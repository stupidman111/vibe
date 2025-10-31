#!/bin/bash

# This script runs during building the sandbox template
# and makes sure the Next.js app is (1) running and (2) the `/` page is compiled

# 定义一个函数 ping_server，用于检测服务器是否启动并响应 200 状态码。
# 函数内部通过循环 + curl 检测，每 0.1 秒检查一次，最多尝试 200 次（20 秒）。
# 若检测到 200 状态码，跳出循环；否则，继续等待。
function ping_server() {
	counter=0
	response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
	while [[ ${response} -ne 200 ]]; do
	  let counter++
	  if  (( counter % 20 == 0 )); then
        echo "Waiting for server to start..."
        sleep 0.1
      fi

	  response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
	done
}

# 后台运行ping_server函数，异步等待服务器启动。
# 进入用户主目录（应用所在目录），启动 Next.js 开发服务器（使用--turbopack加速编译）。
ping_server &
cd /home/user && npx next dev --turbopack