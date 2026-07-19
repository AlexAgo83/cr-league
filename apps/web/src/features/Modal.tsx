import { type KeyboardEvent, type MouseEvent, type ReactNode, useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  label,
  className = "panel modal",
  closeLabel = "Close",
  showCloseButton = false,
  onClose,
  children
}: {
  label: string;
  className?: string;
  closeLabel?: string;
  showCloseButton?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const overlayPressStarted = useRef(false);

  useEffect(() => {
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    return () => {
      if (triggerRef.current?.isConnected) triggerRef.current.focus();
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusable?.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="modal-overlay"
      onPointerDown={(event) => {
        overlayPressStarted.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (overlayPressStarted.current && event.target === event.currentTarget) onClose();
        overlayPressStarted.current = false;
      }}
    >
      <section ref={dialogRef} className={className} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} onKeyDown={handleKeyDown} onClick={(event: MouseEvent) => event.stopPropagation()}>
        {showCloseButton ? (
          <button className="modal-close-button" type="button" aria-label={closeLabel} onClick={onClose}>
            ×
          </button>
        ) : null}
        {children}
      </section>
    </div>
  );
}
