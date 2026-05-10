export interface IAccountBillingTransaction {
  id: string;
  status: string;
  currency: string;
  amount: number;
  periodStart: string | null;
  periodEnd: string | null;
  paidAt: string | null;
  createdAt: string;
}
