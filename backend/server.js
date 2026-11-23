/**
 * 姓名：卜宁 | 学号：24001010202 | 时间：2026-11-19 | 大模型：DeepSeek
 * 科技资讯平台 - 后端服务入口
 * 统一响应：{ code: 0, msg: '', data: {} }
 */
const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const pool = require('./db');
const multer = require('multer');
const fs = require('fs');
const os = require('os');
const kbParse = require('./kb_parse');
const rag = require('./rag');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const app = express();
const PORT = process.env.PORT || 8325;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 托管前端
app.use(express.static(path.join(__dirname, '..', 'frontend')));

/** 健康检查 */
app.get('/api/buning_202_health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ code: 0, msg: '服务与数据库正常', data: { db: rows[0].ok === 1 } });
  } catch (e) {
    console.error('[buning_202_health]', e.message);
    res.json({ code: 500, msg: '数据库连接失败：' + e.message, data: null });
  }
});

/** 科技新闻列表（分页） */
app.get('/api/buning_202_news/list', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const size = Math.min(50, Math.max(1, parseInt(req.query.size || '10', 10)));
  const offset = (page - 1) * size;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM buning_202_news ORDER BY buning_202_publish_time DESC LIMIT ? OFFSET ?',
      [size, offset]
    );
    const [[cnt]] = await pool.query('SELECT COUNT(*) AS total FROM buning_202_news');
    res.json({ code: 0, msg: 'ok', data: { total: cnt.total, page, size, rows } });
  } catch (e) {
    console.error('[news/list]', e.message);
    res.json({ code: 500, msg: '查询失败：' + e.message, data: null });
  }
});

/** 数据库连接测试（给 database.html 用） */
app.post('/api/buning_202_db/test', async (req, res) => {
  const { user, password } = req.body || {};
  if (!user || !password) {
    return res.json({ code: 400, msg: '请输入用户名和密码', data: null });
  }
  try {
    const conn = await require('mysql2/promise').createConnection({
      host: process.env.DB_HOST || 'localhost',
      user,
      password,
      database: process.env.DB_NAME || 'buning_202_technews'
    });
    await conn.end();
    res.json({ code: 0, msg: '数据库连接成功', data: { user } });
  } catch (e) {
    console.error('[db/test]', e.message);
    res.json({ code: 500, msg: '连接失败：' + e.message, data: null });
  }
});

/** 图文列表（画廊，分页） */
app.get('/api/buning_202_gallery/list', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const size = Math.min(50, Math.max(1, parseInt(req.query.size || '12', 10)));
  const tag = req.query.tag || '';
  const offset = (page - 1) * size;
  try {
    let rows, cnt;
    if (tag) {
      [rows] = await pool.query(
        'SELECT * FROM buning_202_gallery WHERE buning_202_tag = ? ORDER BY buning_202_create_time DESC LIMIT ? OFFSET ?',
        [tag, size, offset]
      );
      [[cnt]] = await pool.query(
        'SELECT COUNT(*) AS total FROM buning_202_gallery WHERE buning_202_tag = ?',
        [tag]
      );
    } else {
      [rows] = await pool.query(
        'SELECT * FROM buning_202_gallery ORDER BY buning_202_create_time DESC LIMIT ? OFFSET ?',
        [size, offset]
      );
      [[cnt]] = await pool.query('SELECT COUNT(*) AS total FROM buning_202_gallery');
    }
    res.json({ code: 0, msg: 'ok', data: { total: cnt.total, page, size, tag, rows } });
  } catch (e) {
    console.error('[gallery/list]', e.message);
    res.json({ code: 500, msg: '查询失败：' + e.message, data: null });
  }
});

/** 画廊点赞 */
app.post('/api/buning_202_gallery/like/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.json({ code: 400, msg: '参数错误', data: null });
  try {
    const [r] = await pool.query(
      'UPDATE buning_202_gallery SET buning_202_likes = buning_202_likes + 1 WHERE buning_202_id = ?',
      [id]
    );
    res.json({ code: 0, msg: 'ok', data: { affected: r.affectedRows } });
  } catch (e) {
    res.json({ code: 500, msg: '操作失败：' + e.message, data: null });
  }
});

/**
 * AI 聊天：转发到硅基流动（LLM 设计作业）
 * 作业要求：在控制台输出「发送给大模型的数据」和「从大模型接收到的数据」
 */
app.post('/api/buning_202_chat', async (req, res) => {
  const message = (req.body && req.body.message ? String(req.body.message) : '').trim();
  if (!message) {
    return res.json({ code: 400, msg: '请输入内容', data: null });
  }

  const body = {
    model: process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash',
    messages: [
      { role: 'system', content: '你是科技资讯平台的智能助手，回答简洁、准确、中文优先。' },
      { role: 'user', content: message }
    ],
    max_tokens: 800
  };

  // ===== 作业要求：打印发送给大模型的数据 =====
  console.log('===== [发给大模型] =====');
  console.log(JSON.stringify(body, null, 2));

  try {
    const url = (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1') + '/chat/completions';
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (process.env.SILICONFLOW_API_KEY || '')
      },
      body: JSON.stringify(body)
    });
    const raw = await r.text();

    // ===== 作业要求：打印从大模型接收到的数据 =====
    console.log('===== [大模型返回] =====');
    console.log(raw);

    if (!r.ok) {
      return res.json({ code: r.status, msg: '大模型接口返回错误：' + raw.slice(0, 200), data: null });
    }

    const json = JSON.parse(raw);
    const answer = (json.choices && json.choices[0] && json.choices[0].message)
      ? json.choices[0].message.content : '';
    res.json({
      code: 0,
      msg: 'ok',
      data: {
        answer,
        model: json.model || body.model,
        usage: json.usage || null
      }
    });
  } catch (e) {
    console.error('[chat] 请求失败：', e.message);
    res.json({ code: 500, msg: '请求大模型失败：' + e.message, data: null });
  }
});

/**
 * 在线客服：调用七牛 AI 推理（LLM 设计作业第二部分）
 * 作业要求：在控制台输出「发送给大模型的数据」和「从大模型接收到的数据」
 */
app.post('/api/buning_202_service', async (req, res) => {
  const message = (req.body && req.body.message ? String(req.body.message) : '').trim();
  if (!message) {
    return res.json({ code: 400, msg: '请输入咨询内容', data: null });
  }

  const body = {
    model: process.env.QINIU_MODEL || 'qiniu/conatus-free',
    messages: [
      { role: 'system', content: '你是科技资讯平台的在线客服，语气礼貌、回答简洁，遇到退款、账号、订单问题给出处理步骤，超出范围时引导用户留言。' },
      { role: 'user', content: message }
    ],
    max_tokens: 800
  };

  console.log('===== [客服·发给大模型] =====');
  console.log(JSON.stringify(body, null, 2));

  const url = (process.env.QINIU_BASE_URL || 'https://api.qnaigc.com/v1') + '/chat/completions';
  const MAX_TRY = 4;
  let lastMsg = '';

  // 七牛免费池会有 "Too many requests / identity verification" 的偶发失败，做重试
  for (let attempt = 1; attempt <= MAX_TRY; attempt++) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (process.env.QINIU_API_KEY || '')
        },
        body: JSON.stringify(body)
      });
      const raw = await r.text();

      console.log('===== [客服·大模型返回] 第 ' + attempt + ' 次 =====');
      console.log(raw);

      if (r.ok) {
        const json = JSON.parse(raw);
        const answer = (json.choices && json.choices[0] && json.choices[0].message)
          ? json.choices[0].message.content : '';
        if (answer) {
          return res.json({ code: 0, msg: 'ok', data: { answer, model: json.model || body.model, usage: json.usage || null, attempt } });
        }
        // 空回答（免费模型偶尔只返回 reasoning），重试
        lastMsg = '模型返回空内容';
      } else {
        lastMsg = raw.slice(0, 240);
        // 非限流类错误直接返回
        if (r.status === 400 || r.status === 401 || r.status === 404) {
          return res.json({ code: r.status, msg: '七牛接口返回错误：' + lastMsg, data: null });
        }
      }
    } catch (e) {
      lastMsg = e.message;
      console.error('[service] 第 ' + attempt + ' 次请求异常：', e.message);
    }
    if (attempt < MAX_TRY) {
      await new Promise((r2) => setTimeout(r2, attempt * 1500));
    }
  }

  console.error('[service] 重试 ' + MAX_TRY + ' 次仍失败：', lastMsg);
  res.json({ code: 429, msg: '七牛免费模型繁忙（已自动重试 ' + MAX_TRY + ' 次），请稍后再发一次。详情：' + lastMsg, data: null });
});

/* ================= 知识库（RAG） ================= */

/** 启动时确保表存在 */
async function bnEnsureKbTables() {
  await pool.query(`CREATE TABLE IF NOT EXISTS buning_202_kb (
    buning_202_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    buning_202_name VARCHAR(120) NOT NULL,
    buning_202_filename VARCHAR(200) NOT NULL,
    buning_202_ext VARCHAR(16) NOT NULL,
    buning_202_size INT UNSIGNED DEFAULT 0,
    buning_202_chunk_count INT UNSIGNED DEFAULT 0,
    buning_202_text_len INT UNSIGNED DEFAULT 0,
    buning_202_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await pool.query(`CREATE TABLE IF NOT EXISTS buning_202_kb_chunk (
    buning_202_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    buning_202_kb_id INT UNSIGNED NOT NULL,
    buning_202_seq INT UNSIGNED NOT NULL,
    buning_202_content TEXT NOT NULL,
    buning_202_embedding LONGTEXT,
    KEY idx_kb (buning_202_kb_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  console.log('[kb] 数据表就绪（buning_202_kb / buning_202_kb_chunk）');
}
bnEnsureKbTables().catch(function (e) { console.error('[kb] 建表失败：', e.message); });

/** 上传知识库文件：解析 → 分块 → 向量化 → 入库 */
app.post('/api/buning_202_kb/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.json({ code: 400, msg: '没有收到文件', data: null });
  // 中文文件名：浏览器上传是 UTF-8，命令行/部分客户端可能是 GBK，做一次安全解码与兜底
  let original = req.file.originalname || '未命名文件';
  try {
    const decoded = Buffer.from(original, 'latin1').toString('utf8');
    // 解码后若包含常见乱码特征（替换符、阿拉伯/希伯来区），说明原始字节不是 UTF-8，保留原名
    if (!/[\uFFFD\u0400-\u06FF]/.test(decoded)) original = decoded;
  } catch (e) {}
  // 仍不合法则用安全名
  if (!/[\u4e00-\u9fa5A-Za-z0-9_\-.（）()【】· ]/.test(original) || /[\u0400-\u06FF]/.test(original)) {
    original = '文档' + (require('path').extname(original) || '.txt');
  }
  const ext = kbParse.extOf(original);
  const tmp = path.join(os.tmpdir(), 'bn_kb_' + Date.now() + ext);
  try {
    fs.writeFileSync(tmp, req.file.buffer);

    const text = await kbParse.parseFile(tmp, original);
    const clean = rag.cleanText(text);
    if (!clean) throw new Error('文件里没有可解析的文字（可能是扫描版 PDF）');

    const chunks = rag.chunkText(clean, 500, 80);
    console.log('[kb] 解析完成：' + original + '，正文 ' + clean.length + ' 字，分块 ' + chunks.length + ' 个');

    let embeddings = null;
    try {
      embeddings = await rag.embedTexts(chunks);
      console.log('[kb] 向量化完成：' + embeddings.length + ' 条，维度 ' + (embeddings[0] ? embeddings[0].length : 0));
    } catch (e) {
      console.error('[kb] 向量化失败，将使用关键词检索兜底：', e.message);
    }

    const nameRaw = (req.body && req.body.kbName ? String(req.body.kbName).trim() : '');
    const name = nameRaw || original.replace(/\.[^.]+$/, '');
    const [r1] = await pool.query(
      'INSERT INTO buning_202_kb (buning_202_name, buning_202_filename, buning_202_ext, buning_202_size, buning_202_chunk_count, buning_202_text_len) VALUES (?,?,?,?,?,?)',
      [name, original, ext, req.file.size, chunks.length, clean.length]
    );
    const kbId = r1.insertId;

    for (let i = 0; i < chunks.length; i++) {
      await pool.query(
        'INSERT INTO buning_202_kb_chunk (buning_202_kb_id, buning_202_seq, buning_202_content, buning_202_embedding) VALUES (?,?,?,?)',
        [kbId, i + 1, chunks[i], embeddings && embeddings[i] ? JSON.stringify(embeddings[i]) : null]
      );
    }

    res.json({
      code: 0, msg: 'ok',
      data: { id: kbId, name, filename: original, ext, chunkCount: chunks.length, textLen: clean.length, embedded: !!embeddings }
    });
  } catch (e) {
    console.error('[kb upload]', e.message);
    res.json({ code: 500, msg: '解析失败：' + e.message, data: null });
  } finally {
    try { fs.unlinkSync(tmp); } catch (e2) {}
  }
});

/** 知识库列表 */
app.get('/api/buning_202_kb/list', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM buning_202_kb ORDER BY buning_202_id DESC');
    res.json({ code: 0, msg: 'ok', data: rows });
  } catch (e) {
    res.json({ code: 500, msg: '查询失败：' + e.message, data: null });
  }
});

/** 删除知识库（连带分块） */
app.delete('/api/buning_202_kb/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.json({ code: 400, msg: 'id 不合法', data: null });
  try {
    await pool.query('DELETE FROM buning_202_kb_chunk WHERE buning_202_kb_id = ?', [id]);
    await pool.query('DELETE FROM buning_202_kb WHERE buning_202_id = ?', [id]);
    console.log('[kb] 已删除知识库 id=' + id);
    res.json({ code: 0, msg: 'ok', data: { id } });
  } catch (e) {
    res.json({ code: 500, msg: '删除失败：' + e.message, data: null });
  }
});

/** 基于知识库问答 */
app.post('/api/buning_202_kb/ask', async (req, res) => {
  const question = (req.body && req.body.message ? String(req.body.message) : '').trim();
  const kbId = req.body && req.body.kbId ? parseInt(req.body.kbId, 10) : null;
  if (!question) return res.json({ code: 400, msg: '请输入问题', data: null });

  try {
    // 1) 取分块
    let sql = 'SELECT c.buning_202_id AS id, c.buning_202_kb_id AS kbId, c.buning_202_seq AS seq, c.buning_202_content AS content, c.buning_202_embedding AS embedding, k.buning_202_name AS kbName FROM buning_202_kb_chunk c JOIN buning_202_kb k ON k.buning_202_id = c.buning_202_kb_id';
    const params = [];
    if (kbId) { sql += ' WHERE c.buning_202_kb_id = ?'; params.push(kbId); }
    const [chunks] = await pool.query(sql, params);
    if (!chunks.length) {
      return res.json({ code: 404, msg: '知识库还是空的，请先上传文件', data: null });
    }

    // 2) 问题向量化（失败则关键词兜底）
    let qVec = null;
    try { qVec = (await rag.embedTexts([question]))[0]; }
    catch (e) { console.error('[kb ask] 问题向量化失败，改用关键词检索：', e.message); }

    const top = rag.retrieve(question, chunks, 4, qVec);
    const context = top.map(function (t, i) {
      return '【片段' + (i + 1) + '｜' + t.chunk.kbName + ' 第' + t.chunk.seq + '段｜相似度' + t.score.toFixed(3) + '】\n' + t.chunk.content;
    }).join('\n\n');

    // 3) 组装请求
    const body = {
      model: process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash',
      messages: [
        { role: 'system', content: '你是知识库问答助手。只能依据下面提供的资料回答；资料里没有的内容，直接回答"知识库中没有相关信息"，不要编造。回答后不要重复资料原文，用简洁中文。\n\n资料：\n' + context },
        { role: 'user', content: question }
      ],
      max_tokens: 900
    };

    console.log('===== [知识库问答·发给大模型] =====');
    console.log(JSON.stringify({ model: body.model, question, hits: top.map(t => ({ kb: t.chunk.kbName, seq: t.chunk.seq, score: Number(t.score.toFixed(4)) })) }, null, 2));
    console.log('--- 提示词中的资料片段（前 500 字）---');
    console.log(context.slice(0, 500));

    const url = (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1') + '/chat/completions';
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (process.env.SILICONFLOW_API_KEY || '') },
      body: JSON.stringify(body)
    });
    const raw = await r.text();
    console.log('===== [知识库问答·大模型返回] =====');
    console.log(raw);

    if (!r.ok) return res.json({ code: r.status, msg: '大模型返回错误：' + raw.slice(0, 200), data: null });
    const json = JSON.parse(raw);
    const answer = (json.choices && json.choices[0] && json.choices[0].message) ? json.choices[0].message.content : '';
    res.json({
      code: 0, msg: 'ok',
      data: {
        answer,
        model: json.model || body.model,
        usage: json.usage || null,
        sources: top.map(function (t) { return { kb: t.chunk.kbName, seq: t.chunk.seq, score: Number(t.score.toFixed(4)), preview: t.chunk.content.slice(0, 120) }; })
      }
    });
  } catch (e) {
    console.error('[kb ask]', e.message);
    res.json({ code: 500, msg: '问答失败：' + e.message, data: null });
  }
});

app.listen(PORT, () => {
  console.log('==============================================');
  console.log(' 科技资讯平台 服务已启动');
  console.log(' 姓名：卜宁  学号：24001010202');
  console.log(' 地址：http://localhost:' + PORT);
  console.log(' 接口前缀：/api/');
  console.log('==============================================');
});
