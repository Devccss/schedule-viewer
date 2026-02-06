import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Clock, ChevronUp, ChevronDown } from "lucide-react";

interface Activity {
  id: string;
  name: string;
  time: string;
  description?: string;
  upcomingTests?: string[];
  importantDates?: string[];
}

interface DaySchedule {
  day: string;
  activities: Activity[];
}

interface ActivityManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingActivity: Activity | null;
  setEditingActivity: (activity: Activity | null) => void;
  newActivity: Partial<Activity>;
  setNewActivity: (activity: Partial<Activity>) => void;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  scheduleData: DaySchedule[];
  addActivity: () => void;
  updateActivity: () => void;
  editActivity: (activity: Activity) => void;
  deleteActivity: (id: string) => void;
  duplicateActivity?: (activity: Activity, targetDays: string[]) => void;
}

const TimePickerInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  const [h, m] = value.split(":");

  const handleUpdate = (newH: number, newM: number) => {
    const hours = String((newH + 24) % 24).padStart(2, "0");
    const minutes = String((newM + 60) % 60).padStart(2, "0");
    onChange(`${hours}:${minutes}`);
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs">{label} (24h)</Label>
      <div className="flex items-center gap-2 border rounded-md p-2 bg-background">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <div className="flex flex-col items-center">
          <button onClick={() => handleUpdate(parseInt(h) + 1, parseInt(m))} className="hover:text-primary"><ChevronUp className="w-4 h-4" /></button>
          <input
            className="w-8 text-center bg-transparent font-mono"
            value={h}
            onChange={(e) => handleUpdate(parseInt(e.target.value) || 0, parseInt(m))}
          />
          <button onClick={() => handleUpdate(parseInt(h) - 1, parseInt(m))} className="hover:text-primary"><ChevronDown className="w-4 h-4" /></button>
        </div>
        <span className="font-bold">:</span>
        <div className="flex flex-col items-center">
          <button onClick={() => handleUpdate(parseInt(h), parseInt(m) + 15)} className="hover:text-primary"><ChevronUp className="w-4 h-4" /></button>
          <input
            className="w-8 text-center bg-transparent font-mono"
            value={m}
            onChange={(e) => handleUpdate(parseInt(h), parseInt(e.target.value) || 0)}
          />
          <button onClick={() => handleUpdate(parseInt(h), parseInt(m) - 15)} className="hover:text-primary"><ChevronDown className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};

const ActivityManagementDialog: React.FC<ActivityManagementDialogProps> = ({
  open,
  onOpenChange,
  editingActivity,
  setEditingActivity,
  newActivity,
  setNewActivity,
  selectedDay,
  setSelectedDay,
  scheduleData,
  addActivity,
  updateActivity,
  editActivity,
  deleteActivity,
  duplicateActivity,
}) => {
  const [selectedDays, setSelectedDays] = React.useState<string[]>([]);
  const [startTime, setStartTime] = React.useState<string>("08:00");
  const [endTime, setEndTime] = React.useState<string>("09:00");

  React.useEffect(() => {
    if (open) {
      if (editingActivity) {
        setNewActivity(editingActivity);
        const [start, end] = editingActivity.time.split(" - ");
        setStartTime(start || "08:00");
        setEndTime(end || "09:00");
        const currentDay = scheduleData.find(d => d.activities.some(a => a.id === editingActivity.id))?.day;
        setSelectedDays(currentDay ? [currentDay] : []);
      } else {
        setNewActivity({});
        setStartTime("08:00");
        setEndTime("09:00");
        setSelectedDays([]);
      }
    }
  }, [open, editingActivity]);

  const handleSubmit = () => {
    if (!newActivity.name || selectedDays.length === 0) return;
    
    const timeStr = `${startTime} - ${endTime}`;
    const activityData = { ...newActivity, time: timeStr } as Activity;

    if (editingActivity) {
      // Si el día cambió o hay múltiples, usamos duplicación y borramos el original
      // Para simplificar según lo pedido: actualizamos los datos y enviamos
      setNewActivity(activityData);
      setTimeout(() => {
        updateActivity();
        onOpenChange(false);
      }, 0);
    } else if (duplicateActivity) {
      duplicateActivity(activityData, selectedDays);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full md:max-w-6xl max-w-[95vw] md:h-fit h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingActivity ? "Edit Activity" : "New Activity"} (24h Mode)</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input
              placeholder="Activity Name"
              value={newActivity.name || ""}
              onChange={e => setNewActivity({ ...newActivity, name: e.target.value })}
            />
            <div className="flex gap-4">
              <TimePickerInput label="Start" value={startTime} onChange={setStartTime} />
              <TimePickerInput label="End" value={endTime} onChange={setEndTime} />
            </div>
            <Textarea
              placeholder="Description"
              value={newActivity.description || ""}
              onChange={e => setNewActivity({ ...newActivity, description: e.target.value })}
            />
            
            <div className="space-y-2">
              <Label>Days</Label>
              <div className="grid grid-cols-4 gap-2">
                {scheduleData.map(day => (
                  <Button
                    key={day.day}
                    variant={selectedDays.includes(day.day) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedDays(prev => 
                        prev.includes(day.day) ? prev.filter(d => d !== day.day) : [...prev, day.day]
                      );
                    }}
                  >
                    {day.day.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={handleSubmit} disabled={!newActivity.name || selectedDays.length === 0}>
              {editingActivity ? "Save Changes" : `Add to ${selectedDays.length} days`}
            </Button>
          </div>

          <div className="space-y-4 border-l pl-6 hidden md:block">
            <h3 className="font-medium">Current Schedule</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {scheduleData.flatMap(d => d.activities).map(a => (
                <div key={a.id} className="text-xs p-2 bg-muted rounded flex justify-between">
                  <span>{a.name} ({a.time})</span>
                  <div className="flex gap-1">
                    <button onClick={() => editActivity(a)}><Edit className="w-3 h-3"/></button>
                    <button onClick={() => deleteActivity(a.id)}><Trash2 className="w-3 h-3 text-destructive"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityManagementDialog;
