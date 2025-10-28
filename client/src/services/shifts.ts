import api from "@/services/api";

export type ShiftRequirement = { roleId: number; count: number };
export type CreateShiftPayload = {
  day: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  title: string;
  locationId: number;
  requirements: ShiftRequirement[];
};

export const ShiftsApi = {
  async list() {
    const res = await api.get("/shifts", { withCredentials: true });
    return res.data;
  },

  async create(payload: CreateShiftPayload) {
    const res = await api.post("/shifts", payload, { withCredentials: true });
    return res.data;
  },

  async createWeekly(payload: { perDayShifts: CreateShiftPayload[] }) {
    const res = await api.post("/shifts/weekly", payload, { withCredentials: true });
    return res.data;
  },
};
