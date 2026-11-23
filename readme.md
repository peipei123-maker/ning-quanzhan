# 科技资讯平台（全栈项目）

- **姓名：卜宁**
- **学号：24001010202**
- 项目名称：科技资讯平台
- 项目类别：自选
- 技术栈：原生 HTML / CSS / JavaScript + Node.js / Express + MySQL
- 端口：8325 ｜ 接口前缀：/api/
- 访问地址：http://localhost:8325
- 命名约定：全部统一 **buning_202_** 前缀

## 目录结构

```
quanzhanxiangmu/
├── AGENTS.md                给 AI 的开发规则（项目结构与约定）
├── readme.md                本文件（学号、姓名、目录说明）
├── buning_202_prompt.md     开发指令记录（只追加）
├── qidong.bat               一键启动后端
├── backend/                 Node.js + Express 后端
│   ├── server.js            服务入口：/api 接口 + static 托管 frontend
│   ├── db.js                MySQL 连接池
│   ├── .env                 数据库凭据（已进 .gitignore）
│   ├── buning_202_interface.md   接口记录（只追加）
│   └── buning_202_database.md    建表与数据 SQL（只追加，可重建库）
└── frontend/                原生前端
    ├── index.html           首页：姓名学号、页面导航、canvas 粒子动画、接口自检
    ├── css/buning_202_main.css
    ├── js/buning_202_main.js
    ├── images/  fonts/
```

## 数据库

- MySQL 库名：`buning_202_technews`
- 主要数据表：`buning_202_news`（科技新闻，8 条测试数据）、`buning_202_gallery`（图文列表，8 条）
- 完整建表与 INSERT 语句见 `backend/buning_202_database.md`

## 接口一览

| 接口 | 方法 | 说明 |
|---|---|---|
| /api/buning_202_health | GET | 服务与数据库健康检查 |
| /api/buning_202_news/list | GET | 科技新闻分页列表（page、size） |
| /api/buning_202_db/test | POST | 数据库连通性测试（database.html 使用） |
| /api/buning_202_gallery/list | GET | 图文列表（size、tag 可选） |
| /api/buning_202_gallery/like/:id | POST | 图文点赞（浏览量 +1） |

## 页面清单（全部已完成）

- `frontend/index.html` 首页：姓名学号、导航卡片、canvas 粒子动画、接口自检
- `frontend/database.html` 数据库连接测试：输入用户名密码，成功/失败均有提示
- `frontend/news.html` 科技新闻列表：读取 `buning_202_news`，显示接口链接与内容
- `frontend/gallery.html` 图文列表：读取 `buning_202_gallery`，支持标签筛选与点赞

## 启动方式

1. 双击根目录 `qidong.bat`（首次会自动 `npm i` 装依赖）
2. 浏览器访问 http://localhost:8325

## 在 Trae（或 VSCode）里启动

1. Trae 菜单 **文件 → 打开文件夹**，选 `D:\quanzhanxiangmu`
2. **首次**：终端里执行 `cd backend` → `npm i`（本项目已装过，可跳过）
3. 按 **F5**（或左侧「运行和调试」→ 选择「启动后端（8325）」→ 点绿色三角）
4. 底部终端出现「服务已启动 / http://localhost:8325」即成功
5. 浏览器打开 http://localhost:8325 （AI 聊天 `/chat.html`，在线客服 `/kefu.html`）

> 也可以不打开 Trae，直接双击根目录 `qidong.bat` 启动。
> 若提示 `EADDRINUSE`，说明 8325 已被占用，先关掉旧的终端窗口或重启电脑。
