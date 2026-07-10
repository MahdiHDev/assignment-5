import { ProfileStatus, UserRole } from "../../generated/enums";

export type getAllTutorsOptions = {
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
};
