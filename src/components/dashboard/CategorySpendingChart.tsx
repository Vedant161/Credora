"use client";

import { apiFetch } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import {
    useEffect,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import styles from "./CategorySpendingChart.module.css";

interface CategorySpending {
    category: string;
    total: number;
}

export default function CategorySpendingChart() {
    const router = useRouter();

    const [data, setData] =
        useState<CategorySpending[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        async function fetchCategorySpending() {
            try {
                setLoading(true);
                setError(null);

                const result = await apiFetch<any>(
                    API_ENDPOINTS.categorySpending
                );

                setData(result);
            } catch (error) {
                console.error(error);

                setError(
                    "Unable to load category spending."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchCategorySpending();
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
                            By Category
                        </h2>
                    </div>

                    <span className={styles.period}>
                        Successful transactions
                    </span>
                </div>

                <div className={styles.list}>
                    Loading category spending...
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
                            By Category
                        </h2>
                    </div>
                </div>

                <div className={styles.list}>
                    {error}
                </div>
            </section>
        );
    }

    const categories = [...data]
        .sort((a, b) => b.total - a.total)
        .slice(0, 6);

    const maxAmount =
        categories.length > 0
            ? categories[0].total
            : 0;

    return (
        <section className={styles.card}>
            <div className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>
                        Spending
                    </p>

                    <h2 className={styles.title}>
                        By Category
                    </h2>
                </div>

                <span className={styles.period}>
                    Successful transactions
                </span>
            </div>

            <div className={styles.list}>
                {categories.map(
                    (item) => {
                        const percentage =
                            maxAmount === 0
                                ? 0
                                : (
                                    item.total /
                                    maxAmount
                                ) * 100;

                        return (
                            <div
                                key={item.category}
                                className={styles.row}
                                onClick={() => {
                                    router.push(
                                        `/transactions?category=${encodeURIComponent(
                                            item.category
                                        )}`
                                    );
                                }}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" ||
                                        event.key === " "
                                    ) {
                                        event.preventDefault();

                                        router.push(
                                            `/transactions?category=${encodeURIComponent(
                                                item.category
                                            )}`
                                        );
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                            >
                                <div
                                    className={
                                        styles.rowHeader
                                    }
                                >
                                    <span>
                                        {
                                            item.category
                                        }
                                    </span>

                                    <strong>
                                        {item.total.toLocaleString(
                                            "en-IN",
                                            {
                                                style:
                                                    "currency",
                                                currency:
                                                    "INR",
                                                maximumFractionDigits: 0,
                                            }
                                        )}
                                    </strong>
                                </div>

                                <div
                                    className={
                                        styles.track
                                    }
                                >
                                    <div
                                        className={
                                            styles.bar
                                        }
                                        style={{
                                            width: `${percentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
        </section>
    );
}