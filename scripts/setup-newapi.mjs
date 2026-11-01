// Embedded gateway deployment has been removed. Fail before reading or writing credentials.
console.error("baotuo-studio 不再部署或初始化 New API。请启动项目后，在管理后台 → 模型渠道配置自定义接口。");
process.exitCode = 1;
