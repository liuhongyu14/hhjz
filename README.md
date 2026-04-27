# 好好记账

基于 UI 稿、需求文档和交互文档生成的首版 H5 / 混合 App 程序。前端使用 Vue 3 + Vite + Ionic Vue + Pinia，登录后会直接走 `/api` 后端，后端保留 Vercel Functions + Neon PostgreSQL + Drizzle ORM 的真实接入能力。

## 已实现范围

- 启动页、首页、日历账单、收支统计、记一笔、我的。
- 登录 / 注册演示流程，不包含微信登录和第三方登录。
- 游客可浏览演示数据，新增账单、分类管理、标签管理、主题切换会触发“登录后继续”拦截。
- 账本分类管理、标签管理、新建 / 编辑 / 删除 / 搜索等首版交互。
- 浅色、深色、暖色主题底部弹窗，并全局生效。
- Drizzle 数据表：用户、账单、账本分类、标签、账单标签关系。
- 本地开发支持两种后端模式：配置 `DATABASE_URL` 或 Vercel `POSTGRES_URL` 时执行真实 `api/` 函数；未配置时自动切到文件持久化本地后端。

## 本地运行

```bash
npm install
npm run dev
```

打开 Vite 输出的本地地址即可预览。首屏会先显示品牌启动页，随后进入首页。

当前 Vite 开发服务器已内置本地 API 调试中间件，访问 `http://localhost:5173/api/*` 时会按以下方式工作：

- 已配置 `DATABASE_URL`、`POSTGRES_URL`、`POSTGRES_URL_NON_POOLING` 或 `POSTGRES_PRISMA_URL`：直接执行 `api/` 下的真实 Vercel Functions，并连接 Vercel 数据库。
- 未配置 `DATABASE_URL`：自动切到本地文件后端，数据保存在 `.data/haohao-dev-db.json`，适合本地联调登录、分类、标签、账单等流程。

```bash
cp .env.example .env
```

然后在 `.env` 中填写：

```bash
DATABASE_URL=postgres://user:password@host/database?sslmode=require
# 如果从 Vercel 拉取的是 POSTGRES_URL，也可以保留为：
POSTGRES_URL=postgres://user:password@host/database?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
```

如果你要联调真实数据库，配置完成后重新运行：

```bash
npm run dev
```

## 构建

```bash
npm run build
```

## Vercel 数据库

把 Vercel 数据库连接串写入 `.env` 后，本地 `npm run dev` 会直接连接 Vercel 数据库，不再使用 `.data/haohao-dev-db.json`。

```bash
cp .env.example .env
npm run db:push
npm run dev
```

`npm run db:push` 会把 `drizzle/schema.ts` 中的表结构同步到当前配置的 Vercel 数据库。首次换库时需要先执行一次，否则接口会因为缺表而报错。

## 后端接入

1. 复制 `.env.example` 为 `.env`，填写 `DATABASE_URL` 或 Vercel `POSTGRES_URL`，以及 `JWT_SECRET`。
2. 使用 Drizzle 生成并迁移数据库。
3. 将前端 Pinia 中的 localStorage 演示数据替换为 `/api/auth/*`、`/api/transactions` 等接口调用。

当前 API 目录提供了 Vercel Functions 后端代码，便于接入 Neon PostgreSQL。

### 后端接口

- `POST /api/auth/register`：注册账号，注册成功后自动写入默认分类和标签。
- `POST /api/auth/login`：账号密码登录，返回用户信息和 token，并写入 HttpOnly Cookie。
- `POST /api/auth/logout`：退出登录，清理会话 Cookie。
- `GET /api/me`：获取当前登录用户。
- `PATCH /api/me`：更新昵称、头像或主题。
- `GET /api/categories` / `POST /api/categories`：获取或新建账本分类。
- `GET /api/categories/:id` / `PATCH /api/categories/:id` / `DELETE /api/categories/:id`：分类详情、修改、删除。
- `GET /api/tags` / `POST /api/tags`：获取或新建标签，支持 `keyword` 查询。
- `GET /api/tags/:id` / `PATCH /api/tags/:id` / `DELETE /api/tags/:id`：标签详情、修改、删除。
- `GET /api/transactions?month=2026-04` / `POST /api/transactions`：按月获取账单或新增账单。
- `GET /api/transactions/:id` / `PATCH /api/transactions/:id` / `DELETE /api/transactions/:id`：账单详情、修改、删除。

### 后端校验

```bash
npm run typecheck:api
```

当前前端已经切换为真实后端调用：游客态仍显示演示数据；登录或注册后会从 `/api/categories`、`/api/tags`、`/api/transactions` 拉取真实数据，新增、编辑、删除也会写入后端。本地配置 Vercel 数据库地址后会写入 Vercel 数据库；未配数据库时，以上写操作会落到 `.data/haohao-dev-db.json`，便于直接调试整条链路。
