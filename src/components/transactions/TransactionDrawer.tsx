"use client";

import { useEffect } from "react";

import type { Transaction } from "@/types/transaction";

import styles from "./TransactionDrawer.module.css";

interface TransactionDrawerProps {
    transaction: Transaction | null;
    onClose: () => void;
}

function normalizeStatus(status: string) {
    return status.trim().toUpperCase();
}

function getCategoryLabel(
    category: string | null | undefined
) {
    if (!category || !category.trim()) {
        return "Other";
    }

    return category;
}

export default function TransactionDrawer({
    transaction,
    onClose,
}: TransactionDrawerProps) {

    useEffect(() => {
        function handleEscape(
            event: KeyboardEvent
        ) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [onClose]);

    if (!transaction) {
        return null;
    }



    const status = normalizeStatus(
        transaction.status
    );

    const category = getCategoryLabel(
        transaction.category
    );

    const formattedAmount =
        transaction.amount.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );

    const transactionDate = new Date(
        transaction.timestamp
    );

    const formattedDate =
        transactionDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }
        );

    const formattedTime =
        transactionDate.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );

    return (
        <div
            className={styles.overlay}
            onClick={onClose}
        >
            <aside
                className={styles.drawer}
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <div className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>
                            Transaction Details
                        </p>

                        <h2>
                            {transaction.merchant}
                        </h2>
                    </div>

                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close transaction details"
                    >
                        ×
                    </button>
                </div>

                <div className={styles.amountSection}>
                    <span className={styles.amountLabel}>
                        Amount
                    </span>

                    <strong className={styles.amount}>
                        {transaction.currency ===
                            "INR"
                            ? "₹"
                            : transaction.currency}

                        {formattedAmount}
                    </strong>

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
                            className={
                                styles.statusDot
                            }
                        />

                        {status}
                    </span>
                </div>

                <div className={styles.section}>
                    <h3>
                        Transaction Information
                    </h3>

                    <div className={styles.details}>
                        <div className={styles.detailRow}>
                            <span>
                                Transaction ID
                            </span>

                            <strong>
                                {transaction.id}
                            </strong>
                        </div>

                        <div className={styles.detailRow}>
                            <span>
                                Category
                            </span>

                            <strong>
                                {category}
                            </strong>
                        </div>

                        <div className={styles.detailRow}>
                            <span>
                                Payment Method
                            </span>

                            <strong>
                                {transaction.payment_method}
                            </strong>
                        </div>

                        <div className={styles.detailRow}>
                            <span>
                                Currency
                            </span>

                            <strong>
                                {transaction.currency}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3>
                        Date & Time
                    </h3>

                    <div className={styles.details}>
                        <div className={styles.detailRow}>
                            <span>
                                Date
                            </span>

                            <strong>
                                {formattedDate}
                            </strong>
                        </div>

                        <div className={styles.detailRow}>
                            <span>
                                Time
                            </span>

                            <strong>
                                {formattedTime}
                            </strong>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}