import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ScheduleClass } from "../backend.d";
import {
  useAddScheduleClass,
  useUpdateScheduleClass,
} from "../hooks/useQueries";

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  existingClass?: ScheduleClass | null;
}

const DAYS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

const ALERT_OPTIONS = [
  { value: "5", label: "5 minutes before" },
  { value: "10", label: "10 minutes before" },
  { value: "15", label: "15 minutes before" },
  { value: "30", label: "30 minutes before" },
  { value: "60", label: "1 hour before" },
];

const defaultForm = {
  name: "",
  dayOfWeek: "1",
  startTime: "09:00",
  endTime: "10:00",
  location: "",
  notes: "",
  alertMinutesBefore: "15",
};

export function ClassFormDialog({
  open,
  onOpenChange,
  mode,
  existingClass,
}: ClassFormDialogProps) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<{ name?: string; time?: string }>({});

  const addMutation = useAddScheduleClass();
  const updateMutation = useUpdateScheduleClass();
  const isPending = addMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      if (mode === "edit" && existingClass) {
        setForm({
          name: existingClass.name,
          dayOfWeek: String(Number(existingClass.dayOfWeek)),
          startTime: existingClass.startTime,
          endTime: existingClass.endTime,
          location: existingClass.location ?? "",
          notes: existingClass.notes ?? "",
          alertMinutesBefore: String(Number(existingClass.alertMinutesBefore)),
        });
      } else {
        setForm(defaultForm);
      }
      setErrors({});
    }
  }, [open, mode, existingClass]);

  const validate = () => {
    const newErrors: { name?: string; time?: string } = {};
    if (!form.name.trim()) newErrors.name = "Class name is required";
    if (form.startTime >= form.endTime)
      newErrors.time = "End time must be after start time";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (mode === "add") {
        await addMutation.mutateAsync({
          name: form.name.trim(),
          dayOfWeek: Number(form.dayOfWeek),
          startTime: form.startTime,
          endTime: form.endTime,
          location: form.location.trim() || null,
          notes: form.notes.trim() || null,
          alertMinutesBefore: Number(form.alertMinutesBefore),
        });
        toast.success("Class added successfully");
      } else if (mode === "edit" && existingClass) {
        await updateMutation.mutateAsync({
          id: existingClass.id,
          name: form.name.trim(),
          dayOfWeek: Number(form.dayOfWeek),
          startTime: form.startTime,
          endTime: form.endTime,
          location: form.location.trim() || null,
          notes: form.notes.trim() || null,
          alertMinutesBefore: Number(form.alertMinutesBefore),
        });
        toast.success("Class updated successfully");
      }
      onOpenChange(false);
    } catch {
      toast.error("Failed to save class. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="class_form.dialog"
        className="glass-strong border-border/80 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold text-foreground">
            {mode === "add" ? "Add New Class" : "Edit Class"}
          </DialogTitle>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4 mt-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Class Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-foreground/90"
            >
              Class Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              data-ocid="class_form.name_input"
              placeholder="e.g. Calculus, Biology Lab..."
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="bg-input/60 border-border/60 focus:border-primary/60 focus:ring-primary/20"
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-destructive" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Day of Week */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/90">
              Day of Week
            </Label>
            <Select
              value={form.dayOfWeek}
              onValueChange={(val) =>
                setForm((prev) => ({ ...prev, dayOfWeek: val }))
              }
            >
              <SelectTrigger
                data-ocid="class_form.day_select"
                className="bg-input/60 border-border/60 focus:border-primary/60"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong">
                {DAYS.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="startTime"
                className="text-sm font-medium text-foreground/90"
              >
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                data-ocid="class_form.start_input"
                value={form.startTime}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startTime: e.target.value }))
                }
                className="bg-input/60 border-border/60 focus:border-primary/60 time-pill"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="endTime"
                className="text-sm font-medium text-foreground/90"
              >
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                data-ocid="class_form.end_input"
                value={form.endTime}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endTime: e.target.value }))
                }
                className="bg-input/60 border-border/60 focus:border-primary/60 time-pill"
              />
            </div>
          </div>
          {errors.time && (
            <p className="text-xs text-destructive -mt-2" role="alert">
              {errors.time}
            </p>
          )}

          {/* Location */}
          <div className="space-y-1.5">
            <Label
              htmlFor="location"
              className="text-sm font-medium text-foreground/90"
            >
              Location{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="location"
              data-ocid="class_form.location_input"
              placeholder="e.g. Room 201, Library..."
              value={form.location}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, location: e.target.value }))
              }
              className="bg-input/60 border-border/60 focus:border-primary/60"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label
              htmlFor="notes"
              className="text-sm font-medium text-foreground/90"
            >
              Notes{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="notes"
              data-ocid="class_form.notes_textarea"
              placeholder="e.g. Bring textbook, quiz today..."
              value={form.notes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={2}
              className="bg-input/60 border-border/60 focus:border-primary/60 resize-none"
            />
          </div>

          {/* Alert Before */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/90">
              Alert Before Class
            </Label>
            <Select
              value={form.alertMinutesBefore}
              onValueChange={(val) =>
                setForm((prev) => ({ ...prev, alertMinutesBefore: val }))
              }
            >
              <SelectTrigger
                data-ocid="class_form.alert_select"
                className="bg-input/60 border-border/60 focus:border-primary/60"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong">
                {ALERT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-6 gap-2 flex-row justify-end">
            <Button
              type="button"
              data-ocid="class_form.cancel_button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="border-border/60 hover:bg-accent/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="class_form.submit_button"
              disabled={isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow font-semibold"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending
                ? mode === "add"
                  ? "Adding..."
                  : "Saving..."
                : mode === "add"
                  ? "Add Class"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
