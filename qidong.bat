@echo off
chcp 65001 >nul
title 科技资讯平台 - 卜宁 24001010202
cd /d "%~dp0backend"
if not exist node_modules (
  echo [1/2] 首次运行，安装依赖...
  call npm i
)
echo [2/2] 启动服务 http://localhost:8325
node server.js
pause
