# 科技资讯平台（全栈项目）

- 姓名：卜宁
- 学号：24001010202
- 技术栈：原生 HTML/CSS/JS + Node.js/Express + MySQL
- 端口：8325
- 访问地址：http://localhost:8325

## 目录结构
```
quanzhanxiangmu/
├── backend/          Node.js + Express 后端（/api 前缀）
│   ├── server.js     服务入口，托管 frontend
│   ├── db.js         MySQL 连接池
│   ├── .env          数据库凭据（不进 git）
│   └── buning_interface.md / buning_database.md
├── frontend/         原生前端
│   ├── index.html    首页（导航 + canvas 动画）
│   ├── css/ js/ images/ fonts/
├── qidong.bat        一键启动后端
└── AGENTS.md         给 AI 的开发规则
```

## 启动
1. 双击根目录 `qidong.bat`
2. 浏览器打开 http://localhost:8325
