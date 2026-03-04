import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  Clock,
  Plus,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ScheduleClass } from "./backend.d";
import { ClassCard } from "./components/ClassCard";
import { ClassFormDialog } from "./components/ClassFormDialog";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { WeeklySchedule } from "./components/WeeklySchedule";
import { useAddScheduleClass, useGetScheduleClasses } from "./hooks/useQueries";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SAMPLE_CLASSES = [
  {
    name: "Mathematics",
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "10:30",
    location: "Room 201",
    notes: "Bring calculator",
    alertMinutesBefore: 15,
  },
  {
    name: "Physics",
    dayOfWeek: 2,
    startTime: "11:00",
    endTime: "12:30",
    location: "Lab 3",
    notes: "Lab coat required",
    alertMinutesBefore: 10,
  },
  {
    name: "Physics",
    dayOfWeek: 4,
    startTime: "11:00",
    endTime: "12:30",
    location: "Lab 3",
    notes: "Lab coat required",
    alertMinutesBefore: 10,
  },
  {
    name: "History",
    dayOfWeek: 3,
    startTime: "14:00",
    endTime: "15:30",
    location: "Hall B",
    notes: "Chapter 7 reading due",
    alertMinutesBefore: 5,
  },
  {
    name: "English Lit",
    dayOfWeek: 5,
    startTime: "10:00",
    endTime: "11:30",
    location: "Room 105",
    notes: "Essay draft due",
    alertMinutesBefore: 15,
  },
];

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return { hours, minutes };
}

function getMinutesFromMidnight(timeStr: string): number {
  const { hours, minutes } = parseTime(timeStr);
  return hours * 60 + minutes;
}

function formatTimeTo12(timeStr: string): string {
  const { hours, minutes } = parseTime(timeStr);
  const period = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, "0");
  return `${h}:${m} ${period}`;
}

function getClassStatus(
  cls: ScheduleClass,
  now: Date,
): "upcoming" | "active" | "completed" {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = getMinutesFromMidnight(cls.startTime);
  const endMin = getMinutesFromMidnight(cls.endTime);
  if (nowMin < startMin) return "upcoming";
  if (nowMin >= startMin && nowMin < endMin) return "active";
  return "completed";
}

function getCountdownText(cls: ScheduleClass, now: Date): string {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = getMinutesFromMidnight(cls.startTime);
  const endMin = getMinutesFromMidnight(cls.endTime);
  if (nowMin < startMin) {
    const diff = startMin - nowMin;
    if (diff < 60) return `Starts in ${diff}m`;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return m > 0 ? `Starts in ${h}h ${m}m` : `Starts in ${h}h`;
  }
  if (nowMin >= startMin && nowMin < endMin) {
    const diff = endMin - nowMin;
    if (diff < 60) return `Ends in ${diff}m`;
    return "In progress";
  }
  return "Completed";
}

export default function App() {
  const [activeTab, setActiveTab] = useState("today");
  const [now, setNow] = useState(new Date());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editClass, setEditClass] = useState<ScheduleClass | null>(null);
  const [deleteClass, setDeleteClass] = useState<ScheduleClass | null>(null);
  const [notifPermission, setNotifPermission] =
    useState<NotificationPermission>("default");
  const firedAlertsRef = useRef<Set<string>>(new Set());
  const seedAttemptedRef = useRef(false);

  const { data: classes, isLoading, isError } = useGetScheduleClasses();
  const addMutation = useAddScheduleClass();

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
      if (Notification.permission === "default") {
        Notification.requestPermission().then((perm) => {
          setNotifPermission(perm);
        });
      }
    }
  }, []);

  // Seed sample data if backend is empty
  useEffect(() => {
    if (seedAttemptedRef.current) return;
    if (classes === undefined) return;
    if (classes.length === 0 && !addMutation.isPending) {
      seedAttemptedRef.current = true;
      const seedAll = async () => {
        for (const sample of SAMPLE_CLASSES) {
          await addMutation.mutateAsync({
            name: sample.name,
            dayOfWeek: sample.dayOfWeek,
            startTime: sample.startTime,
            endTime: sample.endTime,
            location: sample.location,
            notes: sample.notes,
            alertMinutesBefore: sample.alertMinutesBefore,
          });
        }
      };
      seedAll().catch(console.error);
    }
  }, [classes, addMutation]);

  // Live clock — update every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Alert engine — check every 60 seconds
  const checkAlerts = useCallback(() => {
    if (!classes) return;
    const currentDay = new Date().getDay();
    const todayClasses = classes.filter(
      (cls) => Number(cls.dayOfWeek) === currentDay,
    );

    const nowMin = now.getHours() * 60 + now.getMinutes();

    for (const cls of todayClasses) {
      const startMin = getMinutesFromMidnight(cls.startTime);
      const alertMin = Number(cls.alertMinutesBefore);
      const alertKey = `${cls.id}-${cls.startTime}-${now.toDateString()}`;

      const minutesUntilClass = startMin - nowMin;

      if (
        minutesUntilClass > 0 &&
        minutesUntilClass <= alertMin &&
        !firedAlertsRef.current.has(alertKey)
      ) {
        firedAlertsRef.current.add(alertKey);

        const body = cls.location
          ? `Your class starts in ${minutesUntilClass} minute${minutesUntilClass !== 1 ? "s" : ""} at ${cls.location}`
          : `Your class starts in ${minutesUntilClass} minute${minutesUntilClass !== 1 ? "s" : ""}`;

        // Browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`📚 ${cls.name}`, { body, icon: "/favicon.ico" });
        }

        // In-app toast
        toast(`📚 ${cls.name}`, {
          description: body,
          duration: 8000,
        });
      }
    }
  }, [classes, now]);

  useEffect(() => {
    checkAlerts();
    const interval = setInterval(checkAlerts, 60_000);
    return () => clearInterval(interval);
  }, [checkAlerts]);

  const todayDay = now.getDay();
  const todayName = DAY_NAMES[todayDay];
  const todayClasses = (classes ?? [])
    .filter((cls) => Number(cls.dayOfWeek) === todayDay)
    .sort(
      (a, b) =>
        getMinutesFromMidnight(a.startTime) -
        getMinutesFromMidnight(b.startTime),
    );

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen font-body flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border/60">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-lg text-gradient">
              ClassPulse
            </span>
          </div>

          <div className="flex items-center gap-3">
            {notifPermission === "denied" && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-warning/80 bg-warning/10 px-2.5 py-1 rounded-full border border-warning/20">
                <AlertTriangle className="w-3 h-3" />
                Notifications blocked
              </div>
            )}
            <Button
              data-ocid="schedule.add_button"
              onClick={() => setAddDialogOpen(true)}
              size="sm"
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Class</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pb-16 pt-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-secondary/50 border border-border/60 p-1 rounded-xl">
            <TabsTrigger
              data-ocid="nav.today_tab"
              value="today"
              className="rounded-lg gap-2 font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all"
            >
              <Clock className="w-4 h-4" />
              Today
            </TabsTrigger>
            <TabsTrigger
              data-ocid="nav.weekly_tab"
              value="weekly"
              className="rounded-lg gap-2 font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all"
            >
              <CalendarDays className="w-4 h-4" />
              Weekly
            </TabsTrigger>
          </TabsList>

          {/* Today Tab */}
          <TabsContent
            value="today"
            data-ocid="today.section"
            className="space-y-6"
          >
            {/* Date header */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-1"
            >
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                {todayName}
              </h1>
              <p className="text-muted-foreground text-sm">
                {formattedDate} ·{" "}
                {now.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </motion.div>

            {/* Loading state */}
            {isLoading && (
              <div data-ocid="app.loading_state" className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-24 w-full rounded-xl bg-card/60"
                  />
                ))}
              </div>
            )}

            {/* Error state */}
            {isError && (
              <div
                data-ocid="app.error_state"
                className="glass rounded-xl p-6 text-center border-destructive/30"
              >
                <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-destructive font-medium">
                  Failed to load schedule
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Please refresh the page
                </p>
              </div>
            )}

            {/* Today's classes */}
            {!isLoading &&
              !isError &&
              (todayClasses.length === 0 ? (
                <motion.div
                  data-ocid="today.empty_state"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="glass rounded-2xl p-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                    <CalendarDays className="w-8 h-8 text-primary/60" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      Free day!
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      No classes scheduled for {todayName}. Enjoy your day off.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddDialogOpen(true)}
                    className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Plus className="w-4 h-4" />
                    Add a class for today
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {/* Progress indicator */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span>
                      {
                        todayClasses.filter(
                          (c) => getClassStatus(c, now) === "completed",
                        ).length
                      }{" "}
                      of {todayClasses.length} classes completed
                    </span>
                    <span className="text-primary font-medium">
                      {todayClasses.filter(
                        (c) => getClassStatus(c, now) === "active",
                      ).length > 0 && "● Class in session"}
                    </span>
                  </div>

                  <AnimatePresence mode="popLayout">
                    {todayClasses.map((cls, index) => (
                      <motion.div
                        key={cls.id.toString()}
                        data-ocid={`today.item.${index + 1}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3, delay: index * 0.06 }}
                      >
                        <ClassCard
                          cls={cls}
                          now={now}
                          status={getClassStatus(cls, now)}
                          countdownText={getCountdownText(cls, now)}
                          formatTime={formatTimeTo12}
                          editIndex={index + 1}
                          onEdit={() => setEditClass(cls)}
                          onDelete={() => setDeleteClass(cls)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ))}
          </TabsContent>

          {/* Weekly Tab */}
          <TabsContent value="weekly" data-ocid="weekly.section">
            {isLoading ? (
              <div data-ocid="app.loading_state" className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-32 w-full rounded-xl bg-card/60"
                  />
                ))}
              </div>
            ) : isError ? (
              <div
                data-ocid="app.error_state"
                className="glass rounded-xl p-6 text-center"
              >
                <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-destructive font-medium">
                  Failed to load schedule
                </p>
              </div>
            ) : (
              <WeeklySchedule
                classes={classes ?? []}
                dayNames={DAY_NAMES}
                dayShort={DAY_SHORT}
                todayDay={todayDay}
                formatTime={formatTimeTo12}
                onEdit={setEditClass}
                onDelete={setDeleteClass}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 px-4">
        <div className="max-w-4xl mx-auto text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/70 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>

      {/* Add Class Dialog */}
      <ClassFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        mode="add"
      />

      {/* Edit Class Dialog */}
      <ClassFormDialog
        open={!!editClass}
        onOpenChange={(open) => !open && setEditClass(null)}
        mode="edit"
        existingClass={editClass}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={!!deleteClass}
        onOpenChange={(open) => !open && setDeleteClass(null)}
        scheduleClass={deleteClass}
      />

      <Toaster position="top-right" richColors />
    </div>
  );
}
