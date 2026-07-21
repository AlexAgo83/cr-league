import { type KeyboardEvent, type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let bodyScrollLockCount = 0;
let bodyScrollState: { overflow: string; paddingRight: string; position: string; top: string; width: string; scrollY: number } | null = null;

function lockBodyScroll() {
  if (bodyScrollLockCount === 0) {
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
    bodyScrollState = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      scrollY: window.scrollY
    };
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${bodyScrollState.scrollY}px`;
    document.body.style.width = "100%";
    if (scrollbarGap > 0) document.body.style.paddingRight = bodyScrollState.paddingRight ? `calc(${bodyScrollState.paddingRight} + ${scrollbarGap}px)` : `${scrollbarGap}px`;
  }
  bodyScrollLockCount += 1;
  return () => {
    bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1);
    if (bodyScrollLockCount > 0 || !bodyScrollState) return;
    const { overflow, paddingRight, position, top, width, scrollY } = bodyScrollState;
    document.body.style.overflow = overflow;
    document.body.style.paddingRight = paddingRight;
    document.body.style.position = position;
    document.body.style.top = top;
    document.body.style.width = width;
    if (scrollY > 0) window.scrollTo(0, scrollY);
    bodyScrollState = null;
  };
}

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
    const unlockBodyScroll = lockBodyScroll();
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    return () => {
      unlockBodyScroll();
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

  return createPortal(
    <div
      className="modal-overlay"
      role="presentation"
      onPointerDown={(event) => {
        overlayPressStarted.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (overlayPressStarted.current && event.target === event.currentTarget) onClose();
        overlayPressStarted.current = false;
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- dialog owns the focus trap keyboard handler. */}
      <section ref={dialogRef} className={className} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} onKeyDown={handleKeyDown}>
        {showCloseButton ? (
          <button className="modal-close-button" type="button" aria-label={closeLabel} onClick={onClose}>
            ×
          </button>
        ) : null}
        {children}
      </section>
    </div>,
    document.body
  );
}
