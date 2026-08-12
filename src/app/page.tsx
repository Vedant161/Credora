"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";


import MonthlySpendingChart from "@/components/dashboard/MonthlySpendingChart";
import CategorySpendingChart from "@/components/dashboard/CategorySpendingChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import KpiCard from "@/components/dashboard/KpiCard";
import styles from "./page.module.css";

interface DashboardStats {
  totalTransactions: number;
  totalSpend: number;
  successfulTransactions: number;
  failedTransactions: number;
  successRate: number;
}

export default function DashboardPage() {
  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setLoading(true);
        setError(null);

        const data = await apiFetch<any>(API_ENDPOINTS.dashboardStats);

        setStats(data);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        {error}
      </div>
    );
  }

  const totalTransactions =
    stats?.totalTransactions ?? 0;

  const totalSpend =
    stats?.totalSpend ?? 0;

  const successfulTransactions =
    stats?.successfulTransactions ?? 0;

  const failedTransactions =
    stats?.failedTransactions ?? 0;

  const successRate =
    stats?.successRate ?? 0;

  const formattedTotalSpend =
    totalSpend.toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    );

  const formattedSuccessRate =
    `${successRate.toFixed(1)}%`;

  return (
    <div className={styles.page}>

      <section className={styles.heading}>
        <p className={styles.eyebrow}>
          Overview
        </p>

        <h1 className={styles.title}>
          Good evening, Vedant
        </h1>

        <p className={styles.subtitle}>
          Here's a summary of your
          spending and rewards.
        </p>
      </section>

      <section className={styles.kpiGrid}>
        <KpiCard
          label="Total Transactions"
          value={totalTransactions.toLocaleString(
            "en-IN"
          )}
          description="Across all recorded transactions"
        />

        <KpiCard
          label="Total Spend"
          value={formattedTotalSpend}
          description="Total value of successful payments"
        />

        <KpiCard
          label="Successful"
          value={successfulTransactions.toLocaleString(
            "en-IN"
          )}
          description={`${formattedSuccessRate} success rate`}
        />

        <KpiCard
          label="Failed"
          value={failedTransactions.toLocaleString(
            "en-IN"
          )}
          description="Transactions that failed"
        />
      </section>

      <section className={styles.analytics}>
        <MonthlySpendingChart />
        <CategorySpendingChart />
      </section>

      <RecentTransactions />
    </div>
  );
}