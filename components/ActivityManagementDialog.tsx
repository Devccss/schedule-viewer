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
import { Plus, Edit, Trash2 } from "lucide-react";

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
}

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
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full md:max-w-6xl max-w-[95vw] md:h-fit h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Activity Management</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Add, edit, or delete activities in your schedule.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{editingActivity ? "Edit Activity" : "Add New Activity"}</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="day">Day</Label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a day" /> 
                  </SelectTrigger>
                  <SelectContent>
                    {scheduleData.map((day) => (
                      <SelectItem key={day.day} value={day.day}>
                        {day.day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Activity Name</Label>
                <Input
                  id="name"
                  value={newActivity.name || ""}
                  onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                  placeholder="e.g., Mobile Development"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  <Input
                    id="time"
                    value={newActivity.time || ""}
                    onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                    placeholder="e.g., 8:00 AM - 10:30 AM"
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newActivity.description || ""}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  placeholder="Brief description of the activity"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="upcomingTests">Upcoming Tests</Label>
                <div className="space-y-2">
                  {(newActivity.upcomingTests || []).map((test, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        value={test}
                        onChange={e =>
                          setNewActivity({
                            ...newActivity,
                            upcomingTests: (newActivity.upcomingTests || []).map((t, i) => i === idx ? e.target.value : t),
                          })
                        }
                        placeholder="e.g., March 15, 2024 - Midterm Exam"
                        className="w-full"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setNewActivity({
                            ...newActivity,
                            upcomingTests: (newActivity.upcomingTests || []).filter((_, i) => i !== idx),
                          })
                        }
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-1 w-full"
                    onClick={() =>
                      setNewActivity({
                        ...newActivity,
                        upcomingTests: [...(newActivity.upcomingTests || []), ""],
                      })
                    }
                  >
                    <Plus className="w-3 h-3" /> Add Test
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="importantDates">Important Dates</Label>
                <div className="space-y-2">
                  {(newActivity.importantDates || []).map((date, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        value={date}
                        onChange={e =>
                          setNewActivity({
                            ...newActivity,
                            importantDates: (newActivity.importantDates || []).map((d, i) => i === idx ? e.target.value : d),
                          })
                        }
                        placeholder="e.g., March 1, 2024 - Assignment Due"
                        className="w-full"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setNewActivity({
                            ...newActivity,
                            importantDates: (newActivity.importantDates || []).filter((_, i) => i !== idx),
                          })
                        }
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-1 w-full"
                    onClick={() =>
                      setNewActivity({
                        ...newActivity,
                        importantDates: [...(newActivity.importantDates || []), ""],
                      })
                    }
                  >
                    <Plus className="w-3 h-3" /> Add Date
                  </Button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button
                  onClick={() => {
                    if (editingActivity) {
                      updateActivity();
                    } else {
                      addActivity();
                    }
                    onOpenChange(false);
                  }}
                  className="flex-1 items-center gap-2 w-full sm:w-auto"
                >
                  {editingActivity ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingActivity ? "Update Activity" : "Add Activity"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingActivity(null);
                    setNewActivity({});
                    setSelectedDay("");
                    onOpenChange(false);
                  }}
                  className="flex-1 w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Current Activities</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {scheduleData.flatMap((day) =>
                day.activities.map((activity) => (
                  <div key={activity.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{activity.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {day.day} • {activity.time}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <Button size="sm" variant="outline" onClick={() => editActivity(activity)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteActivity(activity.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityManagementDialog;
