import { base44 } from "@/api/base44Client";

const SOURCES = [
  ["expenses", base44.entities.Expense], ["income", base44.entities.Income],
  ["bank_accounts", base44.entities.BankAccount], ["investments", base44.entities.InvestmentAccount],
  ["assets", base44.entities.Asset], ["liabilities", base44.entities.Liability], ["budgets", base44.entities.Budget],
];

const escapeCsv = value => {
  const text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

export async function downloadFinancialBackup() {
  const groups = await Promise.all(SOURCES.map(([, entity]) => entity.list("-created_date", 5000)));
  const rows = groups.flatMap((items, index) => items.map(item => ({ record_type: SOURCES[index][0], ...item })));
  const headers = ["record_type", ...new Set(rows.flatMap(row => Object.keys(row)).filter(key => key !== "record_type"))];
  const csv = [headers.map(escapeCsv).join(","), ...rows.map(row => headers.map(key => escapeCsv(row[key])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `homefinance-backup-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  return rows.length;
}