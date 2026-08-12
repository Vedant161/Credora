"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./Sidebar.module.css";

const navigationItems = [
    {
        href: "/",
        label: "Dashboard",
        icon: "⌂",
    },
    {
        href: "/transactions",
        label: "Transactions",
        icon: "▤",
    },
    {
        href: "/rewards",
        label: "Rewards",
        icon: "◆",
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <div className={styles.logoMark}>
                    <img src="/logo.png" alt="Logo" width={40} height={40} />
                </div>

                <span>CredOra</span>
            </div>

            <nav
                className={styles.navigation}
                aria-label="Main navigation"
            >
                {navigationItems.map((item) => {
                    const isActive =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(
                                item.href
                            );

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive
                                ? styles.active
                                : ""
                                }`}
                        >
                            <span
                                className={styles.icon}
                                aria-hidden="true"
                            >
                                {item.icon}
                            </span>

                            <span>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className={styles.bottomSection}>
                <div className={styles.divider} />

                <button
                    type="button"
                    className={styles.navItem}
                    disabled
                    title="Settings coming soon"
                >
                    <span
                        className={styles.icon}
                        aria-hidden="true"
                    >
                        ⚙
                    </span>

                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
}