import api from "@/services/api";

// Matches backend DTOs
export type SubmitLeaveRequest = {
  memberId: number;
  shiftId: number;
  reason?: string;
};

export type LeaveRequestDto = {
  memberId: number;
  shiftId: number | null;
  approval: "PENDING" | "APPROVED" | "REJECTED";
  shiftDay: string; // date string
  reason?: string;
};

export type ApproveLeaveRequest = {
  memberId: number;
  shiftId: number;
  approve: boolean;
  reason?: string;
};

export const LeavesApi = {
  async submit(payload: SubmitLeaveRequest): Promise<LeaveRequestDto> {
    const res = await api.post("/leaves/request", payload, { withCredentials: true });
    return res.data;
  },
  async handle(payload: ApproveLeaveRequest): Promise<any> {
    const res = await api.post("/leaves/handle", payload, { withCredentials: true });
    return res.data;
  },
  async pendingForManager(managerId: number): Promise<LeaveRequestDto[]> {
    const res = await api.get(`/leaves/pending/manager/${managerId}`, { withCredentials: true });
    return res.data;
  },
};
