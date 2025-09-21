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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, FolderPlus, Copy } from "lucide-react";

interface Schedule {
  id: string;
  name: string;
  description?: string;
  data: any;
}

interface ScheduleManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedules: Schedule[];
  setSchedules: (schedules: Schedule[]) => void;
  currentScheduleId: string;
  setCurrentScheduleId: (id: string) => void;
  newSchedule: Partial<Schedule>;
  setNewSchedule: (schedule: Partial<Schedule>) => void;
  exportData: () => void;
  importData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  clearAllData: () => void;
  duplicateSchedule: (id: string) => void;
  deleteSchedule: (id: string) => void;
}

const ScheduleManagementDialog: React.FC<ScheduleManagementDialogProps> = ({
  open,
  onOpenChange,
  schedules,
  setSchedules,
  currentScheduleId,
  setCurrentScheduleId,
  newSchedule,
  setNewSchedule,
  exportData,
  importData,
  clearAllData,
  duplicateSchedule,
  deleteSchedule,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full max-h-screen md:h-fit h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Management</DialogTitle>
          <DialogDescription>
            Create, duplicate, delete, export or import schedules.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Create New Schedule</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="schedule-name">Schedule Name</Label>
                <Input
                  id="schedule-name"
                  value={newSchedule.name || ""}
                  onChange={e => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  placeholder="e.g., Fall 2024 Semester"
                />
              </div>
              <div>
                <Label htmlFor="schedule-description">Description</Label>
                <Textarea
                  id="schedule-description"
                  value={newSchedule.description || ""}
                  onChange={e => setNewSchedule({ ...newSchedule, description: e.target.value })}
                  placeholder="Brief description of this schedule"
                />
              </div>
              <Button
                onClick={() => {
                  if (!newSchedule.name) return;
                  const schedule = {
                    id: `schedule-${Date.now()}`,
                    name: newSchedule.name,
                    description: newSchedule.description || "",
                    data: [
                      { day: "Monday", activities: [] },
                      { day: "Tuesday", activities: [] },
                      { day: "Wednesday", activities: [] },
                      { day: "Thursday", activities: [] },
                      { day: "Friday", activities: [] },
                      { day: "Saturday", activities: [] },
                      { day: "Sunday", activities: [] },
                    ],
                  };
                  setSchedules([...schedules, schedule]);
                  setCurrentScheduleId(schedule.id);
                  setNewSchedule({});
                  onOpenChange(false);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Schedule
              </Button>
            </div>
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-medium mb-3">Data Management</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={exportData}
                  className="w-full justify-start bg-transparent"
                >
                  Export All Data
                </Button>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                    id="import-file"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("import-file")?.click()}
                    className="w-full justify-start"
                  >
                    Import Data
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={clearAllData}
                  className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
                >
                  Clear All Data
                </Button>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Existing Schedules</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{schedule.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {schedule.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicateSchedule(schedule.id)}
                      title="Duplicate schedule"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    {schedules.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteSchedule(schedule.id)}
                        title="Delete schedule"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
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

export default ScheduleManagementDialog;
