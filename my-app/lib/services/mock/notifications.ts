import type { NotificationService } from "@/lib/services/contracts";
import { clone, getDb, latency, persist } from "./db";
import { requireUser } from "./session";

export const mockNotificationService: NotificationService = {
  async getNotifications() {
    await latency(140);
    const user = requireUser();
    return clone(
      getDb()
        .notifications.filter((n) => n.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async markRead(id) {
    await latency(80);
    const user = requireUser();
    const n = getDb().notifications.find((x) => x.id === id && x.userId === user.id);
    if (n) n.read = true;
    persist();
  },

  async markAllRead() {
    await latency(120);
    const user = requireUser();
    getDb().notifications.forEach((n) => {
      if (n.userId === user.id) n.read = true;
    });
    persist();
  },

  async getAnnouncements(params = {}) {
    await latency(160);
    requireUser();
    return clone(
      getDb()
        .announcements.filter((a) => a.published)
        .filter((a) => (params.contestId ? a.contestId === params.contestId : true))
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt)),
    );
  },
};
