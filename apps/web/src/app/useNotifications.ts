import { useEffect, useRef, useState } from "react";

export type Notification = { id: number; text: string; tone: "info" | "error" };

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationId = useRef(0);
  const timers = useRef(new Set<number>());

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  function pushNotification(text: string, tone: Notification["tone"] = "info") {
    const id = notificationId.current + 1;
    notificationId.current = id;
    setNotifications((items) => items.at(-1)?.text === text ? items : [{ id, text, tone }]);
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      setNotifications((items) => items.filter((item) => item.id !== id));
    }, 2_000);
    timers.current.add(timer);
    return id;
  }

  return {
    notifications,
    pushNotification,
    clearTransientNotifications: () => setNotifications([]),
    dismissNotification: (id: number) => setNotifications((items) => items.filter((item) => item.id !== id))
  };
}
