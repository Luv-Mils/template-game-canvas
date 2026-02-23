export interface ModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Called when the modal should close (backdrop click, escape key, close button) */
  onClose: () => void;
  /** Optional title shown in the modal header */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Max width class (default: 'max-w-lg') */
  maxWidth?: string;
  /** Whether clicking the backdrop closes the modal (default: true) */
  closeOnBackdrop?: boolean;
  /** Whether pressing Escape closes the modal (default: true) */
  closeOnEscape?: boolean;
  /** Whether to show the close (X) button (default: true) */
  showCloseButton?: boolean;
}
