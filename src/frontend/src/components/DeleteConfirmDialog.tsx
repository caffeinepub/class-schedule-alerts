import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ScheduleClass } from "../backend.d";
import { useDeleteScheduleClass } from "../hooks/useQueries";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleClass: ScheduleClass | null;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  scheduleClass,
}: DeleteConfirmDialogProps) {
  const deleteMutation = useDeleteScheduleClass();

  const handleConfirm = async () => {
    if (!scheduleClass) return;
    try {
      await deleteMutation.mutateAsync(scheduleClass.id);
      toast.success(`${scheduleClass.name} removed from your schedule`);
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete class. Please try again.");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        data-ocid="delete_confirm.dialog"
        className="glass-strong border-border/80 max-w-sm"
      >
        <AlertDialogHeader>
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-2">
            <Trash2 className="w-5 h-5 text-destructive" />
          </div>
          <AlertDialogTitle className="font-display text-lg font-bold text-foreground">
            Remove this class?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            {scheduleClass ? (
              <>
                <span className="text-foreground font-medium">
                  {scheduleClass.name}
                </span>{" "}
                will be permanently removed from your schedule. This action
                cannot be undone.
              </>
            ) : (
              "This class will be permanently removed from your schedule."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            data-ocid="delete_confirm.cancel_button"
            disabled={deleteMutation.isPending}
            className="border-border/60 hover:bg-accent/50"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            data-ocid="delete_confirm.confirm_button"
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {deleteMutation.isPending ? "Removing..." : "Remove Class"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
