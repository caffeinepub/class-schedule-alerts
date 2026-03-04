import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ScheduleClass {
    id: bigint;
    startTime: string;
    endTime: string;
    alertMinutesBefore: bigint;
    dayOfWeek: bigint;
    name: string;
    notes?: string;
    location?: string;
}
export interface backendInterface {
    addScheduleClass(name: string, dayOfWeek: bigint, startTime: string, endTime: string, location: string | null, notes: string | null, alertMinutesBefore: bigint): Promise<ScheduleClass>;
    deleteScheduleClass(id: bigint): Promise<void>;
    getScheduleClasses(): Promise<Array<ScheduleClass>>;
    updateScheduleClass(id: bigint, name: string, dayOfWeek: bigint, startTime: string, endTime: string, location: string | null, notes: string | null, alertMinutesBefore: bigint): Promise<void>;
}
