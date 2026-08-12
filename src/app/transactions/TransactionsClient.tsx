"use client";

import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import type { Transaction } from "@/types/transaction";
import { apiFetch } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/formatters";

import styles from "./TransactionsClient.module.css";

import TransactionDrawer from "@/components/transactions/TransactionDrawer";

const PAGE_SIZE = 20;

export default function TransactionsClient() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    const searchParams = useSearchParams();

    const [category, setCategory] = useState(
        () => searchParams.get("category") || "ALL"
    );

    const [status, setStatus] = useState("ALL");

    const [transactions, setTransactions] =
        useState<Transaction[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [currentPage, setCurrentPage] =
        useState(1);

    const [totalPages, setTotalPages] =
        useState(1);

    const [totalTransactions, setTotalTransactions] =
        useState(0);

    const [sortDirection, setSortDirection] = useState<
        "asc" | "desc"
    >("desc");

    const [sortBy, setSortBy] =
        useState<"date" | "amount">("date");

    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);

    const [paymentMethod, setPaymentMethod] =
        useState("ALL");

    const [minAmount, setMinAmount] =
        useState("");

    const [maxAmount, setMaxAmount] =
        useState("");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

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

    function clearFilters() {
        setSearch("");
        setCategory("ALL");
        setStatus("ALL");
        setPaymentMethod("ALL");
        setMinAmount("");
        setMaxAmount("");
        setStartDate("");
        setEndDate("");
        setCurrentPage(1);
    }

    async function fetchTransactions() {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();

            params.set(
                "page",
                String(currentPage)
            );

            params.set(
                "limit",
                String(PAGE_SIZE)
            );

            if (debouncedSearch.trim()) {
                params.set(
                    "search",
                    debouncedSearch.trim()
                );
            }

            if (category !== "ALL") {
                params.set(
                    "category",
                    category
                );
            }

            if (status !== "ALL") {
                params.set(
                    "status",
                    status
                );
            }

            if (paymentMethod !== "ALL") {
                params.set(
                    "paymentMethod",
                    paymentMethod
                );
            }

            if (minAmount !== "") {
                params.set(
                    "minAmount",
                    minAmount
                );
            }

            if (maxAmount !== "") {
                params.set(
                    "maxAmount",
                    maxAmount
                );
            }

            if (startDate !== "") {
                params.set(
                    "startDate",
                    startDate
                );
            }

            if (endDate !== "") {
                params.set(
                    "endDate",
                    endDate
                );
            }

            params.set(
                "sortBy",
                sortBy
            );

            params.set(
                "sortOrder",
                sortDirection
            );

            const result = await apiFetch<any>(
                `${API_ENDPOINTS.transactions}?${params.toString()}`
            );

            const normalizedTransactions =
                result.data.map(
                    (transaction: Transaction) => ({
                        ...transaction,
                        amount:
                            Number(
                                transaction.amount
                            ),
                    })
                );

            setTransactions(
                normalizedTransactions
            );

            setTotalTransactions(
                result.pagination.total
            );

            setTotalPages(
                result.pagination.totalPages
            );
        } catch (error) {
            console.error(
                "Transaction fetch failed:",
                error
            );

            setError(
                "Unable to load transactions."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const urlCategory =
            searchParams.get("category");

        if (urlCategory) {
            setCategory(urlCategory);
            setCurrentPage(1);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchTransactions();
    }, [
        currentPage,
        debouncedSearch,
        category,
        status,
        paymentMethod,
        minAmount,
        maxAmount,
        startDate,
        endDate,
        sortBy,
        sortDirection,
    ]);

    const categories = [
        "ALL",
        "Health",
        "Insurance",
        "Food & Dining",
        "Fuel",
        "Utilities",
        "Education",
        "Shopping",
        "Travel",
        "Entertainment",
        "Groceries",
        "Other",
    ];

    const paymentMethods = [
        "ALL",
        "Credit Card",
        "Netbanking",
        "UPI",
        "Debit Card",
    ];

    return (
        <section className={styles.container}>

            <div className={styles.toolbar}>

                <div className={styles.searchBox}>
                    <span>⌕</span>

                    <input
                        type="text"
                        placeholder="Search merchant..."
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <select
                    value={category}
                    onChange={(event) => {
                        setCategory(event.target.value);
                        setCurrentPage(1);
                    }}
                    className={styles.select}
                >
                    {categories.map((item) => (
                        <option
                            key={item}
                            value={item}
                        >
                            {item === "ALL"
                                ? "All categories"
                                : item}
                        </option>
                    ))}
                </select>

                <select
                    value={status}
                    onChange={(event) => {
                        setStatus(event.target.value);
                        setCurrentPage(1);
                    }}
                    className={styles.select}
                >
                    <option value="ALL">
                        All statuses
                    </option>

                    <option value="SUCCESS">
                        Successful
                    </option>

                    <option value="FAILED">
                        Failed
                    </option>

                    <option value="PENDING">
                        Pending
                    </option>
                </select>

                <select
                    value={paymentMethod}
                    onChange={(event) => {
                        setPaymentMethod(
                            event.target.value
                        );

                        setCurrentPage(1);
                    }}
                    className={styles.select}
                >
                    {paymentMethods.map((method) => (
                        <option
                            key={method}
                            value={method}
                        >
                            {method === "ALL"
                                ? "All payment methods"
                                : method}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    min="0"
                    placeholder="Min amount"
                    value={minAmount}
                    onChange={(event) => {
                        setMinAmount(event.target.value);
                        setCurrentPage(1);
                    }}
                    className={styles.amountInput}
                />

                <input
                    type="number"
                    min="0"
                    placeholder="Max amount"
                    value={maxAmount}
                    onChange={(event) => {
                        setMaxAmount(event.target.value);
                        setCurrentPage(1);
                    }}
                    className={styles.amountInput}
                />

                <input
                    type="date"
                    value={startDate}
                    onChange={(event) => {
                        setStartDate(event.target.value);
                        setCurrentPage(1);
                    }}
                    className={styles.dateInput}
                />

                <input
                    type="date"
                    value={endDate}
                    onChange={(event) => {
                        setEndDate(event.target.value);
                        setCurrentPage(1);
                    }}
                    className={styles.dateInput}
                />

                <button
                    className={styles.clearButton}
                    onClick={clearFilters}
                >
                    Clear filters
                </button>

            </div>

            <div className={styles.summary}>

                <div>
                    <strong>
                        {totalTransactions}
                    </strong>

                    <span>
                        {" "}transactions
                    </span>
                </div>

                <div className={styles.sortControls}>
                    <span>Sort:</span>

                    <button
                        className={styles.sortButton}
                        onClick={() => {
                            if (sortBy === "date") {
                                setSortDirection((current) =>
                                    current === "desc"
                                        ? "asc"
                                        : "desc"
                                );
                            } else {
                                setSortBy("date");
                                setSortDirection("desc");
                            }

                            setCurrentPage(1);
                        }}
                    >
                        Date{" "}
                        {sortBy === "date" &&
                            (sortDirection === "desc"
                                ? "↓"
                                : "↑")}
                    </button>

                    <button
                        className={styles.sortButton}
                        onClick={() => {
                            if (sortBy === "amount") {
                                setSortDirection((current) =>
                                    current === "desc"
                                        ? "asc"
                                        : "desc"
                                );
                            } else {
                                setSortBy("amount");
                                setSortDirection("desc");
                            }

                            setCurrentPage(1);
                        }}
                    >
                        Amount{" "}
                        {sortBy === "amount" &&
                            (sortDirection === "desc"
                                ? "↓"
                                : "↑")}
                    </button>
                </div>

            </div>

            {(
                category !== "ALL" ||
                status !== "ALL" ||
                paymentMethod !== "ALL" ||
                search.trim() !== "" ||
                minAmount !== "" ||
                maxAmount !== "" ||
                startDate !== "" ||
                endDate !== ""
            ) && (
                    <div className={styles.activeFilters}>
                        <span>Filters applied</span>

                        {search.trim() && (
                            <span className={styles.filterChip}>
                                Search: {search}
                            </span>
                        )}

                        {category !== "ALL" && (
                            <span className={styles.filterChip}>
                                Category: {category}
                            </span>
                        )}

                        {status !== "ALL" && (
                            <span className={styles.filterChip}>
                                Status: {status}
                            </span>
                        )}

                        {paymentMethod !== "ALL" && (
                            <span className={styles.filterChip}>
                                Payment: {paymentMethod}
                            </span>
                        )}
                        {minAmount !== "" && (
                            <span className={styles.filterChip}>
                                Min: ₹{Number(minAmount).toLocaleString("en-IN")}
                            </span>
                        )}

                        {maxAmount !== "" && (
                            <span className={styles.filterChip}>
                                Max: ₹{Number(maxAmount).toLocaleString("en-IN")}
                            </span>
                        )}

                        {startDate !== "" && (
                            <span className={styles.filterChip}>
                                From: {startDate}
                            </span>
                        )}

                        {endDate !== "" && (
                            <span className={styles.filterChip}>
                                To: {endDate}
                            </span>
                        )}
                    </div>
                )}

            <div className={styles.tableWrapper}>

                {loading && (
                    <div className={styles.loading}>
                        Loading transactions...
                    </div>
                )}

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <table className={styles.table}>

                    <thead>
                        <tr>
                            <th>Merchant</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Payment Method</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>

                        {!loading &&
                            transactions.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className={styles.empty}
                                    >
                                        No transactions found.
                                    </td>
                                </tr>
                            )}

                        {transactions.map(
                            (transaction) => (
                                <tr
                                    key={transaction.id}
                                    onClick={() =>
                                        setSelectedTransaction(
                                            transaction
                                        )
                                    }
                                >

                                    <td>
                                        <div className={styles.merchant}>

                                            <div
                                                className={
                                                    styles.merchantIcon
                                                }
                                            >
                                                {transaction.merchant.charAt(0)}
                                            </div>

                                            <div>
                                                <strong>
                                                    {transaction.merchant}
                                                </strong>

                                                <span>
                                                    {transaction.id}
                                                </span>
                                            </div>

                                        </div>
                                    </td>

                                    <td>
                                        <span
                                            className={styles.category}
                                        >
                                            {getCategoryLabel(transaction.category)}
                                        </span>
                                    </td>

                                    <td>
                                        <strong>
                                            {transaction.currency ===
                                                "INR"
                                                ? "₹"
                                                : transaction.currency}

                                            {transaction.amount.toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }
                                            )}
                                        </strong>
                                    </td>

                                    <td>
                                        {new Date(
                                            transaction.timestamp
                                        ).toLocaleDateString(
                                            "en-IN",
                                            {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            }
                                        )}
                                    </td>

                                    <td>
                                        {transaction.payment_method}
                                    </td>

                                    <td>

                                        <span
                                            className={
                                                normalizeStatus(transaction.status) ===
                                                    "SUCCESS"
                                                    ? styles.success
                                                    : normalizeStatus(transaction.status) ===
                                                        "FAILED"
                                                        ? styles.failed
                                                        : styles.pending
                                            }
                                        >
                                            <span className={styles.statusDot} />

                                            {normalizeStatus(transaction.status)}
                                        </span>

                                    </td>

                                </tr>
                            )
                        )}

                        {totalTransactions ===
                            0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className={styles.empty}
                                    >
                                        No transactions found.
                                    </td>
                                </tr>
                            )}

                    </tbody>

                </table>

            </div>

            <div className={styles.pagination}>

                <span>
                    Showing{" "}

                    {totalTransactions === 0
                        ? 0
                        : (currentPage - 1) *
                        PAGE_SIZE +
                        1}

                    –

                    {Math.min(
                        currentPage * PAGE_SIZE,
                        totalTransactions
                    )}

                    {" "}of{" "}
                    {totalTransactions}
                </span>

                <div
                    className={
                        styles.paginationButtons
                    }
                >

                    <button
                        disabled={currentPage === 1}
                        onClick={() =>
                            setCurrentPage(
                                (page) => page - 1
                            )
                        }
                    >
                        ←
                    </button>

                    <span>
                        {currentPage} / {totalPages}
                    </span>

                    <button
                        disabled={
                            currentPage === totalPages
                        }
                        onClick={() =>
                            setCurrentPage(
                                (page) => page + 1
                            )
                        }
                    >
                        →
                    </button>

                </div>

            </div>
            <TransactionDrawer
                transaction={selectedTransaction}
                onClose={() =>
                    setSelectedTransaction(null)
                }
            />

        </section>
    );
}