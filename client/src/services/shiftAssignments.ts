import api from "@/services/api";

export type ShiftAssignmentDto = {
  shiftId: number;
  memberId: number;
  roleId: number;
  attendance: "PRESENT" | "ABSENT" | "LEAVE" | "SCHEDULED";
};

export const ShiftAssignmentsApi = {
  async listByShift(shiftId: number): Promise<ShiftAssignmentDto[]> {
    const res = await api.get(`/shift_assignments/${shiftId}`, { withCredentials: true });
    return res.data;
  },
  async autoAssign(shiftId: number): Promise<ShiftAssignmentDto[]> {
    const res = await api.post(`/shift_assignments/${shiftId}/auto`, {}, { withCredentials: true });
    return res.data;
  },
  async manualAssign(shiftId: number, payload: { memberId: number; roleId: number }): Promise<ShiftAssignmentDto> {
    const res = await api.post(`/shift_assignments/${shiftId}/manual`, payload, { withCredentials: true });
    return res.data;
  },
};
