export type getAllUsersOptions = {
    search: string | undefined;
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
};
