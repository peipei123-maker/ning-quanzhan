/**
 * 姓名：卜宁 | 学号：24001010202 | 时间：2026-11-23 | 大模型：DeepSeek-V4-Flash
 * RAG：文本分块 + 向量化（硅基流动 bge-m3）+ 余弦相似度检索
 */
const SF_BASE = () => process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';
const SF_KEY = () => process.env.SILICONFLOW_API_KEY || '';
const EMB_MODEL = () => process.env.SILICONFLOW_EMBED_MODEL || 'BAAI/bge-m3';

/** 清洗文本 */
function cleanText(t) {
  return String(t || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * 分块：按段落聚合到约 chunkSize 字，带 overlap 重叠
 */
function chunkText(text, chunkSize, overlap) {
  const size = chunkSize || 500;
  const ov = overlap === undefined ? 80 : overlap;
  const clean = cleanText(text);
  if (!clean) return [];
  const paras = clean.split('\n').filter(function (s) { return s.trim().length > 0; });
  const chunks = [];
  let buf = '';
  paras.forEach(function (p) {
    if ((buf + '\n' + p).length <= size) {
      buf = buf ? (buf + '\n' + p) : p;
    } else {
      if (buf) chunks.push(buf);
      // 单段超长则硬切
      if (p.length > size) {
        for (let i = 0; i < p.length; i += (size - ov)) {
          chunks.push(p.slice(i, i + size));
        }
        buf = '';
      } else {
        const tail = buf ? buf.slice(-ov) : '';
        buf = tail ? (tail + '\n' + p) : p;
      }
    }
  });
  if (buf) chunks.push(buf);
  return chunks.filter(function (c) { return c.trim().length > 0; });
}

/**
 * 批量向量化，返回 [[float...], ...]
 */
async function embedTexts(texts) {
  const out = [];
  const BATCH = 16;
  for (let i = 0; i < texts.length; i += BATCH) {
    const slice = texts.slice(i, i + BATCH);
    const body = { model: EMB_MODEL(), input: slice };
    const r = await fetch(SF_BASE() + '/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SF_KEY() },
      body: JSON.stringify(body)
    });
    const raw = await r.text();
    if (!r.ok) {
      throw new Error('向量化失败（' + r.status + '）：' + raw.slice(0, 200));
    }
    const json = JSON.parse(raw);
    (json.data || []).forEach(function (d) { out.push(d.embedding); });
  }
  return out;
}

/** 余弦相似度 */
function cosine(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** 关键词兜底打分（向量化不可用时） */
function keywordScore(question, content) {
  const qs = String(question || '').split(/[\s,，。？?、;；:：]+/).filter(function (s) { return s.length >= 2; });
  if (!qs.length) return 0;
  let hit = 0;
  const c = String(content || '');
  qs.forEach(function (k) { if (c.indexOf(k) >= 0) hit += 1; });
  return hit / qs.length;
}

/**
 * 检索 topK 片段
 * chunks: [{ id, content, embedding(数组或JSON字符串) }]
 */
function retrieve(question, chunks, topK, qVec) {
  const k = topK || 4;
  const scored = chunks.map(function (c) {
    let emb = c.embedding;
    if (typeof emb === 'string') {
      try { emb = JSON.parse(emb); } catch (e) { emb = null; }
    }
    const score = (qVec && emb && emb.length) ? cosine(qVec, emb) : keywordScore(question, c.content);
    return { chunk: c, score };
  });
  scored.sort(function (a, b) { return b.score - a.score; });
  return scored.slice(0, k);
}

module.exports = { cleanText, chunkText, embedTexts, cosine, retrieve, keywordScore };
