import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay } from "date-fns";

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };


  // Mock data: working days, leave days, and shift details
  // In a real app, these would come from API
  const workingDays = [
    new Date(2024, 11, 18),
    new Date(2024, 11, 19),
    new Date(2024, 11, 20),
    new Date(2024, 11, 21),
    new Date(2024, 11, 22),
    new Date(2024, 11, 23),
    new Date(2024, 11, 24),
  ];
  const leaveDays = [
    new Date(2024, 11, 25), // Christmas
    new Date(2024, 11, 26), // Boxing Day
  ];
  const shiftDetails: Record<string, { shift: string; time: string }> = {
    "2024-12-18": { shift: "Morning", time: "8:00 AM - 4:00 PM" },
    "2024-12-19": { shift: "Evening", time: "4:00 PM - 12:00 AM" },
    "2024-12-20": { shift: "Night", time: "12:00 AM - 8:00 AM" },
    "2024-12-21": { shift: "Morning", time: "8:00 AM - 4:00 PM" },
    "2024-12-22": { shift: "Evening", time: "4:00 PM - 12:00 AM" },
    "2024-12-23": { shift: "Night", time: "12:00 AM - 8:00 AM" },
    "2024-12-24": { shift: "Morning", time: "8:00 AM - 4:00 PM" },
  };

  const isWorkingDay = (date: Date) => {
    return workingDays.some(d => isSameDay(date, d));
  };
  const isLeaveDay = (date: Date) => {
    return leaveDays.some(d => isSameDay(date, d));
  };

  const getDayClasses = (date: Date) => {
    let classes = "aspect-square flex items-center justify-center text-sm cursor-pointer transition-colors relative ";
    if (!isSameMonth(date, currentDate)) {
      classes += "text-muted-foreground ";
    }
    if (isLeaveDay(date)) {
      classes += "bg-red-200 text-red-800 font-semibold rounded-md ";
    } else if (isWorkingDay(date)) {
      classes += "bg-blue-200 text-blue-900 font-semibold rounded-md ";
    } else if (isToday(date)) {
      classes += "border-2 border-primary ";
    } else {
      classes += "hover:bg-accent rounded-md ";
    }
    return classes;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Dialog state for shift details
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const handleDayClick = (date: Date) => {
    if (isWorkingDay(date)) {
      setSelectedDate(date);
    }
  };

  return (
    <Card data-testid="calendar-widget">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="calendar-title">Calendar</CardTitle>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={previousMonth}
              data-testid="button-previous-month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={nextMonth}
              data-testid="button-next-month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground text-sm" data-testid="calendar-month">
          {format(currentDate, "MMMM yyyy")}
        </p>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1" data-testid="calendar-grid">
          {calendarDays.map((date, index) => {
            const dateKey = format(date, "yyyy-MM-dd");
            return (
              <div
                key={index}
                className={getDayClasses(date)}
                data-testid={`calendar-day-${dateKey}`}
                onClick={() => handleDayClick(date)}
              >
                <span>{format(date, "d")}</span>
                {isWorkingDay(date) && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                )}
                {isLeaveDay(date) && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
        {/* Shift Details Dialog */}
        <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Shift Details</DialogTitle>
            </DialogHeader>
            {selectedDate && (
              <div className="space-y-2">
                <div>Date: {format(selectedDate, "PPP")}</div>
                <div>Shift: {shiftDetails[format(selectedDate, "yyyy-MM-dd")]?.shift || "N/A"}</div>
                <div>Time: {shiftDetails[format(selectedDate, "yyyy-MM-dd")]?.time || "N/A"}</div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Calendar Legend */}
        <div className="mt-4 space-y-2" data-testid="calendar-legend">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-muted-foreground">Work Day</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-muted-foreground">Holiday/Leave</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
