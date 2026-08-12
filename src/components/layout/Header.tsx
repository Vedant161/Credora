"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { useRouter } from "next/navigation";

import styles from "./Header.module.css";

interface RewardBalance {
    earnedCoins: number;
    redeemedCoins: number;
    balance: number;
}

export default function Header() {
    const router = useRouter();

    const [balance, setBalance] =
        useState<number | null>(null);

    const [search, setSearch] =
        useState("");

    useEffect(() => {
        async function fetchRewardBalance() {
            try {
                const data = await apiFetch<RewardBalance>(API_ENDPOINTS.rewardBalance);

                setBalance(data.balance);
            } catch (error) {
                console.error(
                    "Failed to load reward balance:",
                    error
                );

                setBalance(null);
            }
        }

        fetchRewardBalance();
    }, []);

    function handleSearch(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const value = search.trim();

        if (!value) {
            router.push("/transactions");
            return;
        }

        router.push(
            `/transactions?search=${encodeURIComponent(
                value
            )}`
        );
    }

    return (
        <header className={styles.header}>
            <form
                className={styles.search}
                onSubmit={handleSearch}
            >
                <span
                    className={styles.searchIcon}
                    aria-hidden="true"
                >
                    ⌕
                </span>

                <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    placeholder="Search transactions..."
                    aria-label="Search transactions"
                />
            </form>

            <div className={styles.headerRight}>

                <button
                    type="button"
                    className={styles.coinBalance}
                    onClick={() =>
                        router.push("/rewards")
                    }
                    aria-label="View rewards"
                >
                    <span
                        className={styles.coinIcon}
                        aria-hidden="true"
                    >
                        ◆
                    </span>

                    <div>
                        <span
                            className={
                                styles.coinAmount
                            }
                        >
                            {balance === null
                                ? "—"
                                : balance.toLocaleString(
                                    "en-IN"
                                )}
                        </span>

                        <span
                            className={
                                styles.coinLabel
                            }
                        >
                            coins
                        </span>
                    </div>
                </button>

                <div
                    className={styles.avatar}
                    aria-label="Vedant"
                >
                    V
                </div>
            </div>
        </header>
    );
}