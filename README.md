# SkillBridge — Tutoring Platform (Backend)

SkillBridge is a backend API for an online tutoring marketplace where students can discover tutors, book sessions, and leave reviews. Tutors can manage teaching sessions and availability, while administrators manage users, tutors, subjects, and bookings.

---

## 🔗 Live URLs

| Resource      | URL                                                     |
| ------------- | ------------------------------------------------------- |
| Backend Live  | `https://skillbridge-backend.vercel.app`                |
| Frontend Live | `https://skillbridge-frontend.vercel.app`               |
| Frontend Repo | `https://github.com/your-username/skillbridge-frontend` |

---

## 🎥 Demo Video

> [Watch Demo on Google Drive](https://drive.google.com/file/d/your-video-id/view)

---

## 🛠️ Tech Stack

| Technology  | Purpose                      |
| ----------- | ---------------------------- |
| Node.js     | Runtime Environment          |
| Express.js  | REST API Framework           |
| PostgreSQL  | Relational Database          |
| Prisma ORM  | Database Access & Migrations |
| TypeScript  | Type Safety                  |
| Better Auth | Authentication               |
| Stripe      | Payment Integration          |

---

## ✨ Core Features

### 🌐 Public

- Browse and search tutors
- Filter tutors by subject and price
- View tutor profiles and reviews

### 🎓 Student

- Register and login
- Book tutoring sessions
- Pay via Stripe
- View upcoming and past sessions
- Leave reviews for completed sessions

### 🧑‍🏫 Tutor

- Create and update tutor profile
- Create teaching sessions with subjects and hourly rates
- Set weekly availability with time slots
- View teaching sessions and statuses
- See ratings and reviews from students

### 🔐 Admin

- View and manage all users
- Ban / unban users
- Approve or reject tutor applications
- Manage subjects
- View all bookings with filters

---

## 📁 Project Structure

```
skillbridge-backend/
├── src/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── tutor/
│   │   │   ├── availability/
│   │   │   ├── booking/
│   │   │   ├── subject/
│   │   │   ├── review/
│   │   │   └── admin/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   └── routes.ts
│   ├── config/
│   ├── generated/
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env
├── package.json
└── tsconfig.json
```

---

## 🌐 Base URL

```
http://localhost:5000/api
```

---

## 🔐 Authentication

Authentication is handled using **Better Auth**.

### Register User

**POST** `/auth/sign-up/email`

```json
{
  "email": "admin@skillbridge.com",
  "password": "admin123",
  "name": "Admin"
}
```

### Login

**POST** `/auth/sign-in/email`

```json
{
  "email": "admin@skillbridge.com",
  "password": "admin123"
}
```

---

## 👨‍🏫 Tutor Module

### Create Tutor Profile

**POST** `/v1/tutor/create`

```json
{
  "bio": "I am a Senior Software Engineer with 10 years of experience."
}
```

### Update Tutor Profile

**PUT** `/v1/tutor/updateTutorProfile`

```json
{
  "tutorProfileId": "a9e6eb81-7bba-4f7e-bbe3-523bbe48d6a5",
  "bio": "Updated tutor profile bio"
}
```

### Get My Tutor Profile

**GET** `/v1/tutor/getMyProfile`

### Get Tutor By ID

**GET** `/v1/tutor/:tutorProfileId`

### Get All Tutors

**GET** `/v1/tutor/getAllTutors`

| Query Parameter | Description           |
| --------------- | --------------------- |
| `page`          | Page number           |
| `limit`         | Results per page      |
| `search`        | Search tutors by name |
| `subject`       | Filter by subject     |
| `minPrice`      | Minimum hourly rate   |
| `maxPrice`      | Maximum hourly rate   |
| `status`        | Tutor approval status |
| `sortBy`        | Sort field            |
| `sortOrder`     | `asc` / `desc`        |

```
GET /v1/tutor/getAllTutors?page=1&search=admin&subject=physics
```

### Admin Get All Tutors

**GET** `/v1/tutor/getAllTutors/admin?status=PENDING`

### Approve Tutor (Admin)

**PATCH** `/v1/tutor/approve`

```json
{
  "tutorProfileId": "a9e6eb81-7bba-4f7e-bbe3-523bbe48d6a5",
  "status": "approved"
}
```

---

## 📚 Teaching Session Module

### Create Teaching Session

**POST** `/v1/tutor/createTeachingSession`

```json
{
  "subjectName": "docker containerization",
  "hourlyRate": 45.5,
  "level": "BEGINNER"
}
```

### Update Teaching Session

**PUT** `/v1/tutor/updateTeachingSession/:sessionId`

```json
{
  "level": "INTERMEDIATE"
}
```

### Delete Teaching Session

**DELETE** `/v1/tutor/deleteTeachingSession/:sessionId`

### Get Tutor Teaching Sessions

**GET** `/v1/tutor/getTeachingSession`

---

## 🗓️ Availability Module

### Create Availability

**POST** `/v1/availability/create`

```json
{
  "startDate": "2026-01-01",
  "endDate": "2026-06-30",
  "slots": [
    {
      "dayOfWeek": "MON",
      "startTime": "18:00",
      "endTime": "20:00"
    },
    {
      "dayOfWeek": "WED",
      "startTime": "16:00",
      "endTime": "18:00"
    }
  ]
}
```

### Update Availability

**PATCH** `/v1/availability/update/:availabilityId`

### Get My Availability

**GET** `/v1/availability/me`

### Get Availability By Tutor Profile

**GET** `/v1/availability/:tutorProfileId`

### Delete Availability

**DELETE** `/v1/availability/delete/:availabilityId`

---

## 📅 Booking Module

### Create Booking

**POST** `/v1/booking/create`

```json
{
  "tutorCategoryId": "001c103f-4ec7-48bc-aab8-00faa455cfe3",
  "sessionDate": "2026-03-16",
  "startTime": "10:00",
  "endTime": "12:00"
}
```

### Get My Sessions

**GET** `/v1/booking/my-sessions`

### Get Upcoming Sessions

**GET** `/v1/booking/upcoming`

### Update Booking Status

**PATCH** `/v1/booking/:bookingId/status`

```json
{
  "status": "COMPLETED",
  "meetingLink": "link.google-meet.com"
}
```

### Tutor Teaching Sessions

**GET** `/v1/booking/teaching?status=PENDING`

### Admin Get All Bookings

**GET** `/v1/booking/getAllBooking`

```
GET /v1/booking/getAllBooking?status=CANCELLED&page=1&limit=10
```

---

## 🏷️ Subject Module (Admin)

### Get All Subjects

**GET** `/v1/subject/getAllSubjects`

### Create Subject

**POST** `/v1/subject/create`

```json
{
  "subject": "docker containerization"
}
```

### Update Subject

**PATCH** `/v1/subject/update/:subjectId`

### Delete Subject

**DELETE** `/v1/subject/delete/:subjectId`

---

## ⭐ Review Module

### Create Review

**POST** `/v1/review/create`

```json
{
  "bookingId": "booking-uuid-here",
  "rating": 3,
  "comment": "I like this teacher"
}
```

### Get Reviews By Tutor

**GET** `/v1/review/:tutorProfileId`

### Get My Reviews

**GET** `/v1/review/my`

---

## 👑 Admin Module

### Get All Users

**GET** `/v1/admin/users`

```
GET /v1/admin/users?limit=10&page=1&search=email
```

### Ban / Unban User

**PATCH** `/v1/admin/users/:userId/status`

```json
{
  "status": "BANNED"
}
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/skillbridge-backend.git

# Navigate to project directory
cd skillbridge-backend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/skillbridge
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:5000
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
PORT=5000
NODE_ENV=development
```

### Database Setup

```bash
# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# (Optional) Seed the database
npx prisma db seed
```

### Run the Development Server

```bash
npm run dev
```

Server will start at `http://localhost:5000`

### Build for Production

```bash
npm run build
npm start
```

---

## 🧪 Admin Credentials (Demo)

```
Email    : admin@skillbridge.com
Password : admin123
```

---

## 📦 Deployment

The backend is deployed on **Vercel / Render / Railway**.

Make sure to set all environment variables in your deployment platform's settings before deploying.

---

## 📋 Assignment Submission

```

```

---

## 📄 License

This project is for educational purposes as part of **Batch 6 — Assignment 5**.
