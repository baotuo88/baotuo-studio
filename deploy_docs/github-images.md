# baotuo-studio：GitHub 自动构建与 GHCR 部署

仓库：https://github.com/baotuo88/baotuo-studio

## 1. 自动构建

工作流：`.github/workflows/docker-images.yml`。

| 事件 | 行为 |
| --- | --- |
| 推送 main / master | 构建并发布三个应用镜像 |
| 推送 v* 标签，例如 v1.0.0 | 发布同名版本镜像 |
| PR 到 main / master | 只构建，不登录仓库、不发布 |
| Actions → Run workflow | 为选择的分支或标签构建并发布 |

镜像名：

- `ghcr.io/baotuo88/baotuo-studio-web`
- `ghcr.io/baotuo88/baotuo-studio-server`
- `ghcr.io/baotuo88/baotuo-studio-publisher`

工作流按仓库所属账号自动生成小写命名空间，转移到其他账号时不必修改工作流。

每次发布产生 `sha-完整40位提交ID`；分支构建还产生分支标签，版本构建产生 `v1.0.0` 等标签。只有默认分支构建更新 `latest`。三项服务独立构建，务必等整个工作流全部成功后再部署同一个 SHA 标签，避免使用中途更新的 latest。

当前目标架构为 `linux/amd64`，适合常见 x86 云服务器，不包含 ARM64 镜像。

## 2. GitHub 首次配置

1. 将当前修改推送到上述仓库的 main（或 master）分支。当前源码目录没有 `.git`，需先与该仓库建立 Git 关联，确认远端已有内容再推送。
2. 仓库 Settings → Actions → General 中允许使用工作流及 Docker 官方 Actions。工作流已经声明 `contents: read`、`packages: write` 权限。
3. 构建登录使用自动提供的 `GITHUB_TOKEN`，无需额外配置 Docker Hub 密码或发布 PAT。
4. Actions 页面查看三个构建任务；全部通过后，在账号 Packages 中可看到镜像。
5. GHCR 首次发布的包可能为私有。需要免登录拉取时，将三个包分别设置为 Public；私有包则保留私有并在服务器登录。已有同名包需授予此仓库 Actions 写入权限。

可选前端构建变量在 Settings → Secrets and variables → Actions → **Variables** 配置：

- `NEXT_PUBLIC_CREDIT_STORE_URL`
- `NEXT_PUBLIC_ICP_RECORD_NUMBER`
- `NEXT_PUBLIC_GITHUB_URL`，可填写当前仓库 URL。

这些值会编译进浏览器代码，不能填写模型密钥或支付密钥。前端请求使用同源 `/api`；数据库、模型、支付等运行配置不参与镜像构建。`NEXT_PUBLIC_*` 修改后必须重新构建镜像，仅修改服务器 `.env` 不会改变已发布前端。

## 3. 服务器部署

需要 Docker 与 Docker Compose **2.24.4 或以上版本**。保留仓库中的 Compose 文件、`nginx/`、`server/config/` 等运行配置；镜像不会包含部署者的 `.env` 和支付密钥。

复制 `.env.example` 为 `.env` 并填好数据库密码、应用密钥、管理员密码、发布服务令牌和访问地址。设置：

```dotenv
GHCR_OWNER=baotuo88
# 推荐使用已完整构建成功的版本或 sha-完整提交ID
IMAGE_TAG=v1.0.0
```

也可使用 `IMAGE_TAG=latest` 获取默认分支最近发布版本。

若包为私有，执行 `docker login ghcr.io -u baotuo88`，在密码提示中输入具有 `read:packages` 权限的 GitHub 令牌。

```sh
docker compose -f docker-compose-local.yml -f docker-compose.ghcr.yml pull
docker compose -f docker-compose-local.yml -f docker-compose.ghcr.yml up -d --no-build
docker compose -f docker-compose-local.yml -f docker-compose.ghcr.yml ps
```

`docker-compose.ghcr.yml` 通过 `!reset` 去掉三个应用的本地 build 定义，只从 GHCR 拉取镜像。它也可叠加到 `docker-compose.yml`；该配置使用外部 Nginx 目录，需另行准备反向代理配置。

官方 PostgreSQL、Redis、Nginx 镜像继续正常拉取。所有部署方式均不包含 New API 或其辅助服务。

## 4. 本地构建与升级

不叠加 GHCR 文件时通过 `pull_policy: build` 从源码构建，默认镜像名为 `baotuo-studio-web`、`baotuo-studio-server`、`baotuo-studio-publisher`：

```sh
docker compose -f docker-compose-local.yml up -d --build
```

`IMAGE_PREFIX` 控制本地构建镜像前缀；GHCR 覆盖文件使用 `GHCR_OWNER`，不受 `IMAGE_PREFIX` 影响。

升级时先确认目标工作流全部成功，将 `.env` 中 `IMAGE_TAG` 改为目标版本，然后执行上述 pull/up。回退镜像时使用之前记录的 SHA 或版本标签；若新版本执行了数据库迁移，须先确认旧代码兼容性，必要时从备份恢复，不能只回退镜像。

容器名称已统一为 `baotuo-studio-*`。已有环境需沿用原 Compose 项目名和同一份数据挂载路径；在维护窗口停止旧容器，避免两个数据库容器同时挂载同一数据目录。此次改名没有修改数据库名称、数据目录或自动删除任何容器。

## 5. 验证范围

本地检查包括工作流 YAML 解析、Docker Compose 原生解析、本地与 GHCR 模式镜像来源、GHCR 模式不存在 build 配置、New API 不参与部署。

真正的镜像构建与推送需由 GitHub 首次运行验证；本地配置完成不代表远端已经产生镜像。工作流当前验证 Docker 构建，不等同所有业务测试通过。

本轮本地验证：9 项部署回归通过；工作流 YAML、矩阵构建路径、PR 不发布条件和包写入权限检查通过。尚未向远端推送或触发 Actions。
