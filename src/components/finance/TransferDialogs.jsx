import FormModal from "@/components/finance/FormModal";
import ConfirmDialog from "@/components/finance/ConfirmDialog";
import TransferFormFields from "@/components/finance/TransferFormFields";

export default function TransferDialogs({ transfer }) {
  return (
    <>
      {transfer.modal && <FormModal title="New Transfer" onClose={() => transfer.setModal(false)} onSubmit={transfer.submit} submitting={transfer.submitting}><TransferFormFields form={transfer.form} setForm={transfer.setForm} accounts={transfer.accounts} error={transfer.error} /></FormModal>}
      {transfer.confirmDelete && <ConfirmDialog title="Delete this transfer?" message={`This will return the money to ${transfer.confirmDelete.source_account_name} and remove it from ${transfer.confirmDelete.destination_account_name}.`} onConfirm={transfer.remove} onCancel={() => transfer.setConfirmDelete(null)} />}
    </>
  );
}