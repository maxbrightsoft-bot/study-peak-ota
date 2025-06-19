import { Role } from "@/utils/enums";

export type LoginEmailRequest = {
    email?: string;
    otp?: number;
}

export type SignInOTPRequest = {
    email: string;
    otp: number;
    role?: string;
    reCaptcha: string;
    isAcademy: boolean;
}

export type QRCodeData = {
    image: string;
    key: string;
}

export enum QRCodeStatus {
    Pending,
    Scanned,
    Confirmed,
    Invalid,
    Rejected
}

export type UserAgentInfo = {
    browser: string
    deviceBrand: string
    deviceFamily: string
    deviceModel: string
    os: string
    scannedAt: string
}

export type PhoneLoginRequest = {
    phoneNumber: string;
    password: string;
    role?: string;
    isMobile: boolean
}

export interface QRCodeConfirmationProps {
    deviceId: string
    domain?: string,
    role: Role
}