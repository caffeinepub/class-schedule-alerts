import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, Clock, MapPin, Pencil, Trash2 } from "lucide-react";
import type { ScheduleClass } from "../backend.d";

interface ClassCardProps {
  cls: ScheduleClass;
  now: Date;
  status: "upcoming" | "active" | "completed";
  countdownText: string;
  formatTime: (t: string) => string;
  editIndex: number;
  onEdit: () => void;
  onDelete: () => void;
}

const statusConfig = {
  upcoming: {
    badgeClass: "status-upcoming",
    borderClass: "border-l-primary/60",
    dotClass: "bg-primary animate-pulse",
    indicatorClass: "bg-primary/10",
  },
  active: {
    badgeClass: "status-active",
    borderClass: "border-l-success",
    dotClass: "bg-success animate-pulse-glow",
    indicatorClass: "bg-success/10",
  },
  completed: {
    badgeClass: "status-completed",
    borderClass: "border-l-border",
    dotClass: "bg-muted-foreground/40",
    indicatorClass: "bg-transparent",
  },
};

export function ClassCard({
  cls,
  status,
  countdownText,
  formatTime,
  editIndex,
  onEdit,
  onDelete,
}: ClassCardProps) {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "glass rounded-xl p-4 border-l-4 card-hover group relative overflow-hidden",
        config.borderClass,
      )}
    >
      {/* Active pulse background */}
      {status === "active" && (
        <div className="absolute inset-0 bg-success/3 pointer-events-none" />
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left: Status dot + Info */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Status indicator dot */}
          <div className="mt-1.5 flex-shrink-0">
            <div className={cn("w-2.5 h-2.5 rounded-full", config.dotClass)} />
          </div>

          {/* Class details */}
          <div className="min-w-0 flex-1 space-y-1">
            <h3
              className={cn(
                "font-display font-semibold text-base leading-tight",
                status === "completed"
                  ? "text-muted-foreground"
                  : "text-foreground",
              )}
            >
              {cls.name}
            </h3>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {/* Time */}
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="time-pill text-muted-foreground">
                  {formatTime(cls.startTime)} – {formatTime(cls.endTime)}
                </span>
              </div>

              {/* Location */}
              {cls.location && (
                <div className="flex items-center gap-1.5 text-sm">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate max-w-[180px]">
                    {cls.location}
                  </span>
                </div>
              )}

              {/* Alert indicator */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                <Bell className="w-3 h-3" />
                <span>{Number(cls.alertMinutesBefore)}m</span>
              </div>
            </div>

            {/* Notes */}
            {cls.notes && (
              <p className="text-xs text-muted-foreground/70 truncate max-w-xs">
                {cls.notes}
              </p>
            )}
          </div>
        </div>

        {/* Right: Countdown badge + Actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Countdown badge */}
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full time-pill whitespace-nowrap",
              config.badgeClass,
            )}
          >
            {countdownText}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              data-ocid={`class.edit_button.${editIndex}`}
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={onEdit}
              aria-label={`Edit ${cls.name}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              data-ocid={`class.delete_button.${editIndex}`}
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}
              aria-label={`Delete ${cls.name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
