import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock wage data
const weeklyWage = 4200;
const hourlyWage = 150;
const totalHours = 28;

export default function WagePage() {
  return (
    <Card className="w-full max-w-md mx-auto mt-8 shadow-lg">
      <CardHeader>
        <CardTitle>Wage Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-blue-700">Weekly Wage</span>
          <span className="text-xl font-bold">₹{weeklyWage}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-green-700">Hourly Wage</span>
          <span className="text-xl font-bold">₹{hourlyWage}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-purple-700">Total Hours Completed</span>
          <span className="text-xl font-bold">{totalHours} hrs</span>
        </div>
        <div className="mt-4 text-sm text-muted-foreground text-center">
          *Wage and hours are calculated for the current week.
        </div>
      </CardContent>
    </Card>
  );
}
