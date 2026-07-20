import { useEffect, useRef, useState } from "react";

export type Notification = { id: number; text: string; tone: "info" | "error"; persistent?: boolean };

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationId = useRef(0);
  const timers = useRef(new Set<number>());

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  function pushNotification(text: string, tone: Notification["tone"] = "info", persistent = tone === "error") {
    const id = notificationId.current + 1;
    notificationId.current = id;
    setNotifications((items) => {
      const kept = items.filter((item) => item.persistent);
      return kept.at(-1)?.text === text ? kept : [...kept, { id, text, tone, persistent }].slice(-2);
    });
    if (!persistent) {
      const timer = window.setTimeout(() => {
        timers.current.delete(timer);
        setNotifications((items) => items.filter((item) => item.id !== id));
      }, 4_000);
      timers.current.add(timer);
    }
    return id;
  }

  return {
    notifications,
    pushNotification,
    clearTransientNotifications: () => setNotifications((items) => items.filter((item) => item.persistent)),
    dismissNotification: (id: number) => setNotifications((items) => items.filter((item) => item.id !== id))
  };
}
