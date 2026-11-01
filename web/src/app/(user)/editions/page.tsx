import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clapperboard, ImageIcon, Layers3, Images } from "lucide-react";
import { brand } from "@/shared/config/brand";
import { PageShell } from "@/shared/components/page-shell";

export const metadata: Metadata = {
    title: `关于工作台 - ${brand.name}`,
    description: brand.description,
};

const workspaces = [
    { href: "/image", icon: ImageIcon, title: "图片创作", description: "描述想法、添加参考图，逐步打磨画面。" },
    { href: "/video", icon: Clapperboard, title: "视频生成", description: "将文字和参考素材转化为动态影像。" },
    { href: "/canvas", icon: Layers3, title: "无限画布", description: "组织分镜、连接素材，在一个空间里编排作品。" },
    { href: "/assets", icon: Images, title: "素材管理", description: "集中整理创作素材，复用已有成果。" },
];

export default function AboutWorkspacePage() {
    return (
        <PageShell eyebrow={brand.name} title={brand.tagline} description="从第一张图片到完整的视频，在同一个工作台里持续创作。" icon={<Layers3 />} width="wide">
            <div className="grid gap-4 md:grid-cols-2">
                {workspaces.map(({ href, icon: Icon, title, description }) => (
                    <Link key={href} href={href} className="group rounded-2xl border border-[var(--studio-line)] bg-[var(--studio-surface)] p-6 transition-colors hover:border-[var(--studio-primary-line)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--studio-action)]">
                        <div className="flex items-center justify-between text-[var(--studio-action)]"><Icon className="size-6" aria-hidden="true" /><ArrowUpRight className="size-4" aria-hidden="true" /></div>
                        <h2 className="mt-6 text-lg font-semibold text-[var(--studio-ink)]">{title}</h2>
                        <p className="mt-2 text-sm leading-6 text-[var(--studio-muted)]">{description}</p>
                    </Link>
                ))}
            </div>
        </PageShell>
    );
}
