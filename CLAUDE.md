# TinySpark — 儿童美术作品集网站

## 产品概述

**TinySpark** (tinyspark.art) — 帮助小朋友将美术和手工作品数字化的展示平台。支持多用户，同学间共享，家长通过邀请码管理注册。

## 技术栈

- **前端**: Next.js 15 (App Router) + TypeScript + Tailwind CSS 4
- **部署**: Cloudflare Workers (via @opennextjs/cloudflare)
- **数据库**: Cloudflare D1 (SQLite) + Drizzle ORM
- **图片存储**: Cloudflare Images (直传 + 自动变体 + CDN)
- **认证**: JWT (jose 库) + bcryptjs, 存 HttpOnly Cookie
- **配置**: wrangler.jsonc

## 设计风格：温暖童趣

- 背景: `#FFF8F0` (奶油白)
- 主色: `#FF6B6B` (珊瑚红, 按钮/强调)
- 辅色: `#4ECDC4` (薄荷绿), `#FFE66D` (阳光黄), `#95E1D3` (浅绿), `#F38181` (浅粉)
- 文字: `#2D3436` (深灰), `#636E72` (次要文字)
- 圆角: 大圆角 (rounded-2xl / rounded-3xl)
- 卡片: 画框感, 柔和阴影
- 分类标签: 彩色药丸样式
- 微动画: 卡片悬浮上浮, 点赞星星弹跳, 页面淡入
- 响应式: 手机2列, 平板3列, 桌面4列
- 触摸友好: 按钮最小 44x44px

## 功能需求

### 用户系统
- 开放注册 (家长注册账号，小朋友用家长账号登录)
- 角色: admin / user

### 作品管理
- 上传作品图片 (直传到 Cloudflare Images)
- 元数据: 标题, 艺术家名, 创作时间, 是否公开
- 编辑/删除自己的作品

### 画廊展示
- 公共画廊: 瀑布流布局 (CSS columns), 仅显示公开作品
- 个人主页: 网格布局, 显示所有作品 (含私密标记)
- 作品详情: 大图 + 信息卡 + Lightbox
- 无限滚动加载 (Intersection Observer)

### 互动
- 点赞功能 (星星, toggle)

## 数据库设计

3 张表:
- **users**: id(nanoid), username(unique), display_name, password_hash, avatar_key?, role, created_at
- **artworks**: id, user_id, title, artist_name, description?, tags?(逗号分隔), image_id(CF Images ID), is_public(0/1), created_at, artwork_date?
- **likes**: (user_id, artwork_id) 复合主键, created_at

## Cloudflare Images 变体

在 Dashboard 中创建:
- `thumbnail`: 400px 宽 (画廊卡片)
- `medium`: 800px 宽 (详情页)
- `full`: 1600px 宽 (Lightbox)
- `avatar`: 128x128 (头像)

URL 格式: `https://imagedelivery.net/<account_hash>/<image_id>/<variant>`

## 页面路由

| 路由 | 说明 |
|------|------|
| `/` | 公共画廊 (瀑布流, 仅公开作品) |
| `/login` | 登录 |
| `/register` | 邀请码注册 |
| `/my` | 我的作品集 (网格) |
| `/upload` | 上传新作品 |
| `/artwork/[id]` | 作品详情 + Lightbox |
| `/user/[id]` | 用户公开作品 |

## API 路由

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 邀请码注册 |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/artworks` | 公开作品列表 (分页) |
| POST | `/api/artworks` | 创建作品 (需认证) |
| GET | `/api/artworks/[id]` | 作品详情 |
| PATCH | `/api/artworks/[id]` | 编辑作品 |
| DELETE | `/api/artworks/[id]` | 删除作品 |
| POST | `/api/artworks/[id]/like` | 点赞 toggle |
| GET | `/api/users/[id]/artworks` | 用户作品列表 |
| POST | `/api/upload-url` | 获取 CF Images 直传 URL |

## 项目结构

```
artwork/
├── .dev.vars                    # 本地环境变量 (JWT_SECRET, CF_IMAGES_TOKEN)
├── cloudflare-env.d.ts          # Cloudflare 绑定类型声明
├── drizzle.config.ts
├── next.config.ts
├── open-next.config.ts
├── wrangler.jsonc               # D1 绑定, compatibility flags
├── db/
│   ├── schema.ts                # Drizzle 表定义
│   └── migrations/
├── src/
│   ├── app/                     # Next.js App Router 页面 + API
│   ├── components/
│   │   ├── ui/                  # Button, Input, Modal, Avatar
│   │   ├── layout/              # Navbar, Footer
│   │   ├── gallery/             # MasonryGrid, ArtworkCard, InfiniteScroll
│   │   ├── artwork/             # ArtworkDetail, Lightbox, LikeButton
│   │   ├── upload/              # UploadForm
│   │   └── auth/                # LoginForm, RegisterForm
│   ├── lib/
│   │   ├── db.ts                # D1 连接 (getCloudflareContext → drizzle)
│   │   ├── auth.ts              # JWT sign/verify/middleware
│   │   ├── cloudflare-images.ts # 直传URL, 删除, URL拼接
│   │   └── constants.ts
│   ├── hooks/                   # useAuth, useInfiniteArtworks
│   └── types/index.ts
└── public/
```

## 代码规范

- **简洁优先**: 不过度设计，保证代码简洁易懂
- **最小改动**: 改动时尽量不修改其他模块代码
- **模块化**: 每个组件独立实现，导出明确的 TypeScript interface/class
- **避免 AI 代码冗余**: 不添加多余注释、不添加不必要的防御性检查、不使用 any 绕过类型检查
- **敏感信息**: 保存在 `.env` / `.dev.vars` 中，不提交到仓库
- **静态变量**: 保存在 `src/lib/constants.ts` 中
- **注释规范**: 模块需要简短逻辑说明，方法需要包含参数说明
- **Shell 脚本规范**: 需要有 `--help/-h` 介绍用法和参数说明，所有参数需要有简洁写法（如 `-o/--output`）
- **代码检查流程**: 每次改动完成后，依次执行 `/simplify` 和 `/code-checker`

## 关键依赖

```
@opennextjs/cloudflare  # CF Workers 适配
wrangler                # CF CLI
drizzle-orm / drizzle-kit
jose                    # JWT (Edge Runtime 兼容)
bcryptjs                # 密码哈希 (纯 JS)
nanoid                  # ID 生成
```

## 部署命令

```bash
npm run preview   # 本地预览 (opennextjs-cloudflare build + preview)
npm run deploy    # 部署到 CF (opennextjs-cloudflare build + deploy)
npm run db:generate       # drizzle-kit generate
npm run db:migrate:local  # wrangler d1 migrations apply --local
npm run db:migrate:remote # wrangler d1 migrations apply --remote
```
