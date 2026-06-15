#!/bin/bash

# ====== LUCERNA Archive ======
# 🖋 @huyan

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 启动 Vite 开发服务器（指定端口 5177）
if ! lsof -i :5177 > /dev/null 2>&1; then
  echo "→ 启动开发服务器（端口 5177）..."
  cd "$PROJECT_DIR"
  npx vite --port 5177 &
  sleep 3
fi

# 打开应用
sleep 1
open "http://localhost:5177"
