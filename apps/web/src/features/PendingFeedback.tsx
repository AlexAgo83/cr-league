export function PendingFeedback({ className = "", message }: { className?: string; message: string | null }) {
  return message ? <p className={`pending-feedback ${className}`} role="status">{message}</p> : null;
}
