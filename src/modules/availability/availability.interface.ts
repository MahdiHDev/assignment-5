import { DayOfWeek } from "../../generated/enums";

export interface CreateAvailabilityInput {
    startDate: string;
    endDate: string;
    slots: {
        dayOfWeek: DayOfWeek;
        startTime: string;
        endTime: string;
    }[];
}

export interface UpdateAvailabilitySlot {
    dayOfWeek?: DayOfWeek;
    startTime?: string;
    endTime?: string;
    startDate?: string;
    endDate?: string;
}
