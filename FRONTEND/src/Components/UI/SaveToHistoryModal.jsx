import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import Modal from "../Main/Modal";
import { Field, inputClass, ModalActions } from "../Main/FormControls";
import { toUpper } from "../../utils/text";

// One reusable "Save to History" prompt shared by every calculator page
// (Hotel/Transport/Visa/Flight/Customize Package). Callers own the actual
// save request — this just collects the Client Name / Package Title and
// reports back via onConfirm.
const SaveToHistoryModal = ({
  open,
  onClose,
  onConfirm,
  label = "Client Name",
  defaultValue = "",
  saving = false,
}) => {
  const [clientName, setClientName] = useState(defaultValue);

  useEffect(() => {
    if (open) setClientName(defaultValue);
  }, [open, defaultValue]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Save to History"
      icon={<Save size={20} className="text-brand-600" />}
      maxWidth="max-w-md"
      footer={
        <ModalActions
          onCancel={onClose}
          onSubmit={() => onConfirm(clientName)}
          submitLabel={saving ? "Saving..." : "Save"}
          submitColor="green"
          submitDisabled={saving}
        />
      }
    >
      <Field label={label} required>
        <input
          type="text"
          placeholder={`Enter ${label.toLowerCase()}`}
          value={clientName}
          onChange={(e) => setClientName(toUpper(e.target.value))}
          className={inputClass}
          disabled={saving}
          autoFocus
        />
      </Field>
    </Modal>
  );
};

export default SaveToHistoryModal;
