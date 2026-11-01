export function normalizeChannelDraft<T extends { name: string; baseUrl: string; apiKey: string; models: string[] }>(draft: T): T {
    const name = draft.name.trim();
    if (!name) throw new Error("请输入渠道名称");
    let url: URL;
    try { url = new URL(draft.baseUrl.trim()); } catch { throw new Error("请输入完整的 HTTP(S) 接口地址"); }
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
        throw new Error("接口地址须为 HTTP(S)，不能包含账号、密码、查询参数或锚点");
    }
    const models = [...new Set(draft.models.map(model => model.trim()).filter(Boolean))];
    if (!models.length) throw new Error("请至少添加一个模型 ID");
    if (models.some(model => model.includes("::"))) throw new Error("模型 ID 不能包含内部标识分隔符 ::");
    return { ...draft, name, baseUrl: url.toString().replace(/\/+$/, ""), apiKey: draft.apiKey.trim(), models };
}
