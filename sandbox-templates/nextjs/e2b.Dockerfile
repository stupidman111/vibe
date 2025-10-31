# 基于 Debian 系统的 Node.js 21 精简镜像作为基础环境，提供 Node.js 运行时。
FROM node:21-slim

# 更新系统包索引，安装curl工具（用于后续检测服务器状态），并清理安装缓存（减少镜像体积）。
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

# 将本地的compile_page.sh脚本复制到容器的根目录。
# 给复制的脚本添加可执行权限，确保后续能运行。
COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

# 设置工作目录为/home/user/nextjs-app，后续命令默认在此目录执行。
WORKDIR /home/user/nextjs-app

# 使用npx创建 Next.js 应用，指定版本 15.3.3，
# --yes自动确认所有配置，在当前目录（nextjs-app）初始化项目。
RUN npx --yes create-next-app@15.3.3 . --yes

# 安装 shadcn UI 组件库：
# init初始化 shadcn 配置（指定neutral主题，--force强制覆盖现有配置）；
# add --all安装 shadcn 的所有组件。
RUN npx --yes shadcn@2.6.3 init --yes -b neutral --force
RUN npx --yes shadcn@2.6.3 add --all --yes

# 将nextjs-app目录下的所有文件移动到用户主目录（/home/user/），并删除原nextjs-app目录，调整目录结构使应用直接放在用户根目录。
RUN mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app
