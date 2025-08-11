"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Top navigation bar shared across pages.
 * Uses global theme tokens defined in globals.css (Tailwind v4 @theme).
 */
export default function NavBar() {
    const pathname = usePathname();
    const link = (href: string, label: string) => {
        const active = pathname === href;
        return (
            <Link
                key={href}
                href={href}
                className={`px-3 py-2 rounded-md transition-colors text-sm
          ${active ? "text-up" : "text-chart hover:text-up"}`}>
                {label}
            </Link>
        );
    };

    return (
        <header className="bg-chart border-b border-chart-grid sticky top-0 z-40">
            <nav className="mx-auto max-w-7xl px-8 h-16 flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 mr-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-up" />
                    <span className="text-chart font-semibold">BitShuriken</span>
                </Link>
                <div className="flex-1 flex items-center gap-2">
                    {link("/spot", "Spot")}
                    {link("/futures", "Futures")}
                    {link("/account", "Account")}
                </div>
            </nav>
        </header>
    );
}
