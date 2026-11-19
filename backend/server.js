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

app.listen(PORT, () => {
  console.log('==============================================');
  console.log(' 科技资讯平台 服务已启动');
  console.log(' 姓名：卜宁  学号：24001010202');
  console.log(' 地址：http://localhost:' + PORT);
  console.log(' 接口前缀：/api/');
  console.log('==============================================');
});
