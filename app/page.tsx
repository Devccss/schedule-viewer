"use client";

import React from "react";
import { useAuth } from "@/components/auth-provider";
import { useState, useEffect } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Calendar,
  BookOpen,
  CalendarDays,
  List,
  Grid3X3,
  Plus,
  Edit,
  Trash2,
  Settings,
  FolderPlus,
  Copy,
  LogOut,
} from "lucide-react";
import ActivityManagementDialog from "@/components/ActivityManagementDialog";
import ScheduleManagementDialog from "@/components/ScheduleManagementDialog";

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

interface Schedule {
  id: string;
  name: string;
  description?: string;
  data: DaySchedule[];
}

const initialScheduleData: DaySchedule[] = [
  {
    day: "Monday",
    activities: [
      {
        id: "mon-1",
        name: "Mobile Development",
        time: "8:00 AM - 10:30 AM",
        description: "Mobile app development fundamentals",
        upcomingTests: [
          "March 15, 2024 - Midterm Exam",
          "April 20, 2024 - Final Project Due",
        ],
        importantDates: [
          "March 1, 2024 - Assignment 2 Due",
          "March 8, 2024 - Lab Report Due",
        ],
      },
      {
        id: "mon-2",
        name: "Mobile Development",
        time: "11:00 AM - 12:00 PM",
        description: "Practical session and lab work",
        upcomingTests: [
          "March 15, 2024 - Midterm Exam",
          "April 20, 2024 - Final Project Due",
        ],
        importantDates: [
          "March 1, 2024 - Assignment 2 Due",
          "March 8, 2024 - Lab Report Due",
        ],
      },
      {
        id: "mon-3",
        name: "Machine Learning and Deep Learning",
        time: "12:40 PM - 2:00 PM",
        description: "Lab3-Esp-Face",
        upcomingTests: [
          "March 10, 2024 - Quiz 2",
          "March 25, 2024 - Project Presentation",
        ],
        importantDates: [
          "February 28, 2024 - Lab3 Report Due",
          "March 5, 2024 - Dataset Submission",
        ],
      },
      {
        id: "mon-4",
        name: "Daily Finance",
        time: "4:00 PM - 4:30 PM",
        description: "Personal finance management",
        upcomingTests: [],
        importantDates: [
          "March 1, 2024 - Budget Review",
          "March 15, 2024 - Investment Analysis",
        ],
      },
    ],
  },
  {
    day: "Tuesday",
    activities: [
      {
        id: "tue-1",
        name: "Web Development",
        time: "8:00 AM - 9:00 AM",
        description: "Frontend and backend development",
        upcomingTests: [
          "March 12, 2024 - Practical Exam",
          "April 5, 2024 - Final Project",
        ],
        importantDates: [
          "March 3, 2024 - Portfolio Due",
          "March 18, 2024 - Code Review",
        ],
      },
      {
        id: "tue-2",
        name: "Degree Project",
        time: "9:40 AM - 11:00 AM",
        description: "Final degree project work and supervision",
        upcomingTests: [],
        importantDates: [
          "March 7, 2024 - Progress Report",
          "March 21, 2024 - Supervisor Meeting",
          "April 30, 2024 - Final Submission",
        ],
      },
    ],
  },
  {
    day: "Wednesday",
    activities: [],
  },
  {
    day: "Thursday",
    activities: [],
  },
  {
    day: "Friday",
    activities: [],
  },
  {
    day: "Saturday",
    activities: [],
  },
  {
    day: "Sunday",
    activities: [],
  },
];

const emptyScheduleData: DaySchedule[] = [
  { day: "Monday", activities: [] },
  { day: "Tuesday", activities: [] },
  { day: "Wednesday", activities: [] },
  { day: "Thursday", activities: [] },
  { day: "Friday", activities: [] },
  { day: "Saturday", activities: [] },
  { day: "Sunday", activities: [] },
];

const STORAGE_KEY = "schedule-viewer-data";

interface StorageData {
  schedules: Schedule[];
  currentScheduleId: string;
  viewMode: "daily" | "weekly" | "schedule";
}

const loadFromStorage = (): StorageData | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return null;
  }
};

const saveToStorage = (data: StorageData) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
};

export default function ScheduleViewer() {
  const { isAuthenticated, username, logout, isLoading } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "schedule">(
    "weekly"
  );
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: "default",
      name: "Spring 2024 Semester",
      description: "Current semester schedule",
      data: initialScheduleData,
    },
  ]);
  const [currentScheduleId, setCurrentScheduleId] = useState<string>("default");
  const [showScheduleManagement, setShowScheduleManagement] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Partial<Schedule>>({});

  const [showManagement, setShowManagement] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({});
  const [selectedDay, setSelectedDay] = useState<string>("");

  useEffect(() => {
    const storedData = loadFromStorage();
    if (storedData) {
      setSchedules(storedData.schedules);
      setCurrentScheduleId(storedData.currentScheduleId);
      setViewMode(storedData.viewMode);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const dataToSave: StorageData = {
      schedules,
      currentScheduleId,
      viewMode,
    };
    saveToStorage(dataToSave);
  }, [schedules, currentScheduleId, viewMode, isLoaded]);

  const currentSchedule = schedules.find((s) => s.id === currentScheduleId);
  const scheduleData = currentSchedule?.data || emptyScheduleData;

  const updateScheduleData = (newData: DaySchedule[]) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === currentScheduleId
          ? { ...schedule, data: newData }
          : schedule
      )
    );
  };

  const createNewSchedule = () => {
    if (!newSchedule.name) return;

    const schedule: Schedule = {
      id: `schedule-${Date.now()}`,
      name: newSchedule.name,
      description: newSchedule.description || "",
      data: emptyScheduleData,
    };

    setSchedules((prev) => [...prev, schedule]);
    setCurrentScheduleId(schedule.id);
    setNewSchedule({});
    setShowScheduleManagement(false);
  };

  const duplicateSchedule = (scheduleId: string) => {
    const originalSchedule = schedules.find((s) => s.id === scheduleId);
    if (!originalSchedule) return;

    const duplicatedSchedule: Schedule = {
      id: `schedule-${Date.now()}`,
      name: `${originalSchedule.name} (Copy)`,
      description: originalSchedule.description,
      data: JSON.parse(JSON.stringify(originalSchedule.data)), // Deep copy
    };

    setSchedules((prev) => [...prev, duplicatedSchedule]);
    setCurrentScheduleId(duplicatedSchedule.id);
  };

  const deleteSchedule = (scheduleId: string) => {
    if (schedules.length <= 1) return; // Don't delete the last schedule

    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));

    if (currentScheduleId === scheduleId) {
      const remainingSchedules = schedules.filter((s) => s.id !== scheduleId);
      setCurrentScheduleId(remainingSchedules[0]?.id || "");
    }
  };

  const exportData = () => {
    const dataToExport: StorageData = {
      schedules,
      currentScheduleId,
      viewMode,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schedule-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData: StorageData = JSON.parse(
          e.target?.result as string
        );

        if (importedData.schedules && Array.isArray(importedData.schedules)) {
          setSchedules(importedData.schedules);
          setCurrentScheduleId(
            importedData.currentScheduleId ||
              importedData.schedules[0]?.id ||
              "default"
          );
          setViewMode(importedData.viewMode || "weekly");
        }
      } catch (error) {
        console.error("Failed to import data:", error);
        alert("Failed to import data. Please check the file format.");
      }
    };
    reader.readAsText(file);

    event.target.value = "";
  };

  const clearAllData = () => {
    if (
      confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      const defaultSchedule: Schedule = {
        id: "default",
        name: "New Schedule",
        description: "Start fresh with a new schedule",
        data: emptyScheduleData,
      };

      setSchedules([defaultSchedule]);
      setCurrentScheduleId("default");
      setViewMode("weekly");
    }
  };

  const addActivity = () => {
    if (!newActivity.name || !newActivity.time || !selectedDay) return;

    const activity: Activity = {
      id: `${selectedDay.toLowerCase()}-${Date.now()}`,
      name: newActivity.name,
      time: newActivity.time,
      description: newActivity.description || "",
      upcomingTests: newActivity.upcomingTests || [],
      importantDates: newActivity.importantDates || [],
    };

    const newData = scheduleData.map((day) =>
      day.day === selectedDay
        ? { ...day, activities: [...day.activities, activity] }
        : day
    );
    updateScheduleData(newData);

    setNewActivity({});
    setSelectedDay("");
  };

  const editActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setNewActivity(activity);
    setSelectedDay(
      scheduleData.find((day) =>
        day.activities.some((a) => a.id === activity.id)
      )?.day || ""
    );
  };

  const updateActivity = () => {
    if (!editingActivity || !newActivity.name || !newActivity.time) return;

    const newData = scheduleData.map((day) => ({
      ...day,
      activities: day.activities.map((activity) =>
        activity.id === editingActivity.id
          ? { ...activity, ...newActivity }
          : activity
      ),
    }));
    updateScheduleData(newData);

    setEditingActivity(null);
    setNewActivity({});
    setSelectedDay("");
  };

  const deleteActivity = (activityId: string) => {
    const newData = scheduleData.map((day) => ({
      ...day,
      activities: day.activities.filter(
        (activity) => activity.id !== activityId
      ),
    }));
    updateScheduleData(newData);
  };

  const parseTimeToHour = (
    timeString: string
  ): {
    startHour: number;
    endHour: number;
    startMinutes: number;
    endMinutes: number;
  } => {
    const [startTime, endTime] = timeString.split(" - ");

    // Parse start time
    const [startTimePart, startPeriod] = startTime.trim().split(" ");
    const [startHourStr, startMinStr = "0"] = startTimePart.split(":");
    let startHour = Number.parseInt(startHourStr);
    const startMinutes = Number.parseInt(startMinStr);

    if (startPeriod === "PM" && startHour !== 12) {
      startHour += 12;
    } else if (startPeriod === "AM" && startHour === 12) {
      startHour = 0;
    }

    // Parse end time
    let endHour = startHour + 1;
    let endMinutes = 0;

    if (endTime) {
      const [endTimePart, endPeriod] = endTime.trim().split(" ");
      const [endHourStr, endMinStr = "0"] = endTimePart.split(":");
      endHour = Number.parseInt(endHourStr);
      endMinutes = Number.parseInt(endMinStr);

      if (endPeriod === "PM" && endHour !== 12) {
        endHour += 12;
      } else if (endPeriod === "AM" && endHour === 12) {
        endHour = 0;
      }
    }

    return { startHour, endHour, startMinutes, endMinutes };
  };

  const timeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 8;
    const displayHour = hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? "PM" : "AM";
    return {
      hour,
      display: `${displayHour}:00 ${period}`,
    };
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {currentSchedule?.name || "My Schedule"}
                </h1>
                <span className="text-sm text-muted-foreground">
                  • Welcome, {username}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentSchedule?.description ||
                  "Click on any activity to view upcoming tests and important dates"}
              </p>
            </div>

            <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-3 md:flex gap-2">
              <div className="col-span-2 sm:col-span-3 md:col-auto flex gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={logout}
                  className="flex-1 md:flex-none items-center gap-2 bg-transparent"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
                <Select
                  value={currentScheduleId}
                  onValueChange={setCurrentScheduleId}
                >
                  <SelectTrigger className="flex-1 md:w-48">
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {schedules.map((schedule) => (
                      <SelectItem key={schedule.id} value={schedule.id}>
                        {schedule.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  setShowScheduleManagement(!showScheduleManagement)
                }
                className="flex items-center justify-center gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Schedules</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowManagement(!showManagement)}
                className="flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Manage</span>
              </Button>
              <Button
                variant={viewMode === "weekly" ? "default" : "outline"}
                onClick={() => setViewMode("weekly")}
                className="flex items-center justify-center gap-2"
              >
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">Weekly</span>
              </Button>
              <Button
                variant={viewMode === "daily" ? "default" : "outline"}
                onClick={() => setViewMode("daily")}
                className="flex items-center justify-center gap-2"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Daily</span>
              </Button>
              <Button
                variant={viewMode === "schedule" ? "default" : "outline"}
                onClick={() => setViewMode("schedule")}
                className="flex items-center justify-center gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Schedule</span>
              </Button>
            </div>
          </div>
        </header>

        <ScheduleManagementDialog
          open={showScheduleManagement}
          onOpenChange={setShowScheduleManagement}
          schedules={schedules}
          setSchedules={setSchedules}
          currentScheduleId={currentScheduleId}
          setCurrentScheduleId={setCurrentScheduleId}
          newSchedule={newSchedule}
          setNewSchedule={setNewSchedule}
          exportData={exportData}
          importData={importData}
          clearAllData={clearAllData}
          duplicateSchedule={duplicateSchedule}
          deleteSchedule={deleteSchedule}
        />

        <ActivityManagementDialog
          open={showManagement}
          onOpenChange={setShowManagement}
          editingActivity={editingActivity}
          setEditingActivity={setEditingActivity}
          newActivity={newActivity}
          setNewActivity={setNewActivity}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          scheduleData={scheduleData}
          addActivity={addActivity}
          updateActivity={updateActivity}
          editActivity={editActivity}
          deleteActivity={deleteActivity}
        />

        {viewMode === "schedule" ? (
          <div className="overflow-x-auto">
            <div className="min-w-[800px] grid grid-cols-8 gap-1 bg-card rounded-lg p-4 border border-border">
              <div className="font-semibold text-card-foreground p-2"></div>
              {scheduleData.map((daySchedule) => (
                <div
                  key={daySchedule.day}
                  className="font-semibold text-center text-card-foreground p-2 border-b border-border"
                >
                  {daySchedule.day.slice(0, 3)}
                </div>
              ))}

              {timeSlots.map((timeSlot) => (
                <React.Fragment key={timeSlot.hour}>
                  <div
                    key={`time-${timeSlot.hour}`}
                    className="text-sm text-muted-foreground p-2 border-r border-border flex items-center"
                  >
                    {timeSlot.display}
                  </div>

                  {scheduleData.map((daySchedule) => {
                    const activitiesStartingInSlot =
                      daySchedule.activities.filter((activity) => {
                        const { startHour } = parseTimeToHour(activity.time);
                        return startHour === timeSlot.hour;
                      });

                    return (
                      <div
                        key={`${daySchedule.day}-${timeSlot.hour}`}
                        className="relative p-1 min-h-[100px] border-b border-border"
                      >
                        {activitiesStartingInSlot.map((activity) => {
                          const {
                            startHour,
                            endHour,
                            startMinutes,
                            endMinutes,
                          } = parseTimeToHour(activity.time);
                          const totalDurationHours = endHour - startHour;
                          const totalDurationMinutes =
                            (endHour - startHour) * 60 +
                            (endMinutes - startMinutes);
                          const topOffset = (startMinutes / 60) * 100;
                          const heightPercentage =
                            (totalDurationMinutes / 60) * 100;

                          return (
                            <Dialog key={activity.id}>
                              <DialogTrigger asChild>
                                <Card
                                  className="absolute left-1 right-1 cursor-pointer hover:bg-accent/20 transition-colors duration-200 border-primary/20 bg-primary/5 overflow-clip "
                                  style={{
                                    top: `${topOffset}%`,
                                    height: `${heightPercentage}%`,
                                    minHeight: "0px",
                                    zIndex: 10,
                                  }}
                                >
                                  <CardHeader className="p-2 h-full flex flex-col justify-center items-center">
                                    <CardTitle className="text-xs font-medium text-card-foreground leading-tight">
                                      {activity.name}
                                    </CardTitle>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {activity.time}
                                    </div>
                                  </CardHeader>
                                </Card>
                              </DialogTrigger>
                        <DialogContent className="bg-popover border-border">
                          <DialogHeader>
                            <DialogTitle className="text-popover-foreground flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-primary" />
                              {activity.name}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                              {activity.time} • {activity.description}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6 mt-4">
                            {activity.upcomingTests &&
                              activity.upcomingTests.length > 0 && (
                                <div>
                                  <h3 className="text-lg font-semibold text-popover-foreground mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    Upcoming Tests
                                  </h3>
                                  <div className="space-y-2">
                                    {activity.upcomingTests.map(
                                      (test, index) => (
                                        <div
                                          key={index}
                                          className="p-3 bg-card rounded-lg border border-border"
                                        >
                                          <p className="text-card-foreground">
                                            {test}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {activity.importantDates &&
                              activity.importantDates.length > 0 && (
                                <div>
                                  <h3 className="text-lg font-semibold text-popover-foreground mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-accent" />
                                    Important Dates
                                  </h3>
                                  <div className="space-y-2">
                                    {activity.importantDates.map(
                                      (date, index) => (
                                        <div
                                          key={index}
                                          className="p-3 bg-muted rounded-lg border border-border"
                                        >
                                          <p className="text-muted-foreground">
                                            {date}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {(!activity.upcomingTests ||
                              activity.upcomingTests.length === 0) &&
                              (!activity.importantDates ||
                                activity.importantDates.length === 0) && (
                                <div className="text-center py-8">
                                  <p className="text-muted-foreground">
                                    No upcoming tests or important dates
                                    scheduled
                                  </p>
                                </div>
                              )}
                          </div>
                        </DialogContent>
                            </Dialog>
                          );
                        })}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : viewMode === "weekly" ? (
            <div className="overflow-x-auto p-2">
            <div className="min-w-[1024px] grid grid-cols-7 gap-6">
              {scheduleData.map((daySchedule) => (
              <div key={daySchedule.day} className="w-full space-y-3">
                <h2 className="text-xl font-semibold text-primary border-b border-border pb-2">
                {daySchedule.day}
                </h2>

                {daySchedule.activities.length > 0 ? (
                <div className="space-y-3">
                  {daySchedule.activities.map((activity) => (
                  <Dialog key={activity.id}>
                    <DialogTrigger asChild>
                    <Card className="w-full cursor-pointer hover:bg-accent/10 transition-colors duration-200 border-border">
                      <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium text-card-foreground leading-tight">
                        {activity.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3 text-primary" />
                        <span className="text-xs text-muted-foreground">
                        {activity.time}
                        </span>
                      </div>
                      {activity.description && (
                        <CardDescription className="text-xs text-muted-foreground mt-1">
                        {activity.description}
                        </CardDescription>
                      )}
                      </CardHeader>
                    </Card>
                    </DialogTrigger>
                    <DialogContent className="bg-popover border-border">
                    <DialogHeader>
                      <DialogTitle className="text-popover-foreground flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      {activity.name}
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                      {activity.time} • {activity.description}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                      {activity.upcomingTests &&
                      activity.upcomingTests.length > 0 && (
                        <div>
                        <h3 className="text-lg font-semibold text-popover-foreground mb-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          Upcoming Tests
                        </h3>
                        <div className="space-y-2">
                          {activity.upcomingTests.map(
                          (test, index) => (
                            <div
                            key={index}
                            className="p-3 bg-card rounded-lg border border-border"
                            >
                            <p className="text-card-foreground">
                              {test}
                            </p>
                            </div>
                          )
                          )}
                        </div>
                        </div>
                      )}

                      {activity.importantDates &&
                      activity.importantDates.length > 0 && (
                        <div>
                        <h3 className="text-lg font-semibold text-popover-foreground mb-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-accent" />
                          Important Dates
                        </h3>
                        <div className="space-y-2">
                          {activity.importantDates.map(
                          (date, index) => (
                            <div
                            key={index}
                            className="p-3 bg-muted rounded-lg border border-border"
                            >
                            <p className="text-muted-foreground">
                              {date}
                            </p>
                            </div>
                          )
                          )}
                        </div>
                        </div>
                      )}

                      {(!activity.upcomingTests ||
                      activity.upcomingTests.length === 0) &&
                      (!activity.importantDates ||
                        activity.importantDates.length === 0) && (
                        <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No upcoming tests or important dates
                          scheduled
                        </p>
                        </div>
                      )}
                    </div>
                    </DialogContent>
                  </Dialog>
                  ))}
                </div>
                ) : (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground text-sm">
                  No activities
                  </p>
                </div>
                )}
              </div>
              ))}
            </div>
            </div>
        ) : (
          <div className="space-y-8">
            {scheduleData.map((daySchedule) => (
              <div key={daySchedule.day} className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-b border-border pb-2">
                  {daySchedule.day}
                </h2>

                <div className="grid gap-4">
                  {daySchedule.activities.map((activity) => (
                    <Dialog key={activity.id}>
                      <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:bg-accent/10 transition-colors duration-200 border-border">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg text-card-foreground">
                                {activity.name}
                              </CardTitle>
                              <Badge
                                variant="outline"
                                className="text-primary border-primary"
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                {activity.time}
                              </Badge>
                            </div>
                            {activity.description && (
                              <CardDescription className="text-muted-foreground">
                                {activity.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                        </Card>
                      </DialogTrigger>

                      <DialogContent className="bg-popover border-border">
                        <DialogHeader>
                          <DialogTitle className="text-popover-foreground flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            {activity.name}
                          </DialogTitle>
                          <DialogDescription className="text-muted-foreground">
                            {activity.time} • {activity.description}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 mt-4">
                          {activity.upcomingTests &&
                            activity.upcomingTests.length > 0 && (
                              <div>
                                <h3 className="text-lg font-semibold text-popover-foreground mb-3 flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  Upcoming Tests
                                </h3>
                                <div className="space-y-2">
                                  {activity.upcomingTests.map((test, index) => (
                                    <div
                                      key={index}
                                      className="p-3 bg-card rounded-lg border border-border"
                                    >
                                      <p className="text-card-foreground">
                                        {test}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {activity.importantDates &&
                            activity.importantDates.length > 0 && (
                              <div>
                                <h3 className="text-lg font-semibold text-popover-foreground mb-3 flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-accent" />
                                  Important Dates
                                </h3>
                                <div className="space-y-2">
                                  {activity.importantDates.map(
                                    (date, index) => (
                                      <div
                                        key={index}
                                        className="p-3 bg-muted rounded-lg border border-border"
                                      >
                                        <p className="text-muted-foreground">
                                          {date}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {(!activity.upcomingTests ||
                            activity.upcomingTests.length === 0) &&
                            (!activity.importantDates ||
                              activity.importantDates.length === 0) && (
                              <div className="text-center py-8">
                                <p className="text-muted-foreground">
                                  No upcoming tests or important dates scheduled
                                </p>
                              </div>
                            )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        

        <footer className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            Your data is automatically saved locally • {schedules.length}{" "}
            schedule{schedules.length !== 1 ? "s" : ""} stored
          </p>
        </footer>
      </div>
    </div>
  );
}
