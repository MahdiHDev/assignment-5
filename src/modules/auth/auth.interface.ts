export interface ILoginUserPayload {
    email: string;
    password: string;
}

export interface IRegisterUserPayload {
    name: string;
    email: string;
    password: string;
}

export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export interface IverifyEmailPayload {
    email: string;
    otp: string;
}

export interface IresetPasswordPayload {
    email: string;
    otp: string;
    newPassword: string;
}
