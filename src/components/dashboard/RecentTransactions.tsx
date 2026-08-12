"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

import { useRouter } from "next/navigation";

import styles from "./RecentTransactions.module.css";

import TransactionDrawer from "@/components/transactions/TransactionDrawer";

import type { Transaction } from "@/types/transaction";

function formatCurrency(
    amount: number,
    currency: string
) {
    return amount.toLocaleString("en-IN", {
        style: "currency",
        currency: currency || "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatDate(timestamp: string) {
    return new Date(
        timestamp
    ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getCategoryLabel(
    category: string | null | undefined
) {
    if (!category || !category.trim()) {
        return "Other";
    }

    return category;
}

export default function RecentTransactions() {

    const router = useRouter();

    const [transactions, setTransactions] =
        useState<Transaction[]>([]);

    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        async function fetchRecentTransactions() {
            try {
                setLoading(true);
                setError(null);

                const data = await apiFetch<any>(
                    `${API_ENDPOINTS.transactions}?page=1&limit=5&sortBy=date&sortOrder=desc`
                );

                const records =
                    Array.isArray(data)
                        ? data
                        : data.data ?? [];

                const normalizedRecords: Transaction[] =
                    records.map((transaction: Transaction) => ({
                        ...transaction,
                        amount: Number(transaction.amount),
                        status:
                            transaction.status
                                .trim()
                                .toUpperCase() as Transaction["status"],
                    }));

                setTransactions(normalizedRecords);
            } catch (error) {
                console.error(error);

                setError(
                    "Unable to load recent transactions."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchRecentTransactions();
    }, []);

    return (
        <>
            <section className={styles.card}>
                <div className={styles.header}>
                    <div>
                        <h2>
                            Recent Transactions
                        </h2>

                        <p>
                            Your latest credit-card payments
                        </p>
                    </div>

                    <button
                        className={styles.viewAll}
                        onClick={() => router.push("/transactions")}
                    >
                        View all
                    </button>
                </div>

                <div className={styles.tableWrapper}>
                    {loading ? (
                        <div>
                            Loading recent transactions...
                        </div>
                    ) : error ? (
                        <div>
                            {error}
                        </div>
                    ) : (
                        <table
                            className={styles.table}
                        >
                            <thead>
                                <tr>
                                    <th>
                                        Merchant
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Amount
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions.map((transaction) => {
                                    const status =
                                        transaction.status
                                            .trim()
                                            .toUpperCase();

                                    return (
                                        <tr
                                            key={transaction.id}
                                            onClick={() =>
                                                setSelectedTransaction(transaction)
                                            }
                                            className={styles.clickableRow}
                                        >
                                            <td>
                                                <div
                                                    className={
                                                        styles.merchant
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.merchantIcon
                                                        }
                                                    >
                                                        {transaction.merchant
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                transaction.merchant
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                transaction.payment_method
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        styles.category
                                                    }
                                                >
                                                    {getCategoryLabel(
                                                        transaction.category
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                <strong>
                                                    {formatCurrency(
                                                        Number(
                                                            transaction.amount
                                                        ),
                                                        transaction.currency
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        styles.date
                                                    }
                                                >
                                                    {formatDate(
                                                        transaction.timestamp
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        status === "SUCCESS"
                                                            ? styles.success
                                                            : status === "FAILED"
                                                                ? styles.failed
                                                                : styles.pending
                                                    }
                                                >
                                                    <span
                                                        className={styles.statusDot}
                                                    />

                                                    {status === "SUCCESS"
                                                        ? "Successful"
                                                        : status === "FAILED"
                                                            ? "Failed"
                                                            : "Pending"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
            <TransactionDrawer
                transaction={selectedTransaction}
                onClose={() =>
                    setSelectedTransaction(null)
                }
            />
        </>
    );
}