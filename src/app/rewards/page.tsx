"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

import styles from "./page.module.css";

interface Reward {
    id: number;
    name: string;
    description: string;
    coin_cost: number;
}

interface RewardBalance {
    earnedCoins: number;
    redeemedCoins: number;
    balance: number;
}

interface Redemption {
    id: number;
    reward_id: number;
    coins_spent: number;
    redeemed_at: string;
    reward_name: string;
    reward_description: string;
}



export default function RewardsPage() {
    const [rewards, setRewards] =
        useState<Reward[]>([]);

    const [balance, setBalance] =
        useState<RewardBalance | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [redeemingId, setRedeemingId] =
        useState<number | null>(null);

    const [message, setMessage] =
        useState<string | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    const [history, setHistory] =
        useState<Redemption[]>([]);

    async function fetchHistory() {
        const result = await apiFetch<any>(API_ENDPOINTS.rewardHistory);

        setHistory(result.data);
    }

    async function fetchRewards() {
        const result = await apiFetch<any>(API_ENDPOINTS.rewards);

        setRewards(result.data);
    }

    async function fetchBalance() {
        const result = await apiFetch<RewardBalance>(API_ENDPOINTS.rewardBalance);

        setBalance(result);
    }

    useEffect(() => {
        async function loadRewards() {
            try {
                setLoading(true);
                setError(null);

                await Promise.all([
                    fetchRewards(),
                    fetchBalance(),
                    fetchHistory(),
                ]);
            } catch (error) {
                console.error(error);

                setError(
                    "Unable to load rewards."
                );
            } finally {
                setLoading(false);
            }
        }

        loadRewards();
    }, []);

    async function handleRedeem(
        rewardId: number
    ) {
        try {
            setRedeemingId(rewardId);
            setMessage(null);
            setError(null);

            const result = await apiFetch<any>(
                API_ENDPOINTS.rewardRedeem,
                {
                    method: "POST",
                    body: JSON.stringify({ rewardId })
                }
            );

            setMessage(
                "Reward redeemed successfully."
            );

            setBalance(
                (current) =>
                    current
                        ? {
                            ...current,
                            redeemedCoins:
                                current.redeemedCoins +
                                Number(
                                    result.reward
                                        .coinCost
                                ),
                            balance:
                                result.balance,
                        }
                        : current
            );

            await fetchHistory();

        } catch (error) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to redeem reward."
            );
        } finally {
            setRedeemingId(null);
        }
    }

    function formatCoins(
        value: number
    ) {
        return value.toLocaleString(
            "en-IN"
        );
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <p>
                    Loading rewards...
                </p>
            </div>
        );
    }

    if (error && !balance) {
        return (
            <div className={styles.page}>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <section
                className={styles.heading}
            >
                <p
                    className={
                        styles.eyebrow
                    }
                >
                    Rewards
                </p>

                <h1>
                    Redeem your coins
                </h1>

                <p>
                    Use your earned coins
                    to redeem available
                    rewards.
                </p>
            </section>

            {message && (
                <div
                    className={
                        styles.successMessage
                    }
                >
                    {message}
                </div>
            )}

            {error && (
                <div
                    className={
                        styles.errorMessage
                    }
                >
                    {error}
                </div>
            )}

            <section
                className={
                    styles.balanceCard
                }
            >
                <div>
                    <p
                        className={
                            styles.balanceLabel
                        }
                    >
                        Available Balance
                    </p>

                    <strong
                        className={
                            styles.balance
                        }
                    >
                        {formatCoins(
                            balance?.balance ??
                            0
                        )}
                    </strong>

                    <span
                        className={
                            styles.coinsLabel
                        }
                    >
                        coins
                    </span>
                </div>

                <div
                    className={
                        styles.balanceStats
                    }
                >
                    <div>
                        <span>
                            Earned
                        </span>

                        <strong>
                            {formatCoins(
                                balance?.earnedCoins ??
                                0
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Redeemed
                        </span>

                        <strong>
                            {formatCoins(
                                balance?.redeemedCoins ??
                                0
                            )}
                        </strong>
                    </div>
                </div>
            </section>

            <section
                className={
                    styles.rewardsSection
                }
            >
                <div
                    className={
                        styles.sectionHeader
                    }
                >
                    <div>
                        <p
                            className={
                                styles.eyebrow
                            }
                        >
                            Catalogue
                        </p>

                        <h2>
                            Available Rewards
                        </h2>
                    </div>

                    <span>
                        {rewards.length}{" "}
                        rewards
                    </span>
                </div>

                <div
                    className={styles.grid}
                >
                    {rewards.map(
                        (reward) => {
                            const affordable =
                                (balance?.balance ??
                                    0) >=
                                Number(
                                    reward.coin_cost
                                );

                            const redeeming =
                                redeemingId ===
                                reward.id;

                            return (
                                <article
                                    key={
                                        reward.id
                                    }
                                    className={
                                        styles.rewardCard
                                    }
                                >
                                    <div
                                        className={
                                            styles.rewardIcon
                                        }
                                    >
                                        ₹
                                    </div>

                                    <h3>
                                        {
                                            reward.name
                                        }
                                    </h3>

                                    <p>
                                        {
                                            reward.description
                                        }
                                    </p>

                                    <div
                                        className={
                                            styles.rewardFooter
                                        }
                                    >
                                        <strong>
                                            {formatCoins(
                                                Number(
                                                    reward.coin_cost
                                                )
                                            )}{" "}
                                            coins
                                        </strong>

                                        <button
                                            disabled={
                                                !affordable ||
                                                redeeming
                                            }
                                            onClick={() =>
                                                handleRedeem(
                                                    reward.id
                                                )
                                            }
                                        >
                                            {redeeming
                                                ? "Redeeming..."
                                                : affordable
                                                    ? "Redeem"
                                                    : "Not enough coins"}
                                        </button>
                                    </div>
                                </article>
                            );
                        }
                    )}
                </div>
            </section>

            <section className={styles.historySection}>
                <div className={styles.sectionHeader}>
                    <div>
                        <p className={styles.eyebrow}>
                            Activity
                        </p>

                        <h2>
                            Redemption History
                        </h2>
                    </div>

                    <span>
                        {history.length} redemptions
                    </span>
                </div>

                {history.length === 0 ? (
                    <div className={styles.emptyHistory}>
                        <h3>
                            No redemptions yet
                        </h3>

                        <p>
                            Your redeemed rewards will
                            appear here.
                        </p>
                    </div>
                ) : (
                    <div className={styles.historyCard}>
                        {history.map((redemption) => (
                            <div
                                key={redemption.id}
                                className={styles.historyRow}
                            >
                                <div
                                    className={
                                        styles.historyIcon
                                    }
                                >
                                    ₹
                                </div>

                                <div
                                    className={
                                        styles.historyDetails
                                    }
                                >
                                    <strong>
                                        {redemption.reward_name}
                                    </strong>

                                    <span>
                                        {new Date(
                                            redemption.redeemed_at
                                        ).toLocaleDateString(
                                            "en-IN",
                                            {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            }
                                        )}
                                    </span>
                                </div>

                                <strong
                                    className={
                                        styles.historyCoins
                                    }
                                >
                                    -
                                    {formatCoins(
                                        Number(
                                            redemption.coins_spent
                                        )
                                    )}{" "}
                                    coins
                                </strong>
                            </div>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
}