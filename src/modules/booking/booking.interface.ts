import { BookingStatus } from "../../generated/enums";

export type getAllBookingOptions = {
    subjectSlug: string | undefined;
    minPrice: number | undefined;
    maxPrice: number | undefined;
    startDate?: string;
    endDate?: string;
    studentId: string | undefined;
    tutorId: string | undefined;

    status: BookingStatus | undefined;

    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
};

export type getAllTeachingSessionOptions = {
    status: BookingStatus | undefined;
    startDate?: string;
    endDate?: string;

    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
};
