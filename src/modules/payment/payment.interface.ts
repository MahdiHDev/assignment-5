import { UserRole } from "../../generated/enums";

export interface IRequestUser {
    email: string;
    name: string;
    role: UserRole;
    emailVerified: true;
}
