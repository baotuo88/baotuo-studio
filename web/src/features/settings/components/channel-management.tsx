"use client";

import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, App, Button, Empty, Form, Input, Modal, Popconfirm, Select, Space, Spin, Tag } from "antd";
import { Plus, RefreshCw, Settings2 } from "lucide-react";
import { createChannel, updateChannel, deleteChannel, listChannels, refreshChannelModels, type ServerChannel } from "@/services/api/server";
import { useConfigStore, type ApiCallFormat } from "../stores/use-config-store";
import { normalizeChannelDraft } from "../lib/channel-draft";

const formats: { value: ApiCallFormat; label: string }[] = [
    { value: "openai", label: "OpenAI 兼容" },
    { value: "gemini", label: "Google Gemini" },
    { value: "anthropic", label: "Anthropic" },
    { value: "openai-video-json", label: "OpenAI 视频 JSON" },
    { value: "evolink", label: "Evolink" },
    { value: "seedance", label: "火山引擎 Seedance" },
    { value: "minimax", label: "MiniMax" },
    { value: "agnes", label: "Agnes" },
    { value: "muse", label: "Muse" },
    { value: "dola", label: "Dola" },
    { value: "autodl-comfyui", label: "AutoDL ComfyUI" },
    { value: "custom", label: "自定义请求模板" },
];

export function ChannelManagement() {
    const { message } = App.useApp();
    const [channels, setChannels] = useState<ServerChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [draft, setDraft] = useState<ServerChannel | null>(null);
    const [editing, setEditing] = useState(false);
    const [busy, setBusy] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [form] = Form.useForm<ServerChannel>();
    const fetchVersion = useRef(0);
    const openConfigDialog = useConfigStore(state => state.openConfigDialog);

    const reload = useCallback(async () => {
        setLoading(true);
        setError("");
        try { setChannels((await listChannels()).channels); }
        catch { setError("渠道加载失败，请重试"); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { void reload(); }, [reload]);

    const openEditor = (channel?: ServerChannel) => {
        fetchVersion.current++;
        setEditing(Boolean(channel));
        // Never place a saved secret in the form; an empty key preserves it on update.
        const next: ServerChannel = channel ? { ...channel, apiKey: "", models: [...channel.models] }
            : { id: nanoid(), name: "", baseUrl: "", apiKey: "", apiFormat: "openai", models: [] };
        setDraft(next);
        form.setFieldsValue(next);
    };
    const closeEditor = () => { fetchVersion.current++; setDraft(null); };
    const refreshSnapshot = async () => {
        await reload();
        try { await useConfigStore.getState().refreshModelConfiguration(); }
        catch { message.warning("配置已保存，但模型目录刷新失败，请刷新页面"); }
    };
    const save = async () => {
        if (busy || !draft) return;
        let values: ServerChannel;
        try { values = normalizeChannelDraft({ ...draft, ...await form.validateFields() }); }
        catch (failure) { if (failure instanceof Error) message.error(failure.message); return; }
        setBusy(true);
        try {
            await (editing ? updateChannel(values) : createChannel(values));
            closeEditor();
            message.success("渠道已保存，请继续配置模型类型与能力");
            await refreshSnapshot();
        } catch (failure) { message.error(failure instanceof Error ? failure.message : "保存失败"); }
        finally { setBusy(false); }
    };
    const fetchModels = async () => {
        if (fetching) return;
        try { await form.validateFields(["baseUrl", "apiKey", "apiFormat"]); } catch { return; }
        const values = form.getFieldsValue();
        if (!values.apiKey?.trim()) { message.info("拉取模型需重新输入 API Key；也可以直接手填模型 ID"); return; }
        const version = ++fetchVersion.current;
        setFetching(true);
        try {
            const result = await refreshChannelModels(values);
            if (version !== fetchVersion.current) return;
            form.setFieldValue("models", [...new Set([...(form.getFieldValue("models") || []), ...result.models])]);
            message.success(`已获取 ${result.models.length} 个模型，现有列表已保留`);
        } catch { message.error("拉取失败，请检查地址、密钥和协议；供应商不提供模型列表时可手动填写"); }
        finally { setFetching(false); }
    };
    const remove = async (channel: ServerChannel) => {
        setBusy(true);
        try { await deleteChannel(channel.id); message.success("渠道已删除"); await refreshSnapshot(); }
        catch (failure) { message.error(failure instanceof Error ? failure.message : "删除失败"); }
        finally { setBusy(false); }
    };

    return <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-lg font-semibold">自定义模型渠道</h2><p className="mt-1 text-sm text-[var(--studio-muted)]">添加供应商接口，再为模型设置类型、能力和默认项。</p></div>
            <Space wrap>
                <Button icon={<RefreshCw size={15} />} onClick={() => void reload()} disabled={busy || loading}>刷新</Button>
                <Button icon={<Settings2 size={15} />} onClick={() => openConfigDialog(false, "models")} disabled={loading || busy || Boolean(error)}>模型能力与计费</Button>
                <Button type="primary" icon={<Plus size={15} />} onClick={() => openEditor()} disabled={busy}>添加渠道</Button>
            </Space>
        </div>
        <Alert type="info" showIcon title="直接连接你配置的模型服务" description="接口地址需包含供应商要求的版本路径（例如 /v1）。可手动输入模型 ID，或从供应商拉取列表；保存后在“模型能力与计费”中选择图片、视频、文本或语音模型。" />
        {error ? <Alert type="error" showIcon title={error} action={<Button onClick={() => void reload()}>重试</Button>} /> : null}
        {loading ? <div className="p-10 text-center"><Spin /></div> : !channels.length && !error ? <Empty description="还没有模型渠道，添加第一个接口开始创作" /> : (
            <div className="grid gap-4 xl:grid-cols-2">{channels.map(channel => <section key={channel.id} className="min-w-0 rounded-xl border border-[var(--studio-line)] bg-[var(--studio-surface)] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{channel.name}</h3><Tag>{formats.find(format => format.value === channel.apiFormat)?.label || "兼容协议"}</Tag></div>
                <p className="my-3 break-all text-xs text-[var(--studio-muted)]">{channel.baseUrl}</p>
                <div className="mb-4 flex flex-wrap gap-1">{channel.models.slice(0, 8).map(model => <Tag key={model}>{model}</Tag>)}{channel.models.length > 8 ? <Tag>另 {channel.models.length - 8} 个</Tag> : null}</div>
                <Space><Button onClick={() => openEditor(channel)} disabled={busy}>编辑</Button><Popconfirm title="删除渠道及关联模型配置？" description="历史作品保留；正在执行的任务会阻止删除。" onConfirm={() => remove(channel)} okText="删除" cancelText="取消" disabled={busy}><Button danger disabled={busy}>删除</Button></Popconfirm></Space>
            </section>)}</div>
        )}
        <Modal open={Boolean(draft)} title={editing ? "编辑模型渠道" : "添加模型渠道"} onCancel={closeEditor} onOk={() => void save()} confirmLoading={busy} okButtonProps={{ disabled: fetching }} cancelButtonProps={{ disabled: busy || fetching }} closable={!busy && !fetching} mask={{ closable: false }} keyboard={!busy && !fetching} okText="保存渠道" cancelText="取消" width={640}>
            <Form form={form} layout="vertical" disabled={busy || fetching} className="mt-5">
                <Form.Item name="name" label="渠道名称" rules={[{ required: true, whitespace: true, message: "请输入渠道名称" }]}><Input placeholder="例如：我的模型服务" maxLength={100} /></Form.Item>
                <Form.Item name="apiFormat" label="接口协议" rules={[{ required: true }]}><Select options={formats} /></Form.Item>
                <Form.Item name="baseUrl" label="接口地址" rules={[{ required: true, whitespace: true, message: "请输入接口地址" }]}><Input placeholder="https://api.example.com/v1" autoComplete="off" /></Form.Item>
                <Form.Item name="apiKey" label="API Key" extra={editing ? "留空保留原密钥；需要拉取模型时请重新输入。" : "密钥仅由管理员配置，由服务端加密保存。"}><Input.Password autoComplete="new-password" placeholder={editing ? "留空保留原密钥" : "填写供应商密钥，无鉴权服务可留空"} /></Form.Item>
                <Form.Item name="models" label="模型 ID" rules={[{ required: true, type: "array", min: 1, message: "至少添加一个模型 ID" }]} extra="输入供应商的完整模型 ID，按回车添加。拉取列表会合并现有模型。"><Select mode="tags" tokenSeparators={[",", "\n"]} placeholder="输入模型 ID 后按回车" open={false} /></Form.Item>
                <Button onClick={() => void fetchModels()} loading={fetching} disabled={busy || fetching}>从接口拉取模型</Button>
                {editing ? <p className="mt-3 text-xs text-[var(--studio-muted)]">移除模型会删除关联的能力配置；正在执行的任务会阻止移除。</p> : null}
            </Form>
        </Modal>
    </div>;
}
