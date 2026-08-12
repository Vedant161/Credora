import { Suspense } from "react";
import TransactionsClient from "./TransactionsClient";
import styles from "./page.module.css";

export default function TransactionsPage() {
    return (
        <div className={styles.page}>
            <section className={styles.heading}>
                <p className={styles.eyebrow}>Transactions</p>

                <h1>All Transactions</h1>

                <p>
                    View and manage your credit card transactions.
                </p>
            </section>

            <Suspense fallback={<div>Loading transactions...</div>}>
                <TransactionsClient />
            </Suspense>
        </div>
    );
}