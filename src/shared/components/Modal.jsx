import { useEffect, useRef } from "react";
import { cn }                from "@utils/helpers.js";

// ─────────────────────────────────────────
// MODAL COMPONENT
// ─────────────────────────────────────────

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size      = "md",
  showClose = true,
  className = "",
}) => {
  const overlayRef = useRef(null);

  // ── Close on Escape key ──────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // ── Prevent body scroll ──────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Size variants ────────────────────────
  const sizes = {
    sm:   "max-w-md",
    md:   "max-w-lg",
    lg:   "max-w-2xl",
    xl:   "max-w-4xl",
    full: "max-w-7xl",
  };

  // ── Handle overlay click ─────────────────
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    // Overlay
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-modal flex items-center
                 justify-center p-4 bg-black/50
                 backdrop-blur-sm animate-fade-in"
    >
      {/* Modal box */}
      <div
        className={cn(
          "relative w-full bg-background rounded-2xl",
          "shadow-modal border border-border",
          "animate-zoom-in max-h-[90vh] flex flex-col",
          sizes[size],
          className
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between
                          p-6 border-b border-border shrink-0">
            {title && (
              <h2 className="text-lg font-semibold text-text-primary">
                {title}
              </h2>
            )}

            {showClose && (
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-lg text-text-secondary
                           hover:bg-surface hover:text-text-primary
                           transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// ── Modal Footer helper ──────────────────
export const ModalFooter = ({ children, className = "" }) => (
  <div
    className={cn(
      "flex items-center justify-end gap-3",
      "pt-4 mt-4 border-t border-border",
      className
    )}
  >
    {children}
  </div>
);

export default Modal;