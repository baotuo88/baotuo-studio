import type { HomepageShowcase, HomepageShowcasePage } from "@/services/api/server";

export type HomepageVideoShowcase = HomepageShowcase & { fullVideoUrl?: string; visualStyle?: string };

export const homepageTargetPaths: Record<HomepageShowcase["targetType"], string> = {
    image: "/image",
    video: "/video",
    canvas: "/canvas",
    asset: "/assets",
};

export function getHomepageTargetPath(targetType: HomepageShowcase["targetType"]) {
    return homepageTargetPaths[targetType];
}

export function getHomepageCreationHref(item: HomepageShowcase) {
    const path = item.targetPath || getHomepageTargetPath(item.targetType);
    return item.promptContent ? `${path}${path.includes("?") ? "&" : "?"}initialPrompt=${encodeURIComponent(item.promptContent)}` : path;
}

/** Display only administrator-published content; empty installations have no demo assets. */
export function readHomepageShowcasePage(result: HomepageShowcasePage) {
    const items = result.items || [];
    if (items.some((item) => !isValidHomepageShowcase(item))) {
        throw new Error("首页精选内容包含无效媒体或入口配置");
    }
    return { ...result, items, categories: result.categories || [] };
}

function isValidHomepageShowcase(item: HomepageShowcase) {
    return (
        item.mediaType === "video" &&
        (item.targetType === "image" || item.targetType === "video" || item.targetType === "canvas" || item.targetType === "asset") &&
        Boolean(item.mediaUrl) &&
        Boolean(item.targetPath) &&
        item.targetPath.startsWith("/") &&
        !item.targetPath.startsWith("//")
    );
}
