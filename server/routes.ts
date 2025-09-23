import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertShiftSchema, insertLeaveRequestSchema, insertAttendanceSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check admin role
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "admin") return res.sendStatus(403);
    next();
  };

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    next();
  };

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (user.role === "admin") {
        const allUsers = await storage.getAllUsers();
        const todayAttendance = await storage.getAttendanceByDate(today);
        const allShifts = await storage.getAllShifts();
        const allLeaveRequests = await storage.getAllLeaveRequests();
        
        const presentToday = todayAttendance.filter(a => a.status === "present").length;
        const activeShifts = allShifts.filter(s => s.status === "active").length;
        const pendingRequests = allLeaveRequests.filter(r => r.status === "pending").length;
        
        res.json({
          totalEmployees: allUsers.filter(u => u.role === "normal").length,
          presentToday,
          activeShifts,
          pendingRequests,
        });
      } else {
        const userAttendance = await storage.getAttendanceByUser(user.id);
        const userShifts = await storage.getShiftsByUser(user.id);
        const userLeaveRequests = await storage.getLeaveRequestsByUser(user.id);
        
        const presentDays = userAttendance.filter(a => a.status === "present").length;
        const totalDays = userAttendance.length;
        const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
        
        res.json({
          attendanceRate: attendanceRate.toFixed(1),
          totalShifts: userShifts.length,
          pendingRequests: userLeaveRequests.filter(r => r.status === "pending").length,
          approvedLeaves: userLeaveRequests.filter(r => r.status === "approved").length,
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Shifts endpoints
  app.get("/api/shifts", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      let shifts;
      
      if (user.role === "admin") {
        shifts = await storage.getAllShifts();
      } else {
        shifts = await storage.getShiftsByUser(user.id);
      }
      
      // Include user names for admin view
      if (user.role === "admin") {
        const allUsers = await storage.getAllUsers();
        const userMap = new Map(allUsers.map(u => [u.id, u]));
        
        shifts = shifts.map(shift => ({
          ...shift,
          assignedUser: shift.assignedUserId ? userMap.get(shift.assignedUserId) : null,
        }));
      }
      
      res.json(shifts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shifts" });
    }
  });

  app.post("/api/shifts", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertShiftSchema.parse(req.body);
      const shift = await storage.createShift(validatedData);
      res.status(201).json(shift);
    } catch (error) {
      res.status(400).json({ message: "Invalid shift data" });
    }
  });

  app.patch("/api/shifts/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedShift = await storage.updateShift(id, req.body);
      if (!updatedShift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      res.json(updatedShift);
    } catch (error) {
      res.status(500).json({ message: "Failed to update shift" });
    }
  });

  // Leave requests endpoints
  app.get("/api/leave-requests", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      let requests;
      
      if (user.role === "admin") {
        requests = await storage.getAllLeaveRequests();
      } else {
        requests = await storage.getLeaveRequestsByUser(user.id);
      }
      
      // Include user names for admin view
      if (user.role === "admin") {
        const allUsers = await storage.getAllUsers();
        const userMap = new Map(allUsers.map(u => [u.id, u]));
        
        requests = requests.map(request => ({
          ...request,
          user: userMap.get(request.userId),
        }));
      }
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  app.post("/api/leave-requests", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const validatedData = insertLeaveRequestSchema.parse({
        ...req.body,
        userId: user.id,
      });
      const request = await storage.createLeaveRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ message: "Invalid leave request data" });
    }
  });

  app.patch("/api/leave-requests/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user!;
      const { status, ...otherFields } = req.body;
      
      const request = await storage.getLeaveRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      
      // Only admin can approve/reject, or user can update their own pending request
      if (status && user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can approve/reject requests" });
      }
      
      if (user.role !== "admin" && request.userId !== user.id) {
        return res.status(403).json({ message: "Cannot modify other user's requests" });
      }
      
      const updateData = status 
        ? { status, approvedBy: user.id, ...otherFields }
        : otherFields;
      
      const updatedRequest = await storage.updateLeaveRequest(id, updateData);
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update leave request" });
    }
  });

  // Attendance endpoints
  app.get("/api/attendance", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const { date } = req.query;
      let attendance;
      
      if (user.role === "admin") {
        if (date) {
          attendance = await storage.getAttendanceByDate(new Date(date as string));
        } else {
          attendance = await storage.getAllAttendance();
        }
      } else {
        attendance = await storage.getAttendanceByUser(user.id);
      }
      
      // Include user names for admin view
      if (user.role === "admin") {
        const allUsers = await storage.getAllUsers();
        const userMap = new Map(allUsers.map(u => [u.id, u]));
        
        attendance = attendance.map(record => ({
          ...record,
          user: userMap.get(record.userId),
        }));
      }
      
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const validatedData = insertAttendanceSchema.parse({
        ...req.body,
        userId: user.id,
      });
      const attendance = await storage.createAttendance(validatedData);
      res.status(201).json(attendance);
    } catch (error) {
      res.status(400).json({ message: "Invalid attendance data" });
    }
  });

  app.patch("/api/attendance/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user!;
      
      const record = await storage.getAttendance(id);
      if (!record) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      // Only admin or the record owner can update
      if (user.role !== "admin" && record.userId !== user.id) {
        return res.status(403).json({ message: "Cannot modify other user's attendance" });
      }
      
      const updatedRecord = await storage.updateAttendance(id, req.body);
      res.json(updatedRecord);
    } catch (error) {
      res.status(500).json({ message: "Failed to update attendance" });
    }
  });

  // Clock in/out endpoint
  app.post("/api/attendance/clock", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const { type } = req.body; // "in" or "out"
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Find today's attendance record
      const todayAttendance = await storage.getAttendanceByDate(today);
      const userTodayRecord = todayAttendance.find(a => a.userId === user.id);
      
      if (type === "in") {
        if (userTodayRecord) {
          return res.status(400).json({ message: "Already clocked in today" });
        }
        
        const attendance = await storage.createAttendance({
          userId: user.id,
          date: today,
          clockIn: now,
          clockOut: null,
          status: "present",
          notes: null,
        });
        
        res.json(attendance);
      } else if (type === "out") {
        if (!userTodayRecord || userTodayRecord.clockOut) {
          return res.status(400).json({ message: "No active clock-in found" });
        }
        
        const updatedRecord = await storage.updateAttendance(userTodayRecord.id, {
          clockOut: now,
        });
        
        res.json(updatedRecord);
      } else {
        res.status(400).json({ message: "Invalid clock type" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update clock status" });
    }
  });

  // Employees endpoint (admin only)
  app.get("/api/employees", requireAdmin, async (req, res) => {
    try {
      const employees = await storage.getAllUsers();
      // Exclude password from response
      const safeEmployees = employees.map(({ password, ...user }) => user);
      res.json(safeEmployees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
