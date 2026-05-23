import Modal, { ModalFooter } from "./Modal.jsx";
import Button                 from "./Button.jsx";

// ─────────────────────────────────────────
// CONFIRM DIALOG
// ─────────────────────────────────────────

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title      = "Are you sure?",
  message    = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText  = "Cancel",
  variant     = "danger",
  isLoading   = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <p className="text-text-secondary text-sm leading-relaxed">
        {message}
      </p>

      <ModalFooter>
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </Button>

        <Button
          variant={variant}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmDialog;