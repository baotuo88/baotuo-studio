import { brand } from "@/shared/config/brand";
import { cn } from "@/shared/lib/utils";

type BrandLogoProps = {
    compact?: boolean;
    className?: string;
    label?: string;
};

export function BrandLogo({ compact = false, className, label = brand.name }: BrandLogoProps) {
    return (
        <span role="img" aria-label={label} className={cn("inline-flex shrink-0 items-center gap-2.5 text-[var(--studio-ink)]", compact ? "size-8" : "h-9", className)}>
            <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className="h-full max-h-10 w-auto shrink-0">
                <rect width="40" height="40" rx="12" fill="var(--studio-action)" />
                <path d="M13 10v20h8a6 6 0 0 0 0-12h-8m0-8h7a4 4 0 0 1 0 8" stroke="var(--studio-action-foreground)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {!compact && <span aria-hidden="true" className="text-base font-semibold tracking-tight">{brand.name}</span>}
        </span>
    );
}
