import { 
  User, 
  InsertUser, 
  Shift, 
  InsertShift, 
  LeaveRequest, 
  InsertLeaveRequest,
  Attendance,
  InsertAttendance 
} from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Shift methods
  getShift(id: string): Promise<Shift | undefined>;
  getShiftsByUser(userId: string): Promise<Shift[]>;
  getAllShifts(): Promise<Shift[]>;
  getShiftsByDateRange(startDate: Date, endDate: Date): Promise<Shift[]>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(id: string, shift: Partial<Shift>): Promise<Shift | undefined>;
  deleteShift(id: string): Promise<boolean>;
  
  // Leave request methods
  getLeaveRequest(id: string): Promise<LeaveRequest | undefined>;
  getLeaveRequestsByUser(userId: string): Promise<LeaveRequest[]>;
  getAllLeaveRequests(): Promise<LeaveRequest[]>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(id: string, request: Partial<LeaveRequest>): Promise<LeaveRequest | undefined>;
  
  // Attendance methods
  getAttendance(id: string): Promise<Attendance | undefined>;
  getAttendanceByUser(userId: string): Promise<Attendance[]>;
  getAttendanceByDate(date: Date): Promise<Attendance[]>;
  getAllAttendance(): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, attendance: Partial<Attendance>): Promise<Attendance | undefined>;
  
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private shifts: Map<string, Shift>;
  private leaveRequests: Map<string, LeaveRequest>;
  private attendanceRecords: Map<string, Attendance>;
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.shifts = new Map();
    this.leaveRequests = new Map();
    this.attendanceRecords = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Seed some initial data
    this.seedData();
  }

  private async seedData() {
    // Demo users will be created via registration to avoid password hashing issues
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      id, 
      department: insertUser.department || null,
      position: insertUser.position || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Shift methods
  async getShift(id: string): Promise<Shift | undefined> {
    return this.shifts.get(id);
  }

  async getShiftsByUser(userId: string): Promise<Shift[]> {
    return Array.from(this.shifts.values()).filter(
      (shift) => shift.assignedUserId === userId
    );
  }

  async getAllShifts(): Promise<Shift[]> {
    return Array.from(this.shifts.values());
  }

  async getShiftsByDateRange(startDate: Date, endDate: Date): Promise<Shift[]> {
    return Array.from(this.shifts.values()).filter(
      (shift) => shift.startTime >= startDate && shift.startTime <= endDate
    );
  }

  async createShift(insertShift: InsertShift): Promise<Shift> {
    const id = randomUUID();
    const shift: Shift = { 
      ...insertShift,
      id,
      description: insertShift.description || null,
      assignedUserId: insertShift.assignedUserId || null,
      createdAt: new Date(),
      status: "scheduled",
    };
    this.shifts.set(id, shift);
    return shift;
  }

  async updateShift(id: string, updateData: Partial<Shift>): Promise<Shift | undefined> {
    const shift = this.shifts.get(id);
    if (!shift) return undefined;
    
    const updatedShift = { ...shift, ...updateData };
    this.shifts.set(id, updatedShift);
    return updatedShift;
  }

  async deleteShift(id: string): Promise<boolean> {
    return this.shifts.delete(id);
  }

  // Leave request methods
  async getLeaveRequest(id: string): Promise<LeaveRequest | undefined> {
    return this.leaveRequests.get(id);
  }

  async getLeaveRequestsByUser(userId: string): Promise<LeaveRequest[]> {
    return Array.from(this.leaveRequests.values()).filter(
      (request) => request.userId === userId
    );
  }

  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    return Array.from(this.leaveRequests.values());
  }

  async createLeaveRequest(insertRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const id = randomUUID();
    const request: LeaveRequest = { 
      ...insertRequest,
      id,
      reason: insertRequest.reason || null,
      createdAt: new Date(),
      status: "pending",
      approvedBy: null,
    };
    this.leaveRequests.set(id, request);
    return request;
  }

  async updateLeaveRequest(id: string, updateData: Partial<LeaveRequest>): Promise<LeaveRequest | undefined> {
    const request = this.leaveRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...updateData };
    this.leaveRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Attendance methods
  async getAttendance(id: string): Promise<Attendance | undefined> {
    return this.attendanceRecords.get(id);
  }

  async getAttendanceByUser(userId: string): Promise<Attendance[]> {
    return Array.from(this.attendanceRecords.values()).filter(
      (record) => record.userId === userId
    );
  }

  async getAttendanceByDate(date: Date): Promise<Attendance[]> {
    const dateStr = date.toDateString();
    return Array.from(this.attendanceRecords.values()).filter(
      (record) => record.date.toDateString() === dateStr
    );
  }

  async getAllAttendance(): Promise<Attendance[]> {
    return Array.from(this.attendanceRecords.values());
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const attendance: Attendance = { 
      ...insertAttendance,
      id,
      clockIn: insertAttendance.clockIn || null,
      clockOut: insertAttendance.clockOut || null,
      notes: insertAttendance.notes || null,
      createdAt: new Date(),
    };
    this.attendanceRecords.set(id, attendance);
    return attendance;
  }

  async updateAttendance(id: string, updateData: Partial<Attendance>): Promise<Attendance | undefined> {
    const record = this.attendanceRecords.get(id);
    if (!record) return undefined;
    
    const updatedRecord = { ...record, ...updateData };
    this.attendanceRecords.set(id, updatedRecord);
    return updatedRecord;
  }
}

export const storage = new MemStorage();
