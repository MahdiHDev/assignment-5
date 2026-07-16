var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path2 from "path";
import qs from "qs";

// src/app/middleware/globalErrorHandler.ts
import { ZodError } from "zod";

// src/generated/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.8.0",
  "engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  // output   = "../generated/prisma"\n  output   = "../src/generated"\n  // moduleFormat = "cjs"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// Enums \n\nenum UserRole {\n  STUDENT\n  TUTOR\n  ADMIN\n}\n\nenum UserStatus {\n  ACTIVE\n  BANNED\n}\n\nenum TutorLevel {\n  BEGINNER\n  INTERMEDIATE\n  ADVANCED\n}\n\nenum DayOfWeek {\n  MON\n  TUE\n  WED\n  THU\n  FRI\n  SAT\n  SUN\n}\n\nenum BookingStatus {\n  PENDING\n  CONFIRMED\n  COMPLETED\n  CANCELLED\n}\n\nenum ProfileStatus {\n  PENDING\n  APPROVED\n  REJECTED\n}\n\nenum PaymentStatus {\n  PENDING\n  SUCCEEDED\n  FAILED\n  REFUNDED\n}\n\nmodel User {\n  id            String        @id\n  name          String\n  email         String\n  emailVerified Boolean       @default(false)\n  role          UserRole      @default(STUDENT)\n  status        UserStatus    @default(ACTIVE)\n  image         String?\n  createdAt     DateTime      @default(now())\n  updatedAt     DateTime      @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n  tutorProfile  TutorProfile?\n  bookings      Booking[]     @relation("StudentBookings")\n  reviews       Review[]\n  adminLogs     AdminLog[]\n  payments      Payment[]     @relation("StudentPayments")\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel TutorProfile {\n  id            String        @id @default(uuid())\n  userId        String        @unique\n  bio           String?\n  totalReviews  Int           @default(0)\n  averageRating Float         @default(0)\n  status        ProfileStatus @default(PENDING)\n  isVerified    Boolean       @default(false)\n\n  // Relations \n  user            User               @relation(fields: [userId], references: [id])\n  tutorCategories TutorCategory[]\n  availability    AvailabilitySlot[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  reviews   Review[]\n}\n\nmodel Subject {\n  id   String @id @default(uuid())\n  name String\n  slug String @unique\n\n  //relations\n  tutorCategories TutorCategory[]\n\n  createdAt DateTime @default(now())\n}\n\n// Many to many resolve table\nmodel TutorCategory {\n  id              String     @id @default(uuid())\n  tutorProfileId  String\n  subjectId       String\n  hourlyRate      Float\n  experienceYears Int\n  level           TutorLevel\n  description     String?\n  isPrimary       Boolean    @default(false)\n\n  // Relations\n  tutorProfile TutorProfile @relation(fields: [tutorProfileId], references: [id], onDelete: Cascade)\n  subject      Subject      @relation(fields: [subjectId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime  @default(now())\n  bookings  Booking[]\n\n  @@unique([tutorProfileId, subjectId])\n}\n\nmodel AvailabilitySlot {\n  id             String @id @default(uuid())\n  tutorProfileId String\n\n  dayOfWeek DayOfWeek\n  startTime DateTime\n  endTime   DateTime\n\n  startDate DateTime\n  endDate   DateTime\n\n  isActive Boolean @default(true)\n\n  // Relation\n  tutorProfile TutorProfile @relation(fields: [tutorProfileId], references: [id])\n\n  createdAt DateTime @default(now())\n}\n\nmodel Booking {\n  id              String        @id @default(uuid())\n  studentId       String\n  tutorCategoryId String\n  sessionDate     DateTime\n  startTime       DateTime\n  endTime         DateTime\n  price           Float\n  status          BookingStatus @default(PENDING)\n  meetingLink     String?\n\n  // Relations \n  student       User          @relation("StudentBookings", fields: [studentId], references: [id])\n  tutorCategory TutorCategory @relation(fields: [tutorCategoryId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  review    Review?\n  payment   Payment?\n}\n\nmodel Payment {\n  id                    String        @id @default(uuid())\n  bookingId             String        @unique\n  studentId             String\n  stripeEventId         String?       @unique\n  amount                Float\n  currency              String        @default("usd")\n  status                PaymentStatus @default(PENDING)\n  stripePaymentIntentId String?       @unique\n  stripeSessionId       String?       @unique\n  paidAt                DateTime?\n\n  booking Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)\n  student User    @relation("StudentPayments", fields: [studentId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("payment")\n}\n\nmodel Review {\n  id             String  @id @default(uuid())\n  bookingId      String  @unique\n  studentId      String\n  tutorProfileId String\n  rating         Int\n  comment        String?\n\n  // Relations\n  booking      Booking      @relation(fields: [bookingId], references: [id], onDelete: Cascade)\n  student      User         @relation(fields: [studentId], references: [id])\n  tutorProfile TutorProfile @relation(fields: [tutorProfileId], references: [id])\n\n  createdAt DateTime @default(now())\n}\n\nmodel AdminLog {\n  id       String  @id @default(uuid())\n  adminId  String\n  action   String\n  targetId String?\n\n  // relations\n  admin User @relation(fields: [adminId], references: [id])\n\n  createdAt DateTime @default(now())\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileToUser"},{"name":"bookings","kind":"object","type":"Booking","relationName":"StudentBookings"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"},{"name":"adminLogs","kind":"object","type":"AdminLog","relationName":"AdminLogToUser"},{"name":"payments","kind":"object","type":"Payment","relationName":"StudentPayments"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"totalReviews","kind":"scalar","type":"Int"},{"name":"averageRating","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"ProfileStatus"},{"name":"isVerified","kind":"scalar","type":"Boolean"},{"name":"user","kind":"object","type":"User","relationName":"TutorProfileToUser"},{"name":"tutorCategories","kind":"object","type":"TutorCategory","relationName":"TutorCategoryToTutorProfile"},{"name":"availability","kind":"object","type":"AvailabilitySlot","relationName":"AvailabilitySlotToTutorProfile"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToTutorProfile"}],"dbName":null},"Subject":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"tutorCategories","kind":"object","type":"TutorCategory","relationName":"SubjectToTutorCategory"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"TutorCategory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"subjectId","kind":"scalar","type":"String"},{"name":"hourlyRate","kind":"scalar","type":"Float"},{"name":"experienceYears","kind":"scalar","type":"Int"},{"name":"level","kind":"enum","type":"TutorLevel"},{"name":"description","kind":"scalar","type":"String"},{"name":"isPrimary","kind":"scalar","type":"Boolean"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorCategoryToTutorProfile"},{"name":"subject","kind":"object","type":"Subject","relationName":"SubjectToTutorCategory"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToTutorCategory"}],"dbName":null},"AvailabilitySlot":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"dayOfWeek","kind":"enum","type":"DayOfWeek"},{"name":"startTime","kind":"scalar","type":"DateTime"},{"name":"endTime","kind":"scalar","type":"DateTime"},{"name":"startDate","kind":"scalar","type":"DateTime"},{"name":"endDate","kind":"scalar","type":"DateTime"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"AvailabilitySlotToTutorProfile"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorCategoryId","kind":"scalar","type":"String"},{"name":"sessionDate","kind":"scalar","type":"DateTime"},{"name":"startTime","kind":"scalar","type":"DateTime"},{"name":"endTime","kind":"scalar","type":"DateTime"},{"name":"price","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"meetingLink","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"User","relationName":"StudentBookings"},{"name":"tutorCategory","kind":"object","type":"TutorCategory","relationName":"BookingToTutorCategory"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"review","kind":"object","type":"Review","relationName":"BookingToReview"},{"name":"payment","kind":"object","type":"Payment","relationName":"BookingToPayment"}],"dbName":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"stripeEventId","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"currency","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"stripePaymentIntentId","kind":"scalar","type":"String"},{"name":"stripeSessionId","kind":"scalar","type":"String"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToPayment"},{"name":"student","kind":"object","type":"User","relationName":"StudentPayments"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"payment"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToReview"},{"name":"student","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"ReviewToTutorProfile"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"AdminLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"adminId","kind":"scalar","type":"String"},{"name":"action","kind":"scalar","type":"String"},{"name":"targetId","kind":"scalar","type":"String"},{"name":"admin","kind":"object","type":"User","relationName":"AdminLogToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","tutorProfile","tutorCategories","_count","subject","student","tutorCategory","booking","review","payment","bookings","availability","reviews","admin","adminLogs","payments","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","TutorProfile.findUnique","TutorProfile.findUniqueOrThrow","TutorProfile.findFirst","TutorProfile.findFirstOrThrow","TutorProfile.findMany","TutorProfile.createOne","TutorProfile.createMany","TutorProfile.createManyAndReturn","TutorProfile.updateOne","TutorProfile.updateMany","TutorProfile.updateManyAndReturn","TutorProfile.upsertOne","TutorProfile.deleteOne","TutorProfile.deleteMany","_avg","_sum","TutorProfile.groupBy","TutorProfile.aggregate","Subject.findUnique","Subject.findUniqueOrThrow","Subject.findFirst","Subject.findFirstOrThrow","Subject.findMany","Subject.createOne","Subject.createMany","Subject.createManyAndReturn","Subject.updateOne","Subject.updateMany","Subject.updateManyAndReturn","Subject.upsertOne","Subject.deleteOne","Subject.deleteMany","Subject.groupBy","Subject.aggregate","TutorCategory.findUnique","TutorCategory.findUniqueOrThrow","TutorCategory.findFirst","TutorCategory.findFirstOrThrow","TutorCategory.findMany","TutorCategory.createOne","TutorCategory.createMany","TutorCategory.createManyAndReturn","TutorCategory.updateOne","TutorCategory.updateMany","TutorCategory.updateManyAndReturn","TutorCategory.upsertOne","TutorCategory.deleteOne","TutorCategory.deleteMany","TutorCategory.groupBy","TutorCategory.aggregate","AvailabilitySlot.findUnique","AvailabilitySlot.findUniqueOrThrow","AvailabilitySlot.findFirst","AvailabilitySlot.findFirstOrThrow","AvailabilitySlot.findMany","AvailabilitySlot.createOne","AvailabilitySlot.createMany","AvailabilitySlot.createManyAndReturn","AvailabilitySlot.updateOne","AvailabilitySlot.updateMany","AvailabilitySlot.updateManyAndReturn","AvailabilitySlot.upsertOne","AvailabilitySlot.deleteOne","AvailabilitySlot.deleteMany","AvailabilitySlot.groupBy","AvailabilitySlot.aggregate","Booking.findUnique","Booking.findUniqueOrThrow","Booking.findFirst","Booking.findFirstOrThrow","Booking.findMany","Booking.createOne","Booking.createMany","Booking.createManyAndReturn","Booking.updateOne","Booking.updateMany","Booking.updateManyAndReturn","Booking.upsertOne","Booking.deleteOne","Booking.deleteMany","Booking.groupBy","Booking.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","AdminLog.findUnique","AdminLog.findUniqueOrThrow","AdminLog.findFirst","AdminLog.findFirstOrThrow","AdminLog.findMany","AdminLog.createOne","AdminLog.createMany","AdminLog.createManyAndReturn","AdminLog.updateOne","AdminLog.updateMany","AdminLog.updateManyAndReturn","AdminLog.upsertOne","AdminLog.deleteOne","AdminLog.deleteMany","AdminLog.groupBy","AdminLog.aggregate","AND","OR","NOT","id","adminId","action","targetId","createdAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","bookingId","studentId","tutorProfileId","rating","comment","stripeEventId","amount","currency","PaymentStatus","status","stripePaymentIntentId","stripeSessionId","paidAt","updatedAt","tutorCategoryId","sessionDate","startTime","endTime","price","BookingStatus","meetingLink","DayOfWeek","dayOfWeek","startDate","endDate","isActive","subjectId","hourlyRate","experienceYears","TutorLevel","level","description","isPrimary","name","slug","every","some","none","userId","bio","totalReviews","averageRating","ProfileStatus","isVerified","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","email","emailVerified","UserRole","role","UserStatus","image","tutorProfileId_subjectId","is","isNot","connectOrCreate","upsert","disconnect","delete","connect","createMany","set","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "hgZvwAETBAAAjgMAIAUAAI8DACAGAACQAwAgDwAAkQMAIBEAAP8CACATAACSAwAgFAAAkwMAIN0BAACLAwAw3gEAADYAEN8BAACLAwAw4AEBAAAAAeQBQADxAgAh-QEAAI0DsAIi_QFAAPECACGRAgEA8AIAIasCAQAAAAGsAiAA_AIAIa4CAACMA64CIrACAQD4AgAhAQAAAAEAIAwDAAD9AgAg3QEAAKcDADDeAQAAAwAQ3wEAAKcDADDgAQEA8AIAIeQBQADxAgAh_QFAAPECACGWAgEA8AIAIZ4CQADxAgAhqAIBAPACACGpAgEA-AIAIaoCAQD4AgAhAwMAAMEEACCpAgAAqAMAIKoCAACoAwAgDAMAAP0CACDdAQAApwMAMN4BAAADABDfAQAApwMAMOABAQAAAAHkAUAA8QIAIf0BQADxAgAhlgIBAPACACGeAkAA8QIAIagCAQAAAAGpAgEA-AIAIaoCAQD4AgAhAwAAAAMAIAEAAAQAMAIAAAUAIBEDAAD9AgAg3QEAAKYDADDeAQAABwAQ3wEAAKYDADDgAQEA8AIAIeQBQADxAgAh_QFAAPECACGWAgEA8AIAIZ8CAQDwAgAhoAIBAPACACGhAgEA-AIAIaICAQD4AgAhowIBAPgCACGkAkAAlgMAIaUCQACWAwAhpgIBAPgCACGnAgEA-AIAIQgDAADBBAAgoQIAAKgDACCiAgAAqAMAIKMCAACoAwAgpAIAAKgDACClAgAAqAMAIKYCAACoAwAgpwIAAKgDACARAwAA_QIAIN0BAACmAwAw3gEAAAcAEN8BAACmAwAw4AEBAAAAAeQBQADxAgAh_QFAAPECACGWAgEA8AIAIZ8CAQDwAgAhoAIBAPACACGhAgEA-AIAIaICAQD4AgAhowIBAPgCACGkAkAAlgMAIaUCQACWAwAhpgIBAPgCACGnAgEA-AIAIQMAAAAHACABAAAIADACAAAJACAQAwAA_QIAIAcAAPICACAQAAD-AgAgEQAA_wIAIN0BAAD3AgAw3gEAAAsAEN8BAAD3AgAw4AEBAPACACHkAUAA8QIAIfkBAAD7ApsCIv0BQADxAgAhlgIBAPACACGXAgEA-AIAIZgCAgD5AgAhmQIIAPoCACGbAiAA_AIAIQEAAAALACAPBgAAmgMAIAkAAKUDACAPAACRAwAg3QEAAKMDADDeAQAADQAQ3wEAAKMDADDgAQEA8AIAIeQBQADxAgAh8gEBAPACACGKAgEA8AIAIYsCCAD6AgAhjAICAPkCACGOAgAApAOOAiKPAgEA-AIAIZACIAD8AgAhBAYAAK0FACAJAAC1BQAgDwAArgUAII8CAACoAwAgEAYAAJoDACAJAAClAwAgDwAAkQMAIN0BAACjAwAw3gEAAA0AEN8BAACjAwAw4AEBAAAAAeQBQADxAgAh8gEBAPACACGKAgEA8AIAIYsCCAD6AgAhjAICAPkCACGOAgAApAOOAiKPAgEA-AIAIZACIAD8AgAhsQIAAKIDACADAAAADQAgAQAADgAwAgAADwAgAwAAAA0AIAEAAA4AMAIAAA8AIAEAAAANACASCgAA_QIAIAsAAJ8DACANAACgAwAgDgAAoQMAIN0BAACdAwAw3gEAABMAEN8BAACdAwAw4AEBAPACACHkAUAA8QIAIfEBAQDwAgAh-QEAAJ4DhAIi_QFAAPECACH-AQEA8AIAIf8BQADxAgAhgAJAAPECACGBAkAA8QIAIYICCAD6AgAhhAIBAPgCACEFCgAAwQQAIAsAALIFACANAACzBQAgDgAAtAUAIIQCAACoAwAgEgoAAP0CACALAACfAwAgDQAAoAMAIA4AAKEDACDdAQAAnQMAMN4BAAATABDfAQAAnQMAMOABAQAAAAHkAUAA8QIAIfEBAQDwAgAh-QEAAJ4DhAIi_QFAAPECACH-AQEA8AIAIf8BQADxAgAhgAJAAPECACGBAkAA8QIAIYICCAD6AgAhhAIBAPgCACEDAAAAEwAgAQAAFAAwAgAAFQAgDQYAAJoDACAKAAD9AgAgDAAAlwMAIN0BAACZAwAw3gEAABcAEN8BAACZAwAw4AEBAPACACHkAUAA8QIAIfABAQDwAgAh8QEBAPACACHyAQEA8AIAIfMBAgD5AgAh9AEBAPgCACEBAAAAFwAgEQoAAP0CACAMAACXAwAg3QEAAJQDADDeAQAAGQAQ3wEAAJQDADDgAQEA8AIAIeQBQADxAgAh8AEBAPACACHxAQEA8AIAIfUBAQD4AgAh9gEIAPoCACH3AQEA8AIAIfkBAACVA_kBIvoBAQD4AgAh-wEBAPgCACH8AUAAlgMAIf0BQADxAgAhAQAAABkAIAEAAAATACANBgAAmgMAIN0BAACbAwAw3gEAABwAEN8BAACbAwAw4AEBAPACACHkAUAA8QIAIfIBAQDwAgAhgAJAAPECACGBAkAA8QIAIYYCAACcA4YCIocCQADxAgAhiAJAAPECACGJAiAA_AIAIQEGAACtBQAgDQYAAJoDACDdAQAAmwMAMN4BAAAcABDfAQAAmwMAMOABAQAAAAHkAUAA8QIAIfIBAQDwAgAhgAJAAPECACGBAkAA8QIAIYYCAACcA4YCIocCQADxAgAhiAJAAPECACGJAiAA_AIAIQMAAAAcACABAAAdADACAAAeACAEBgAArQUAIAoAAMEEACAMAACxBQAg9AEAAKgDACANBgAAmgMAIAoAAP0CACAMAACXAwAg3QEAAJkDADDeAQAAFwAQ3wEAAJkDADDgAQEAAAAB5AFAAPECACHwAQEAAAAB8QEBAPACACHyAQEA8AIAIfMBAgD5AgAh9AEBAPgCACEDAAAAFwAgAQAAIAAwAgAAIQAgAQAAAA0AIAEAAAAcACABAAAAFwAgAwAAABMAIAEAABQAMAIAABUAIAMAAAAXACABAAAgADACAAAhACAJEgAA_QIAIN0BAACYAwAw3gEAACgAEN8BAACYAwAw4AEBAPACACHhAQEA8AIAIeIBAQDwAgAh4wEBAPgCACHkAUAA8QIAIQISAADBBAAg4wEAAKgDACAJEgAA_QIAIN0BAACYAwAw3gEAACgAEN8BAACYAwAw4AEBAAAAAeEBAQDwAgAh4gEBAPACACHjAQEA-AIAIeQBQADxAgAhAwAAACgAIAEAACkAMAIAACoAIAYKAADBBAAgDAAAsQUAIPUBAACoAwAg-gEAAKgDACD7AQAAqAMAIPwBAACoAwAgEQoAAP0CACAMAACXAwAg3QEAAJQDADDeAQAAGQAQ3wEAAJQDADDgAQEAAAAB5AFAAPECACHwAQEAAAAB8QEBAPACACH1AQEAAAAB9gEIAPoCACH3AQEA8AIAIfkBAACVA_kBIvoBAQAAAAH7AQEAAAAB_AFAAJYDACH9AUAA8QIAIQMAAAAZACABAAAsADACAAAtACABAAAAAwAgAQAAAAcAIAEAAAATACABAAAAFwAgAQAAACgAIAEAAAAZACABAAAAAQAgEwQAAI4DACAFAACPAwAgBgAAkAMAIA8AAJEDACARAAD_AgAgEwAAkgMAIBQAAJMDACDdAQAAiwMAMN4BAAA2ABDfAQAAiwMAMOABAQDwAgAh5AFAAPECACH5AQAAjQOwAiL9AUAA8QIAIZECAQDwAgAhqwIBAPACACGsAiAA_AIAIa4CAACMA64CIrACAQD4AgAhCAQAAKsFACAFAACsBQAgBgAArQUAIA8AAK4FACARAADDBAAgEwAArwUAIBQAALAFACCwAgAAqAMAIAMAAAA2ACABAAA3ADACAAABACADAAAANgAgAQAANwAwAgAAAQAgAwAAADYAIAEAADcAMAIAAAEAIBAEAACkBQAgBQAApQUAIAYAAKYFACAPAACnBQAgEQAAqAUAIBMAAKkFACAUAACqBQAg4AEBAAAAAeQBQAAAAAH5AQAAALACAv0BQAAAAAGRAgEAAAABqwIBAAAAAawCIAAAAAGuAgAAAK4CArACAQAAAAEBGgAAOwAgCeABAQAAAAHkAUAAAAAB-QEAAACwAgL9AUAAAAABkQIBAAAAAasCAQAAAAGsAiAAAAABrgIAAACuAgKwAgEAAAABARoAAD0AMAEaAAA9ADAQBAAA1gQAIAUAANcEACAGAADYBAAgDwAA2QQAIBEAANoEACATAADbBAAgFAAA3AQAIOABAQCsAwAh5AFAAK4DACH5AQAA1QSwAiL9AUAArgMAIZECAQCsAwAhqwIBAKwDACGsAiAA5QMAIa4CAADUBK4CIrACAQCtAwAhAgAAAAEAIBoAAEAAIAngAQEArAMAIeQBQACuAwAh-QEAANUEsAIi_QFAAK4DACGRAgEArAMAIasCAQCsAwAhrAIgAOUDACGuAgAA1ASuAiKwAgEArQMAIQIAAAA2ACAaAABCACACAAAANgAgGgAAQgAgAwAAAAEAICEAADsAICIAAEAAIAEAAAABACABAAAANgAgBAgAANEEACAnAADTBAAgKAAA0gQAILACAACoAwAgDN0BAACEAwAw3gEAAEkAEN8BAACEAwAw4AEBAMcCACHkAUAAyQIAIfkBAACGA7ACIv0BQADJAgAhkQIBAMcCACGrAgEAxwIAIawCIADlAgAhrgIAAIUDrgIisAIBAMgCACEDAAAANgAgAQAASAAwJgAASQAgAwAAADYAIAEAADcAMAIAAAEAIAEAAAAFACABAAAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgCQMAANAEACDgAQEAAAAB5AFAAAAAAf0BQAAAAAGWAgEAAAABngJAAAAAAagCAQAAAAGpAgEAAAABqgIBAAAAAQEaAABRACAI4AEBAAAAAeQBQAAAAAH9AUAAAAABlgIBAAAAAZ4CQAAAAAGoAgEAAAABqQIBAAAAAaoCAQAAAAEBGgAAUwAwARoAAFMAMAkDAADPBAAg4AEBAKwDACHkAUAArgMAIf0BQACuAwAhlgIBAKwDACGeAkAArgMAIagCAQCsAwAhqQIBAK0DACGqAgEArQMAIQIAAAAFACAaAABWACAI4AEBAKwDACHkAUAArgMAIf0BQACuAwAhlgIBAKwDACGeAkAArgMAIagCAQCsAwAhqQIBAK0DACGqAgEArQMAIQIAAAADACAaAABYACACAAAAAwAgGgAAWAAgAwAAAAUAICEAAFEAICIAAFYAIAEAAAAFACABAAAAAwAgBQgAAMwEACAnAADOBAAgKAAAzQQAIKkCAACoAwAgqgIAAKgDACAL3QEAAIMDADDeAQAAXwAQ3wEAAIMDADDgAQEAxwIAIeQBQADJAgAh_QFAAMkCACGWAgEAxwIAIZ4CQADJAgAhqAIBAMcCACGpAgEAyAIAIaoCAQDIAgAhAwAAAAMAIAEAAF4AMCYAAF8AIAMAAAADACABAAAEADACAAAFACABAAAACQAgAQAAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIA4DAADLBAAg4AEBAAAAAeQBQAAAAAH9AUAAAAABlgIBAAAAAZ8CAQAAAAGgAgEAAAABoQIBAAAAAaICAQAAAAGjAgEAAAABpAJAAAAAAaUCQAAAAAGmAgEAAAABpwIBAAAAAQEaAABnACAN4AEBAAAAAeQBQAAAAAH9AUAAAAABlgIBAAAAAZ8CAQAAAAGgAgEAAAABoQIBAAAAAaICAQAAAAGjAgEAAAABpAJAAAAAAaUCQAAAAAGmAgEAAAABpwIBAAAAAQEaAABpADABGgAAaQAwDgMAAMoEACDgAQEArAMAIeQBQACuAwAh_QFAAK4DACGWAgEArAMAIZ8CAQCsAwAhoAIBAKwDACGhAgEArQMAIaICAQCtAwAhowIBAK0DACGkAkAAxAMAIaUCQADEAwAhpgIBAK0DACGnAgEArQMAIQIAAAAJACAaAABsACAN4AEBAKwDACHkAUAArgMAIf0BQACuAwAhlgIBAKwDACGfAgEArAMAIaACAQCsAwAhoQIBAK0DACGiAgEArQMAIaMCAQCtAwAhpAJAAMQDACGlAkAAxAMAIaYCAQCtAwAhpwIBAK0DACECAAAABwAgGgAAbgAgAgAAAAcAIBoAAG4AIAMAAAAJACAhAABnACAiAABsACABAAAACQAgAQAAAAcAIAoIAADHBAAgJwAAyQQAICgAAMgEACChAgAAqAMAIKICAACoAwAgowIAAKgDACCkAgAAqAMAIKUCAACoAwAgpgIAAKgDACCnAgAAqAMAIBDdAQAAggMAMN4BAAB1ABDfAQAAggMAMOABAQDHAgAh5AFAAMkCACH9AUAAyQIAIZYCAQDHAgAhnwIBAMcCACGgAgEAxwIAIaECAQDIAgAhogIBAMgCACGjAgEAyAIAIaQCQADZAgAhpQJAANkCACGmAgEAyAIAIacCAQDIAgAhAwAAAAcAIAEAAHQAMCYAAHUAIAMAAAAHACABAAAIADACAAAJACAJ3QEAAIEDADDeAQAAewAQ3wEAAIEDADDgAQEAAAAB5AFAAPECACH9AUAA8QIAIZwCAQDwAgAhnQIBAPACACGeAkAA8QIAIQEAAAB4ACABAAAAeAAgCd0BAACBAwAw3gEAAHsAEN8BAACBAwAw4AEBAPACACHkAUAA8QIAIf0BQADxAgAhnAIBAPACACGdAgEA8AIAIZ4CQADxAgAhAAMAAAB7ACABAAB8ADACAAB4ACADAAAAewAgAQAAfAAwAgAAeAAgAwAAAHsAIAEAAHwAMAIAAHgAIAbgAQEAAAAB5AFAAAAAAf0BQAAAAAGcAgEAAAABnQIBAAAAAZ4CQAAAAAEBGgAAgAEAIAbgAQEAAAAB5AFAAAAAAf0BQAAAAAGcAgEAAAABnQIBAAAAAZ4CQAAAAAEBGgAAggEAMAEaAACCAQAwBuABAQCsAwAh5AFAAK4DACH9AUAArgMAIZwCAQCsAwAhnQIBAKwDACGeAkAArgMAIQIAAAB4ACAaAACFAQAgBuABAQCsAwAh5AFAAK4DACH9AUAArgMAIZwCAQCsAwAhnQIBAKwDACGeAkAArgMAIQIAAAB7ACAaAACHAQAgAgAAAHsAIBoAAIcBACADAAAAeAAgIQAAgAEAICIAAIUBACABAAAAeAAgAQAAAHsAIAMIAADEBAAgJwAAxgQAICgAAMUEACAJ3QEAAIADADDeAQAAjgEAEN8BAACAAwAw4AEBAMcCACHkAUAAyQIAIf0BQADJAgAhnAIBAMcCACGdAgEAxwIAIZ4CQADJAgAhAwAAAHsAIAEAAI0BADAmAACOAQAgAwAAAHsAIAEAAHwAMAIAAHgAIBADAAD9AgAgBwAA8gIAIBAAAP4CACARAAD_AgAg3QEAAPcCADDeAQAACwAQ3wEAAPcCADDgAQEAAAAB5AFAAPECACH5AQAA-wKbAiL9AUAA8QIAIZYCAQAAAAGXAgEA-AIAIZgCAgD5AgAhmQIIAPoCACGbAiAA_AIAIQEAAACRAQAgAQAAAJEBACAFAwAAwQQAIAcAAJEEACAQAADCBAAgEQAAwwQAIJcCAACoAwAgAwAAAAsAIAEAAJQBADACAACRAQAgAwAAAAsAIAEAAJQBADACAACRAQAgAwAAAAsAIAEAAJQBADACAACRAQAgDQMAAL0EACAHAAC-BAAgEAAAvwQAIBEAAMAEACDgAQEAAAAB5AFAAAAAAfkBAAAAmwIC_QFAAAAAAZYCAQAAAAGXAgEAAAABmAICAAAAAZkCCAAAAAGbAiAAAAABARoAAJgBACAJ4AEBAAAAAeQBQAAAAAH5AQAAAJsCAv0BQAAAAAGWAgEAAAABlwIBAAAAAZgCAgAAAAGZAggAAAABmwIgAAAAAQEaAACaAQAwARoAAJoBADANAwAAmAQAIAcAAJkEACAQAACaBAAgEQAAmwQAIOABAQCsAwAh5AFAAK4DACH5AQAAlwSbAiL9AUAArgMAIZYCAQCsAwAhlwIBAK0DACGYAgIAtgMAIZkCCADCAwAhmwIgAOUDACECAAAAkQEAIBoAAJ0BACAJ4AEBAKwDACHkAUAArgMAIfkBAACXBJsCIv0BQACuAwAhlgIBAKwDACGXAgEArQMAIZgCAgC2AwAhmQIIAMIDACGbAiAA5QMAIQIAAAALACAaAACfAQAgAgAAAAsAIBoAAJ8BACADAAAAkQEAICEAAJgBACAiAACdAQAgAQAAAJEBACABAAAACwAgBggAAJIEACAnAACVBAAgKAAAlAQAIGkAAJMEACBqAACWBAAglwIAAKgDACAM3QEAAPMCADDeAQAApgEAEN8BAADzAgAw4AEBAMcCACHkAUAAyQIAIfkBAAD0ApsCIv0BQADJAgAhlgIBAMcCACGXAgEAyAIAIZgCAgDTAgAhmQIIANcCACGbAiAA5QIAIQMAAAALACABAAClAQAwJgAApgEAIAMAAAALACABAACUAQAwAgAAkQEAIAgHAADyAgAg3QEAAO8CADDeAQAArAEAEN8BAADvAgAw4AEBAAAAAeQBQADxAgAhkQIBAPACACGSAgEAAAABAQAAAKkBACABAAAAqQEAIAgHAADyAgAg3QEAAO8CADDeAQAArAEAEN8BAADvAgAw4AEBAPACACHkAUAA8QIAIZECAQDwAgAhkgIBAPACACEBBwAAkQQAIAMAAACsAQAgAQAArQEAMAIAAKkBACADAAAArAEAIAEAAK0BADACAACpAQAgAwAAAKwBACABAACtAQAwAgAAqQEAIAUHAACQBAAg4AEBAAAAAeQBQAAAAAGRAgEAAAABkgIBAAAAAQEaAACxAQAgBOABAQAAAAHkAUAAAAABkQIBAAAAAZICAQAAAAEBGgAAswEAMAEaAACzAQAwBQcAAIMEACDgAQEArAMAIeQBQACuAwAhkQIBAKwDACGSAgEArAMAIQIAAACpAQAgGgAAtgEAIATgAQEArAMAIeQBQACuAwAhkQIBAKwDACGSAgEArAMAIQIAAACsAQAgGgAAuAEAIAIAAACsAQAgGgAAuAEAIAMAAACpAQAgIQAAsQEAICIAALYBACABAAAAqQEAIAEAAACsAQAgAwgAAIAEACAnAACCBAAgKAAAgQQAIAfdAQAA7gIAMN4BAAC_AQAQ3wEAAO4CADDgAQEAxwIAIeQBQADJAgAhkQIBAMcCACGSAgEAxwIAIQMAAACsAQAgAQAAvgEAMCYAAL8BACADAAAArAEAIAEAAK0BADACAACpAQAgAQAAAA8AIAEAAAAPACADAAAADQAgAQAADgAwAgAADwAgAwAAAA0AIAEAAA4AMAIAAA8AIAMAAAANACABAAAOADACAAAPACAMBgAA_QMAIAkAAP4DACAPAAD_AwAg4AEBAAAAAeQBQAAAAAHyAQEAAAABigIBAAAAAYsCCAAAAAGMAgIAAAABjgIAAACOAgKPAgEAAAABkAIgAAAAAQEaAADHAQAgCeABAQAAAAHkAUAAAAAB8gEBAAAAAYoCAQAAAAGLAggAAAABjAICAAAAAY4CAAAAjgICjwIBAAAAAZACIAAAAAEBGgAAyQEAMAEaAADJAQAwDAYAAO4DACAJAADvAwAgDwAA8AMAIOABAQCsAwAh5AFAAK4DACHyAQEArAMAIYoCAQCsAwAhiwIIAMIDACGMAgIAtgMAIY4CAADtA44CIo8CAQCtAwAhkAIgAOUDACECAAAADwAgGgAAzAEAIAngAQEArAMAIeQBQACuAwAh8gEBAKwDACGKAgEArAMAIYsCCADCAwAhjAICALYDACGOAgAA7QOOAiKPAgEArQMAIZACIADlAwAhAgAAAA0AIBoAAM4BACACAAAADQAgGgAAzgEAIAMAAAAPACAhAADHAQAgIgAAzAEAIAEAAAAPACABAAAADQAgBggAAOgDACAnAADrAwAgKAAA6gMAIGkAAOkDACBqAADsAwAgjwIAAKgDACAM3QEAAOoCADDeAQAA1QEAEN8BAADqAgAw4AEBAMcCACHkAUAAyQIAIfIBAQDHAgAhigIBAMcCACGLAggA1wIAIYwCAgDTAgAhjgIAAOsCjgIijwIBAMgCACGQAiAA5QIAIQMAAAANACABAADUAQAwJgAA1QEAIAMAAAANACABAAAOADACAAAPACABAAAAHgAgAQAAAB4AIAMAAAAcACABAAAdADACAAAeACADAAAAHAAgAQAAHQAwAgAAHgAgAwAAABwAIAEAAB0AMAIAAB4AIAoGAADnAwAg4AEBAAAAAeQBQAAAAAHyAQEAAAABgAJAAAAAAYECQAAAAAGGAgAAAIYCAocCQAAAAAGIAkAAAAABiQIgAAAAAQEaAADdAQAgCeABAQAAAAHkAUAAAAAB8gEBAAAAAYACQAAAAAGBAkAAAAABhgIAAACGAgKHAkAAAAABiAJAAAAAAYkCIAAAAAEBGgAA3wEAMAEaAADfAQAwCgYAAOYDACDgAQEArAMAIeQBQACuAwAh8gEBAKwDACGAAkAArgMAIYECQACuAwAhhgIAAOQDhgIihwJAAK4DACGIAkAArgMAIYkCIADlAwAhAgAAAB4AIBoAAOIBACAJ4AEBAKwDACHkAUAArgMAIfIBAQCsAwAhgAJAAK4DACGBAkAArgMAIYYCAADkA4YCIocCQACuAwAhiAJAAK4DACGJAiAA5QMAIQIAAAAcACAaAADkAQAgAgAAABwAIBoAAOQBACADAAAAHgAgIQAA3QEAICIAAOIBACABAAAAHgAgAQAAABwAIAMIAADhAwAgJwAA4wMAICgAAOIDACAM3QEAAOMCADDeAQAA6wEAEN8BAADjAgAw4AEBAMcCACHkAUAAyQIAIfIBAQDHAgAhgAJAAMkCACGBAkAAyQIAIYYCAADkAoYCIocCQADJAgAhiAJAAMkCACGJAiAA5QIAIQMAAAAcACABAADqAQAwJgAA6wEAIAMAAAAcACABAAAdADACAAAeACABAAAAFQAgAQAAABUAIAMAAAATACABAAAUADACAAAVACADAAAAEwAgAQAAFAAwAgAAFQAgAwAAABMAIAEAABQAMAIAABUAIA8KAADdAwAgCwAA3gMAIA0AAN8DACAOAADgAwAg4AEBAAAAAeQBQAAAAAHxAQEAAAAB-QEAAACEAgL9AUAAAAAB_gEBAAAAAf8BQAAAAAGAAkAAAAABgQJAAAAAAYICCAAAAAGEAgEAAAABARoAAPMBACAL4AEBAAAAAeQBQAAAAAHxAQEAAAAB-QEAAACEAgL9AUAAAAAB_gEBAAAAAf8BQAAAAAGAAkAAAAABgQJAAAAAAYICCAAAAAGEAgEAAAABARoAAPUBADABGgAA9QEAMA8KAADPAwAgCwAA0AMAIA0AANEDACAOAADSAwAg4AEBAKwDACHkAUAArgMAIfEBAQCsAwAh-QEAAM4DhAIi_QFAAK4DACH-AQEArAMAIf8BQACuAwAhgAJAAK4DACGBAkAArgMAIYICCADCAwAhhAIBAK0DACECAAAAFQAgGgAA-AEAIAvgAQEArAMAIeQBQACuAwAh8QEBAKwDACH5AQAAzgOEAiL9AUAArgMAIf4BAQCsAwAh_wFAAK4DACGAAkAArgMAIYECQACuAwAhggIIAMIDACGEAgEArQMAIQIAAAATACAaAAD6AQAgAgAAABMAIBoAAPoBACADAAAAFQAgIQAA8wEAICIAAPgBACABAAAAFQAgAQAAABMAIAYIAADJAwAgJwAAzAMAICgAAMsDACBpAADKAwAgagAAzQMAIIQCAACoAwAgDt0BAADfAgAw3gEAAIECABDfAQAA3wIAMOABAQDHAgAh5AFAAMkCACHxAQEAxwIAIfkBAADgAoQCIv0BQADJAgAh_gEBAMcCACH_AUAAyQIAIYACQADJAgAhgQJAAMkCACGCAggA1wIAIYQCAQDIAgAhAwAAABMAIAEAAIACADAmAACBAgAgAwAAABMAIAEAABQAMAIAABUAIAEAAAAtACABAAAALQAgAwAAABkAIAEAACwAMAIAAC0AIAMAAAAZACABAAAsADACAAAtACADAAAAGQAgAQAALAAwAgAALQAgDgoAAMgDACAMAADHAwAg4AEBAAAAAeQBQAAAAAHwAQEAAAAB8QEBAAAAAfUBAQAAAAH2AQgAAAAB9wEBAAAAAfkBAAAA-QEC-gEBAAAAAfsBAQAAAAH8AUAAAAAB_QFAAAAAAQEaAACJAgAgDOABAQAAAAHkAUAAAAAB8AEBAAAAAfEBAQAAAAH1AQEAAAAB9gEIAAAAAfcBAQAAAAH5AQAAAPkBAvoBAQAAAAH7AQEAAAAB_AFAAAAAAf0BQAAAAAEBGgAAiwIAMAEaAACLAgAwDgoAAMYDACAMAADFAwAg4AEBAKwDACHkAUAArgMAIfABAQCsAwAh8QEBAKwDACH1AQEArQMAIfYBCADCAwAh9wEBAKwDACH5AQAAwwP5ASL6AQEArQMAIfsBAQCtAwAh_AFAAMQDACH9AUAArgMAIQIAAAAtACAaAACOAgAgDOABAQCsAwAh5AFAAK4DACHwAQEArAMAIfEBAQCsAwAh9QEBAK0DACH2AQgAwgMAIfcBAQCsAwAh-QEAAMMD-QEi-gEBAK0DACH7AQEArQMAIfwBQADEAwAh_QFAAK4DACECAAAAGQAgGgAAkAIAIAIAAAAZACAaAACQAgAgAwAAAC0AICEAAIkCACAiAACOAgAgAQAAAC0AIAEAAAAZACAJCAAAvQMAICcAAMADACAoAAC_AwAgaQAAvgMAIGoAAMEDACD1AQAAqAMAIPoBAACoAwAg-wEAAKgDACD8AQAAqAMAIA_dAQAA1gIAMN4BAACXAgAQ3wEAANYCADDgAQEAxwIAIeQBQADJAgAh8AEBAMcCACHxAQEAxwIAIfUBAQDIAgAh9gEIANcCACH3AQEAxwIAIfkBAADYAvkBIvoBAQDIAgAh-wEBAMgCACH8AUAA2QIAIf0BQADJAgAhAwAAABkAIAEAAJYCADAmAACXAgAgAwAAABkAIAEAACwAMAIAAC0AIAEAAAAhACABAAAAIQAgAwAAABcAIAEAACAAMAIAACEAIAMAAAAXACABAAAgADACAAAhACADAAAAFwAgAQAAIAAwAgAAIQAgCgYAALwDACAKAAC7AwAgDAAAugMAIOABAQAAAAHkAUAAAAAB8AEBAAAAAfEBAQAAAAHyAQEAAAAB8wECAAAAAfQBAQAAAAEBGgAAnwIAIAfgAQEAAAAB5AFAAAAAAfABAQAAAAHxAQEAAAAB8gEBAAAAAfMBAgAAAAH0AQEAAAABARoAAKECADABGgAAoQIAMAoGAAC5AwAgCgAAuAMAIAwAALcDACDgAQEArAMAIeQBQACuAwAh8AEBAKwDACHxAQEArAMAIfIBAQCsAwAh8wECALYDACH0AQEArQMAIQIAAAAhACAaAACkAgAgB-ABAQCsAwAh5AFAAK4DACHwAQEArAMAIfEBAQCsAwAh8gEBAKwDACHzAQIAtgMAIfQBAQCtAwAhAgAAABcAIBoAAKYCACACAAAAFwAgGgAApgIAIAMAAAAhACAhAACfAgAgIgAApAIAIAEAAAAhACABAAAAFwAgBggAALEDACAnAAC0AwAgKAAAswMAIGkAALIDACBqAAC1AwAg9AEAAKgDACAK3QEAANICADDeAQAArQIAEN8BAADSAgAw4AEBAMcCACHkAUAAyQIAIfABAQDHAgAh8QEBAMcCACHyAQEAxwIAIfMBAgDTAgAh9AEBAMgCACEDAAAAFwAgAQAArAIAMCYAAK0CACADAAAAFwAgAQAAIAAwAgAAIQAgAQAAACoAIAEAAAAqACADAAAAKAAgAQAAKQAwAgAAKgAgAwAAACgAIAEAACkAMAIAACoAIAMAAAAoACABAAApADACAAAqACAGEgAAsAMAIOABAQAAAAHhAQEAAAAB4gEBAAAAAeMBAQAAAAHkAUAAAAABARoAALUCACAF4AEBAAAAAeEBAQAAAAHiAQEAAAAB4wEBAAAAAeQBQAAAAAEBGgAAtwIAMAEaAAC3AgAwBhIAAK8DACDgAQEArAMAIeEBAQCsAwAh4gEBAKwDACHjAQEArQMAIeQBQACuAwAhAgAAACoAIBoAALoCACAF4AEBAKwDACHhAQEArAMAIeIBAQCsAwAh4wEBAK0DACHkAUAArgMAIQIAAAAoACAaAAC8AgAgAgAAACgAIBoAALwCACADAAAAKgAgIQAAtQIAICIAALoCACABAAAAKgAgAQAAACgAIAQIAACpAwAgJwAAqwMAICgAAKoDACDjAQAAqAMAIAjdAQAAxgIAMN4BAADDAgAQ3wEAAMYCADDgAQEAxwIAIeEBAQDHAgAh4gEBAMcCACHjAQEAyAIAIeQBQADJAgAhAwAAACgAIAEAAMICADAmAADDAgAgAwAAACgAIAEAACkAMAIAACoAIAjdAQAAxgIAMN4BAADDAgAQ3wEAAMYCADDgAQEAxwIAIeEBAQDHAgAh4gEBAMcCACHjAQEAyAIAIeQBQADJAgAhDggAAMsCACAnAADRAgAgKAAA0QIAIOUBAQAAAAHmAQEAAAAE5wEBAAAABOgBAQAAAAHpAQEAAAAB6gEBAAAAAesBAQAAAAHsAQEA0AIAIe0BAQAAAAHuAQEAAAAB7wEBAAAAAQ4IAADOAgAgJwAAzwIAICgAAM8CACDlAQEAAAAB5gEBAAAABecBAQAAAAXoAQEAAAAB6QEBAAAAAeoBAQAAAAHrAQEAAAAB7AEBAM0CACHtAQEAAAAB7gEBAAAAAe8BAQAAAAELCAAAywIAICcAAMwCACAoAADMAgAg5QFAAAAAAeYBQAAAAATnAUAAAAAE6AFAAAAAAekBQAAAAAHqAUAAAAAB6wFAAAAAAewBQADKAgAhCwgAAMsCACAnAADMAgAgKAAAzAIAIOUBQAAAAAHmAUAAAAAE5wFAAAAABOgBQAAAAAHpAUAAAAAB6gFAAAAAAesBQAAAAAHsAUAAygIAIQjlAQIAAAAB5gECAAAABOcBAgAAAAToAQIAAAAB6QECAAAAAeoBAgAAAAHrAQIAAAAB7AECAMsCACEI5QFAAAAAAeYBQAAAAATnAUAAAAAE6AFAAAAAAekBQAAAAAHqAUAAAAAB6wFAAAAAAewBQADMAgAhDggAAM4CACAnAADPAgAgKAAAzwIAIOUBAQAAAAHmAQEAAAAF5wEBAAAABegBAQAAAAHpAQEAAAAB6gEBAAAAAesBAQAAAAHsAQEAzQIAIe0BAQAAAAHuAQEAAAAB7wEBAAAAAQjlAQIAAAAB5gECAAAABecBAgAAAAXoAQIAAAAB6QECAAAAAeoBAgAAAAHrAQIAAAAB7AECAM4CACEL5QEBAAAAAeYBAQAAAAXnAQEAAAAF6AEBAAAAAekBAQAAAAHqAQEAAAAB6wEBAAAAAewBAQDPAgAh7QEBAAAAAe4BAQAAAAHvAQEAAAABDggAAMsCACAnAADRAgAgKAAA0QIAIOUBAQAAAAHmAQEAAAAE5wEBAAAABOgBAQAAAAHpAQEAAAAB6gEBAAAAAesBAQAAAAHsAQEA0AIAIe0BAQAAAAHuAQEAAAAB7wEBAAAAAQvlAQEAAAAB5gEBAAAABOcBAQAAAAToAQEAAAAB6QEBAAAAAeoBAQAAAAHrAQEAAAAB7AEBANECACHtAQEAAAAB7gEBAAAAAe8BAQAAAAEK3QEAANICADDeAQAArQIAEN8BAADSAgAw4AEBAMcCACHkAUAAyQIAIfABAQDHAgAh8QEBAMcCACHyAQEAxwIAIfMBAgDTAgAh9AEBAMgCACENCAAAywIAICcAAMsCACAoAADLAgAgaQAA1QIAIGoAAMsCACDlAQIAAAAB5gECAAAABOcBAgAAAAToAQIAAAAB6QECAAAAAeoBAgAAAAHrAQIAAAAB7AECANQCACENCAAAywIAICcAAMsCACAoAADLAgAgaQAA1QIAIGoAAMsCACDlAQIAAAAB5gECAAAABOcBAgAAAAToAQIAAAAB6QECAAAAAeoBAgAAAAHrAQIAAAAB7AECANQCACEI5QEIAAAAAeYBCAAAAATnAQgAAAAE6AEIAAAAAekBCAAAAAHqAQgAAAAB6wEIAAAAAewBCADVAgAhD90BAADWAgAw3gEAAJcCABDfAQAA1gIAMOABAQDHAgAh5AFAAMkCACHwAQEAxwIAIfEBAQDHAgAh9QEBAMgCACH2AQgA1wIAIfcBAQDHAgAh-QEAANgC-QEi-gEBAMgCACH7AQEAyAIAIfwBQADZAgAh_QFAAMkCACENCAAAywIAICcAANUCACAoAADVAgAgaQAA1QIAIGoAANUCACDlAQgAAAAB5gEIAAAABOcBCAAAAAToAQgAAAAB6QEIAAAAAeoBCAAAAAHrAQgAAAAB7AEIAN4CACEHCAAAywIAICcAAN0CACAoAADdAgAg5QEAAAD5AQLmAQAAAPkBCOcBAAAA-QEI7AEAANwC-QEiCwgAAM4CACAnAADbAgAgKAAA2wIAIOUBQAAAAAHmAUAAAAAF5wFAAAAABegBQAAAAAHpAUAAAAAB6gFAAAAAAesBQAAAAAHsAUAA2gIAIQsIAADOAgAgJwAA2wIAICgAANsCACDlAUAAAAAB5gFAAAAABecBQAAAAAXoAUAAAAAB6QFAAAAAAeoBQAAAAAHrAUAAAAAB7AFAANoCACEI5QFAAAAAAeYBQAAAAAXnAUAAAAAF6AFAAAAAAekBQAAAAAHqAUAAAAAB6wFAAAAAAewBQADbAgAhBwgAAMsCACAnAADdAgAgKAAA3QIAIOUBAAAA-QEC5gEAAAD5AQjnAQAAAPkBCOwBAADcAvkBIgTlAQAAAPkBAuYBAAAA-QEI5wEAAAD5AQjsAQAA3QL5ASINCAAAywIAICcAANUCACAoAADVAgAgaQAA1QIAIGoAANUCACDlAQgAAAAB5gEIAAAABOcBCAAAAAToAQgAAAAB6QEIAAAAAeoBCAAAAAHrAQgAAAAB7AEIAN4CACEO3QEAAN8CADDeAQAAgQIAEN8BAADfAgAw4AEBAMcCACHkAUAAyQIAIfEBAQDHAgAh-QEAAOAChAIi_QFAAMkCACH-AQEAxwIAIf8BQADJAgAhgAJAAMkCACGBAkAAyQIAIYICCADXAgAhhAIBAMgCACEHCAAAywIAICcAAOICACAoAADiAgAg5QEAAACEAgLmAQAAAIQCCOcBAAAAhAII7AEAAOEChAIiBwgAAMsCACAnAADiAgAgKAAA4gIAIOUBAAAAhAIC5gEAAACEAgjnAQAAAIQCCOwBAADhAoQCIgTlAQAAAIQCAuYBAAAAhAII5wEAAACEAgjsAQAA4gKEAiIM3QEAAOMCADDeAQAA6wEAEN8BAADjAgAw4AEBAMcCACHkAUAAyQIAIfIBAQDHAgAhgAJAAMkCACGBAkAAyQIAIYYCAADkAoYCIocCQADJAgAhiAJAAMkCACGJAiAA5QIAIQcIAADLAgAgJwAA6QIAICgAAOkCACDlAQAAAIYCAuYBAAAAhgII5wEAAACGAgjsAQAA6AKGAiIFCAAAywIAICcAAOcCACAoAADnAgAg5QEgAAAAAewBIADmAgAhBQgAAMsCACAnAADnAgAgKAAA5wIAIOUBIAAAAAHsASAA5gIAIQLlASAAAAAB7AEgAOcCACEHCAAAywIAICcAAOkCACAoAADpAgAg5QEAAACGAgLmAQAAAIYCCOcBAAAAhgII7AEAAOgChgIiBOUBAAAAhgIC5gEAAACGAgjnAQAAAIYCCOwBAADpAoYCIgzdAQAA6gIAMN4BAADVAQAQ3wEAAOoCADDgAQEAxwIAIeQBQADJAgAh8gEBAMcCACGKAgEAxwIAIYsCCADXAgAhjAICANMCACGOAgAA6wKOAiKPAgEAyAIAIZACIADlAgAhBwgAAMsCACAnAADtAgAgKAAA7QIAIOUBAAAAjgIC5gEAAACOAgjnAQAAAI4CCOwBAADsAo4CIgcIAADLAgAgJwAA7QIAICgAAO0CACDlAQAAAI4CAuYBAAAAjgII5wEAAACOAgjsAQAA7AKOAiIE5QEAAACOAgLmAQAAAI4CCOcBAAAAjgII7AEAAO0CjgIiB90BAADuAgAw3gEAAL8BABDfAQAA7gIAMOABAQDHAgAh5AFAAMkCACGRAgEAxwIAIZICAQDHAgAhCAcAAPICACDdAQAA7wIAMN4BAACsAQAQ3wEAAO8CADDgAQEA8AIAIeQBQADxAgAhkQIBAPACACGSAgEA8AIAIQvlAQEAAAAB5gEBAAAABOcBAQAAAAToAQEAAAAB6QEBAAAAAeoBAQAAAAHrAQEAAAAB7AEBANECACHtAQEAAAAB7gEBAAAAAe8BAQAAAAEI5QFAAAAAAeYBQAAAAATnAUAAAAAE6AFAAAAAAekBQAAAAAHqAUAAAAAB6wFAAAAAAewBQADMAgAhA5MCAAANACCUAgAADQAglQIAAA0AIAzdAQAA8wIAMN4BAACmAQAQ3wEAAPMCADDgAQEAxwIAIeQBQADJAgAh-QEAAPQCmwIi_QFAAMkCACGWAgEAxwIAIZcCAQDIAgAhmAICANMCACGZAggA1wIAIZsCIADlAgAhBwgAAMsCACAnAAD2AgAgKAAA9gIAIOUBAAAAmwIC5gEAAACbAgjnAQAAAJsCCOwBAAD1ApsCIgcIAADLAgAgJwAA9gIAICgAAPYCACDlAQAAAJsCAuYBAAAAmwII5wEAAACbAgjsAQAA9QKbAiIE5QEAAACbAgLmAQAAAJsCCOcBAAAAmwII7AEAAPYCmwIiEAMAAP0CACAHAADyAgAgEAAA_gIAIBEAAP8CACDdAQAA9wIAMN4BAAALABDfAQAA9wIAMOABAQDwAgAh5AFAAPECACH5AQAA-wKbAiL9AUAA8QIAIZYCAQDwAgAhlwIBAPgCACGYAgIA-QIAIZkCCAD6AgAhmwIgAPwCACEL5QEBAAAAAeYBAQAAAAXnAQEAAAAF6AEBAAAAAekBAQAAAAHqAQEAAAAB6wEBAAAAAewBAQDPAgAh7QEBAAAAAe4BAQAAAAHvAQEAAAABCOUBAgAAAAHmAQIAAAAE5wECAAAABOgBAgAAAAHpAQIAAAAB6gECAAAAAesBAgAAAAHsAQIAywIAIQjlAQgAAAAB5gEIAAAABOcBCAAAAAToAQgAAAAB6QEIAAAAAeoBCAAAAAHrAQgAAAAB7AEIANUCACEE5QEAAACbAgLmAQAAAJsCCOcBAAAAmwII7AEAAPYCmwIiAuUBIAAAAAHsASAA5wIAIRUEAACOAwAgBQAAjwMAIAYAAJADACAPAACRAwAgEQAA_wIAIBMAAJIDACAUAACTAwAg3QEAAIsDADDeAQAANgAQ3wEAAIsDADDgAQEA8AIAIeQBQADxAgAh-QEAAI0DsAIi_QFAAPECACGRAgEA8AIAIasCAQDwAgAhrAIgAPwCACGuAgAAjAOuAiKwAgEA-AIAIbICAAA2ACCzAgAANgAgA5MCAAAcACCUAgAAHAAglQIAABwAIAOTAgAAFwAglAIAABcAIJUCAAAXACAJ3QEAAIADADDeAQAAjgEAEN8BAACAAwAw4AEBAMcCACHkAUAAyQIAIf0BQADJAgAhnAIBAMcCACGdAgEAxwIAIZ4CQADJAgAhCd0BAACBAwAw3gEAAHsAEN8BAACBAwAw4AEBAPACACHkAUAA8QIAIf0BQADxAgAhnAIBAPACACGdAgEA8AIAIZ4CQADxAgAhEN0BAACCAwAw3gEAAHUAEN8BAACCAwAw4AEBAMcCACHkAUAAyQIAIf0BQADJAgAhlgIBAMcCACGfAgEAxwIAIaACAQDHAgAhoQIBAMgCACGiAgEAyAIAIaMCAQDIAgAhpAJAANkCACGlAkAA2QIAIaYCAQDIAgAhpwIBAMgCACEL3QEAAIMDADDeAQAAXwAQ3wEAAIMDADDgAQEAxwIAIeQBQADJAgAh_QFAAMkCACGWAgEAxwIAIZ4CQADJAgAhqAIBAMcCACGpAgEAyAIAIaoCAQDIAgAhDN0BAACEAwAw3gEAAEkAEN8BAACEAwAw4AEBAMcCACHkAUAAyQIAIfkBAACGA7ACIv0BQADJAgAhkQIBAMcCACGrAgEAxwIAIawCIADlAgAhrgIAAIUDrgIisAIBAMgCACEHCAAAywIAICcAAIoDACAoAACKAwAg5QEAAACuAgLmAQAAAK4CCOcBAAAArgII7AEAAIkDrgIiBwgAAMsCACAnAACIAwAgKAAAiAMAIOUBAAAAsAIC5gEAAACwAgjnAQAAALACCOwBAACHA7ACIgcIAADLAgAgJwAAiAMAICgAAIgDACDlAQAAALACAuYBAAAAsAII5wEAAACwAgjsAQAAhwOwAiIE5QEAAACwAgLmAQAAALACCOcBAAAAsAII7AEAAIgDsAIiBwgAAMsCACAnAACKAwAgKAAAigMAIOUBAAAArgIC5gEAAACuAgjnAQAAAK4CCOwBAACJA64CIgTlAQAAAK4CAuYBAAAArgII5wEAAACuAgjsAQAAigOuAiITBAAAjgMAIAUAAI8DACAGAACQAwAgDwAAkQMAIBEAAP8CACATAACSAwAgFAAAkwMAIN0BAACLAwAw3gEAADYAEN8BAACLAwAw4AEBAPACACHkAUAA8QIAIfkBAACNA7ACIv0BQADxAgAhkQIBAPACACGrAgEA8AIAIawCIAD8AgAhrgIAAIwDrgIisAIBAPgCACEE5QEAAACuAgLmAQAAAK4CCOcBAAAArgII7AEAAIoDrgIiBOUBAAAAsAIC5gEAAACwAgjnAQAAALACCOwBAACIA7ACIgOTAgAAAwAglAIAAAMAIJUCAAADACADkwIAAAcAIJQCAAAHACCVAgAABwAgEgMAAP0CACAHAADyAgAgEAAA_gIAIBEAAP8CACDdAQAA9wIAMN4BAAALABDfAQAA9wIAMOABAQDwAgAh5AFAAPECACH5AQAA-wKbAiL9AUAA8QIAIZYCAQDwAgAhlwIBAPgCACGYAgIA-QIAIZkCCAD6AgAhmwIgAPwCACGyAgAACwAgswIAAAsAIAOTAgAAEwAglAIAABMAIJUCAAATACADkwIAACgAIJQCAAAoACCVAgAAKAAgA5MCAAAZACCUAgAAGQAglQIAABkAIBEKAAD9AgAgDAAAlwMAIN0BAACUAwAw3gEAABkAEN8BAACUAwAw4AEBAPACACHkAUAA8QIAIfABAQDwAgAh8QEBAPACACH1AQEA-AIAIfYBCAD6AgAh9wEBAPACACH5AQAAlQP5ASL6AQEA-AIAIfsBAQD4AgAh_AFAAJYDACH9AUAA8QIAIQTlAQAAAPkBAuYBAAAA-QEI5wEAAAD5AQjsAQAA3QL5ASII5QFAAAAAAeYBQAAAAAXnAUAAAAAF6AFAAAAAAekBQAAAAAHqAUAAAAAB6wFAAAAAAewBQADbAgAhFAoAAP0CACALAACfAwAgDQAAoAMAIA4AAKEDACDdAQAAnQMAMN4BAAATABDfAQAAnQMAMOABAQDwAgAh5AFAAPECACHxAQEA8AIAIfkBAACeA4QCIv0BQADxAgAh_gEBAPACACH_AUAA8QIAIYACQADxAgAhgQJAAPECACGCAggA-gIAIYQCAQD4AgAhsgIAABMAILMCAAATACAJEgAA_QIAIN0BAACYAwAw3gEAACgAEN8BAACYAwAw4AEBAPACACHhAQEA8AIAIeIBAQDwAgAh4wEBAPgCACHkAUAA8QIAIQ0GAACaAwAgCgAA_QIAIAwAAJcDACDdAQAAmQMAMN4BAAAXABDfAQAAmQMAMOABAQDwAgAh5AFAAPECACHwAQEA8AIAIfEBAQDwAgAh8gEBAPACACHzAQIA-QIAIfQBAQD4AgAhEgMAAP0CACAHAADyAgAgEAAA_gIAIBEAAP8CACDdAQAA9wIAMN4BAAALABDfAQAA9wIAMOABAQDwAgAh5AFAAPECACH5AQAA-wKbAiL9AUAA8QIAIZYCAQDwAgAhlwIBAPgCACGYAgIA-QIAIZkCCAD6AgAhmwIgAPwCACGyAgAACwAgswIAAAsAIA0GAACaAwAg3QEAAJsDADDeAQAAHAAQ3wEAAJsDADDgAQEA8AIAIeQBQADxAgAh8gEBAPACACGAAkAA8QIAIYECQADxAgAhhgIAAJwDhgIihwJAAPECACGIAkAA8QIAIYkCIAD8AgAhBOUBAAAAhgIC5gEAAACGAgjnAQAAAIYCCOwBAADpAoYCIhIKAAD9AgAgCwAAnwMAIA0AAKADACAOAAChAwAg3QEAAJ0DADDeAQAAEwAQ3wEAAJ0DADDgAQEA8AIAIeQBQADxAgAh8QEBAPACACH5AQAAngOEAiL9AUAA8QIAIf4BAQDwAgAh_wFAAPECACGAAkAA8QIAIYECQADxAgAhggIIAPoCACGEAgEA-AIAIQTlAQAAAIQCAuYBAAAAhAII5wEAAACEAgjsAQAA4gKEAiIRBgAAmgMAIAkAAKUDACAPAACRAwAg3QEAAKMDADDeAQAADQAQ3wEAAKMDADDgAQEA8AIAIeQBQADxAgAh8gEBAPACACGKAgEA8AIAIYsCCAD6AgAhjAICAPkCACGOAgAApAOOAiKPAgEA-AIAIZACIAD8AgAhsgIAAA0AILMCAAANACAPBgAAmgMAIAoAAP0CACAMAACXAwAg3QEAAJkDADDeAQAAFwAQ3wEAAJkDADDgAQEA8AIAIeQBQADxAgAh8AEBAPACACHxAQEA8AIAIfIBAQDwAgAh8wECAPkCACH0AQEA-AIAIbICAAAXACCzAgAAFwAgEwoAAP0CACAMAACXAwAg3QEAAJQDADDeAQAAGQAQ3wEAAJQDADDgAQEA8AIAIeQBQADxAgAh8AEBAPACACHxAQEA8AIAIfUBAQD4AgAh9gEIAPoCACH3AQEA8AIAIfkBAACVA_kBIvoBAQD4AgAh-wEBAPgCACH8AUAAlgMAIf0BQADxAgAhsgIAABkAILMCAAAZACAC8gEBAAAAAYoCAQAAAAEPBgAAmgMAIAkAAKUDACAPAACRAwAg3QEAAKMDADDeAQAADQAQ3wEAAKMDADDgAQEA8AIAIeQBQADxAgAh8gEBAPACACGKAgEA8AIAIYsCCAD6AgAhjAICAPkCACGOAgAApAOOAiKPAgEA-AIAIZACIAD8AgAhBOUBAAAAjgIC5gEAAACOAgjnAQAAAI4CCOwBAADtAo4CIgoHAADyAgAg3QEAAO8CADDeAQAArAEAEN8BAADvAgAw4AEBAPACACHkAUAA8QIAIZECAQDwAgAhkgIBAPACACGyAgAArAEAILMCAACsAQAgEQMAAP0CACDdAQAApgMAMN4BAAAHABDfAQAApgMAMOABAQDwAgAh5AFAAPECACH9AUAA8QIAIZYCAQDwAgAhnwIBAPACACGgAgEA8AIAIaECAQD4AgAhogIBAPgCACGjAgEA-AIAIaQCQACWAwAhpQJAAJYDACGmAgEA-AIAIacCAQD4AgAhDAMAAP0CACDdAQAApwMAMN4BAAADABDfAQAApwMAMOABAQDwAgAh5AFAAPECACH9AUAA8QIAIZYCAQDwAgAhngJAAPECACGoAgEA8AIAIakCAQD4AgAhqgIBAPgCACEAAAAAAboCAQAAAAEBugIBAAAAAQG6AkAAAAABBSEAAIIGACAiAACFBgAgtAIAAIMGACC1AgAAhAYAILgCAAABACADIQAAggYAILQCAACDBgAguAIAAAEAIAAAAAAABboCAgAAAAG9AgIAAAABvgICAAAAAb8CAgAAAAHAAgIAAAABBSEAAPcFACAiAACABgAgtAIAAPgFACC1AgAA_wUAILgCAAAVACAFIQAA9QUAICIAAP0FACC0AgAA9gUAILUCAAD8BQAguAIAAAEAIAUhAADzBQAgIgAA-gUAILQCAAD0BQAgtQIAAPkFACC4AgAAkQEAIAMhAAD3BQAgtAIAAPgFACC4AgAAFQAgAyEAAPUFACC0AgAA9gUAILgCAAABACADIQAA8wUAILQCAAD0BQAguAIAAJEBACAAAAAAAAW6AggAAAABvQIIAAAAAb4CCAAAAAG_AggAAAABwAIIAAAAAQG6AgAAAPkBAgG6AkAAAAABBSEAAOsFACAiAADxBQAgtAIAAOwFACC1AgAA8AUAILgCAAAVACAFIQAA6QUAICIAAO4FACC0AgAA6gUAILUCAADtBQAguAIAAAEAIAMhAADrBQAgtAIAAOwFACC4AgAAFQAgAyEAAOkFACC0AgAA6gUAILgCAAABACAAAAAAAAG6AgAAAIQCAgUhAADhBQAgIgAA5wUAILQCAADiBQAgtQIAAOYFACC4AgAAAQAgBSEAAN8FACAiAADkBQAgtAIAAOAFACC1AgAA4wUAILgCAAAPACAHIQAA2AMAICIAANsDACC0AgAA2QMAILUCAADaAwAgtgIAABcAILcCAAAXACC4AgAAIQAgByEAANMDACAiAADWAwAgtAIAANQDACC1AgAA1QMAILYCAAAZACC3AgAAGQAguAIAAC0AIAwKAADIAwAg4AEBAAAAAeQBQAAAAAHxAQEAAAAB9QEBAAAAAfYBCAAAAAH3AQEAAAAB-QEAAAD5AQL6AQEAAAAB-wEBAAAAAfwBQAAAAAH9AUAAAAABAgAAAC0AICEAANMDACADAAAAGQAgIQAA0wMAICIAANcDACAOAAAAGQAgCgAAxgMAIBoAANcDACDgAQEArAMAIeQBQACuAwAh8QEBAKwDACH1AQEArQMAIfYBCADCAwAh9wEBAKwDACH5AQAAwwP5ASL6AQEArQMAIfsBAQCtAwAh_AFAAMQDACH9AUAArgMAIQwKAADGAwAg4AEBAKwDACHkAUAArgMAIfEBAQCsAwAh9QEBAK0DACH2AQgAwgMAIfcBAQCsAwAh-QEAAMMD-QEi-gEBAK0DACH7AQEArQMAIfwBQADEAwAh_QFAAK4DACEIBgAAvAMAIAoAALsDACDgAQEAAAAB5AFAAAAAAfEBAQAAAAHyAQEAAAAB8wECAAAAAfQBAQAAAAECAAAAIQAgIQAA2AMAIAMAAAAXACAhAADYAwAgIgAA3AMAIAoAAAAXACAGAAC5AwAgCgAAuAMAIBoAANwDACDgAQEArAMAIeQBQACuAwAh8QEBAKwDACHyAQEArAMAIfMBAgC2AwAh9AEBAK0DACEIBgAAuQMAIAoAALgDACDgAQEArAMAIeQBQACuAwAh8QEBAKwDACHyAQEArAMAIfMBAgC2AwAh9AEBAK0DACEDIQAA4QUAILQCAADiBQAguAIAAAEAIAMhAADfBQAgtAIAAOAFACC4AgAADwAgAyEAANgDACC0AgAA2QMAILgCAAAhACADIQAA0wMAILQCAADUAwAguAIAAC0AIAAAAAG6AgAAAIYCAgG6AiAAAAABBSEAANoFACAiAADdBQAgtAIAANsFACC1AgAA3AUAILgCAACRAQAgAyEAANoFACC0AgAA2wUAILgCAACRAQAgAAAAAAABugIAAACOAgIFIQAA0QUAICIAANgFACC0AgAA0gUAILUCAADXBQAguAIAAJEBACAFIQAAzwUAICIAANUFACC0AgAA0AUAILUCAADUBQAguAIAAKkBACALIQAA8QMAMCIAAPYDADC0AgAA8gMAMLUCAADzAwAwtgIAAPUDADC3AgAA9QMAMLgCAAD1AwAwuQIAAPQDACC6AgAA9QMAMLsCAAD3AwAwvAIAAPgDADANCgAA3QMAIA0AAN8DACAOAADgAwAg4AEBAAAAAeQBQAAAAAHxAQEAAAAB-QEAAACEAgL9AUAAAAAB_wFAAAAAAYACQAAAAAGBAkAAAAABggIIAAAAAYQCAQAAAAECAAAAFQAgIQAA_AMAIAMAAAAVACAhAAD8AwAgIgAA-wMAIAEaAADTBQAwEgoAAP0CACALAACfAwAgDQAAoAMAIA4AAKEDACDdAQAAnQMAMN4BAAATABDfAQAAnQMAMOABAQAAAAHkAUAA8QIAIfEBAQDwAgAh-QEAAJ4DhAIi_QFAAPECACH-AQEA8AIAIf8BQADxAgAhgAJAAPECACGBAkAA8QIAIYICCAD6AgAhhAIBAPgCACECAAAAFQAgGgAA-wMAIAIAAAD5AwAgGgAA-gMAIA7dAQAA-AMAMN4BAAD5AwAQ3wEAAPgDADDgAQEA8AIAIeQBQADxAgAh8QEBAPACACH5AQAAngOEAiL9AUAA8QIAIf4BAQDwAgAh_wFAAPECACGAAkAA8QIAIYECQADxAgAhggIIAPoCACGEAgEA-AIAIQ7dAQAA-AMAMN4BAAD5AwAQ3wEAAPgDADDgAQEA8AIAIeQBQADxAgAh8QEBAPACACH5AQAAngOEAiL9AUAA8QIAIf4BAQDwAgAh_wFAAPECACGAAkAA8QIAIYECQADxAgAhggIIAPoCACGEAgEA-AIAIQrgAQEArAMAIeQBQACuAwAh8QEBAKwDACH5AQAAzgOEAiL9AUAArgMAIf8BQACuAwAhgAJAAK4DACGBAkAArgMAIYICCADCAwAhhAIBAK0DACENCgAAzwMAIA0AANEDACAOAADSAwAg4AEBAKwDACHkAUAArgMAIfEBAQCsAwAh-QEAAM4DhAIi_QFAAK4DACH_AUAArgMAIYACQACuAwAhgQJAAK4DACGCAggAwgMAIYQCAQCtAwAhDQoAAN0DACANAADfAwAgDgAA4AMAIOABAQAAAAHkAUAAAAAB8QEBAAAAAfkBAAAAhAIC_QFAAAAAAf8BQAAAAAGAAkAAAAABgQJAAAAAAYICCAAAAAGEAgEAAAABAyEAANEFACC0AgAA0gUAILgCAACRAQAgAyEAAM8FACC0AgAA0AUAILgCAACpAQAgBCEAAPEDADC0AgAA8gMAMLgCAAD1AwAwuQIAAPQDACAAAAALIQAAhAQAMCIAAIkEADC0AgAAhQQAMLUCAACGBAAwtgIAAIgEADC3AgAAiAQAMLgCAACIBAAwuQIAAIcEACC6AgAAiAQAMLsCAACKBAAwvAIAAIsEADAKBgAA_QMAIA8AAP8DACDgAQEAAAAB5AFAAAAAAfIBAQAAAAGLAggAAAABjAICAAAAAY4CAAAAjgICjwIBAAAAAZACIAAAAAECAAAADwAgIQAAjwQAIAMAAAAPACAhAACPBAAgIgAAjgQAIAEaAADOBQAwEAYAAJoDACAJAAClAwAgDwAAkQMAIN0BAACjAwAw3gEAAA0AEN8BAACjAwAw4AEBAAAAAeQBQADxAgAh8gEBAPACACGKAgEA8AIAIYsCCAD6AgAhjAICAPkCACGOAgAApAOOAiKPAgEA-AIAIZACIAD8AgAhsQIAAKIDACACAAAADwAgGgAAjgQAIAIAAACMBAAgGgAAjQQAIAzdAQAAiwQAMN4BAACMBAAQ3wEAAIsEADDgAQEA8AIAIeQBQADxAgAh8gEBAPACACGKAgEA8AIAIYsCCAD6AgAhjAICAPkCACGOAgAApAOOAiKPAgEA-AIAIZACIAD8AgAhDN0BAACLBAAw3gEAAIwEABDfAQAAiwQAMOABAQDwAgAh5AFAAPECACHyAQEA8AIAIYoCAQDwAgAhiwIIAPoCACGMAgIA-QIAIY4CAACkA44CIo8CAQD4AgAhkAIgAPwCACEI4AEBAKwDACHkAUAArgMAIfIBAQCsAwAhiwIIAMIDACGMAgIAtgMAIY4CAADtA44CIo8CAQCtAwAhkAIgAOUDACEKBgAA7gMAIA8AAPADACDgAQEArAMAIeQBQACuAwAh8gEBAKwDACGLAggAwgMAIYwCAgC2AwAhjgIAAO0DjgIijwIBAK0DACGQAiAA5QMAIQoGAAD9AwAgDwAA_wMAIOABAQAAAAHkAUAAAAAB8gEBAAAAAYsCCAAAAAGMAgIAAAABjgIAAACOAgKPAgEAAAABkAIgAAAAAQQhAACEBAAwtAIAAIUEADC4AgAAiAQAMLkCAACHBAAgAAAAAAAAAboCAAAAmwICBSEAAMYFACAiAADMBQAgtAIAAMcFACC1AgAAywUAILgCAAABACALIQAAtAQAMCIAALgEADC0AgAAtQQAMLUCAAC2BAAwtgIAAIgEADC3AgAAiAQAMLgCAACIBAAwuQIAALcEACC6AgAAiAQAMLsCAAC5BAAwvAIAAIsEADALIQAAqAQAMCIAAK0EADC0AgAAqQQAMLUCAACqBAAwtgIAAKwEADC3AgAArAQAMLgCAACsBAAwuQIAAKsEACC6AgAArAQAMLsCAACuBAAwvAIAAK8EADALIQAAnAQAMCIAAKEEADC0AgAAnQQAMLUCAACeBAAwtgIAAKAEADC3AgAAoAQAMLgCAACgBAAwuQIAAJ8EACC6AgAAoAQAMLsCAACiBAAwvAIAAKMEADAICgAAuwMAIAwAALoDACDgAQEAAAAB5AFAAAAAAfABAQAAAAHxAQEAAAAB8wECAAAAAfQBAQAAAAECAAAAIQAgIQAApwQAIAMAAAAhACAhAACnBAAgIgAApgQAIAEaAADKBQAwDQYAAJoDACAKAAD9AgAgDAAAlwMAIN0BAACZAwAw3gEAABcAEN8BAACZAwAw4AEBAAAAAeQBQADxAgAh8AEBAAAAAfEBAQDwAgAh8gEBAPACACHzAQIA-QIAIfQBAQD4AgAhAgAAACEAIBoAAKYEACACAAAApAQAIBoAAKUEACAK3QEAAKMEADDeAQAApAQAEN8BAACjBAAw4AEBAPACACHkAUAA8QIAIfABAQDwAgAh8QEBAPACACHyAQEA8AIAIfMBAgD5AgAh9AEBAPgCACEK3QEAAKMEADDeAQAApAQAEN8BAACjBAAw4AEBAPACACHkAUAA8QIAIfABAQDwAgAh8QEBAPACACHyAQEA8AIAIfMBAgD5AgAh9AEBAPgCACEG4AEBAKwDACHkAUAArgMAIfABAQCsAwAh8QEBAKwDACHzAQIAtgMAIfQBAQCtAwAhCAoAALgDACAMAAC3AwAg4AEBAKwDACHkAUAArgMAIfABAQCsAwAh8QEBAKwDACHzAQIAtgMAIfQBAQCtAwAhCAoAALsDACAMAAC6AwAg4AEBAAAAAeQBQAAAAAHwAQEAAAAB8QEBAAAAAfMBAgAAAAH0AQEAAAABCOABAQAAAAHkAUAAAAABgAJAAAAAAYECQAAAAAGGAgAAAIYCAocCQAAAAAGIAkAAAAABiQIgAAAAAQIAAAAeACAhAACzBAAgAwAAAB4AICEAALMEACAiAACyBAAgARoAAMkFADANBgAAmgMAIN0BAACbAwAw3gEAABwAEN8BAACbAwAw4AEBAAAAAeQBQADxAgAh8gEBAPACACGAAkAA8QIAIYECQADxAgAhhgIAAJwDhgIihwJAAPECACGIAkAA8QIAIYkCIAD8AgAhAgAAAB4AIBoAALIEACACAAAAsAQAIBoAALEEACAM3QEAAK8EADDeAQAAsAQAEN8BAACvBAAw4AEBAPACACHkAUAA8QIAIfIBAQDwAgAhgAJAAPECACGBAkAA8QIAIYYCAACcA4YCIocCQADxAgAhiAJAAPECACGJAiAA_AIAIQzdAQAArwQAMN4BAACwBAAQ3wEAAK8EADDgAQEA8AIAIeQBQADxAgAh8gEBAPACACGAAkAA8QIAIYECQADxAgAhhgIAAJwDhgIihwJAAPECACGIAkAA8QIAIYkCIAD8AgAhCOABAQCsAwAh5AFAAK4DACGAAkAArgMAIYECQACuAwAhhgIAAOQDhgIihwJAAK4DACGIAkAArgMAIYkCIADlAwAhCOABAQCsAwAh5AFAAK4DACGAAkAArgMAIYECQACuAwAhhgIAAOQDhgIihwJAAK4DACGIAkAArgMAIYkCIADlAwAhCOABAQAAAAHkAUAAAAABgAJAAAAAAYECQAAAAAGGAgAAAIYCAocCQAAAAAGIAkAAAAABiQIgAAAAAQoJAAD-AwAgDwAA_wMAIOABAQAAAAHkAUAAAAABigIBAAAAAYsCCAAAAAGMAgIAAAABjgIAAACOAgKPAgEAAAABkAIgAAAAAQIAAAAPACAhAAC8BAAgAwAAAA8AICEAALwEACAiAAC7BAAgARoAAMgFADACAAAADwAgGgAAuwQAIAIAAACMBAAgGgAAugQAIAjgAQEArAMAIeQBQACuAwAhigIBAKwDACGLAggAwgMAIYwCAgC2AwAhjgIAAO0DjgIijwIBAK0DACGQAiAA5QMAIQoJAADvAwAgDwAA8AMAIOABAQCsAwAh5AFAAK4DACGKAgEArAMAIYsCCADCAwAhjAICALYDACGOAgAA7QOOAiKPAgEArQMAIZACIADlAwAhCgkAAP4DACAPAAD_AwAg4AEBAAAAAeQBQAAAAAGKAgEAAAABiwIIAAAAAYwCAgAAAAGOAgAAAI4CAo8CAQAAAAGQAiAAAAABAyEAAMYFACC0AgAAxwUAILgCAAABACAEIQAAtAQAMLQCAAC1BAAwuAIAAIgEADC5AgAAtwQAIAQhAACoBAAwtAIAAKkEADC4AgAArAQAMLkCAACrBAAgBCEAAJwEADC0AgAAnQQAMLgCAACgBAAwuQIAAJ8EACAIBAAAqwUAIAUAAKwFACAGAACtBQAgDwAArgUAIBEAAMMEACATAACvBQAgFAAAsAUAILACAACoAwAgAAAAAAAAAAAFIQAAwQUAICIAAMQFACC0AgAAwgUAILUCAADDBQAguAIAAAEAIAMhAADBBQAgtAIAAMIFACC4AgAAAQAgAAAABSEAALwFACAiAAC_BQAgtAIAAL0FACC1AgAAvgUAILgCAAABACADIQAAvAUAILQCAAC9BQAguAIAAAEAIAAAAAG6AgAAAK4CAgG6AgAAALACAgshAACYBQAwIgAAnQUAMLQCAACZBQAwtQIAAJoFADC2AgAAnAUAMLcCAACcBQAwuAIAAJwFADC5AgAAmwUAILoCAACcBQAwuwIAAJ4FADC8AgAAnwUAMAshAACMBQAwIgAAkQUAMLQCAACNBQAwtQIAAI4FADC2AgAAkAUAMLcCAACQBQAwuAIAAJAFADC5AgAAjwUAILoCAACQBQAwuwIAAJIFADC8AgAAkwUAMAchAACHBQAgIgAAigUAILQCAACIBQAgtQIAAIkFACC2AgAACwAgtwIAAAsAILgCAACRAQAgCyEAAP4EADAiAACCBQAwtAIAAP8EADC1AgAAgAUAMLYCAAD1AwAwtwIAAPUDADC4AgAA9QMAMLkCAACBBQAgugIAAPUDADC7AgAAgwUAMLwCAAD4AwAwCyEAAPUEADAiAAD5BAAwtAIAAPYEADC1AgAA9wQAMLYCAACgBAAwtwIAAKAEADC4AgAAoAQAMLkCAAD4BAAgugIAAKAEADC7AgAA-gQAMLwCAACjBAAwCyEAAOkEADAiAADuBAAwtAIAAOoEADC1AgAA6wQAMLYCAADtBAAwtwIAAO0EADC4AgAA7QQAMLkCAADsBAAgugIAAO0EADC7AgAA7wQAMLwCAADwBAAwCyEAAN0EADAiAADiBAAwtAIAAN4EADC1AgAA3wQAMLYCAADhBAAwtwIAAOEEADC4AgAA4QQAMLkCAADgBAAgugIAAOEEADC7AgAA4wQAMLwCAADkBAAwDAwAAMcDACDgAQEAAAAB5AFAAAAAAfABAQAAAAH1AQEAAAAB9gEIAAAAAfcBAQAAAAH5AQAAAPkBAvoBAQAAAAH7AQEAAAAB_AFAAAAAAf0BQAAAAAECAAAALQAgIQAA6AQAIAMAAAAtACAhAADoBAAgIgAA5wQAIAEaAAC7BQAwEQoAAP0CACAMAACXAwAg3QEAAJQDADDeAQAAGQAQ3wEAAJQDADDgAQEAAAAB5AFAAPECACHwAQEAAAAB8QEBAPACACH1AQEAAAAB9gEIAPoCACH3AQEA8AIAIfkBAACVA_kBIvoBAQAAAAH7AQEAAAAB_AFAAJYDACH9AUAA8QIAIQIAAAAtACAaAADnBAAgAgAAAOUEACAaAADmBAAgD90BAADkBAAw3gEAAOUEABDfAQAA5AQAMOABAQDwAgAh5AFAAPECACHwAQEA8AIAIfEBAQDwAgAh9QEBAPgCACH2AQgA-gIAIfcBAQDwAgAh-QEAAJUD-QEi-gEBAPgCACH7AQEA-AIAIfwBQACWAwAh_QFAAPECACEP3QEAAOQEADDeAQAA5QQAEN8BAADkBAAw4AEBAPACACHkAUAA8QIAIfABAQDwAgAh8QEBAPACACH1AQEA-AIAIfYBCAD6AgAh9wEBAPACACH5AQAAlQP5ASL6AQEA-AIAIfsBAQD4AgAh_AFAAJYDACH9AUAA8QIAIQvgAQEArAMAIeQBQACuAwAh8AEBAKwDACH1AQEArQMAIfYBCADCAwAh9wEBAKwDACH5AQAAwwP5ASL6AQEArQMAIfsBAQCtAwAh_AFAAMQDACH9AUAArgMAIQwMAADFAwAg4AEBAKwDACHkAUAArgMAIfABAQCsAwAh9QEBAK0DACH2AQgAwgMAIfcBAQCsAwAh-QEAAMMD-QEi-gEBAK0DACH7AQEArQMAIfwBQADEAwAh_QFAAK4DACEMDAAAxwMAIOABAQAAAAHkAUAAAAAB8AEBAAAAAfUBAQAAAAH2AQgAAAAB9wEBAAAAAfkBAAAA-QEC-gEBAAAAAfsBAQAAAAH8AUAAAAAB_QFAAAAAAQTgAQEAAAAB4gEBAAAAAeMBAQAAAAHkAUAAAAABAgAAACoAICEAAPQEACADAAAAKgAgIQAA9AQAICIAAPMEACABGgAAugUAMAkSAAD9AgAg3QEAAJgDADDeAQAAKAAQ3wEAAJgDADDgAQEAAAAB4QEBAPACACHiAQEA8AIAIeMBAQD4AgAh5AFAAPECACECAAAAKgAgGgAA8wQAIAIAAADxBAAgGgAA8gQAIAjdAQAA8AQAMN4BAADxBAAQ3wEAAPAEADDgAQEA8AIAIeEBAQDwAgAh4gEBAPACACHjAQEA-AIAIeQBQADxAgAhCN0BAADwBAAw3gEAAPEEABDfAQAA8AQAMOABAQDwAgAh4QEBAPACACHiAQEA8AIAIeMBAQD4AgAh5AFAAPECACEE4AEBAKwDACHiAQEArAMAIeMBAQCtAwAh5AFAAK4DACEE4AEBAKwDACHiAQEArAMAIeMBAQCtAwAh5AFAAK4DACEE4AEBAAAAAeIBAQAAAAHjAQEAAAAB5AFAAAAAAQgGAAC8AwAgDAAAugMAIOABAQAAAAHkAUAAAAAB8AEBAAAAAfIBAQAAAAHzAQIAAAAB9AEBAAAAAQIAAAAhACAhAAD9BAAgAwAAACEAICEAAP0EACAiAAD8BAAgARoAALkFADACAAAAIQAgGgAA_AQAIAIAAACkBAAgGgAA-wQAIAbgAQEArAMAIeQBQACuAwAh8AEBAKwDACHyAQEArAMAIfMBAgC2AwAh9AEBAK0DACEIBgAAuQMAIAwAALcDACDgAQEArAMAIeQBQACuAwAh8AEBAKwDACHyAQEArAMAIfMBAgC2AwAh9AEBAK0DACEIBgAAvAMAIAwAALoDACDgAQEAAAAB5AFAAAAAAfABAQAAAAHyAQEAAAAB8wECAAAAAfQBAQAAAAENCwAA3gMAIA0AAN8DACAOAADgAwAg4AEBAAAAAeQBQAAAAAH5AQAAAIQCAv0BQAAAAAH-AQEAAAAB_wFAAAAAAYACQAAAAAGBAkAAAAABggIIAAAAAYQCAQAAAAECAAAAFQAgIQAAhgUAIAMAAAAVACAhAACGBQAgIgAAhQUAIAEaAAC4BQAwAgAAABUAIBoAAIUFACACAAAA-QMAIBoAAIQFACAK4AEBAKwDACHkAUAArgMAIfkBAADOA4QCIv0BQACuAwAh_gEBAKwDACH_AUAArgMAIYACQACuAwAhgQJAAK4DACGCAggAwgMAIYQCAQCtAwAhDQsAANADACANAADRAwAgDgAA0gMAIOABAQCsAwAh5AFAAK4DACH5AQAAzgOEAiL9AUAArgMAIf4BAQCsAwAh_wFAAK4DACGAAkAArgMAIYECQACuAwAhggIIAMIDACGEAgEArQMAIQ0LAADeAwAgDQAA3wMAIA4AAOADACDgAQEAAAAB5AFAAAAAAfkBAAAAhAIC_QFAAAAAAf4BAQAAAAH_AUAAAAABgAJAAAAAAYECQAAAAAGCAggAAAABhAIBAAAAAQsHAAC-BAAgEAAAvwQAIBEAAMAEACDgAQEAAAAB5AFAAAAAAfkBAAAAmwIC_QFAAAAAAZcCAQAAAAGYAgIAAAABmQIIAAAAAZsCIAAAAAECAAAAkQEAICEAAIcFACADAAAACwAgIQAAhwUAICIAAIsFACANAAAACwAgBwAAmQQAIBAAAJoEACARAACbBAAgGgAAiwUAIOABAQCsAwAh5AFAAK4DACH5AQAAlwSbAiL9AUAArgMAIZcCAQCtAwAhmAICALYDACGZAggAwgMAIZsCIADlAwAhCwcAAJkEACAQAACaBAAgEQAAmwQAIOABAQCsAwAh5AFAAK4DACH5AQAAlwSbAiL9AUAArgMAIZcCAQCtAwAhmAICALYDACGZAggAwgMAIZsCIADlAwAhDOABAQAAAAHkAUAAAAAB_QFAAAAAAZ8CAQAAAAGgAgEAAAABoQIBAAAAAaICAQAAAAGjAgEAAAABpAJAAAAAAaUCQAAAAAGmAgEAAAABpwIBAAAAAQIAAAAJACAhAACXBQAgAwAAAAkAICEAAJcFACAiAACWBQAgARoAALcFADARAwAA_QIAIN0BAACmAwAw3gEAAAcAEN8BAACmAwAw4AEBAAAAAeQBQADxAgAh_QFAAPECACGWAgEA8AIAIZ8CAQDwAgAhoAIBAPACACGhAgEA-AIAIaICAQD4AgAhowIBAPgCACGkAkAAlgMAIaUCQACWAwAhpgIBAPgCACGnAgEA-AIAIQIAAAAJACAaAACWBQAgAgAAAJQFACAaAACVBQAgEN0BAACTBQAw3gEAAJQFABDfAQAAkwUAMOABAQDwAgAh5AFAAPECACH9AUAA8QIAIZYCAQDwAgAhnwIBAPACACGgAgEA8AIAIaECAQD4AgAhogIBAPgCACGjAgEA-AIAIaQCQACWAwAhpQJAAJYDACGmAgEA-AIAIacCAQD4AgAhEN0BAACTBQAw3gEAAJQFABDfAQAAkwUAMOABAQDwAgAh5AFAAPECACH9AUAA8QIAIZYCAQDwAgAhnwIBAPACACGgAgEA8AIAIaECAQD4AgAhogIBAPgCACGjAgEA-AIAIaQCQACWAwAhpQJAAJYDACGmAgEA-AIAIacCAQD4AgAhDOABAQCsAwAh5AFAAK4DACH9AUAArgMAIZ8CAQCsAwAhoAIBAKwDACGhAgEArQMAIaICAQCtAwAhowIBAK0DACGkAkAAxAMAIaUCQADEAwAhpgIBAK0DACGnAgEArQMAIQzgAQEArAMAIeQBQACuAwAh_QFAAK4DACGfAgEArAMAIaACAQCsAwAhoQIBAK0DACGiAgEArQMAIaMCAQCtAwAhpAJAAMQDACGlAkAAxAMAIaYCAQCtAwAhpwIBAK0DACEM4AEBAAAAAeQBQAAAAAH9AUAAAAABnwIBAAAAAaACAQAAAAGhAgEAAAABogIBAAAAAaMCAQAAAAGkAkAAAAABpQJAAAAAAaYCAQAAAAGnAgEAAAABB-ABAQAAAAHkAUAAAAAB_QFAAAAAAZ4CQAAAAAGoAgEAAAABqQIBAAAAAaoCAQAAAAECAAAABQAgIQAAowUAIAMAAAAFACAhAACjBQAgIgAAogUAIAEaAAC2BQAwDAMAAP0CACDdAQAApwMAMN4BAAADABDfAQAApwMAMOABAQAAAAHkAUAA8QIAIf0BQADxAgAhlgIBAPACACGeAkAA8QIAIagCAQAAAAGpAgEA-AIAIaoCAQD4AgAhAgAAAAUAIBoAAKIFACACAAAAoAUAIBoAAKEFACAL3QEAAJ8FADDeAQAAoAUAEN8BAACfBQAw4AEBAPACACHkAUAA8QIAIf0BQADxAgAhlgIBAPACACGeAkAA8QIAIagCAQDwAgAhqQIBAPgCACGqAgEA-AIAIQvdAQAAnwUAMN4BAACgBQAQ3wEAAJ8FADDgAQEA8AIAIeQBQADxAgAh_QFAAPECACGWAgEA8AIAIZ4CQADxAgAhqAIBAPACACGpAgEA-AIAIaoCAQD4AgAhB-ABAQCsAwAh5AFAAK4DACH9AUAArgMAIZ4CQACuAwAhqAIBAKwDACGpAgEArQMAIaoCAQCtAwAhB-ABAQCsAwAh5AFAAK4DACH9AUAArgMAIZ4CQACuAwAhqAIBAKwDACGpAgEArQMAIaoCAQCtAwAhB-ABAQAAAAHkAUAAAAAB_QFAAAAAAZ4CQAAAAAGoAgEAAAABqQIBAAAAAaoCAQAAAAEEIQAAmAUAMLQCAACZBQAwuAIAAJwFADC5AgAAmwUAIAQhAACMBQAwtAIAAI0FADC4AgAAkAUAMLkCAACPBQAgAyEAAIcFACC0AgAAiAUAILgCAACRAQAgBCEAAP4EADC0AgAA_wQAMLgCAAD1AwAwuQIAAIEFACAEIQAA9QQAMLQCAAD2BAAwuAIAAKAEADC5AgAA-AQAIAQhAADpBAAwtAIAAOoEADC4AgAA7QQAMLkCAADsBAAgBCEAAN0EADC0AgAA3gQAMLgCAADhBAAwuQIAAOAEACAAAAUDAADBBAAgBwAAkQQAIBAAAMIEACARAADDBAAglwIAAKgDACAAAAAFCgAAwQQAIAsAALIFACANAACzBQAgDgAAtAUAIIQCAACoAwAgBAYAAK0FACAJAAC1BQAgDwAArgUAII8CAACoAwAgBAYAAK0FACAKAADBBAAgDAAAsQUAIPQBAACoAwAgBgoAAMEEACAMAACxBQAg9QEAAKgDACD6AQAAqAMAIPsBAACoAwAg_AEAAKgDACABBwAAkQQAIAfgAQEAAAAB5AFAAAAAAf0BQAAAAAGeAkAAAAABqAIBAAAAAakCAQAAAAGqAgEAAAABDOABAQAAAAHkAUAAAAAB_QFAAAAAAZ8CAQAAAAGgAgEAAAABoQIBAAAAAaICAQAAAAGjAgEAAAABpAJAAAAAAaUCQAAAAAGmAgEAAAABpwIBAAAAAQrgAQEAAAAB5AFAAAAAAfkBAAAAhAIC_QFAAAAAAf4BAQAAAAH_AUAAAAABgAJAAAAAAYECQAAAAAGCAggAAAABhAIBAAAAAQbgAQEAAAAB5AFAAAAAAfABAQAAAAHyAQEAAAAB8wECAAAAAfQBAQAAAAEE4AEBAAAAAeIBAQAAAAHjAQEAAAAB5AFAAAAAAQvgAQEAAAAB5AFAAAAAAfABAQAAAAH1AQEAAAAB9gEIAAAAAfcBAQAAAAH5AQAAAPkBAvoBAQAAAAH7AQEAAAAB_AFAAAAAAf0BQAAAAAEPBQAApQUAIAYAAKYFACAPAACnBQAgEQAAqAUAIBMAAKkFACAUAACqBQAg4AEBAAAAAeQBQAAAAAH5AQAAALACAv0BQAAAAAGRAgEAAAABqwIBAAAAAawCIAAAAAGuAgAAAK4CArACAQAAAAECAAAAAQAgIQAAvAUAIAMAAAA2ACAhAAC8BQAgIgAAwAUAIBEAAAA2ACAFAADXBAAgBgAA2AQAIA8AANkEACARAADaBAAgEwAA2wQAIBQAANwEACAaAADABQAg4AEBAKwDACHkAUAArgMAIfkBAADVBLACIv0BQACuAwAhkQIBAKwDACGrAgEArAMAIawCIADlAwAhrgIAANQErgIisAIBAK0DACEPBQAA1wQAIAYAANgEACAPAADZBAAgEQAA2gQAIBMAANsEACAUAADcBAAg4AEBAKwDACHkAUAArgMAIfkBAADVBLACIv0BQACuAwAhkQIBAKwDACGrAgEArAMAIawCIADlAwAhrgIAANQErgIisAIBAK0DACEPBAAApAUAIAYAAKYFACAPAACnBQAgEQAAqAUAIBMAAKkFACAUAACqBQAg4AEBAAAAAeQBQAAAAAH5AQAAALACAv0BQAAAAAGRAgEAAAABqwIBAAAAAawCIAAAAAGuAgAAAK4CArACAQAAAAECAAAAAQAgIQAAwQUAIAMAAAA2ACAhAADBBQAgIgAAxQUAIBEAAAA2ACAEAADWBAAgBgAA2AQAIA8AANkEACARAADaBAAgEwAA2wQAIBQAANwEACAaAADFBQAg4AEBAKwDACHkAUAArgMAIfkBAADVBLACIv0BQACuAwAhkQIBAKwDACGrAgEArAMAIawCIADlAwAhrgIAANQErgIisAIBAK0DACEPBAAA1gQAIAYAANgEACAPAADZBAAgEQAA2gQAIBMAANsEACAUAADcBAAg4AEBAKwDACHkAUAArgMAIfkBAADVBLACIv0BQACuAwAhkQIBAKwDACGrAgEArAMAIawCIADlAwAhrgIAANQErgIisAIBAK0DACEPBAAApAUAIAUAAKUFACAPAACnBQAgEQAAqAUAIBMAAKkFACAUAACqBQAg4AEBAAAAAeQBQAAAAAH5AQAAALACAv0BQAAAAAGRAgEAAAABqwIBAAAAAawCIAAAAAGuAgAAAK4CArACAQAAAAECAAAAAQAgIQAAxgUAIAjgAQEAAAAB5AFAAAAAAYoCAQAAAAGLAggAAAABjAICAAAAAY4CAAAAjgICjwIBAAAAAZACIAAAAAEI4AEBAAAAAeQBQAAAAAGAAkAAAAABgQJAAAAAAYYCAAAAhgIChwJAAAAAAYgCQAAAAAGJAiAAAAABBuABAQAAAAHkAUAAAAAB8AEBAAAAAfEBAQAAAAHzAQIAAAAB9AEBAAAAAQMAAAA2ACAhAADGBQAgIgAAzQUAIBEAAAA2ACAEAADWBAAgBQAA1wQAIA8AANkEACARAADaBAAgEwAA2wQAIBQAANwEACAaAADNBQAg4AEBAKwDACHkAUAArgMAIfkBAADVBLACIv0BQACuAwAhkQIBAKwDACGrAgEArAMAIawCIADlAwAhrgIAANQErgIisAIBAK0DACEPBAAA1gQAIAUAANcEACAPAADZBAAgEQAA2gQAIBMAANsEACAUAADcBAAg4AEBAKwDACHkAUAArgMAIfkBAADVBLACIv0BQACuAwAhkQIBAKwDACGrAgEArAMAIawCIADlAwAhrgIAANQErgIisAIBAK0DACEI4AEBAAAAAeQBQAAAAAHyAQEAAAABiwIIAAAAAYwCAgAAAAGOAgAAAI4CAo8CAQAAAAGQAiAAAAABBOABAQAAAAHkAUAAAAABkQIBAAAAAZICAQAAAAECAAAAqQEAICEAAM8FACAMAwAAvQQAIBAAAL8EACARAADABAAg4AEBAAAAAeQBQAAAAAH5AQAAAJsCAv0BQAAAAAGWAgEAAAABlwIBAAAAAZgCAgAAAAGZAggAAAABmwIgAAAAAQIAAACRAQAgIQAA0QUAIArgAQEAAAAB5AFAAAAAAfEBAQAAAAH5AQAAAIQCAv0BQAAAAAH_AUAAAAABgAJAAAAAAYECQAAAAAGCAggAAAABhAIBAAAAAQMAAACsAQAgIQAAzwUAICIAANYFACAGAAAArAEAIBoAANYFACDgAQEArAMAIeQBQACuAwAhkQIBAKwDACGSAgEArAMAIQTgAQEArAMAIeQBQACuAwAhkQIBAKwDACGSAgEArAMAIQMAAAALACAhAADRBQAgIgAA2QUAIA4AAAALACADAACYBAAgEAAAmgQAIBEAAJsEACAaAADZBQAg4AEBAKwDACHkAUAArgMAIfkBAACXBJsCIv0BQACuAwAhlgIBAKwDACGXAgEArQMAIZgCAgC2AwAhmQIIAMIDACGbAiAA5QMAIQwDAACYBAAgEAAAmgQAIBEAAJsEACDgAQEArAMAIeQBQACuAwAh-QEAAJcEmwIi_QFAAK4DACGWAgEArAMAIZcCAQCtAwAhmAICALYDACGZAggAwgMAIZsCIADlAwAhDAMAAL0EACAHAAC-BAAgEQAAwAQAIOABAQAAAAHkAUAAAAAB-QEAAACbAgL9AUAAAAABlgIBAAAAAZcCAQAAAAGYAgIAAAABmQIIAAAAAZsCIAAAAAECAAAAkQEAICEAANoFACADAAAACwAgIQAA2gUAICIAAN4FACAOAAAACwAgAwAAmAQAIAcAAJkEACARAACbBAAgGgAA3gUAIOABAQCsAwAh5AFAAK4DACH5AQAAlwSbAiL9AUAArgMAIZYCAQCsAwAhlwIBAK0DACGYAgIAtgMAIZkCCADCAwAhmwIgAOUDACEMAwAAmAQAIAcAAJkEACARAACbBAAg4AEBAKwDACHkAUAArgMAIfkBAACXBJsCIv0BQACuAwAhlgIBAKwDACGXAgEArQMAIZgCAgC2AwAhmQIIAMIDACGbAiAA5QMAIQsGAAD9AwAgCQAA_gMAIOABAQAAAAHkAUAAAAAB8gEBAAAAAYoCAQAAAAGLAggAAAABjAICAAAAAY4CAAAAjgICjwIBAAAAAZACIAAAAAECAAAADwAgIQAA3wUAIA8EAACkBQAgBQAApQUAIAYAAKYFACARAACoBQAgEwAAqQUAIBQAAKoFACDgAQEAAAAB5AFAAAAAAfkBAAAAsAIC_QFAAAAAAZECAQAAAAGrAgEAAAABrAIgAAAAAa4CAAAArgICsAIBAAAAAQIAAAABACAhAADhBQAgAwAAAA0AICEAAN8FACAiAADlBQAgDQAAAA0AIAYAAO4DACAJAADvAwAgGgAA5QUAIOABAQCsAwAh5AFAAK4DACHyAQEArAMAIYoCAQCsAwAhiwIIAMIDACGMAgIAtgMAIY4CAADtA44CIo8CAQCtAwAhkAIgAOUDACELBgAA7gMAIAkAAO8DACDgAQEArAMAIeQBQACuAwAh8gEBAKwDACGKAgEArAMAIYsCCADCAwAhjAICALYDACGOAgAA7QOOAiKPAgEArQMAIZACIADlAwAhAwAAADYAICEAAOEFACAiAADoBQAgEQAAADYAIAQAANYEACAFAADXBAAgBgAA2AQAIBEAANoEACATAADbBAAgFAAA3AQAIBoAAOgFACDgAQEArAMAIeQBQACuAwAh-QEAANUEsAIi_QFAAK4DACGRAgEArAMAIasCAQCsAwAhrAIgAOUDACGuAgAA1ASuAiKwAgEArQMAIQ8EAADWBAAgBQAA1wQAIAYAANgEACARAADaBAAgEwAA2wQAIBQAANwEACDgAQEArAMAIeQBQACuAwAh-QEAANUEsAIi_QFAAK4DACGRAgEArAMAIasCAQCsAwAhrAIgAOUDACGuAgAA1ASuAiKwAgEArQMAIQ8EAACkBQAgBQAApQUAIAYAAKYFACAPAACnBQAgEQAAqAUAIBMAAKkFACDgAQEAAAAB5AFAAAAAAfkBAAAAsAIC_QFAAAAAAZECAQAAAAGrAgEAAAABrAIgAAAAAa4CAAAArgICsAIBAAAAAQIAAAABACAhAADpBQAgDgoAAN0DACALAADeAwAgDQAA3wMAIOABAQAAAAHkAUAAAAAB8QEBAAAAAfkBAAAAhAIC_QFAAAAAAf4BAQAAAAH_AUAAAAABgAJAAAAAAYECQAAAAAGCAggAAAABhAIBAAAAAQIAAAAVACAhAADrBQAgAwAAADYAICEAAOkFACAiAADvBQAgEQAAADYAIAQAANYEACAFAADXBAAgBgAA2AQAIA8AANkEACARAADaBAAgEwAA2wQAIBoAAO8FACDgAQEArAMAIeQBQACuAwAh-QEAANUEsAIi_QFAAK4DACGRAgEArAMAIasCAQCsAwAhrAIgAOUDACGuAgAA1ASuAiKwAgEArQMAIQ8EAADWBAAgBQAA1wQAIAYAANgEACAPAADZBAAgEQAA2gQAIBMAANsEACDgAQEArAMAIeQBQACuAwAh-QEAANUEsAIi_QFAAK4DACGRAgEArAMAIasCAQCsAwAhrAIgAOUDACGuAgAA1ASuAiKwAgEArQMAIQMAAAATACAhAADrBQAgIgAA8gUAIBAAAAATACAKAADPAwAgCwAA0AMAIA0AANEDACAaAADyBQAg4AEBAKwDACHkAUAArgMAIfEBAQCsAwAh-QEAAM4DhAIi_QFAAK4DACH-AQEArAMAIf8BQACuAwAhgAJAAK4DACGBAkAArgMAIYICCADCAwAhhAIBAK0DACEOCgAAzwMAIAsAANADACANAADRAwAg4AEBAKwDACHkAUAArgMAIfEBAQCsAwAh-QEAAM4DhAIi_QFAAK4DACH-AQEArAMAIf8BQACuAwAhgAJAAK4DACGBAkAArgMAIYICCADCAwAhhAIBAK0DACEMAwAAvQQAIAcAAL4EACAQAAC_BAAg4AEBAAAAAeQBQAAAAAH5AQAAAJsCAv0BQAAAAAGWAgEAAAABlwIBAAAAAZgCAgAAAAGZAggAAAABmwIgAAAAAQIAAACRAQAgIQAA8wUAIA8EAACkBQAgBQAApQUAIAYAAKYFACAPAACnBQAgEwAAqQUAIBQAAKoFACDgAQEAAAAB5AFAAAAAAfkBAAAAsAIC_QFAAAAAAZECAQAAAAGrAgEAAAABrAIgAAAAAa4CAAAArgICsAIBAAAAAQIAAAABACAhAAD1BQAgDgoAAN0DACALAADeAwAgDgAA4AMAIOABAQAAAAHkAUAAAAAB8QEBAAAAAfkBAAAAhAIC_QFAAAAAAf4BAQAAAAH_AUAAAAABgAJAAAAAAYECQAAAAAGCAggAAAABhAIBAAAAAQIAAAAVACAhAAD3BQAgAwAAAAsAICEAAPMFACAiAAD7BQAgDgAAAAsAIAMAAJgEACAHAACZBAAgEAAAmgQAIBoAAPsFACDgAQEArAMAIeQBQACuAwAh-QEAAJcEmwIi_QFAAK4DACGWAgEArAMAIZcCAQCtAwAhmAICALYDACGZAggAwgMAIZsCIADlAwAhDAMAAJgEACAHAACZBAAgEAAAmgQAIOABAQCsAwAh5AFAAK4DACH5AQAAlwSbAiL9AUAArgMAIZYCAQCsAwAhlwIBAK0DACGYAgIAtgMAIZkCCADCAwAhmwIgAOUDACEDAAAANgAgIQAA9QUAICIAAP4FACARAAAANgAgBAAA1gQAIAUAANcEACAGAADYBAAgDwAA2QQAIBMAANsEACAUAADcBAAgGgAA_gUAIOABAQCsAwAh5AFAAK4DACH5AQAA1QSwAiL9AUAArgMAIZECAQCsAwAhqwIBAKwDACGsAiAA5QMAIa4CAADUBK4CIrACAQCtAwAhDwQAANYEACAFAADXBAAgBgAA2AQAIA8AANkEACATAADbBAAgFAAA3AQAIOABAQCsAwAh5AFAAK4DACH5AQAA1QSwAiL9AUAArgMAIZECAQCsAwAhqwIBAKwDACGsAiAA5QMAIa4CAADUBK4CIrACAQCtAwAhAwAAABMAICEAAPcFACAiAACBBgAgEAAAABMAIAoAAM8DACALAADQAwAgDgAA0gMAIBoAAIEGACDgAQEArAMAIeQBQACuAwAh8QEBAKwDACH5AQAAzgOEAiL9AUAArgMAIf4BAQCsAwAh_wFAAK4DACGAAkAArgMAIYECQACuAwAhggIIAMIDACGEAgEArQMAIQ4KAADPAwAgCwAA0AMAIA4AANIDACDgAQEArAMAIeQBQACuAwAh8QEBAKwDACH5AQAAzgOEAiL9AUAArgMAIf4BAQCsAwAh_wFAAK4DACGAAkAArgMAIYECQACuAwAhggIIAMIDACGEAgEArQMAIQ8EAACkBQAgBQAApQUAIAYAAKYFACAPAACnBQAgEQAAqAUAIBQAAKoFACDgAQEAAAAB5AFAAAAAAfkBAAAAsAIC_QFAAAAAAZECAQAAAAGrAgEAAAABrAIgAAAAAa4CAAAArgICsAIBAAAAAQIAAAABACAhAACCBgAgAwAAADYAICEAAIIGACAiAACGBgAgEQAAADYAIAQAANYEACAFAADXBAAgBgAA2AQAIA8AANkEACARAADaBAAgFAAA3AQAIBoAAIYGACDgAQEArAMAIeQBQACuAwAh-QEAANUEsAIi_QFAAK4DACGRAgEArAMAIasCAQCsAwAhrAIgAOUDACGuAgAA1ASuAiKwAgEArQMAIQ8EAADWBAAgBQAA1wQAIAYAANgEACAPAADZBAAgEQAA2gQAIBQAANwEACDgAQEArAMAIeQBQACuAwAh-QEAANUEsAIi_QFAAK4DACGRAgEArAMAIasCAQCsAwAhrAIgAOUDACGuAgAA1ASuAiKwAgEArQMAIQgEBgIFCgMGDAQIAA8PJggRJwkTKw4ULgoBAwABAQMAAQUDAAEHEAUIAA0QHwwRIgkEBgAECAALCQAGDxYIAgcRBQgABwEHEgAECgABCwAFDRgJDhoKAwYABAoAAQwACAIKAAEMAAgBDxsAAQYABAMHIwAQJAARJQABEgABBgQvAAUwAA8xABEyABMzABQ0AAAAAAMIABQnABUoABYAAAADCAAUJwAVKAAWAQMAAQEDAAEDCAAbJwAcKAAdAAAAAwgAGycAHCgAHQEDAAEBAwABAwgAIicAIygAJAAAAAMIACInACMoACQAAAADCAAqJwArKAAsAAAAAwgAKicAKygALAEDAAEBAwABBQgAMScANCgANWkAMmoAMwAAAAAABQgAMScANCgANWkAMmoAMwAAAwgAOicAOygAPAAAAAMIADonADsoADwCBgAECQAGAgYABAkABgUIAEEnAEQoAEVpAEJqAEMAAAAAAAUIAEEnAEQoAEVpAEJqAEMBBgAEAQYABAMIAEonAEsoAEwAAAADCABKJwBLKABMAgoAAQsABQIKAAELAAUFCABRJwBUKABVaQBSagBTAAAAAAAFCABRJwBUKABVaQBSagBTAgoAAQwACAIKAAEMAAgFCABaJwBdKABeaQBbagBcAAAAAAAFCABaJwBdKABeaQBbagBcAwYABAoAAQwACAMGAAQKAAEMAAgFCABjJwBmKABnaQBkagBlAAAAAAAFCABjJwBmKABnaQBkagBlARIAAQESAAEDCABsJwBtKABuAAAAAwgAbCcAbSgAbhUCARY1ARc4ARg5ARk6ARs8ARw-EB0_ER5BAR9DECBEEiNFASRGASVHEClKEypLFytMAixNAi1OAi5PAi9QAjBSAjFUEDJVGDNXAjRZEDVaGTZbAjdcAjhdEDlgGjphHjtiAzxjAz1kAz5lAz9mA0BoA0FqEEJrH0NtA0RvEEVwIEZxA0dyA0hzEEl2IUp3JUt5Jkx6Jk19Jk5-Jk9_JlCBASZRgwEQUoQBJ1OGASZUiAEQVYkBKFaKASZXiwEmWIwBEFmPASlakAEtW5IBBFyTAQRdlQEEXpYBBF-XAQRgmQEEYZsBEGKcAS5jngEEZKABEGWhAS9mogEEZ6MBBGikARBrpwEwbKgBNm2qAQZuqwEGb64BBnCvAQZxsAEGcrIBBnO0ARB0tQE3dbcBBna5ARB3ugE4eLsBBnm8AQZ6vQEQe8ABOXzBAT19wgEFfsMBBX_EAQWAAcUBBYEBxgEFggHIAQWDAcoBEIQBywE-hQHNAQWGAc8BEIcB0AE_iAHRAQWJAdIBBYoB0wEQiwHWAUCMAdcBRo0B2AEMjgHZAQyPAdoBDJAB2wEMkQHcAQySAd4BDJMB4AEQlAHhAUeVAeMBDJYB5QEQlwHmAUiYAecBDJkB6AEMmgHpARCbAewBSZwB7QFNnQHuAQieAe8BCJ8B8AEIoAHxAQihAfIBCKIB9AEIowH2ARCkAfcBTqUB-QEIpgH7ARCnAfwBT6gB_QEIqQH-AQiqAf8BEKsBggJQrAGDAlatAYQCCq4BhQIKrwGGAgqwAYcCCrEBiAIKsgGKAgqzAYwCELQBjQJXtQGPAgq2AZECELcBkgJYuAGTAgq5AZQCCroBlQIQuwGYAlm8AZkCX70BmgIJvgGbAgm_AZwCCcABnQIJwQGeAgnCAaACCcMBogIQxAGjAmDFAaUCCcYBpwIQxwGoAmHIAakCCckBqgIJygGrAhDLAa4CYswBrwJozQGwAg7OAbECDs8BsgIO0AGzAg7RAbQCDtIBtgIO0wG4AhDUAbkCadUBuwIO1gG9AhDXAb4CatgBvwIO2QHAAg7aAcECENsBxAJr3AHFAm8"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AdminLogScalarFieldEnum: () => AdminLogScalarFieldEnum,
  AnyNull: () => AnyNull2,
  AvailabilitySlotScalarFieldEnum: () => AvailabilitySlotScalarFieldEnum,
  BookingScalarFieldEnum: () => BookingScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  PaymentScalarFieldEnum: () => PaymentScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  SubjectScalarFieldEnum: () => SubjectScalarFieldEnum,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  TutorCategoryScalarFieldEnum: () => TutorCategoryScalarFieldEnum,
  TutorProfileScalarFieldEnum: () => TutorProfileScalarFieldEnum,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.8.0",
  engine: "3c6e192761c0362d496ed980de936e2f3cebcd3a"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  TutorProfile: "TutorProfile",
  Subject: "Subject",
  TutorCategory: "TutorCategory",
  AvailabilitySlot: "AvailabilitySlot",
  Booking: "Booking",
  Payment: "Payment",
  Review: "Review",
  AdminLog: "AdminLog"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  role: "role",
  status: "status",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var TutorProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  bio: "bio",
  totalReviews: "totalReviews",
  averageRating: "averageRating",
  status: "status",
  isVerified: "isVerified",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SubjectScalarFieldEnum = {
  id: "id",
  name: "name",
  slug: "slug",
  createdAt: "createdAt"
};
var TutorCategoryScalarFieldEnum = {
  id: "id",
  tutorProfileId: "tutorProfileId",
  subjectId: "subjectId",
  hourlyRate: "hourlyRate",
  experienceYears: "experienceYears",
  level: "level",
  description: "description",
  isPrimary: "isPrimary",
  createdAt: "createdAt"
};
var AvailabilitySlotScalarFieldEnum = {
  id: "id",
  tutorProfileId: "tutorProfileId",
  dayOfWeek: "dayOfWeek",
  startTime: "startTime",
  endTime: "endTime",
  startDate: "startDate",
  endDate: "endDate",
  isActive: "isActive",
  createdAt: "createdAt"
};
var BookingScalarFieldEnum = {
  id: "id",
  studentId: "studentId",
  tutorCategoryId: "tutorCategoryId",
  sessionDate: "sessionDate",
  startTime: "startTime",
  endTime: "endTime",
  price: "price",
  status: "status",
  meetingLink: "meetingLink",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var PaymentScalarFieldEnum = {
  id: "id",
  bookingId: "bookingId",
  studentId: "studentId",
  stripeEventId: "stripeEventId",
  amount: "amount",
  currency: "currency",
  status: "status",
  stripePaymentIntentId: "stripePaymentIntentId",
  stripeSessionId: "stripeSessionId",
  paidAt: "paidAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ReviewScalarFieldEnum = {
  id: "id",
  bookingId: "bookingId",
  studentId: "studentId",
  tutorProfileId: "tutorProfileId",
  rating: "rating",
  comment: "comment",
  createdAt: "createdAt"
};
var AdminLogScalarFieldEnum = {
  id: "id",
  adminId: "adminId",
  action: "action",
  targetId: "targetId",
  createdAt: "createdAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/enums.ts
var UserStatus = {
  ACTIVE: "ACTIVE",
  BANNED: "BANNED"
};
var TutorLevel = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED"
};
var DayOfWeek = {
  MON: "MON",
  TUE: "TUE",
  WED: "WED",
  THU: "THU",
  FRI: "FRI",
  SAT: "SAT",
  SUN: "SUN"
};
var BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
};
var PaymentStatus = {
  PENDING: "PENDING",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED"
};

// src/generated/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/middleware/globalErrorHandler.ts
function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let errorMessage = "Internal Server error";
  let errorDetails = void 0;
  if (err instanceof ZodError) {
    statusCode = 400;
    errorMessage = "Validation failed";
    errorDetails = err.flatten().fieldErrors;
  } else if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provide incorrect field type or missing fields!";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 400;
      errorMessage = "An operation failed because it depends on one or more records that were required but not found.";
    } else if (err.code === "P2002") {
      statusCode = 400;
      errorMessage = "Duplicate key error";
    } else if (err.code === "P2003") {
      statusCode = 400;
      errorMessage = "Foreign key constraint failed";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "Error occured during query execution";
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = 401;
      errorMessage = "Authentication failed. Please check your creditials!";
    } else if (err.errorCode === "P1001") {
      statusCode = 400;
      errorMessage = "Can't reach database server";
    }
  } else if (err instanceof Error) {
    statusCode = err.statusCode || 500;
    errorMessage = err.message;
  }
  res.status(statusCode);
  res.json({
    message: errorMessage,
    ...errorDetails && { errors: errorDetails },
    ...process.env.NODE_ENV !== "production" && { stack: err?.stack }
  });
}
var globalErrorHandler_default = errorHandler;

// src/app/middleware/notFound.ts
function notFound(req, res) {
  res.status(404).json({
    message: "Route not found!",
    path: req.originalUrl,
    date: Date()
  });
}

// src/app/modules/user/user.router.ts
import { Router } from "express";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/modules/user/user.controller.ts
var getUsers = async (req, res) => {
  try {
    const data = await prisma.user.findMany();
    res.status(200).send({ message: "User Retrieves", data });
  } catch (error) {
    console.log(error);
  }
};
var userController = {
  getUsers
};

// src/utils/cookie.ts
var setCookie = (res, key, value, options) => {
  res.cookie(key, value, options);
};
var getCookie = (req, key) => {
  return req.cookies[key];
};
var clearCookie = (res, key, options) => {
  res.clearCookie(key, options);
};
var CookieUtils = {
  setCookie,
  getCookie,
  clearCookie
};

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, { expiresIn }) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      data: decoded
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};
var decodeToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded;
};
var jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
};

// src/app/middleware/auth.ts
var checkAuth = (...roles) => async (req, res, next) => {
  try {
    const sessionToken = req.cookies["__Secure-session_token"] || req.cookies["session_token"] || req.cookies["better-auth.session_token"] || req.headers["x-session-token"];
    if (!sessionToken) {
      throw new Error(
        "Unauthorized access! No session token provided."
      );
    }
    const session = await prisma.session.findFirst({
      where: {
        token: sessionToken,
        expiresAt: {
          gt: /* @__PURE__ */ new Date()
        }
      },
      include: {
        user: true
      }
    });
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized!"
      });
    }
    if (!session.user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Email verification required. Please verify your email"
      });
    }
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      emailVerified: session.user.emailVerified
    };
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden! You don't have permission to access this resource"
      });
    }
    const bearerHeader = req.headers.authorization;
    const bearerToken = bearerHeader?.startsWith("Bearer ") ? bearerHeader.split(" ")[1] : void 0;
    const accessToken = CookieUtils.getCookie(req, "accessToken") || bearerToken;
    if (!accessToken) {
      throw new Error(
        "Unauthorized access! No access token provided."
      );
    }
    const verifiedToken = jwtUtils.verifyToken(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    if (!verifiedToken.success) {
      throw new Error("Unauthorized access! Invalid access token.");
    }
    if (roles.length > 0 && !roles.includes(verifiedToken.data.role)) {
      throw new Error(
        "Forbidden access! You do not have permission to access this resource."
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

// src/app/modules/user/user.router.ts
var userRouter = Router();
userRouter.get("/", checkAuth(), userController.getUsers);
var user_router_default = userRouter;

// src/app/config/stripe.config.ts
import Stripe from "stripe";
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// src/modules/payment/payment.service.ts
var createCheckoutSession = async (bookingId, user) => {
  const studentData = await prisma.user.findUniqueOrThrow({
    where: { email: user.email }
  });
  const booking = await prisma.booking.findUniqueOrThrow({
    where: {
      id: bookingId,
      studentId: studentData.id
    },
    include: {
      tutorCategory: {
        include: { subject: true }
      }
    }
  });
  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId }
  });
  if (existingPayment?.status === PaymentStatus.SUCCEEDED) {
    throw new Error("Payment already completed for this booking");
  }
  if (booking.status === BookingStatus.CANCELLED) {
    throw new Error("This booking is cancelled");
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Tutoring: ${booking.tutorCategory.subject.name}`,
            description: `Session on ${booking.sessionDate.toDateString()}`
          },
          unit_amount: Math.round(booking.price * 100)
          // Stripe uses cents
        },
        quantity: 1
      }
    ],
    metadata: {
      bookingId: booking.id,
      studentId: studentData.id
    },
    success_url: `${process.env.FRONTEND_URL}/bookings/${booking.id}?payment=success`,
    cancel_url: `${process.env.FRONTEND_URL}/bookings/${booking.id}?payment=cancelled`
  });
  const payment = await prisma.payment.upsert({
    where: { bookingId },
    create: {
      bookingId,
      studentId: studentData.id,
      amount: booking.price,
      currency: "usd",
      status: PaymentStatus.PENDING,
      stripeSessionId: session.id
    },
    update: {
      stripeSessionId: session.id,
      status: PaymentStatus.PENDING
    }
  });
  return {
    paymentUrl: session.url,
    paymentId: payment.id
  };
};
var handlerStripeWebhookEvent = async (event) => {
  const existingPayment = await prisma.payment.findFirst({
    where: { stripeEventId: event.id }
  });
  if (existingPayment) {
    console.log(`Event ${event.id} already processed. Skipping`);
    return { message: `Event ${event.id} already processed. Skipping` };
  }
  switch (event.type) {
    // ── Payment Succeeded ────────────────────────────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object;
      const { bookingId } = session.metadata ?? {};
      if (!bookingId) {
        console.error("Missing bookingId in session metadata");
        return { message: "Missing bookingId in session metadata" };
      }
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      });
      if (!booking) {
        console.error(`Booking with id ${bookingId} not found`);
        return { message: `Booking with id ${bookingId} not found` };
      }
      const isPaid = session.payment_status === "paid";
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { stripeSessionId: session.id },
          data: {
            stripeEventId: event.id,
            stripePaymentIntentId: session.payment_intent,
            status: isPaid ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
            paidAt: isPaid ? /* @__PURE__ */ new Date() : null
          }
        });
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: isPaid ? BookingStatus.CONFIRMED : BookingStatus.PENDING
          }
        });
      });
      console.log(
        `checkout.session.completed \u2192 booking ${bookingId} marked ${isPaid ? "CONFIRMED" : "PENDING"}`
      );
      break;
    }
    // ── Session Expired ──────────────────────────────────────────────────
    case "checkout.session.expired": {
      const session = event.data.object;
      const payment = await prisma.payment.findUnique({
        where: { stripeSessionId: session.id }
      });
      if (!payment) {
        console.error(`No payment found for session ${session.id}`);
        break;
      }
      await prisma.payment.update({
        where: { stripeSessionId: session.id },
        data: {
          stripeEventId: event.id,
          status: PaymentStatus.FAILED
        }
      });
      console.log(
        `checkout.session.expired \u2192 payment ${payment.id} marked FAILED`
      );
      break;
    }
    // ── Payment Intent Failed ────────────────────────────────────────────
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id }
      });
      if (!payment) {
        console.error(
          `No payment found for payment_intent ${paymentIntent.id}`
        );
        break;
      }
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          stripeEventId: event.id,
          status: PaymentStatus.FAILED
        }
      });
      console.log(
        `payment_intent.payment_failed \u2192 payment ${payment.id} marked FAILED`
      );
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  return { message: `Webhook event ${event.id} processed successfully` };
};
var refundPayment = async (bookingId, user) => {
  const studentData = await prisma.user.findUniqueOrThrow({
    where: { email: user.email }
  });
  const payment = await prisma.payment.findUniqueOrThrow({
    where: {
      bookingId,
      studentId: studentData.id
    }
  });
  if (payment.status !== PaymentStatus.SUCCEEDED) {
    throw new Error("Only succeeded payments can be refunded");
  }
  if (!payment.stripePaymentIntentId) {
    throw new Error("No Stripe payment intent found for this payment");
  }
  await stripe.refunds.create({
    payment_intent: payment.stripePaymentIntentId
  });
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { bookingId },
      data: { status: PaymentStatus.REFUNDED }
    });
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED }
    });
  });
  console.log(`Refund issued for booking ${bookingId}`);
  return { success: true };
};
var PaymentService = {
  createCheckoutSession,
  handlerStripeWebhookEvent,
  refundPayment
};

// src/modules/payment/payment.controller.ts
var createCheckoutSession2 = async (req, res) => {
  const user = req.user;
  const { bookingId } = req.params;
  const result = await PaymentService.createCheckoutSession(
    bookingId,
    user
  );
  res.status(200).json({
    success: true,
    message: "Checkout session created successfully",
    data: result
  });
};
var handleStripeWebhookEvent = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    console.error("Missing Stripe signature or webhook secret");
    return res.status(400).json({
      message: "Missing Stripe signature or webhook secret"
    });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      // raw Buffer — must use express.raw()
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).json({ message: "Invalid webhook signature" });
  }
  try {
    const result = await PaymentService.handlerStripeWebhookEvent(event);
    res.status(200).json({
      success: true,
      message: "Stripe webhook event processed successfully",
      data: result
    });
  } catch (error) {
    console.error("Error handling Stripe webhook event:", error);
    res.status(500).json({
      success: false,
      message: "Error handling Stripe webhook event"
    });
  }
};
var refundPayment2 = async (req, res) => {
  const user = req.user;
  const { bookingId } = req.params;
  const result = await PaymentService.refundPayment(
    bookingId,
    user
  );
  res.status(200).json({
    success: true,
    message: "Payment refunded successfully",
    data: result
  });
};
var PaymentController = {
  createCheckoutSession: createCheckoutSession2,
  handleStripeWebhookEvent,
  refundPayment: refundPayment2
};

// src/routes/index.ts
import { Router as Router10 } from "express";

// src/modules/admin/admin.routes.ts
import { Router as Router2 } from "express";

// src/helpers/paginationSortingHelper.ts
var paginationSortingHelper = (options) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = options.skip !== void 0 ? Number(options.skip) : (page - 1) * limit;
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder || "desc";
  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder
  };
};
var paginationSortingHelper_default = paginationSortingHelper;

// src/modules/admin/admin.service.ts
var getAllUsers = async ({
  page,
  limit,
  skip,
  sortBy,
  sortOrder,
  search
}) => {
  const andConditions = [];
  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ]
    });
  }
  const users = await prisma.user.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions
    },
    orderBy: {
      [sortBy]: sortOrder
    }
  });
  const total = await prisma.user.count({
    where: {
      AND: andConditions
    }
  });
  return {
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var updateUserStatus = async (id, status) => {
  if (!Object.values(UserStatus).includes(status)) {
    throw new Error("Invalid status. Status must be ACTIVE or BANNED.");
  }
  return await prisma.user.update({
    where: { id },
    data: { status }
  });
};
var adminService = { getAllUsers, updateUserStatus };

// src/modules/admin/admin.controller.ts
var getAllUsers2 = async (req, res, next) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper_default(
    req.query
  );
  const { search } = req.query;
  const searchString = typeof search === "string" ? search : void 0;
  try {
    const result = await adminService.getAllUsers({
      search: searchString,
      limit,
      page,
      skip,
      sortBy,
      sortOrder
    });
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var updateUserStatus2 = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await adminService.updateUserStatus(
      id,
      status
    );
    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var adminController = { getAllUsers: getAllUsers2, updateUserStatus: updateUserStatus2 };

// src/modules/admin/admin.routes.ts
var adminRoutes = Router2();
adminRoutes.get(
  "/users",
  checkAuth("ADMIN" /* ADMIN */),
  adminController.getAllUsers
);
adminRoutes.patch(
  "/users/:id/status",
  checkAuth("ADMIN" /* ADMIN */),
  adminController.updateUserStatus
);
var admin_routes_default = adminRoutes;

// src/modules/auth/auth.routes.ts
import { Router as Router3 } from "express";

// src/utils/token.ts
var getAccessToken = (payload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
  );
  return accessToken;
};
var getRefreshToken = (payload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );
  return refreshToken;
};
var setAccessTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  });
};
var setRefreshTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //7d
    maxAge: 60 * 60 * 24 * 1e3 * 7
  });
};
var setBetterAuthSessionCookie = (res, token) => {
  CookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  });
};
var tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie
};

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { oAuthProxy } from "better-auth/plugins";

// src/lib/mailer.ts
import "dotenv/config";
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASSWORD
  }
});

// src/lib/auth.ts
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  baseURL: process.env.FRONTEND_URL,
  trustedOrigins: [process.env.FRONTEND_URL],
  //...other options
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"SkillBridge" <prismablog@ph.com>',
          to: user.email,
          subject: "Please verify your email!",
          html: `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                        <meta charset="UTF-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <title>Email Verification</title>
                        <style>
                        body {
                            margin: 0;
                            padding: 0;
                            background-color: #f4f6f8;
                            font-family: Arial, Helvetica, sans-serif;
                        }

                        .container {
                            max-width: 600px;
                            margin: 40px auto;
                            background-color: #ffffff;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                        }

                        .header {
                            background-color: #0f172a;
                            color: #ffffff;
                            padding: 20px;
                            text-align: center;
                        }

                        .header h1 {
                            margin: 0;
                            font-size: 22px;
                        }

                        .content {
                            padding: 30px;
                            color: #334155;
                            line-height: 1.6;
                        }

                        .content h2 {
                            margin-top: 0;
                            font-size: 20px;
                            color: #0f172a;
                        }

                        .button-wrapper {
                            text-align: center;
                            margin: 30px 0;
                        }

                        .verify-button {
                            background-color: #2563eb;
                            color: #ffffff !important;
                            padding: 14px 28px;
                            text-decoration: none;
                            font-weight: bold;
                            border-radius: 6px;
                            display: inline-block;
                        }

                        .verify-button:hover {
                            background-color: #1d4ed8;
                        }

                        .footer {
                            background-color: #f1f5f9;
                            padding: 20px;
                            text-align: center;
                            font-size: 13px;
                            color: #64748b;
                        }

                        .link {
                            word-break: break-all;
                            font-size: 13px;
                            color: #2563eb;
                        }
                        </style>
                        </head>
                        <body>
                        <div class="container">
                        <!-- Header -->
                        <div class="header">
                            <h1>Prisma Blog</h1>
                        </div>

                        <!-- Content -->
                        <div class="content">
                            <h2>Verify Your Email Address</h2>
                            <p>
                            Hello ${user.name} <br /><br />
                            Thank you for registering on <strong>Prisma Blog</strong>.
                            Please confirm your email address to activate your account.
                            </p>

                            <div class="button-wrapper">
                            <a href="${verificationUrl}" class="verify-button">
                                Verify Email
                            </a>
                            </div>

                            <p>
                            If the button doesn\u2019t work, copy and paste the link below into your browser:
                            </p>

                            <p class="link">
                            ${verificationUrl}
                            </p>

                            <p>
                            This verification link will expire soon for security reasons.
                            If you did not create an account, you can safely ignore this email.
                            </p>

                            <p>
                            Regards, <br />
                            <strong>Skill Bridge Team</strong>
                            </p>
                        </div>

                        <!-- Footer -->
                        <div class="footer">
                            \xA9 2025 SkillBridge. All rights reserved.
                        </div>
                        </div>
                        </body>
                        </html>
                        `
        });
        console.log("Message sent:", info.messageId);
      } catch (err) {
        console.error(err);
        throw err;
      }
    }
  },
  // socialProviders: {
  //     google: {
  //         clientId: process.env.GOOGLE_CLIENT_ID as string,
  //         clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  //         prompt: "select_account",
  //     },
  //     github: {
  //         clientId: process.env.GITHUB_CLIENT_ID as string,
  //         clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  //     },
  // },
  // account: { skipStateCookieCheck: true }, // solved redirect issue
  advanced: {
    cookies: {
      // session_token: {
      //     name: "session_token", // Force this exact name
      //     attributes: {
      //         httpOnly: true,
      //         secure: true,
      //         sameSite: "none",
      //         partitioned: true,
      //     },
      // },
      session_token: {
        name: "session_token",
        attributes: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          // ✅ false on localhost
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          // ✅ lax on localhost
          partitioned: process.env.NODE_ENV === "production"
          // ✅ only in production
        }
      },
      state: {
        name: "session_token",
        // Force this exact name
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          partitioned: true
        }
      }
    }
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        required: false
      }
    }
  },
  plugins: [oAuthProxy()]
});

// src/modules/auth/auth.validation.ts
import { z } from "zod";
var registerUserSchema = z.object({
  name: z.string({ error: "Name is required" }).min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters").trim(),
  email: z.string({ error: "Email is required" }).email("Invalid email address").trim().toLowerCase(),
  password: z.string({ error: "Password is required" }).min(8, "Password must be at least 8 characters").max(128, "Password must not exceed 128 characters")
});
var loginUserSchema = z.object({
  email: z.string({ error: "Email is required" }).email("Invalid email address").trim().toLowerCase(),
  password: z.string({ error: "Password is required" }).min(1, "Password is required")
});
var changePasswordSchema = z.object({
  currentPassword: z.string({ error: "Current password is required" }).min(1, "Current password is required"),
  newPassword: z.string({ error: "New password is required" }).min(8, "New password must be at least 8 characters").max(128, "New password must not exceed 128 characters")
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"]
});
var verifyEmailSchema = z.object({
  email: z.string({ error: "Email is required" }).email("Invalid email address").trim().toLowerCase(),
  otp: z.string({ error: "OTP is required" }).length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only digits")
});
var resetPasswordSchema = z.object({
  email: z.string({ error: "Email is required" }).email("Invalid email address").trim().toLowerCase(),
  otp: z.string({ error: "OTP is required" }).length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only digits"),
  newPassword: z.string({ error: "New password is required" }).min(8, "New password must be at least 8 characters").max(128, "New password must not exceed 128 characters")
});
var authValidation = {
  registerUserSchema,
  loginUserSchema,
  changePasswordSchema,
  verifyEmailSchema,
  resetPasswordSchema
};

// src/modules/auth/auth.service.ts
var registerUser = async (payload) => {
  const { name, email, password } = authValidation.registerUserSchema.parse(payload);
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password
    }
  });
  if (!data.user) {
    throw new Error("Failed to register patient");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  return {
    ...data,
    accessToken,
    refreshToken
  };
};
var loginUser = async (payload) => {
  const { email, password } = authValidation.loginUserSchema.parse(payload);
  const data = await auth.api.signInEmail({
    body: {
      email,
      password
    }
  });
  if (data.user.status === UserStatus.BANNED) {
    throw new Error("User is Banned");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  return {
    ...data,
    accessToken,
    refreshToken
  };
};
var getNewToken = async (refreshToken, sessionToken) => {
  const isSessionTokenExists = await prisma.session.findUnique({
    where: {
      token: sessionToken
    },
    include: {
      user: true
    }
  });
  if (!isSessionTokenExists) {
    throw new Error("Invalid session token");
  }
  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
    throw new Error("Invalid refresh token");
  }
  const data = verifiedRefreshToken.data;
  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  });
  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  });
  const { token } = await prisma.session.update({
    where: {
      token: sessionToken
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1e3),
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token
  };
};
var changePassword = async (payload, sessionToken) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (!session) {
    throw new Error("Invalid session token");
  }
  const { currentPassword, newPassword } = authValidation.changePasswordSchema.parse(payload);
  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  return {
    ...result,
    accessToken,
    refreshToken
  };
};
var logoutUser = async (sessionToken) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  return result;
};
var verifyEmail = async (payload) => {
  const { email, otp } = authValidation.verifyEmailSchema.parse(payload);
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp
    }
  });
  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email
      },
      data: {
        emailVerified: true
      }
    });
  }
};
var forgetPassword = async (email) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExist) {
    throw new Error("User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new Error("Email not verified");
  }
  if (!isUserExist) {
    throw new Error("User not found");
  }
  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email
    }
  });
};
var resetPassword = async (payload) => {
  const { email, otp, newPassword } = authValidation.resetPasswordSchema.parse(payload);
  const isUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExist) {
    throw new Error("User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new Error("Email not verified");
  }
  if (!isUserExist) {
    throw new Error("User not found");
  }
  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword
    }
  });
  await prisma.session.deleteMany({
    where: {
      userId: isUserExist.id
    }
  });
};
var AuthService = {
  registerUser,
  loginUser,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgetPassword,
  resetPassword
};

// src/modules/auth/auth.controller.ts
var registerUser2 = async (req, res, next) => {
  try {
    const result = await AuthService.registerUser(req.body);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var loginUser2 = async (req, res, next) => {
  try {
    const result = await AuthService.loginUser(req.body);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
    res.status(200).json({
      success: true,
      message: "User Logged In Successfully!",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getNewToken2 = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    if (!refreshToken) {
      throw new Error("Refresh token is missing");
    }
    const result = await AuthService.getNewToken(
      refreshToken,
      betterAuthSessionToken
    );
    const {
      accessToken,
      refreshToken: newRefreshToken,
      sessionToken
    } = result;
    res.status(200).json({
      success: true,
      message: "New tokens generated successfully!",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        sessionToken
      }
    });
  } catch (error) {
    next(error);
  }
};
var changePassword2 = async (req, res, next) => {
  try {
    const payload = req.body;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const result = await AuthService.changePassword(
      payload,
      betterAuthSessionToken
    );
    res.status(200).json({
      success: true,
      message: "Password changed successfully!",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var logoutUser2 = async (req, res, next) => {
  try {
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const result = await AuthService.logoutUser(betterAuthSessionToken);
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    res.clearCookie("better-auth.session_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    res.status(200).json({
      success: true,
      message: "User logged out successfully!",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var verifyEmail2 = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    await AuthService.verifyEmail({ email, otp });
    res.status(200).json({
      success: true,
      message: "Email verified successfully!"
    });
  } catch (error) {
    next(error);
  }
};
var forgetPassword2 = async (req, res, next) => {
  try {
    const { email } = req.body;
    await AuthService.forgetPassword(email);
    res.status(200).json({
      success: true,
      message: "Password reset OTP sent to email successfully!"
    });
  } catch (error) {
    next(error);
  }
};
var resetPassword2 = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    await AuthService.resetPassword({ email, otp, newPassword });
    res.status(200).json({
      success: true,
      message: "Password reset successfully!"
    });
  } catch (error) {
    next(error);
  }
};
var AuthController = {
  registerUser: registerUser2,
  loginUser: loginUser2,
  getNewToken: getNewToken2,
  changePassword: changePassword2,
  logoutUser: logoutUser2,
  verifyEmail: verifyEmail2,
  forgetPassword: forgetPassword2,
  resetPassword: resetPassword2
};

// src/modules/auth/auth.routes.ts
var router = Router3();
router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.post("/refresh-token", AuthController.getNewToken);
router.post(
  "/change-password",
  checkAuth("ADMIN" /* ADMIN */, "STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */),
  AuthController.changePassword
);
router.post(
  "/logout",
  checkAuth("ADMIN" /* ADMIN */, "STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */),
  AuthController.logoutUser
);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);
var AuthRoutes = router;

// src/modules/availability/availability.routes.ts
import { Router as Router4 } from "express";

// src/app/middleware/checkBanStatus.ts
var checkUserBanStatus = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please log in to access this resource."
    });
  }
  const userId = user.id;
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true }
  });
  if (userData?.status === "BANNED") {
    return res.status(403).json({
      success: false,
      message: "your account has been been banned by admin."
    });
  }
  next();
};
var checkBanStatus_default = checkUserBanStatus;

// src/modules/availability/availability.validation.ts
import { z as z2 } from "zod";
var timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
var slotSchema = z2.object({
  dayOfWeek: z2.enum(DayOfWeek, {
    error: `dayOfWeek must be one of: ${Object.values(DayOfWeek).join(", ")}`
  }),
  startTime: z2.string().regex(
    timeRegex,
    "Invalid time format. Use HH:MM (24-hour format)"
  ),
  endTime: z2.string().regex(
    timeRegex,
    "Invalid time format. Use HH:MM (24-hour format)"
  )
}).refine((slot) => slot.startTime < slot.endTime, {
  message: "Start time must be before end time",
  path: ["endTime"]
});
var createAvailabilitySchema = z2.object({
  startDate: z2.coerce.date(),
  endDate: z2.coerce.date(),
  slots: z2.array(slotSchema).min(1, "At least one slot is required")
}).refine((data) => data.startDate < data.endDate, {
  message: "Invalid date range",
  path: ["endDate"]
});
var updateAvailabilitySchema = z2.object({
  dayOfWeek: z2.enum(DayOfWeek, {
    error: `dayOfWeek must be one of: ${Object.values(DayOfWeek).join(", ")}`
  }).optional(),
  startTime: z2.string().regex(timeRegex, "Invalid time format. Use HH:MM (24-hour format)").optional(),
  endTime: z2.string().regex(timeRegex, "Invalid time format. Use HH:MM (24-hour format)").optional(),
  startDate: z2.coerce.date().optional(),
  endDate: z2.coerce.date().optional()
}).refine(
  (data) => !data.startTime || !data.endTime || data.startTime < data.endTime,
  { message: "Start time must be before end time", path: ["endTime"] }
).refine(
  (data) => !data.startDate || !data.endDate || data.startDate < data.endDate,
  { message: "Invalid date range", path: ["endDate"] }
);

// src/modules/availability/availability.service.ts
var createAvailability = async (userId, data) => {
  const { startDate, endDate, slots } = createAvailabilitySchema.parse(data);
  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
    select: { id: true }
  });
  if (!tutorProfile) {
    throw new Error("Tutor Profile not found");
  }
  const tutorProfileId = tutorProfile.id;
  const existingSlots = await prisma.availabilitySlot.findMany({
    where: {
      tutorProfileId,
      isActive: true
    }
  });
  const availabilityData = [];
  for (const slot of slots) {
    const startTime = /* @__PURE__ */ new Date(`1970-01-01T${slot.startTime}:00Z`);
    const endTime = /* @__PURE__ */ new Date(`1970-01-01T${slot.endTime}:00Z`);
    const sameDaySlots = existingSlots.filter(
      (s) => s.dayOfWeek === slot.dayOfWeek
    );
    const isOverlap = sameDaySlots.some((s) => {
      const timeOverlop = startTime < s.endTime && endTime > s.startTime;
      const dateOverlop = parsedStartDate <= s.endDate && parsedEndDate >= s.startDate;
      return timeOverlop && dateOverlop;
    });
    if (isOverlap) {
      throw new Error(`Time slot overlaps on ${slot.dayOfWeek}`);
    }
    availabilityData.push({
      tutorProfileId,
      dayOfWeek: slot.dayOfWeek,
      startTime,
      endTime,
      startDate: parsedStartDate,
      endDate: parsedEndDate
    });
  }
  return await prisma.availabilitySlot.createMany({
    data: availabilityData,
    skipDuplicates: true
  });
};
var getAvailability = async (userId) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
    select: { id: true }
  });
  if (!tutorProfile) {
    throw new Error("Tutor Profile not found");
  }
  const tutorProfileId = tutorProfile.id;
  console.log("tutor profle id", tutorProfileId);
  const availability = await prisma.availabilitySlot.findMany({
    where: { tutorProfileId }
  });
  return availability;
};
var getAvailibilityByTutorId = async (tutorProfileId) => {
  const result = await prisma.availabilitySlot.findMany({
    where: { tutorProfileId }
  });
  return result;
};
var getAvailabilityWithBookings = async (tutorId, date) => {
  const selectedDate = /* @__PURE__ */ new Date(`${date}T00:00:00.000`);
  if (isNaN(selectedDate.getTime())) {
    throw new Error("Invalid date format");
  }
  const dayOfWeek = selectedDate.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const slots = await prisma.availabilitySlot.findMany({
    where: {
      tutorProfileId: tutorId,
      dayOfWeek,
      isActive: true,
      startDate: { lte: selectedDate },
      endDate: { gte: selectedDate }
    }
  });
  if (!slots.length) return [];
  const bookings = await prisma.booking.findMany({
    where: {
      tutorCategory: {
        tutorProfileId: tutorId
      },
      sessionDate: selectedDate,
      status: { in: ["PENDING", "CONFIRMED"] }
    }
  });
  const result = slots.map((slot) => {
    const isBooked = bookings.some(
      (b) => b.startTime < slot.endTime && b.endTime > slot.startTime
    );
    return {
      id: slot.id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isBooked
    };
  });
  return result;
};
var getAvailableDatesInMonth = async (tutorProfileId, year, month) => {
  const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  const now = /* @__PURE__ */ new Date();
  const todayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const slots = await prisma.availabilitySlot.findMany({
    where: {
      tutorProfileId,
      isActive: true,
      startDate: { lte: endOfMonth },
      endDate: { gte: startOfMonth }
    }
  });
  const bookings = await prisma.booking.findMany({
    where: {
      tutorCategory: { tutorProfileId },
      status: { in: ["PENDING", "CONFIRMED"] },
      sessionDate: { gte: startOfMonth, lte: endOfMonth }
    },
    select: { sessionDate: true, startTime: true, endTime: true }
  });
  const availableDates = /* @__PURE__ */ new Set();
  for (let d = new Date(startOfMonth); d <= endOfMonth; d.setUTCDate(d.getUTCDate() + 1)) {
    if (d < todayUTC) continue;
    const dayName = d.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "UTC"
    }).toUpperCase();
    const dateStr = d.toISOString().split("T")[0];
    const slotsForDay = slots.filter(
      (s) => s.dayOfWeek === dayName && d >= s.startDate && d <= s.endDate
    );
    if (slotsForDay.length === 0) continue;
    const bookingsForDay = bookings.filter((b) => {
      return b.sessionDate.toISOString().split("T")[0] === dateStr;
    });
    const hasAvailableSlot = slotsForDay.some((slot) => {
      const isBooked = bookingsForDay.some(
        (b) => b.startTime <= slot.startTime && b.endTime >= slot.endTime
      );
      return !isBooked;
    });
    if (hasAvailableSlot) {
      availableDates.add(d.toISOString());
    }
  }
  return Array.from(availableDates);
};
var updateAvailability = async (userId, availabilityId, rawData) => {
  const data = updateAvailabilitySchema.parse(rawData);
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
    select: { id: true }
  });
  if (!tutorProfile) {
    throw new Error("Tutor Profile not found");
  }
  const tutorProfileId = tutorProfile.id;
  const existingSlot = await prisma.availabilitySlot.findFirst({
    where: {
      id: availabilityId,
      tutorProfileId,
      isActive: true
    }
  });
  if (!existingSlot) {
    throw new Error("Availability Slot not found");
  }
  const updatedDay = data.dayOfWeek ?? existingSlot.dayOfWeek;
  const parsedStartDate = data.startDate ? new Date(data.startDate) : existingSlot.startDate;
  const parsedEndDate = data.endDate ? new Date(data.endDate) : existingSlot.endDate;
  if (parsedStartDate >= parsedEndDate) {
    throw new Error("Invalid date range");
  }
  const startTime = data.startTime ? /* @__PURE__ */ new Date(`1970-01-01T${data.startTime}:00Z`) : existingSlot.startTime;
  const endTime = data.endTime ? /* @__PURE__ */ new Date(`1970-01-01T${data.endTime}:00Z`) : existingSlot.endTime;
  if (startTime >= endTime) {
    throw new Error("Start time must be before end time");
  }
  const overlappingSlot = await prisma.availabilitySlot.findFirst({
    where: {
      tutorProfileId,
      dayOfWeek: updatedDay,
      isActive: true,
      id: { not: availabilityId },
      // Date overlap
      startDate: { lte: parsedEndDate },
      endDate: { gte: parsedStartDate },
      // Time overlap
      startTime: { lt: endTime },
      endTime: { gt: startTime }
    }
  });
  if (overlappingSlot) {
    throw new Error("Updated slot overlaps with existing availability");
  }
  return await prisma.availabilitySlot.update({
    where: { id: availabilityId },
    data: {
      dayOfWeek: updatedDay,
      startTime,
      endTime,
      startDate: parsedStartDate,
      endDate: parsedEndDate
    }
  });
};
var deleteAvailability = async (slotId) => {
  const result = await prisma.availabilitySlot.delete({
    where: { id: slotId }
  });
  return result;
};
var AvailabilityService = {
  createAvailability,
  getAvailability,
  getAvailibilityByTutorId,
  getAvailabilityWithBookings,
  getAvailableDatesInMonth,
  updateAvailability,
  deleteAvailability
};

// src/modules/availability/availability.controller.ts
var createAvailability2 = async (req, res, next) => {
  const userId = req.user?.id;
  console.log(req.user);
  if (!userId) {
    throw new Error("User not found");
  }
  try {
    const result = await AvailabilityService.createAvailability(
      userId,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "create availability slots created!",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getOwnAvailability = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }
  try {
    const result = await AvailabilityService.getAvailability(userId);
    res.status(200).json({
      success: true,
      message: "Availability Slot Retrived Successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getAvailibilityByTutorId2 = async (req, res, next) => {
  const tutorProfileId = req.params.tutorId;
  try {
    const result = await AvailabilityService.getAvailibilityByTutorId(
      tutorProfileId
    );
    res.status(200).json({
      success: true,
      message: "Availability Slot Retrived Successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getAvailabilityWithBookings2 = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required"
      });
    }
    const result = await AvailabilityService.getAvailabilityWithBookings(
      tutorId,
      date
    );
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};
var getAvailableDatesInMonth2 = async (req, res) => {
  const { tutorProfileId } = req.params;
  const { year, month } = req.query;
  if (!year || !month) {
    return res.status(500).json({
      success: false,
      message: "year and month query params are required"
    });
  }
  const parsedYear = parseInt(year);
  const parsedMonth = parseInt(month);
  if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    return res.status(500).json({
      success: false,
      message: "Invalid year or month"
    });
  }
  const result = await AvailabilityService.getAvailableDatesInMonth(
    tutorProfileId,
    parsedYear,
    parsedMonth
  );
  res.status(200).json({
    success: true,
    message: "Available dates fetched successfully",
    data: result
  });
};
var updateAvailability2 = async (req, res, next) => {
  const userId = req.user?.id;
  const slotId = req.params.slotId;
  if (!userId) {
    throw new Error("User Id not found");
  }
  const { dayOfWeek, startTime, endTime, startDate, endDate } = req.body;
  try {
    const result = await AvailabilityService.updateAvailability(
      userId,
      slotId,
      { dayOfWeek, startTime, endTime, startDate, endDate }
    );
    res.status(200).json({
      success: true,
      message: "Availability Slot updated Successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var deleteAvailability2 = async (req, res, next) => {
  const slotId = req.params.slotId;
  try {
    const result = await AvailabilityService.deleteAvailability(
      slotId
    );
    res.status(200).json({
      success: true,
      message: "Availability Slot deleted Successfully!",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var availabilityController = {
  createAvailability: createAvailability2,
  getOwnAvailability,
  getAvailibilityByTutorId: getAvailibilityByTutorId2,
  getAvailabilityWithBookings: getAvailabilityWithBookings2,
  getAvailableDatesInMonth: getAvailableDatesInMonth2,
  updateAvailability: updateAvailability2,
  deleteAvailability: deleteAvailability2
};

// src/modules/availability/availability.routes.ts
var availabilityRoutes = Router4();
availabilityRoutes.post(
  "/create",
  checkAuth("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  checkBanStatus_default,
  availabilityController.createAvailability
);
availabilityRoutes.get(
  "/me",
  checkAuth("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  availabilityController.getOwnAvailability
);
availabilityRoutes.get(
  "/:tutorId",
  availabilityController.getAvailibilityByTutorId
);
availabilityRoutes.get(
  "/:tutorId/with-bookings",
  availabilityController.getAvailabilityWithBookings
);
availabilityRoutes.get(
  "/:tutorProfileId/available-dates",
  availabilityController.getAvailableDatesInMonth
);
availabilityRoutes.patch(
  "/update/:slotId",
  checkAuth("ADMIN" /* ADMIN */, "TUTOR" /* TUTOR */),
  availabilityController.updateAvailability
);
availabilityRoutes.delete(
  "/delete/:slotId",
  checkAuth("ADMIN" /* ADMIN */, "TUTOR" /* TUTOR */),
  availabilityController.deleteAvailability
);
var availability_routes_default = availabilityRoutes;

// src/modules/booking/booking.routes.ts
import { Router as Router5 } from "express";

// src/modules/booking/booking.validation.ts
import { z as z3 } from "zod";
var timeRegex2 = /^([01]\d|2[0-3]):([0-5]\d)$/;
var createBookingSchema = z3.object({
  sessionDate: z3.iso.date({
    error: (issue) => issue.input === void 0 ? "Session date is required" : "sessionDate must be a valid date (YYYY-MM-DD)"
  }),
  startTime: z3.string({ error: "Start time is required" }).regex(timeRegex2, "Invalid time format. Use HH:MM"),
  endTime: z3.string({ error: "End time is required" }).regex(timeRegex2, "Invalid time format. Use HH:MM"),
  tutorCategoryId: z3.string({ error: "Tutor category is required" }).min(1, "Tutor category is required")
}).refine((data) => data.startTime < data.endTime, {
  message: "Start time must be before end time",
  path: ["endTime"]
}).refine(
  (data) => {
    const sessionDate = /* @__PURE__ */ new Date(`${data.sessionDate}T00:00:00.000Z`);
    const today = /* @__PURE__ */ new Date();
    today.setUTCHours(0, 0, 0, 0);
    return sessionDate >= today;
  },
  {
    message: "Session date cannot be in the past",
    path: ["sessionDate"]
  }
);
var bookingStatusSchema = z3.object({
  status: z3.enum(BookingStatus, {
    error: `Invalid status. Status must be one of: ${Object.values(BookingStatus).join(", ")}`
  }),
  meetingLink: z3.url("meetingLink must be a valid URL").optional()
});

// src/modules/booking/booking.service.ts
var createBooking = async (studentId, rawData) => {
  const data = createBookingSchema.parse(rawData);
  if (!data.sessionDate) {
    throw new Error("Session date is required");
  }
  const sessionDate = /* @__PURE__ */ new Date(`${data.sessionDate}T00:00:00.000Z`);
  const startTime = /* @__PURE__ */ new Date(`1970-01-01T${data.startTime}:00Z`);
  const endTime = /* @__PURE__ */ new Date(`1970-01-01T${data.endTime}:00Z`);
  return await prisma.$transaction(
    async (tx) => {
      const tutorCategory = await tx.tutorCategory.findUnique({
        where: { id: data.tutorCategoryId },
        include: { tutorProfile: true }
      });
      if (!tutorCategory) {
        throw new Error("Tutor Category not found");
      }
      const tutorProfileId = tutorCategory.tutorProfileId;
      if (tutorCategory.tutorProfile.status !== "APPROVED") {
        throw new Error("Tutor is not approved");
      }
      const dayOfWeek = await sessionDate.toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "UTC"
      }).toUpperCase();
      const availability = await tx.availabilitySlot.findFirst({
        where: {
          tutorProfileId,
          dayOfWeek,
          isActive: true,
          startDate: { lte: sessionDate },
          endDate: { gte: sessionDate },
          startTime: { lte: startTime },
          endTime: { gte: endTime }
        }
      });
      if (!availability) {
        throw new Error("Selected time is not available");
      }
      const overLappingBooking = await tx.booking.findFirst({
        where: {
          tutorCategoryId: data.tutorCategoryId,
          sessionDate,
          status: { in: ["PENDING", "CONFIRMED"] },
          startTime: { lt: endTime },
          endTime: { gt: startTime }
        }
      });
      if (overLappingBooking) {
        throw new Error("This time slot is already booked");
      }
      const durationInMs = endTime.getTime() - startTime.getTime();
      const durationInHours = durationInMs / (1e3 * 60 * 60);
      const totalPrice = Number(
        tutorCategory.hourlyRate * durationInHours
      ).toFixed(2);
      const booking = await tx.booking.create({
        data: {
          studentId,
          tutorCategoryId: data.tutorCategoryId,
          sessionDate,
          startTime,
          endTime,
          price: parseFloat(totalPrice),
          status: "PENDING"
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      return booking;
    },
    {
      timeout: 15e3
    }
  );
};
var mySessions = async (studentId) => {
  return await prisma.booking.findMany({
    where: { studentId },
    include: {
      tutorCategory: {
        include: {
          subject: true,
          tutorProfile: {
            select: {
              id: true,
              userId: true,
              bio: true,
              totalReviews: true,
              averageRating: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      },
      review: true
    }
  });
};
var upCommingSession = async (userId) => {
  const today = /* @__PURE__ */ new Date();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  const where = {
    sessionDate: { gte: today },
    status: "CONFIRMED"
  };
  if (user?.role === "STUDENT") {
    where.studentId = userId;
  } else if (user?.role === "TUTOR") {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId },
      select: { id: true }
    });
    where.tutorCategory = {
      tutorProfileId: tutorProfile?.id
    };
  }
  return await prisma.booking.findMany({
    where,
    include: {
      tutorCategory: {
        include: {
          tutorProfile: {
            include: { user: true }
            // ✅ include tutor name
          },
          subject: true
        }
      },
      student: true
      // ✅ include student info for tutor view
    },
    orderBy: {
      sessionDate: "asc"
      // ✅ nearest first
    }
  });
};
var teachingSession = async (userId, {
  status,
  startDate,
  endDate,
  page,
  limit,
  skip,
  sortBy,
  sortOrder
}) => {
  const andConditions = [];
  if (status) {
    andConditions.push({
      status
    });
  }
  if (startDate || endDate) {
    andConditions.push({
      sessionDate: {
        ...startDate && { gte: new Date(startDate) },
        ...endDate && { lte: new Date(endDate) }
      }
    });
  }
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
    select: { id: true }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  const booking = await prisma.booking.findMany({
    take: limit,
    skip,
    where: {
      tutorCategory: {
        tutorProfileId: tutorProfile.id
      },
      AND: andConditions
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      tutorCategory: {
        include: {
          subject: true,
          tutorProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      [sortBy]: sortOrder
    }
  });
  const total = await prisma.booking.count({
    where: {
      tutorCategory: {
        tutorProfileId: tutorProfile.id
      },
      AND: andConditions
    }
  });
  return {
    data: booking,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getAllBooking = async ({
  status,
  studentId,
  tutorId,
  subjectSlug,
  startDate,
  endDate,
  minPrice,
  maxPrice,
  page,
  limit,
  skip,
  sortBy,
  sortOrder
}) => {
  const andConditions = [];
  if (status) {
    andConditions.push({
      status
    });
  }
  if (studentId) {
    andConditions.push({
      studentId
    });
  }
  if (tutorId) {
    andConditions.push({
      tutorCategory: {
        tutorProfileId: tutorId
      }
    });
  }
  if (subjectSlug) {
    andConditions.push({
      tutorCategory: {
        subject: {
          slug: subjectSlug
        }
      }
    });
  }
  if (startDate || endDate) {
    andConditions.push({
      sessionDate: {
        ...startDate && { gte: new Date(startDate) },
        ...endDate && { lte: new Date(endDate) }
      }
    });
  }
  if (minPrice || maxPrice) {
    andConditions.push({
      price: {
        gte: minPrice ?? 0,
        lte: maxPrice ?? 999999
      }
    });
  }
  const booking = await prisma.booking.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions
    },
    orderBy: {
      [sortBy]: sortOrder
    },
    include: {
      student: true,
      tutorCategory: {
        include: {
          subject: true,
          tutorProfile: {
            include: {
              user: true
            }
          }
        }
      }
    }
  });
  const total = await prisma.booking.count({
    where: {
      AND: andConditions
    }
  });
  return {
    data: booking,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var bookingStatus = async (bookingId, rawData) => {
  const data = bookingStatusSchema.parse(rawData);
  const updateData = { status: data.status };
  if (data.meetingLink !== void 0) {
    updateData.meetingLink = data.meetingLink;
  }
  return await prisma.booking.update({
    where: { id: bookingId },
    data: updateData
  });
};
var BookingService = {
  createBooking,
  mySessions,
  upCommingSession,
  teachingSession,
  getAllBooking,
  bookingStatus
};

// src/modules/booking/booking.controller.ts
var createBooking2 = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
  const studentId = user?.id;
  try {
    const result = await BookingService.createBooking(studentId, req.body);
    res.status(200).json({
      success: true,
      message: "Booking created successfully",
      data: result
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
var mySessions2 = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
  const studentId = user?.id;
  try {
    const result = await BookingService.mySessions(studentId);
    res.status(200).json({
      success: true,
      message: "My Sessions are retrived successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var upcomingSession = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const result = await BookingService.upCommingSession(userId);
    res.status(200).json({
      success: true,
      message: "Upcoming Sessions are retrieved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var teachingSession2 = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
  const userId = user?.id;
  try {
    const { status, startDate, endDate } = req.query;
    const bookingStatus3 = status;
    const startDateQuery = startDate;
    const endDateQuery = endDate;
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper_default(req.query);
    const result = await BookingService.teachingSession(userId, {
      status: bookingStatus3,
      startDate: startDateQuery,
      endDate: endDateQuery,
      page,
      limit,
      skip,
      sortBy,
      sortOrder
    });
    res.status(200).json({
      success: true,
      message: "Teaching Sessions retrived successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getAllBooking2 = async (req, res, next) => {
  try {
    const {
      status,
      studentId,
      tutorId,
      subject,
      startDate,
      endDate,
      minPrice,
      maxPrice
    } = req.query;
    const bookingStatus3 = status;
    const studentIdQuery = studentId;
    const tutorIdQuery = tutorId;
    const subjectQuery = subject;
    const startDateQuery = startDate;
    const endDateQuery = endDate;
    const minPriceQuery = minPrice ? parseFloat(minPrice) : void 0;
    const maxPriceQuery = maxPrice ? parseFloat(maxPrice) : void 0;
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper_default(req.query);
    const result = await BookingService.getAllBooking({
      status: bookingStatus3,
      studentId: studentIdQuery,
      tutorId: tutorIdQuery,
      subjectSlug: subjectQuery,
      startDate: startDateQuery,
      endDate: endDateQuery,
      minPrice: minPriceQuery,
      maxPrice: maxPriceQuery,
      page,
      limit,
      skip,
      sortBy,
      sortOrder
    });
    res.status(200).json({
      success: true,
      message: "All booking retrived successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var bookingStatus2 = async (req, res, next) => {
  const { id } = req.params;
  const { status, meetingLink } = req.body;
  try {
    const result = await BookingService.bookingStatus(id, {
      status,
      meetingLink
    });
    res.status(200).json({
      success: true,
      message: "Booking Status Updated Successfully!",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var bookingController = {
  createBooking: createBooking2,
  mySessions: mySessions2,
  upcomingSession,
  teachingSession: teachingSession2,
  getAllBooking: getAllBooking2,
  bookingStatus: bookingStatus2
};

// src/modules/booking/booking.routes.ts
var bookingRoutes = Router5();
bookingRoutes.post(
  "/create",
  checkAuth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  checkBanStatus_default,
  bookingController.createBooking
);
bookingRoutes.get(
  "/my-sessions",
  checkAuth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  bookingController.mySessions
);
bookingRoutes.get(
  "/upcoming",
  checkAuth("STUDENT" /* STUDENT */, "ADMIN" /* ADMIN */, "TUTOR" /* TUTOR */),
  bookingController.upcomingSession
);
bookingRoutes.get(
  "/teaching",
  checkAuth("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  bookingController.teachingSession
);
bookingRoutes.get(
  "/getAllBooking",
  checkAuth("ADMIN" /* ADMIN */),
  bookingController.getAllBooking
);
bookingRoutes.patch(
  "/:id/status",
  checkAuth("ADMIN" /* ADMIN */, "TUTOR" /* TUTOR */),
  bookingController.bookingStatus
);
var booking_routes_default = bookingRoutes;

// src/modules/payment/payment.routes.ts
import { Router as Router6 } from "express";
var router2 = Router6();
router2.post(
  "/checkout/:bookingId",
  checkAuth("STUDENT" /* STUDENT */),
  PaymentController.createCheckoutSession
);
router2.post(
  "/refund/:bookingId",
  checkAuth("STUDENT" /* STUDENT */, "ADMIN" /* ADMIN */),
  PaymentController.refundPayment
);
var PaymentRoutes = router2;

// src/modules/review/review.routes.ts
import { Router as Router7 } from "express";

// src/modules/review/review.validation.ts
import { z as z4 } from "zod";
var createReviewSchema = z4.object({
  bookingId: z4.string().min(1, "bookingId is required"),
  rating: z4.number({ error: "Rating is required" }).int("Rating must be a whole number").min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  comment: z4.string().max(1e3, "Comment must be under 1000 characters").optional()
});

// src/modules/review/review.service.ts
var createReview = async (studentId, rawData) => {
  const reviewData = createReviewSchema.parse(rawData);
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: reviewData.bookingId },
      include: {
        tutorCategory: {
          include: { tutorProfile: true }
        }
      }
    });
    const existingReview = await tx.review.findUnique({
      where: {
        bookingId: reviewData.bookingId
      }
    });
    if (existingReview) {
      throw new Error("You have already reviewed this session");
    }
    if (!booking) {
      throw new Error("Booking not found");
    }
    if (booking?.studentId !== studentId) {
      throw new Error("You are not allowed to review this booking");
    }
    if (booking.status !== "COMPLETED") {
      throw new Error("You can only review completed sessions");
    }
    const tutorProfileId = booking.tutorCategory.tutorProfileId;
    const review = await tx.review.create({
      data: {
        bookingId: reviewData.bookingId,
        studentId,
        tutorProfileId,
        rating: reviewData.rating,
        comment: reviewData.comment ?? null
      }
    });
    const stats = await tx.review.aggregate({
      where: { tutorProfileId },
      _avg: {
        rating: true
      },
      _count: {
        rating: true
      }
    });
    await tx.tutorProfile.update({
      where: { id: tutorProfileId },
      data: {
        totalReviews: stats._count.rating,
        averageRating: stats._avg.rating ?? 0
      }
    });
    const reviewWithRelations = await tx.review.findUnique({
      where: { id: review.id },
      include: {
        student: {
          select: {
            id: true,
            name: true
          }
        },
        tutorProfile: true,
        booking: true
      }
    });
    return reviewWithRelations;
  });
};
var getTutorReviews = async (tutorProfileId) => {
  return await prisma.review.findMany({
    where: { tutorProfileId },
    include: {
      student: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};
var getMyReviews = async (studentId) => {
  return prisma.review.findMany({
    where: { studentId },
    include: {
      tutorProfile: true,
      booking: {
        include: {
          tutorCategory: {
            include: {
              subject: true
              // ✅ brings in subject name
            }
          }
        }
      }
    }
  });
};
var deleteReview = async (reviewId, role, userId, targetStudentId) => {
  return await prisma.$transaction(async (tx) => {
    const review = await tx.review.findUnique({
      where: { id: reviewId },
      include: {
        tutorProfile: true
      }
    });
    if (!review) throw new Error("Review not found");
    if (role === "ADMIN") {
    } else if (role === "TUTOR") {
      if (review.studentId === userId) {
      } else {
        const tutorProfile = await tx.tutorProfile.findUnique({
          where: { userId },
          select: {
            id: true,
            userId: true
          }
        });
        if (!tutorProfile || review.tutorProfileId !== tutorProfile.id) {
          throw new Error(
            "You can only delete reviews on your own profile"
          );
        }
        if (targetStudentId && review.studentId !== targetStudentId) {
          throw new Error(
            "This review was not written by that student"
          );
        }
      }
    } else {
      if (review.studentId !== userId) {
        throw new Error("You are not allowed to delete this review");
      }
    }
    await tx.review.delete({ where: { id: reviewId } });
    const stats = await tx.review.aggregate({
      where: { tutorProfileId: review.tutorProfileId },
      _avg: { rating: true },
      _count: { rating: true }
    });
    await tx.tutorProfile.update({
      where: { id: review.tutorProfileId },
      data: {
        totalReviews: stats._count.rating,
        averageRating: stats._avg.rating ?? 0
      }
    });
  });
};
var reviewService = {
  createReview,
  getTutorReviews,
  getMyReviews,
  deleteReview
};

// src/modules/review/review.controller.ts
var createReview2 = async (req, res, next) => {
  const { bookingId, rating, comment } = req.body;
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
  const studentId = user?.id;
  try {
    const result = await reviewService.createReview(studentId, {
      bookingId,
      rating,
      comment
    });
    res.status(200).json({
      success: true,
      message: "Review Created Successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getReviewsByTutorProfileId = async (req, res, next) => {
  try {
    const { tutorProfileId } = req.params;
    if (!tutorProfileId) {
      return res.status(400).json({
        success: false,
        message: "Tutor Profile ID is required"
      });
    }
    const result = await reviewService.getTutorReviews(
      tutorProfileId
    );
    res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getMyReviews2 = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const studentId = user?.id;
    const result = await reviewService.getMyReviews(studentId);
    res.status(200).json({
      success: true,
      message: "My reviews retrived successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var deleteReview2 = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const { reviewId } = req.params;
    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required"
      });
    }
    await reviewService.deleteReview(
      reviewId,
      user.role,
      user.id,
      // 👈 always from token
      req.query.targetStudentId
    );
    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
var reviewController = {
  createReview: createReview2,
  getReviewsByTutorProfileId,
  getMyReviews: getMyReviews2,
  deleteReview: deleteReview2
};

// src/modules/review/review.routes.ts
var reviewRoutes = Router7();
reviewRoutes.post(
  "/create",
  checkAuth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  checkBanStatus_default,
  reviewController.createReview
);
reviewRoutes.get(
  "/my",
  checkAuth("STUDENT" /* STUDENT */, "ADMIN" /* ADMIN */, "TUTOR" /* TUTOR */),
  reviewController.getMyReviews
);
reviewRoutes.get(
  "/:tutorProfileId",
  reviewController.getReviewsByTutorProfileId
);
reviewRoutes.delete(
  "/:reviewId/",
  checkAuth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  checkBanStatus_default,
  reviewController.deleteReview
);
var review_routes_default = reviewRoutes;

// src/modules/subject/subject.routes.ts
import { Router as Router8 } from "express";

// src/modules/subject/subject.service.ts
var createSubject = async (subject) => {
  const subjectSlug = subject.toLowerCase().replace(/\s+/g, "-");
  return await prisma.subject.create({
    data: {
      name: subject,
      slug: subjectSlug
    }
  });
};
var getAllSubjects = async () => {
  return await prisma.subject.findMany();
};
var updateSubject = async (id, subject) => {
  const subjectSlug = subject.toLowerCase().replace(/\s+/g, "-");
  return await prisma.subject.update({
    where: {
      id
    },
    data: {
      name: subject,
      slug: subjectSlug
    }
  });
};
var deleteSubject = async (id) => {
  return await prisma.subject.delete({
    where: { id }
  });
};
var SubjectService = {
  createSubject,
  getAllSubjects,
  updateSubject,
  deleteSubject
};

// src/modules/subject/subject.controller.ts
var createSubject2 = async (req, res, next) => {
  try {
    const { subject } = req.body;
    const result = await SubjectService.createSubject(subject);
    res.status(200).json({
      success: true,
      message: "Subject Created Successfully!",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getAllSubjects2 = async (req, res, next) => {
  try {
    const result = await SubjectService.getAllSubjects();
    res.status(200).json({
      success: true,
      message: "Subjects Retrived Successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var updateSubject2 = async (req, res, next) => {
  const { id } = req.params;
  try {
    const { subject } = req.body;
    if (!subject) {
      throw new Error("Subject field must be required");
    }
    const result = await SubjectService.updateSubject(
      id,
      subject
    );
    res.status(200).json({
      success: true,
      message: "Subject Updated Successfully",
      data: result
    });
  } catch (error) {
    if (error instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error(
          `Subject with ID '${id}' not found. Cannot update non-existent record.`
        );
      }
    }
    next(error);
  }
};
var deleteSubject2 = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await SubjectService.deleteSubject(id);
    res.status(200).json({
      success: true,
      message: "Subject deleted Successfully!",
      data: result
    });
  } catch (error) {
    if (error instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error(
          `Subject with ID '${id}' not found. Cannot delete non-existent record.`
        );
      }
    }
    next(error);
  }
};
var SubjectController = {
  createSubject: createSubject2,
  getAllSubjects: getAllSubjects2,
  updateSubject: updateSubject2,
  deleteSubject: deleteSubject2
};

// src/modules/subject/subject.routes.ts
var subjectRoutes = Router8();
subjectRoutes.post(
  "/create",
  checkAuth("ADMIN" /* ADMIN */),
  SubjectController.createSubject
);
subjectRoutes.get("/getAllSubjects", SubjectController.getAllSubjects);
subjectRoutes.patch(
  "/update/:id",
  checkAuth("ADMIN" /* ADMIN */),
  SubjectController.updateSubject
);
subjectRoutes.delete(
  "/delete/:id",
  checkAuth("ADMIN" /* ADMIN */),
  SubjectController.deleteSubject
);
var subject_routes_default = subjectRoutes;

// src/modules/tutor/tutor.routes.ts
import { Router as Router9 } from "express";

// src/modules/tutor/tutor.validation.ts
import { z as z5 } from "zod";
var createTeachingSessionSchema = z5.object({
  subjectName: z5.string({ error: "Subject name is required" }).trim().min(1, "Subject name is required").max(100, "Subject name must be under 100 characters"),
  hourlyRate: z5.number({ error: "Hourly rate is required" }).positive("Hourly rate must be greater than 0"),
  experienceYears: z5.number({ error: "Experience years is required" }).int("Experience years must be a whole number").min(0, "Experience years cannot be negative"),
  level: z5.enum(TutorLevel, {
    error: `Level must be one of: ${Object.values(TutorLevel).join(", ")}`
  }),
  bio: z5.string().max(2e3, "Bio must be under 2000 characters").optional(),
  isPrimary: z5.boolean().optional()
});
var updateTeachingSessionSchema = z5.object({
  hourlyRate: z5.number().positive("Hourly rate must be greater than 0").optional(),
  experienceYears: z5.number().int("Experience years must be a whole number").min(0, "Experience years cannot be negative").optional(),
  level: z5.enum(TutorLevel, {
    error: `Level must be one of: ${Object.values(TutorLevel).join(", ")}`
  }).optional(),
  description: z5.string().max(2e3, "Description must be under 2000 characters").optional(),
  isPrimary: z5.boolean().optional()
}).refine((data) => Object.values(data).some((v) => v !== void 0), {
  message: "At least one field must be provided",
  path: ["_general"]
});

// src/modules/tutor/tutor.service.ts
var createTutorProfile = async (data, userId) => {
  const profile = await prisma.tutorProfile.create({
    data: {
      ...data,
      userId,
      status: "PENDING"
    },
    include: {
      user: true
    }
  });
  return profile;
};
var createTeachingSession = async (userId, rawData) => {
  const data = createTeachingSessionSchema.parse(rawData);
  const slug = data.subjectName.toLowerCase().trim().replace(/\s+/g, "-");
  return await prisma.$transaction(async (tx) => {
    const subject = await tx.subject.upsert({
      where: { slug },
      update: {},
      create: {
        name: data.subjectName,
        slug
      }
    });
    const getTutorProfile = await tx.tutorProfile.findUnique({
      where: {
        userId
      }
    });
    if (!getTutorProfile) {
      throw new Error("Tutor profile not found for the user");
    }
    const TutorCategory = await tx.tutorCategory.create({
      data: {
        tutorProfileId: getTutorProfile.id,
        subjectId: subject.id,
        hourlyRate: data.hourlyRate,
        experienceYears: data.experienceYears,
        level: data.level,
        description: data.bio || "",
        isPrimary: data.isPrimary || false
      },
      include: {
        subject: true,
        tutorProfile: {
          include: {
            user: true
          }
        }
      }
    });
    return TutorCategory;
  });
};
var getTeachingSession = async (userId) => {
  const tutorid = await prisma.tutorProfile.findUnique({
    where: {
      userId
    }
  });
  if (!tutorid) {
    throw new Error("Tutor profile not found for the user");
  }
  const result = await prisma.tutorCategory.findMany({
    where: {
      tutorProfileId: tutorid?.id
    },
    include: {
      subject: true
    }
  });
  return result;
};
var getAllTutors = async ({
  search,
  subjectSlug,
  minPrice,
  maxPrice,
  minRating,
  page,
  limit,
  skip,
  sortBy,
  sortOrder,
  status,
  role,
  isVerified
}) => {
  const andConditions = [];
  if (role === "ADMIN") {
    if (status) {
      andConditions.push({
        status
      });
    }
    if (typeof isVerified === "boolean") {
      andConditions.push({
        isVerified
      });
    }
  } else {
    andConditions.push({
      status: "APPROVED",
      isVerified: true,
      tutorCategories: {
        // ✅ must have at least one category
        some: {}
      }
    });
  }
  if (search) {
    andConditions.push({
      OR: [
        {
          bio: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          user: {
            name: {
              contains: search,
              mode: "insensitive"
            }
          }
        },
        {
          user: {
            email: {
              contains: search,
              mode: "insensitive"
            }
          }
        }
      ]
    });
  }
  if (subjectSlug) {
    andConditions.push({
      tutorCategories: {
        some: {
          subject: {
            slug: subjectSlug
          }
        }
      }
    });
  }
  if (minPrice || maxPrice) {
    andConditions.push({
      tutorCategories: {
        some: {
          hourlyRate: {
            gte: minPrice ?? 0,
            lte: maxPrice ?? 999999
          }
        }
      }
    });
  }
  if (minRating) {
    andConditions.push({
      averageRating: {
        gte: minRating
      }
    });
  }
  const tutors = await prisma.tutorProfile.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions
    },
    orderBy: {
      [sortBy]: sortOrder
    },
    include: {
      user: true,
      tutorCategories: {
        include: {
          subject: true
        }
      }
    }
  });
  const total = await prisma.tutorProfile.count({
    where: {
      AND: andConditions
    }
  });
  return {
    data: tutors,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var approveTutorProfile = async (status, tutorProfileId, adminId) => {
  const updatedProfile = await prisma.$transaction(async (tx) => {
    const profile = await tx.tutorProfile.update({
      where: { id: tutorProfileId },
      data: {
        status,
        isVerified: status === "APPROVED"
      },
      include: {
        user: true
      }
    });
    if (status === "APPROVED" && profile.user.role !== "ADMIN") {
      await tx.user.update({
        where: { id: profile.userId },
        data: {
          role: "TUTOR"
        }
      });
    }
    await tx.adminLog.create({
      data: {
        adminId,
        action: "APPROVE_TUTOR",
        targetId: tutorProfileId
      }
    });
    if (status === "APPROVED" && profile.user.role !== "ADMIN") {
      profile.user.role = "TUTOR";
    }
    return profile;
  });
  return updatedProfile;
};
var getTutorProfileByUserId = async (userId) => {
  const profile = await prisma.tutorProfile.findUnique({
    where: { userId },
    include: {
      tutorCategories: {
        include: {
          subject: true
        }
      },
      user: true
    }
  });
  return profile;
};
var getTutorProfileById = async (id) => {
  return prisma.tutorProfile.findUnique({
    where: { id },
    include: {
      user: true,
      tutorCategories: {
        include: {
          subject: true
        }
      },
      reviews: {
        include: {
          student: {
            select: {
              id: true,
              name: true
            }
          },
          booking: {
            select: {
              tutorCategory: {
                select: {
                  subject: { select: { name: true } }
                  // ✅ brings in subject name
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });
};
var updateTutorProfile = async (tutorProfileId, bio) => {
  const updatedProfile = await prisma.tutorProfile.update({
    where: { id: tutorProfileId },
    data: {
      ...bio !== void 0 && { bio }
    }
  });
  return updatedProfile;
};
var updateTeachingSession = async (tutorSessionId, rawData) => {
  const data = updateTeachingSessionSchema.parse(rawData);
  return await prisma.tutorCategory.update({
    where: { id: tutorSessionId },
    data: {
      ...data.hourlyRate !== void 0 && {
        hourlyRate: data.hourlyRate
      },
      ...data.experienceYears !== void 0 && {
        experienceYears: data.experienceYears
      },
      ...data.level !== void 0 && { level: data.level },
      ...data.description !== void 0 && {
        description: data.description
      },
      ...data.isPrimary !== void 0 && { isPrimary: data.isPrimary }
    },
    include: {
      subject: true,
      tutorProfile: {
        include: {
          user: true
        }
      }
    }
  });
};
var deleteTeachingSession = async (tutorSessionId) => {
  return await prisma.tutorCategory.delete({
    where: { id: tutorSessionId }
  });
};
var TutorService = {
  createTutorProfile,
  createTeachingSession,
  approveTutorProfile,
  getAllTutors,
  getTutorProfileByUserId,
  getTutorProfileById,
  getTeachingSession,
  updateTutorProfile,
  updateTeachingSession,
  deleteTeachingSession
};

// src/modules/tutor/tutor.controller.ts
var getAllTutors2 = async (req, res) => {
  try {
    const { search, subject, minPrice, maxPrice, minRating } = req.query;
    const searchString = typeof search === "string" ? search : void 0;
    const status = req.query.status || void 0;
    const isVerified = req.query.isVerified === "true" ? true : req.query.isVerified === "false" ? false : void 0;
    const role = req.user?.role;
    const subjectSlug = typeof subject === "string" ? subject : void 0;
    const minPriceNumber = minPrice ? Number(minPrice) : void 0;
    const maxPriceNumber = maxPrice ? Number(maxPrice) : void 0;
    const minRatingNumber = minRating ? Number(minRating) : void 0;
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper_default(req.query);
    const result = await TutorService.getAllTutors({
      search: searchString,
      subjectSlug,
      minPrice: minPriceNumber,
      maxPrice: maxPriceNumber,
      minRating: minRatingNumber,
      limit,
      page,
      skip,
      sortBy,
      sortOrder,
      status,
      role,
      isVerified
    });
    return res.status(200).json({
      success: true,
      message: "All tutors retrieved successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tutors"
    });
    console.error(error);
  }
};
var getTutorProfileByUserId2 = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).json({
      error: "Unauthorized"
    });
  }
  try {
    const profile = await TutorService.getTutorProfileByUserId(user.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found."
      });
    }
    if (profile.status === "PENDING" && !profile.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Your tutor profile is pending verification."
      });
    }
    if (profile.status === "REJECTED") {
      return res.status(400).json({
        success: false,
        message: "Your tutor profile application has been rejected. Please review your profile and reapply."
      });
    }
    return res.status(200).json({
      success: true,
      message: "Tutor profile retrieved successfully",
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tutor profile"
    });
    console.error(error);
  }
};
var getTutorProfileById2 = async (req, res) => {
  const { tutorProfileId } = req.params;
  try {
    const profile = await TutorService.getTutorProfileById(
      tutorProfileId
    );
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found"
      });
    }
    if (profile.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Tutor profile is not publicly available"
      });
    }
    return res.status(200).json({
      success: true,
      message: "Tutor profile retrieved successfully",
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tutor profile"
    });
  }
};
var getTeachingSession2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const result = await TutorService.getTeachingSession(userId);
    return res.status(200).json({
      success: true,
      message: "Teaching session retrieved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var createTutorProfile2 = async (req, res, next) => {
  const user = req.user;
  try {
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized"
      });
    }
    const result = await TutorService.createTutorProfile(
      { bio: req.body.bio },
      user.id
      // {
      //     subjectName: req.body.subjectName,
      //     hourlyRate: req.body.hourlyRate,
      //     experienceYears: req.body.experienceYears,
      //     level: req.body.level,
      // },
    );
    return res.status(200).json({
      success: true,
      message: "Tutor profile created successfully. You will get email once your profile is verified.",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var createTeachingSession2 = async (req, res, next) => {
  try {
    const {
      subjectName,
      hourlyRate,
      experienceYears,
      level,
      bio,
      isPrimary
    } = req.body;
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized"
      });
    }
    const result = await TutorService.createTeachingSession(user.id, {
      subjectName,
      hourlyRate,
      experienceYears,
      level,
      bio,
      isPrimary
    });
    res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var approveTutorProfile2 = async (req, res) => {
  const { tutorProfileId, status } = req.body;
  const profileStatus = status.toUpperCase();
  const adminId = req.user;
  if (!adminId) {
    return res.status(400).json({
      error: "Unauthorized"
    });
  }
  try {
    const updatedProfile = await TutorService.approveTutorProfile(
      status.toUpperCase(),
      tutorProfileId,
      adminId.id
    );
    let subject = "";
    let html = "";
    if (profileStatus === "APPROVED") {
      subject = "Your Tutor Profile Has Been Approved \u{1F389}";
      html = `
                <h1>Hello, ${updatedProfile.user.name}!</h1>
                <p>Congratulations! Your tutor profile has been <b>approved</b>.</p>
                <p>You can now start receiving bookings from students.</p>
                <br />
                <a href="${process.env.FRONTEND_URL}/dashboard">
                Go to Dashboard
                </a>
            `;
    }
    if (profileStatus === "REJECTED") {
      subject = "Your Tutor Profile Application Status";
      html = `
                <h1>Hello, ${updatedProfile.user.name}!</h1>
                <p>We regret to inform you that your tutor profile has been <b>rejected</b>.</p>
                <p>Please review your profile information and reapply.</p>
                <br />
                <a href="${process.env.FRONTEND_URL}/support">
                Contact Support
                </a>
            `;
    }
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: updatedProfile.user.email,
      subject,
      html
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email failed to send:", error);
      } else {
        console.log("Approval email sent: ", info.response);
      }
    });
    res.status(200).json({
      message: `Tutor ${status.toLowerCase()} successfully and notification email sent.`,
      data: updatedProfile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to approve tutor"
    });
  }
};
var updateTutorProfile2 = async (req, res, next) => {
  try {
    const { bio, tutorProfileId } = req.body;
    const updatedProfile = await TutorService.updateTutorProfile(
      tutorProfileId,
      bio
    );
    res.status(200).json({
      success: true,
      message: "Tutor profile updated successfully",
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};
var updateTeachingSession2 = async (req, res, next) => {
  const { tutorSessionId } = req.params;
  try {
    const { hourlyRate, experienceYears, level, description, isPrimary } = req.body;
    if (!tutorSessionId) {
      return res.status(400).json({
        success: false,
        message: "Tutor session ID is required"
      });
    }
    const updatedSession = await TutorService.updateTeachingSession(
      tutorSessionId,
      {
        hourlyRate: hourlyRate ? Number(hourlyRate) : void 0,
        experienceYears: experienceYears ? Number(experienceYears) : void 0,
        level,
        description,
        isPrimary
      }
    );
    res.status(200).json({
      success: true,
      message: "Teaching session updated successfully",
      data: updatedSession
    });
  } catch (error) {
    next(error);
  }
};
var deleteTeachingSession2 = async (req, res) => {
  try {
    const { tutorSessionId } = req.params;
    if (!tutorSessionId) {
      return res.status(400).json({
        success: false,
        message: "Tutor session ID is required"
      });
    }
    await TutorService.deleteTeachingSession(tutorSessionId);
    res.status(200).json({
      success: true,
      message: "Teaching session deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete teaching session"
    });
  }
};
var TutorController = {
  createTutorProfile: createTutorProfile2,
  createTeachingSession: createTeachingSession2,
  getAllTutors: getAllTutors2,
  getTutorProfileById: getTutorProfileById2,
  approveTutorProfile: approveTutorProfile2,
  getTutorProfileByUserId: getTutorProfileByUserId2,
  getTeachingSession: getTeachingSession2,
  updateTutorProfile: updateTutorProfile2,
  updateTeachingSession: updateTeachingSession2,
  deleteTeachingSession: deleteTeachingSession2
};

// src/modules/tutor/tutor.routes.ts
var tutorRoutes = Router9();
tutorRoutes.get("/getAllTutors", TutorController.getAllTutors);
tutorRoutes.get(
  "/getAllTutors/admin",
  checkAuth("ADMIN" /* ADMIN */),
  TutorController.getAllTutors
);
tutorRoutes.get(
  "/getMyProfile",
  checkAuth("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  TutorController.getTutorProfileByUserId
);
tutorRoutes.get(
  "/getTeachingSession",
  checkAuth("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  TutorController.getTeachingSession
);
tutorRoutes.get("/:tutorProfileId", TutorController.getTutorProfileById);
tutorRoutes.post(
  "/create",
  checkAuth("ADMIN" /* ADMIN */, "STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */),
  checkBanStatus_default,
  TutorController.createTutorProfile
);
tutorRoutes.post(
  "/createTeachingSession",
  checkAuth("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  checkBanStatus_default,
  TutorController.createTeachingSession
);
tutorRoutes.patch(
  "/approve",
  checkAuth("ADMIN" /* ADMIN */),
  TutorController.approveTutorProfile
);
tutorRoutes.put(
  "/updateTutorProfile",
  checkAuth("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  TutorController.updateTutorProfile
);
tutorRoutes.put(
  "/updateTeachingSession/:tutorSessionId",
  checkAuth("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  checkBanStatus_default,
  TutorController.updateTeachingSession
);
tutorRoutes.delete(
  "/deleteTeachingSession/:tutorSessionId",
  checkAuth("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  TutorController.deleteTeachingSession
);
var tutor_routes_default = tutorRoutes;

// src/routes/index.ts
var routes = Router10();
var moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes
  },
  {
    path: "/tutor",
    route: tutor_routes_default
  },
  {
    path: "/availability",
    route: availability_routes_default
  },
  {
    path: "/booking",
    route: booking_routes_default
  },
  {
    path: "/subject",
    route: subject_routes_default
  },
  {
    path: "/review",
    route: review_routes_default
  },
  {
    path: "/admin",
    route: admin_routes_default
  },
  {
    path: "/payments",
    route: PaymentRoutes
  }
];
moduleRoutes.forEach((route) => routes.use(route.path, route.route));
var routes_default = routes;

// src/app.ts
var app = express();
app.set("query parser", (str) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path2.resolve(process.cwd(), `src/app/templates`));
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent
  // rename from handleStripeWebhookEvent
);
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.NODE_ENV === "development" ? "http://localhost:3000" : process.env.FRONTEND_URL,
    credentials: true
    // methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    // allowedHeaders: [["Content-Type", "Authorization", "Cookie"],
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", routes_default);
app.use("/api/v1/users", user_router_default);
app.get("/", async (req, res) => {
  res.status(201).json({
    success: true,
    message: "SkillBridge- Online Tutor Platform"
  });
});
app.use(globalErrorHandler_default);
app.use(notFound);
var app_default = app;

// src/server.ts
var bootstrap = async () => {
  try {
    await prisma.$connect();
    app_default.listen(process.env.PORT || 5e3, () => {
      console.log(
        `Server is running on http://localhost:${process.env.PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};
if (process.env.NODE_ENV !== "production") {
  bootstrap();
}
var server_default = app_default;
export {
  server_default as default
};
//# sourceMappingURL=server.js.map