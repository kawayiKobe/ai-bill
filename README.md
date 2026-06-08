# AI Bill - 智能记账 App

AI 驱动的个人记账应用，支持自然语言记账、智能分类、消费分析。

## 技术栈

- **前端**: React Native (Expo) + TypeScript + Zustand
- **后端**: NestJS + TypeORM + PostgreSQL
- **AI**: OpenAI 兼容 API

## 项目结构

```
ai-bill/
├── apps/
│   ├── mobile/    # React Native 前端
│   └── server/    # NestJS 后端
└── openspec/      # 项目规格文档
```

## 快速开始

### 前置条件

- Node.js 18+
- Docker (用于 PostgreSQL)
- Expo CLI

### 启动后端

```bash
docker compose up -d        # 启动 PostgreSQL
npm run server              # 启动 NestJS 开发服务器
```

### 启动前端

```bash
npm run mobile              # 启动 Expo 开发服务器
```
