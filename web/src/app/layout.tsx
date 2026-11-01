import { brand } from "@/shared/config/brand";
import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { AppProviders } from "@/features/app-shell/components/app-providers";
import { ThemeScript } from "@/features/theme/components/theme-script";
import { getInitialResolvedTheme, isDarkResolvedTheme } from "@/shared/lib/theme-preference";
import "antd/dist/reset.css";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
    title: brand.name,
    description: brand.description,
    icons: {
        icon: brand.icon,
        shortcut: brand.icon,
        apple: brand.appleIcon,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // The shell contains no user data. Resolve the saved theme in the bootstrap
    // script before paint so a theme cookie does not make every route dynamic.
    const initialThemePreference = "dark";
    const initialResolvedTheme = getInitialResolvedTheme(initialThemePreference);

    return (
        <html lang="zh-CN" suppressHydrationWarning className="font-sans" data-theme={initialResolvedTheme} data-theme-preference={initialThemePreference} style={{ colorScheme: isDarkResolvedTheme(initialResolvedTheme) ? "dark" : "light" }}>
            <body
                className="bg-background text-foreground antialiased"
                style={{
                    fontFamily: '"SF Pro Display","SF Pro Text","PingFang SC","Microsoft YaHei","Helvetica Neue",sans-serif',
                }}
            >
                <ThemeScript preference={initialThemePreference} />
                <AntdRegistry>
                    <AppProviders initialThemePreference={initialThemePreference} initialResolvedTheme={initialResolvedTheme}>
                        {children}
                    </AppProviders>
                </AntdRegistry>
            </body>
        </html>
    );
}
