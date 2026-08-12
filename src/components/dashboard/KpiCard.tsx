import styles from "./KpiCard.module.css";

interface KpiCardProps {
    label: string;
    value: string;
    description?: string;
}

export default function KpiCard({
    label,
    value,
    description,
}: KpiCardProps) {
    return (
        <div className={styles.card}>
            <p className={styles.label}>
                {label}
            </p>

            <strong className={styles.value}>
                {value}
            </strong>

            {description && (
                <span className={styles.description}>
                    {description}
                </span>
            )}
        </div>
    );
}