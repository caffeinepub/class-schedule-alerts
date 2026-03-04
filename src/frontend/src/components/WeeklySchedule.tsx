import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock, MapPin, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import type { ScheduleClass } from "../backend.d";

interface WeeklyScheduleProps {
  classes: ScheduleClass[];
  dayNames: string[];
  dayShort: string[];
  todayDay: number;
  formatTime: (t: string) => string;
  onEdit: (cls: ScheduleClass) => void;
  onDelete: (cls: ScheduleClass) => void;
}

function getMinutesFromMidnight(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// Mon → Sun ordering (1-6, 0)
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function WeeklySchedule({
  classes,
  dayNames,
  dayShort,
  todayDay,
  formatTime,
  onEdit,
  onDelete,
}: WeeklyScheduleProps) {
  const classesByDay = WEEK_ORDER.map((dayIndex) => ({
    dayIndex,
    dayName: dayNames[dayIndex],
    dayShort: dayShort[dayIndex],
    isToday: dayIndex === todayDay,
    classes: classes
      .filter((cls) => Number(cls.dayOfWeek) === dayIndex)
      .sort(
        (a, b) =>
          getMinutesFromMidnight(a.startTime) -
          getMinutesFromMidnight(b.startTime),
      ),
  }));

  const totalClasses = classes.length;

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <h2 className="font-display text-2xl font-bold text-foreground">
          Weekly Schedule
        </h2>
        <span className="text-sm text-muted-foreground">
          {totalClasses} class{totalClasses !== 1 ? "es" : ""} total
        </span>
      </motion.div>

      {/* Day columns */}
      <div className="space-y-3">
        {classesByDay.map(
          ({ dayIndex, dayName, isToday, classes: dayCls }, i) => (
            <motion.div
              key={dayIndex}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className={cn(
                "glass rounded-xl overflow-hidden",
                isToday && "ring-1 ring-primary/40 shadow-glow",
              )}
            >
              {/* Day header */}
              <div
                className={cn(
                  "flex items-center justify-between px-4 py-3 border-b border-border/40",
                  isToday ? "bg-primary/10" : "bg-secondary/30",
                )}
              >
                <div className="flex items-center gap-2.5">
                  {isToday && <div className="day-dot" />}
                  <span
                    className={cn(
                      "font-display font-bold text-sm",
                      isToday ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {dayName}
                  </span>
                  {isToday && (
                    <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-semibold">
                      Today
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {dayCls.length} class{dayCls.length !== 1 ? "es" : ""}
                </span>
              </div>

              {/* Classes for this day */}
              {dayCls.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground/50 italic">
                  No classes scheduled
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {dayCls.map((cls, idx) => (
                    <div
                      key={cls.id.toString()}
                      className="px-4 py-3 flex items-center justify-between gap-3 group hover:bg-accent/20 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Color strip per class index */}
                        <div
                          className={cn(
                            "w-1 h-8 rounded-full flex-shrink-0",
                            idx % 5 === 0 && "bg-chart-1",
                            idx % 5 === 1 && "bg-chart-3",
                            idx % 5 === 2 && "bg-chart-2",
                            idx % 5 === 3 && "bg-chart-4",
                            idx % 5 === 4 && "bg-chart-5",
                          )}
                        />
                        <div className="min-w-0">
                          <p className="font-display font-semibold text-sm text-foreground truncate">
                            {cls.name}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span className="time-pill">
                                {formatTime(cls.startTime)} –{" "}
                                {formatTime(cls.endTime)}
                              </span>
                            </div>
                            {cls.location && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate max-w-[100px]">
                                  {cls.location}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => onEdit(cls)}
                          aria-label={`Edit ${cls.name}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete(cls)}
                          aria-label={`Delete ${cls.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ),
        )}
      </div>
    </div>
  );
}
