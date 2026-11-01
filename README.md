# baotuo-studio

自己的 AI 视觉创作工作台：图片、视频、画布 Agent、电商创作与多平台发布。

项目分析与重构路线见 [改造说明](docs/project-modernization.md)。品牌入口位于 `web/src/shared/config/brand.ts`。


## 仓库内容

- `web/`：Next.js 前端、页面样式、必要的图标、字体和入口配图。
- 首页不再捆绑示例视频和封面；未发布展示内容时显示空状态，后续可在后台配置自己的展示作品。
- `server/`：Java 21 / Spring Boot 后端、表结构迁移和系统提示词。
- `newapi/`：上游网关适配历史源码，仅保留参考，不参与部署。
- `publisher-service/`：多平台发布服务和相关第三方适配代码。
- `scripts/`、`nginx/`、Docker Compose：配置和部署工具。
<img width="1909" height="942" alt="image" src="https://github.com/user-attachments/assets/d68c4004-227f-49ab-a264-282d42626e51" />

<img width="1906" height="932" alt="image" src="https://github.com/user-attachments/assets/0d6dce2a-9953-4807-bb87-33860fce60b0" />
<img width="1912" height="947" alt="image" src="https://github.com/user-attachments/assets/7b4eca8a-5da0-4de0-b32b-13ef1805d027" />
<img width="1892" height="476" alt="image" src="https://github.com/user-attachments/assets/24b1ad62-83eb-4595-8f66-067bc810c83a" />

## GitHub 自动构建与镜像部署

仓库：<https://github.com/baotuo88/baotuo-studio>。推送 `main` / `master` 或 `v*` 标签会由 GitHub Actions 构建并发布前端、后端、发布服务三个镜像到 `ghcr.io/baotuo88/baotuo-studio-*`。PR 只构建、不发布，默认构建 `linux/amd64`。

填写 `.env` 后，使用 Docker Compose 2.24.4+ 拉取镜像启动：

```sh
docker compose -f docker-compose-local.yml -f docker-compose.ghcr.yml up -d --no-build
```

首次使用须等 Actions 全部构建成功。镜像为私有时，先登录 GHCR。操作说明、固定版本部署和回滚见 [GitHub 镜像发布](deploy_docs/github-images.md)。

## 从源码部署

需要 Docker / Docker Compose。部署不拉取、不构建、不启动 New API 或其辅助服务。

1. 复制 `.env.example` 为 `.env`，填写自己的配置，至少包含：
   - `APP_SECRET_KEY`：至少 32 字节的随机密钥。
   - `POSTGRES_PASSWORD`、`PUBLISHER_INTERNAL_TOKEN`：独立随机值。
   - `ADMIN_INITIAL_EMAIL`、`ADMIN_INITIAL_PASSWORD`：新环境的初始管理员。
   - `FRONTEND_BASE_URL`：实际访问地址。
2. 构建并启动应用：

   ```sh
   docker compose -f docker-compose-local.yml up -d --build
   ```

3. 登录管理后台 → **模型渠道**，添加接口地址、API Key、协议和模型 ID。可以手动填写模型，也可以从供应商拉取列表。再进入 **模型能力与计费**，选择图片、视频、文本或语音模型，设置生成能力及默认模型并保存。无需网关初始化脚本或网关令牌。

4. 默认访问 `http://localhost:5550`。首次启动会按 `.env` 创建新的管理员。登录后台后配置模型渠道、对象存储、邮件、支付及内容；这些配置都保存在各自部署环境中。

本地 Compose 的 Web 入口仅绑定 `127.0.0.1`；服务器部署请使用 HTTPS 反向代理。`docker-compose.yml` 是另一种外部 Nginx 部署方式，启用前需要自行配置相应目录。

> 这份源码中的迁移已移除历史内容导入，只用于全新数据库。不要把它直接接到已有数据库执行 Flyway，也不要用它覆盖现有环境的迁移历史。

## 开发与检查

```sh
cd web
corepack enable
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm test:node src/features/homepage/api/homepage-showcases.test.ts
```

服务端使用 Java 21 和 Maven。自定义渠道配置的离线测试示例：

```sh
cd web
node --experimental-strip-types --loader ./scripts/node-test-loader.mjs --test src/features/settings/lib/channel-draft.test.ts
```

部分历史导入脚本需要额外的、由部署者自行提供的素材源；仓库不附带这些导入数据。不要提交运行时生成的 `newapi/generated/`、`outputs/` 或 `.env`。`.gitignore` 已覆盖常见运行数据与密钥文件。
## 许可

本源码附带的 [LICENSE](LICENSE) 为 AGPL-3.0 文本；上游 README 曾标注 MIT，两者不一致。当前保留原始许可文件及第三方素材署名，许可归属需进一步核对。

自定义渠道和旧环境迁移说明见 [模型直连配置](docs/custom-model-channels.md)。
