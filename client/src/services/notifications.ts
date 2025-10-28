import api from "@/services/api";

export type NotificationDto = {
  memberId: number;
  notifSeq: number;
  timestamp: string; // ISO datetime
  viewTime: string | null; // ISO datetime or null
  title: string;
  message: string;
};

export type CreateNotificationRequest = {
  memberId: number;
  title: string;
  message: string;
};

export const NotificationsApi = {
  async listForMember(memberId: number): Promise<NotificationDto[]> {
    const res = await api.get(`/notifications/member/${memberId}`, { withCredentials: true });
    return res.data;
  },
  async markViewed(memberId: number, notifSeq: number): Promise<NotificationDto> {
    const res = await api.post(`/notifications/member/${memberId}/${notifSeq}/view`, {}, { withCredentials: true });
    return res.data;
  },
  async notifyAssignments(shiftId: number): Promise<NotificationDto[]> {
    const res = await api.post(`/notifications/shift/${shiftId}/notify-assignments`, {}, { withCredentials: true });
    return res.data;
  },
  async create(req: CreateNotificationRequest): Promise<NotificationDto> {
    const res = await api.post(`/notifications`, req, { withCredentials: true });
    return res.data;
  },
};
