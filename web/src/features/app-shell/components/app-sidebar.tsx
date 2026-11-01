"use client";

import { House } from "lucide-react";
import { NavigationLink as Link } from "./navigation-link";
import { useNavigationPathname } from "./workspace-navigation";
import { Tooltip } from "antd";

import { NAV_GROUPS, navigationTools } from "@/shared/constants/navigation-tools";
import { useUserStore } from "@/features/auth/stores/use-user-store";
import { cn } from "@/shared/lib/utils";
import { activeWorkspaceSlug } from "../lib/workspace-route";
import styles from "./app-sidebar.module.css";

export function AppSidebar() {
    const pathname = useNavigationPathname();
    const isAdmin = useUserStore((state) => state.user?.role === "admin");

    const visibleTools = navigationTools.filter((tool) => {
        if (tool.adminOnly && !isAdmin) return false;
        return true;
    });
    const activeSlug = activeWorkspaceSlug(pathname, navigationTools.map(tool => tool.slug));

    const renderNavItem = (tool: (typeof navigationTools)[number]) => {
        const Icon = tool.icon;
        const active = tool.slug === activeSlug;

        return (
            <Tooltip key={tool.slug} title={tool.label} placement="right" mouseEnterDelay={0.45}>
                <Link
                    href={`/${tool.slug}`}
                    className={cn(styles.item, active && styles.active)}
                    aria-label={tool.label}
                    aria-current={active ? "page" : undefined}
                >
                    <Icon className={styles.icon} strokeWidth={active ? 1.8 : 1.5} aria-hidden="true" />
                    <span className={styles.label}>{tool.label}</span>
                </Link>
            </Tooltip>
        );
    };

    return (
        <aside className={styles.rail}>
            <nav className={styles.navigation} aria-label="主导航">
                <Tooltip title="首页" placement="right" mouseEnterDelay={0.45}>
                    <Link href="/" aria-label="首页" aria-current={pathname === "/" ? "page" : undefined} className={cn(styles.item, pathname === "/" && styles.active)}>
                        <House className={styles.icon} strokeWidth={pathname === "/" ? 1.8 : 1.5} aria-hidden="true" />
                        <span className={styles.label}>首页</span>
                    </Link>
                </Tooltip>
                {NAV_GROUPS.map((group) => {
                    const items = visibleTools.filter((tool) => tool.group === group.key);
                    return items.length ? (
                        <div key={group.key} className={cn(styles.group, group.key === "resources" && styles.resources, group.key === "settings" && styles.settings)}>
                            <span className={styles.groupLabel}>{group.label}</span>
                            {items.map(renderNavItem)}
                        </div>
                    ) : null;
                })}
            </nav>
        </aside>
    );
}
