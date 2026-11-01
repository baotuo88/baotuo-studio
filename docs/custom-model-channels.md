# 自定义模型渠道与部署

## 部署行为

`docker-compose.yml`、`docker-compose-local.yml` 和 `docker-compose.external-nginx.yml` 都只部署 PostgreSQL、Redis、Nginx、Web、发布服务和 Java 后端。任何基于这些文件的 `pull`、`build`、`up` 都没有 New API 镜像或视频辅助服务可拉取、构建或启动。

环境模板不再包含 NEWAPI 配置；旧 `scripts/setup-newapi.mjs` 会明确退出，不读取或写入凭证，也不请求网络。其他历史协议源码仅留作参考，不在部署链路中执行。

## 后台配置

1. 使用管理员账号进入 **管理后台 → 模型渠道**，选择“添加渠道”。
2. 填写名称、协议、完整接口地址（包括供应商要求的 `/v1` 等路径）和 API Key。无鉴权的自部署服务可留空密钥。
3. 手动输入模型 ID 并回车，或使用“从接口拉取模型”。不要求供应商必须提供 `/models`；拉取只合并列表，不删除已有模型。
4. 保存后点击 **模型能力与计费**，把模型加入文本、图片、视频或语音可选项。新渠道模型无需外部目录同步即可选择。
5. 编辑生成能力、并发、计费、默认模型及需要的自定义 JSON 参数，然后保存。Agent 需配置文本模型，图片或视频模型需勾选供应商实际支持的生成能力。
6. 非标准协议可选“自定义请求模板”，在模型编辑中开启自定义模型，配置提交/查询路径、请求模板和结果提取路径。任意模型 ID 不意味着供应商支持所有类型，请按其文档配置。

渠道密钥由服务端加密保存，配置接口延续管理员鉴权；普通用户使用服务端公开模型目录，不获得渠道密钥。编辑渠道时密钥框不回显；留空保留原密钥，拉取模型时需重新输入密钥。

保存的渠道配置直接决定调用协议和地址，不再查询 New API 模型目录，也不因地址与某个网关相同而覆盖所选协议。兼容协议适配代码的保留不意味着部署网关。

## 已有环境

- 删除 Compose 服务定义不会停止以前已经运行的网关容器。本次代码改造不会自动删除容器或历史数据。
- 若以前使用内嵌网关，请先等生成任务结束，在后台将旧渠道的地址、密钥和协议改为真实供应商配置。尽量编辑原渠道并保留模型 ID，以保留关联的默认项和计费。
- 原网关转发密钥不能作为供应商密钥使用。部分只在旧网关插件中实现的协议需另配自定义模板；不能直接把旧地址改成供应商地址就假定兼容。
- 确认直连成功后，再手动停止旧 `inspirestudio-newapi` 和 `inspirestudio-newapi-video-helper` 容器。旧 `volume/newapi` 数据不自动删除。
- 从其他 Compose 项目、外部脚本或人为执行的 `docker pull` 不受本仓库控制；本仓库部署文件不再引用 New API 镜像。

## 检查

```sh
node --test scripts/test-direct-deployment.mjs
cd web
node --experimental-strip-types --loader ./scripts/node-test-loader.mjs --test src/features/settings/lib/channel-draft.test.ts
pnpm typecheck
pnpm build
```

服务端回归重点：直连模型目录无需网关、协议按后台配置选择、渠道创建/更新/删除和模型计费、普通账号无法访问渠道密钥。真实生成验收需使用部署者配置的供应商并可能消耗额度。

### 本轮验证结果

- Docker Compose 原生解析通过：两份配置均仅输出 `postgres`、`publisher`、`redis`、`server`、`web`、`nginx` 六个服务。
- 部署回归测试 4 项通过；渠道输入、模型草稿合并和现有模型编辑回归共 11 项通过。
- 5 个修改的 TS/TSX 文件通过 TypeScript 语法转译检查，未替代完整类型检查。
- 已更新服务端协议选择测试，并新增直连模型目录不调用外部客户端的测试；当前缺少 Maven，未执行 Java 回归。
- 模型可用性测试因未安装 `nanoid` 等前端依赖无法启动。此前依赖安装受到网络 DNS 限制；完整构建、浏览器验收和真实模型生成尚未执行。

默认 `docker compose up -d` 从 GHCR 拉取应用镜像；本地源码构建使用 `docker compose -f docker-compose-local.yml up -d --build`。
