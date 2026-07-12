import { ProfileStatus, TutorLevel, UserRole } from "../../generated/enums";

export interface IcreateTeachingSession {
    subjectName: string;
    hourlyRate: number;
    experienceYears: number;
    level: TutorLevel;
    bio?: string;
    isPrimary?: boolean;
}

export interface IupdateTeachingSession {
    hourlyRate?: number | undefined;
    experienceYears?: number | undefined;
    level?: TutorLevel;
    description?: string;
    isPrimary?: boolean;
}

export interface getAllTutorsOptions {
    search: string | undefined;
    subjectSlug: string | undefined;
    minPrice: number | undefined;
    maxPrice: number | undefined;
    minRating: number | undefined;

    status: ProfileStatus;
    isVerified: boolean | undefined;

    role?: UserRole;

    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
}
