# Bing Image

每日必应壁纸 - 自动获取并展示必应每日高清壁纸的 Web 应用。

A web application that automatically fetches and displays daily Bing wallpaper images.

## ✨ 功能特性 / Features

- 🖼️ 自动获取必应每日壁纸（每小时检查更新）
- 📱 响应式网页画廊，支持分页浏览
- 📥 支持 4K/UHD 高清壁纸下载
- 💾 SQLite 数据库存储图片元数据
- 🐳 Docker 容器化部署支持
- 🚀 基于 NestJS 框架，性能优异

## 🛠️ 技术栈 / Tech Stack

- **框架**: [NestJS](https://nestjs.com/) v10
- **数据库**: SQLite (better-sqlite3)
- **ORM**: TypeORM
- **模板引擎**: EJS
- **运行时**: Node.js 22+
- **进程管理**: PM2
- **容器化**: Docker

## 📦 安装 / Installation

### 使用 npm

```bash
# 克隆仓库
git clone https://github.com/liubaicai/bingimage.git
cd bingimage

# 安装依赖
npm install

# 构建项目
npm run build

# 启动服务
npm run start:prod
```

### 使用 Docker

```bash
# 使用 docker-compose
docker-compose up -d

# 或手动构建运行
docker build -t bingimage .
docker run -d -p 3000:3000 -v ./public:/app/public -v ./db:/app/db bingimage
```

## ⚙️ 配置 / Configuration

### 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `PORT` | 服务端口 | `3000` |

### PM2 配置

项目包含 `ecosystem.config.js` 用于 PM2 进程管理：

```bash
# 使用 PM2 启动
pm2 start ecosystem.config.js

# 重启服务
pm2 restart bingimage
```

## 🚀 开发 / Development

```bash
# 开发模式（热重载）
npm run dev

# 代码格式化
npm run format

# 代码检查
npm run lint

# 编译 SASS
npm run sass
```

## 📡 API 端点 / API Endpoints

| 路径 | 描述 |
|------|------|
| `GET /` | 首页，展示最新壁纸画廊 |
| `GET /pages/:page` | 分页浏览壁纸 |
| `GET /today` | 获取今日壁纸图片流 |
| `GET /download?id={id}` | 下载指定 ID 的 4K 壁纸 |

## 📁 项目结构 / Project Structure

```
bingimage/
├── src/                    # 源代码
│   ├── entities/           # 数据库实体
│   ├── services/           # 服务层（定时任务等）
│   ├── app.controller.ts   # 控制器
│   ├── app.service.ts      # 业务服务
│   ├── app.module.ts       # 主模块
│   └── main.ts             # 入口文件
├── views/                  # EJS 模板
├── public/                 # 静态资源
│   ├── assets/             # CSS/JS 资源
│   └── data/               # 壁纸存储目录
├── docker-compose.yml      # Docker Compose 配置
├── Dockerfile              # Docker 镜像配置
└── ecosystem.config.js     # PM2 配置
```

## 📄 许可证 / License

本项目采用私有许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 🙏 致谢 / Acknowledgments

- 壁纸来源：[Microsoft Bing](https://www.bing.com/)
- 框架：[NestJS](https://nestjs.com/)
