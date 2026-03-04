import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ScheduleClass } from "../backend.d";
import { useActor } from "./useActor";

export function useGetScheduleClasses() {
  const { actor, isFetching } = useActor();
  return useQuery<ScheduleClass[]>({
    queryKey: ["scheduleClasses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getScheduleClasses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddScheduleClass() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      location: string | null;
      notes: string | null;
      alertMinutesBefore: number;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addScheduleClass(
        params.name,
        BigInt(params.dayOfWeek),
        params.startTime,
        params.endTime,
        params.location,
        params.notes,
        BigInt(params.alertMinutesBefore),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduleClasses"] });
    },
  });
}

export function useUpdateScheduleClass() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      name: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      location: string | null;
      notes: string | null;
      alertMinutesBefore: number;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateScheduleClass(
        params.id,
        params.name,
        BigInt(params.dayOfWeek),
        params.startTime,
        params.endTime,
        params.location,
        params.notes,
        BigInt(params.alertMinutesBefore),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduleClasses"] });
    },
  });
}

export function useDeleteScheduleClass() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteScheduleClass(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduleClasses"] });
    },
  });
}
