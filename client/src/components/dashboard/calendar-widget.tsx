import { useState } from "react";
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

  // Mock events - in a real app, these would come from API
  const eventDates = [
    new Date(2024, 11, 20), // Dec 20
    new Date(2024, 11, 25), // Dec 25 (Holiday)
    new Date(2024, 11, 26), // Dec 26 (Holiday)
  ];

  const holidayDates = [
    new Date(2024, 11, 25), // Christmas
    new Date(2024, 11, 26), // Boxing Day
  ];

  const hasEvent = (date: Date) => {
    return eventDates.some(eventDate => isSameDay(date, eventDate));
  };

  const isHoliday = (date: Date) => {
    return holidayDates.some(holidayDate => isSameDay(date, holidayDate));
  };

  const getDayClasses = (date: Date) => {
    let classes = "aspect-square flex items-center justify-center text-sm cursor-pointer transition-colors ";
    
    if (!isSameMonth(date, currentDate)) {
      classes += "text-muted-foreground ";
    }
    
    if (isToday(date)) {
      classes += "bg-primary text-primary-foreground font-semibold rounded-md ";
    } else if (isHoliday(date)) {
      classes += "bg-red-100 text-red-800 rounded-md ";
    } else {
      classes += "hover:bg-accent rounded-md ";
    }
    
    return classes;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
          {calendarDays.map((date, index) => (
            <div
              key={index}
              className={getDayClasses(date)}
              data-testid={`calendar-day-${format(date, "yyyy-MM-dd")}`}
            >
              <span>{format(date, "d")}</span>
              {hasEvent(date) && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </div>
          ))}
        </div>
        
        {/* Calendar Legend */}
        <div className="mt-4 space-y-2" data-testid="calendar-legend">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-muted-foreground">Work Day</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-muted-foreground">Holiday/Leave</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
