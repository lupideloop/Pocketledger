import { ArrowLeftRight } from "lucide-react";
import useTransfers from "@/hooks/useTransfers";
import TransferHeader from "@/components/finance/TransferHeader";
import TransferFilters from "@/components/finance/TransferFilters";
import TransferList from "@/components/finance/TransferList";
import TransferDialogs from "@/components/finance/TransferDialogs";
import ListPagination from "@/components/finance/ListPagination";
import StatCard from "@/components/finance/StatCard";
import { useTheme } from "@/components/finance/ThemeContext";

export default function Transfers() {
  const transfer = useTransfers();
  const { fmt } = useTheme();
  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-5">
      <TransferHeader count={transfer.items.length} onCreate={transfer.openCreate} />
      <div className="max-w-sm"><StatCard label="Total transferred" value={fmt(transfer.total)} sub="Across your own accounts" icon={ArrowLeftRight} color="blue" /></div>
      <TransferFilters search={transfer.search} onSearch={value => { transfer.setSearch(value); transfer.setPage(1); }} account={transfer.account} onAccount={value => { transfer.setAccount(value); transfer.setPage(1); }} accounts={transfer.accounts} count={transfer.filteredCount} />
      <TransferList items={transfer.pageItems} loading={transfer.loading} hasTransfers={transfer.items.length > 0} onDelete={transfer.setConfirmDelete} />
      <ListPagination page={transfer.page} pageCount={transfer.pageCount} onPage={transfer.setPage} />
      <TransferDialogs transfer={transfer} />
    </div>
  );
}