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

app.listen(PORT, () => {
  console.log('==============================================');
  console.log(' 科技资讯平台 服务已启动');
  console.log(' 姓名：卜宁  学号：24001010202');
  console.log(' 地址：http://localhost:' + PORT);
  console.log(' 接口前缀：/api/');
  console.log('==============================================');
});
