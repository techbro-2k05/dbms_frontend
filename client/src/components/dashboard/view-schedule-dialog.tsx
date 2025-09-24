import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CalendarWidget from "@/components/dashboard/calendar-widget";

interface ViewScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewScheduleDialog({ open, onOpenChange }: ViewScheduleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>View Schedule</DialogTitle>
        </DialogHeader>
        <CalendarWidget />
      </DialogContent>
    </Dialog>
  );
}
