/** Resolve nested workspace routes once for desktop, mobile, and the header. */
export function activeWorkspaceSlug<T extends string>(pathname: string, slugs: readonly T[]): T | undefined {
    const path = pathname.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
    if (path === "/admin" || path.startsWith("/admin/")) return slugs.find(slug => slug === "admin/system");
    return [...slugs].sort((a, b) => b.length - a.length).find(slug => path === `/${slug}` || path.startsWith(`/${slug}/`));
}
