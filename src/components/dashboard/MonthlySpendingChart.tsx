"use client";

import { apiFetch } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import {
    useEffect,
    useState,
} from "react";

import styles from "./MonthlySpendingChart.module.css";

interface MonthlySpending {
    month: string;
    total: number;
}

export default function MonthlySpendingChart() {
    const [data, setData] =
        useState<MonthlySpending[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        async function fetchMonthlySpending() {
            try {
                setLoading(true);
                setError(null);

                const result = await apiFetch<any>(
                    API_ENDPOINTS.monthlySpending
                );

                setData(result);
            } catch (error) {
                console.error(error);

                setError(
                    "Unable to load monthly spending."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchMonthlySpending();
    }, []);

    if (loading) {
        return (
            <section className={styles.card}>
                <div className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>
                            Spending
                        </p>

                        <h2 className={styles.title}>
                            Monthly Spending
                        </h2>
                    </div>

                    <span className={styles.period}>
                        Successful transactions
                    </span>
                </div>

                <div className={styles.chart}>
                    Loading monthly spending...
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className={styles.card}>
                <div className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>
                            Spending
                        </p>

                        <h2 className={styles.title}>
                            Monthly Spending
                        </h2>
                    </div>
                </div>

                <div className={styles.chart}>
                    {error}
                </div>
            </section>
        );
    }

    const chartData = data.map((item) => ({
        month: item.month,
        total: Number(item.total),
    }));

    const maxAmount = Math.max(
        ...chartData.map(
            (item) => item.total
        ),
        0
    );

    return (
        <section className={styles.card}>
            <div className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>
                        Spending
                    </p>

                    <h2 className={styles.title}>
                        Monthly Spending
                    </h2>
                </div>

                <span className={styles.period}>
                    Successful transactions
                </span>
            </div>

            <div className={styles.chart}>
                {chartData.map((item) => {
                    const height =
                        maxAmount === 0
                            ? 0
                            : (item.total /
                                maxAmount) *
                            100;

                    const monthLabel =
                        new Date(
                            `${item.month}-01T00:00:00Z`
                        ).toLocaleDateString(
                            "en-IN",
                            {
                                month: "short",
                                year: "numeric",
                                timeZone: "UTC",
                            }
                        );

                    return (
                        <div
                            key={item.month}
                            className={
                                styles.column
                            }
                        >
                            <div
                                className={
                                    styles.value
                                }
                            >
                                {item.total >
                                    0
                                    ? item.total.toLocaleString(
                                        "en-IN",
                                        {
                                            style:
                                                "currency",
                                            currency:
                                                "INR",
                                            maximumFractionDigits:
                                                0,
                                        }
                                    )
                                    : "₹0"}
                            </div>

                            <div
                                className={
                                    styles.barArea
                                }
                            >
                                <div
                                    className={
                                        styles.bar
                                    }
                                    style={{
                                        height: `${height}%`,
                                    }}
                                />
                            </div>

                            <span
                                className={
                                    styles.month
                                }
                            >
                                {monthLabel}
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}