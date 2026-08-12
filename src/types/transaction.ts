export type TransactionStatus =
    | "SUCCESS"
    | "FAILED"
    | "PENDING"
    | "success";

export interface Transaction {
    id: string;
    timestamp: string;
    merchant: string;
    category: string | null | undefined;
    amount: number;
    currency: string;
    status: TransactionStatus;
    payment_method: string;
}