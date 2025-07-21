# TaskFlow - Smart Task Management System

TaskFlow is a modern, feature-rich task management application designed to help users achieve their goals through disciplined task organization and tracking. Built with cutting-edge technologies, it offers a seamless experience for managing daily, weekly, and monthly tasks, as well as a dedicated space for personal notes.

## 🌟 Key Features

### 1. Smart Task Management

- **Comprehensive Task Creation**: Create tasks with titles, detailed descriptions, due dates, specific start times, and estimated durations.
- **Visual Organization**: Assign custom icons and colors for quick visual identification and categorization.
- **Prioritization**: Mark tasks as high-priority to keep focus on what matters most.
- **Advanced Scheduling**:
  - **Repeating Tasks**: Define complex repetition rules, including daily/weekly intervals, specific days of the week, or a target number of completions per week.
  - **Manual Rescheduling**: Easily delay tasks, with tracking for how many times a task has been postponed.
- **Status & Progress Tracking**:
  - Monitor task status as `pending`, `completed`, or `delayed`.
  - Set reminders for important deadlines.
- **Gamification & Feedback Loop**:
  - **Experience Points**: Earn points for completing tasks, contributing to your overall progress and unlocking achievements.
  - **Task Experience Rating**: After completing a task, rate your experience (`bad`, `okay`, `good`, `best`) to reflect on your performance and mood.
- **Contextual Details**: Add optional information like location to your tasks.
- **Risk Identification**: The system automatically flags tasks that are at risk of being missed, helping you proactively manage your workload.

### 2. Advanced Tagging & Customization

- **Custom Tags**: Create personalized tags for tasks (e.g., morning routine, gym, personal, health, work).
- **Color Coding**: Custom color palette for visual task organization.
- **Icon Selection**: Choose from a wide range of task icons for better visual organization.

### 3. Advanced Notification System

- **Smart Notifications**: Intelligent, contextual alerts based on task behavior and patterns.
- **Multiple Notification Types**:
  - **Task Alerts**: Overdue, due soon, and at-risk notifications for repeating tasks.
  - **Gamification Alerts**: Streak milestones, achievements unlocked, and weekly performance summaries.
  - **System Alerts**: Important announcements and updates.
- **Priority Levels**: Notifications are categorized as `URGENT`, `HIGH`, `MEDIUM`, or `LOW`, with clear visual indicators.
- **Real-time Inbox**: A central hub for all notifications, featuring:
  - Unread counts broken down by priority and type.
  - Filtering and search capabilities.
  - Archiving and read/unread status management.
- **Automatic Generation & Cleanup**: Notifications are automatically created by system triggers and expired ones are removed to keep the inbox relevant.

### 4. Progress Tracking & Analytics

- **Gamification Engine**:
  - **Streak System**: Tracks current and best streaks for daily task completion, encouraging consistency.
  - **Points System**: Earn reward points for completing tasks, which contribute to unlocking achievements.
  - **Achievements**: Unlock milestones for task completion, consistency, and point accumulation.
- **Performance Metrics**:
  - **Consistency Stats**: View current and best streak lengths in days.
  - **Time Management Stats**: Analyze on-time completion rates and average task delay times.
  - **Dashboard Analytics**: Visual charts and stats provide an at-a-glance overview of your productivity.
- **Detailed Activity Log**: A comprehensive, immutable log of all task interactions, including creation, updates, completion, delays, and deletions, providing a full audit trail of your work.

### 5. Notes Feature

- **Personal Notes**: A dedicated space to create, view, edit, and delete personal notes.
- **Simple & Effective**: Each note has a title and content, with automatic tracking of the last update time.
- **Centralized Management**: Easily manage all notes from the clean `/notes` interface.

### 6. User Profile & Settings

- **Personalized Experience**: Customize notification preferences for reminders and achievements.
- **Profile Overview**: View key stats like total completed tasks, reward points, and current streak directly on your profile.
- **Authentication Management**: Securely manage your account connected via Email/Password or Google.

### 7. User Experience

- **Modern UI**: A clean, dark-themed interface designed for focus and clarity.
- **Responsive Design**: Fully functional and accessible across desktop and mobile devices.
- **Intuitive Navigation**: A logical and easy-to-use interface with quick access to all features.
- **Performant & Smooth**:
  - **Optimistic UI Updates**: Instant feedback on actions like task creation or completion.
  - **Seamless Loading**: Utilizes React Suspense for smooth loading transitions without jarring layout shifts.
  - **Fast Navigation**: Built on the Next.js App Router for near-instant page loads.

## 🛠️ Technology Stack

### Frontend

- **Next.js 15+**: React framework with App Router for optimal performance.
- **React 19+**: Latest version for modern UI development.
- **TypeScript**: Type-safe development.
- **Tailwind CSS**: Utility-first CSS framework for responsive design.
- **Framer Motion**: Smooth animations and transitions.
- **Lucide React**: Modern icon library.
- **React Hot Toast**: Toast notifications.
- **React Tooltip**: Enhanced tooltip functionality.

### Backend & Authentication

- **Firebase**: Backend-as-a-Service
  - Firestore: NoSQL database for task and notes storage.
  - Authentication: Handles user creation and sign-in for Email/Password and Google (via ID token).
- **NextAuth.js**: Authentication framework integrating multiple providers:
  - Credentials (for Firebase ID tokens from Google Sign-In & Email/Password).
  - GitHub OAuth.
- **Firebase Admin**: Server-side Firebase operations.

### Development Tools

- **ESLint**: Code quality and style enforcement.
- **TypeScript**: Static type checking.
- **Turbopack**: Fast development server (if used, often default with newer Next.js).

## 📱 Application Structure

### Routes

- **Dashboard**: Overview of tasks and performance analytics.
- **Tasks**: Comprehensive task management interface.
- **Calendar**: Calendar view of tasks.
- **Completed**: View of completed tasks.
- **Notes**: Dedicated section for managing personal notes.
- **Inbox**: Real-time notification management center.
- **Profile**: User settings and preferences.
- **Login**: Secure authentication page with multiple sign-in options.

### Key Components

#### Core UI Elements

- **Task Cards**: Visual representation of tasks with all relevant information, actions, and status indicators.
- **Repeating Task Cards**: Specialized cards for managing recurring tasks with completion tracking.
- **Dashboard Cards**: Quick overview widgets showing task statistics and progress metrics.

#### Navigation & Layout

- **Animated Sidebar**: Collapsible navigation with smooth animations and route indicators.
- **Top Sidebar**: Header with search, notifications, user profile, and quick actions.
- **Command Palette (Search)**: Universal search interface for tasks and navigation (Ctrl+K).

#### Task Management Interface

- **Add Task Modal**: Comprehensive task creation with tabbed interface (Task/Customization).
- **Task Customization**: Color picker, icon selector, and visual customization options.
- **Repetition Rules**: Advanced modal for configuring repeating task patterns.
- **Tag Input**: Dynamic tag creation and management with autocomplete.
- **Duration Calculator**: Time estimation and tracking component.
- **Location Input**: Geographic tagging for tasks.
- **Emoji Experience**: Task completion rating system with emotional feedback.

#### Notification System

- **Notification Bell**: Real-time notification counter with priority indicators and animations.
- **Notification Cards**: Rich notification display with actions, timestamps, and priority badges.
- **Inbox Content**: Full notification management with filtering, search, and bulk actions.
- **Notification Summary**: Dashboard widget showing notification stats and quick access.

#### Reusable Components

- **Button**: Versatile button component with multiple variants (primary, secondary, danger, tag).
- **Input**: Styled input fields with consistent theming.
- **Checkbox**: Custom styled checkbox with accessibility features.
- **Switch**: Toggle switch component built with Radix UI.
- **Date Input**: Calendar picker with date selection and validation.

#### Animations & Visual Effects

- **Animated Background**: Complex background with floating icons, grids, and geometric shapes.
- **Decrypted Text**: Text animation with scrambling/reveal effects.
- **Glitch Text**: CSS-based glitch animation for dramatic text effects.
- **Animated Numbers**: Smooth number transitions and counters.
- **Grid and Dots Background**: Subtle background patterns for visual depth.
- **Loading Animations**: Multiple loader variants (Book, Graph, Polyline).

#### Analytics & Insights

- **Analytics Dashboard**: Comprehensive performance tracking with charts and metrics.
- **Profile Tabs**: User profile interface with settings, activity logs, and statistics.
- **User Info Card**: Profile summary with achievements and progress indicators.
- **Streak Bar**: Visual streak tracking and milestone celebrations.

  #### Utility Components

  - **Modal**: Comprehensive modal system with context-based management and compound component pattern.
  - **Dropdown**: Advanced context menus for task actions with form submissions and status handling.
  - **Color Picker**: Visual color selection interface with customizable palettes and real-time preview.
  - **Icon Picker**: Dynamic icon selection from extensive Lucide React library with grid layout.

  #### Search & Navigation

  - **Search Component**: Universal search interface with task filtering, keyboard navigation, and quick actions.
  - **Command Palette**: Keyboard-driven navigation system (Ctrl+K) for power users.
  - **Sidebar Navigation**: Organized navigation with section grouping and active state indicators.

  #### AI Integration

  - **JotForm Agent**: Embedded AI assistant providing contextual help, task automation suggestions, and app navigation guidance.

## 🔒 Security Features

- **Secure Authentication**: Support for Google Sign-in, Email/Password, and GitHub OAuth, managed by NextAuth.js and Firebase.
- **Protected API routes / Server Actions**: Ensuring only authenticated users can access/modify their data.
- **Environment variable management**: For sensitive keys and configurations.
- **Secure session handling**: Managed by NextAuth.js.

## 🚀 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://your-repository-url.git
    cd taskflow
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    # or yarn install
    ```
3.  **Set up environment variables**:

    - Copy `.env.example` to `.env.local`:
      ```bash
      cp .env.example .env.local
      ```
    - Fill in your Firebase project configuration details.
    - Fill in your NextAuth secret and URL.
    - If using GitHub OAuth, add `GITHUB_ID` and `GITHUB_SECRET` from your GitHub OAuth App settings. The callback URL will be `http://localhost:3000/api/auth/callback/github` for local development.

4.  **Run the development server**:
    ```bash
    npm run dev
    # or yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

### Notification Types & Rules

| Type                     | Trigger                | Priority    | Expiration |
| ------------------------ | ---------------------- | ----------- | ---------- |
| **Task Overdue**         | Past due date          | HIGH/URGENT | 7 days     |
| **Task Due Soon**        | Due within 24 hours    | HIGH/MEDIUM | 7 days     |
| **Achievement Unlocked** | New milestones reached | LOW         | 30 days    |
| **Weekly Summary**       | -                      | LOW         | 7 days     |
| **System message**       | -                      | LOW         | 7 days     |

### Some Typescript types

#### Task Schema

```typescript
interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  isPriority: boolean;
  isReminder: boolean;
  delayCount: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  experience?: "bad" | "okay" | "good" | "best";
  location?: string;
  dueDate: Date; // Stored as Timestamp in Firestore, converted to Date in app
  startDate?: Date;
  startTime?: { hour: number; minute: number };
  completedAt?: Date;
  /**Delayed is pending but rescheduled */
  status: "pending" | "completed" | "delayed";
  isRepeating?: boolean;
  repetitionRule?: RepetitionRule;
  duration?: {
    hours: number;
    minutes: number;
  };
  risk?: boolean;
  points: number;
}
```

#### User Schema

```typescript
interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: Date;
  provider: string;
  notifyReminders: boolean;
  notifyAchievements: boolean;
  rewardPoints: number;
  achievements: Achievement[];
  completedTasksCount: number;
  currentStreak: number;
  bestStreak: number;
  lastLoginAt?: Date;
  notesCount?: number;
}
```

#### Notification Schema

```typescript
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  taskId?: string; // Related task ID if applicable
  isRead: boolean;
  isArchived: boolean;
  createdAt: Date;
  readAt?: Date;
  data?: Record<string, unknown>; // Additional data for the notification
  expiresAt?: Date;
}
```

### DEV ONLY: Firebase Authentication & Firestore Security Rules

#### Understanding the Authentication Issue

The main reason my firebase rules are failing is almost certainly that `request.auth` is null when your client-side code tries to access Firestore.

When you use NextAuth.js, it manages user authentication and creates its own session. However, this session is separate from Firebase Authentication. For `request.auth` to be populated in your Firestore security rules, the user must be explicitly signed into Firebase on the client using the Firebase SDK.

The fact that changing the tasks rule to `allow read, update, delete: if true;` works is a strong indicator that the client is not authenticated with Firebase.

#### The Solution: Custom Firebase Tokens

To fix this, I linked the NextAuth session to a Firebase session. When a user is authenticated with NextAuth, Next.js backend generates a Firebase custom token.

Client-side code fetches this custom token. The client then uses `signInWithCustomToken()` from the Firebase SDK to sign the user into Firebase.

Once the user is signed in with the custom token, `request.auth` will be correctly populated in your security rules, and they will start working as you expect.

A component like `AuthProvider.tsx` is the perfect place to orchestrate this client-side logic.

#### Server vs Client Authentication

On the server, you are authenticated with NextAuth, but you are not authenticated with Firebase.
These are two completely separate authentication systems.

Think of it like this:

- **NextAuth.js** is the Front Door Security Guard for your entire application building. They check your ID (from Google, GitHub, etc.) and give you a session cookie, which is like an ID badge that proves you're allowed inside the building.
- **Firebase** is a Secure Vault inside the building. This vault has its own separate, high-tech lock. Your building ID badge won't open the vault. You need a specific key card (a Firebase Auth token) that is only valid for the vault.

#### How `getServerSession(authOptions)` Works

The Front Door Security Guard (`getServerSession`) works because you carry your ID badge (the NextAuth session cookie) with you everywhere you go inside the building.

- When a user logs in through a NextAuth provider, NextAuth creates a secure, encrypted, httpOnly cookie in the user's browser.
- Every single request the browser makes to your Next.js server—whether it's to render a Server Component, call a Route Handler, or execute a Server Action—automatically includes this cookie.
- `getServerSession(authOptions)` is a server-side function that knows how to find this cookie in the incoming request, decrypt it using your `NEXTAUTH_SECRET`, and validate it.

So, on the server, you can always ask "Is this person allowed in the building?" and `getServerSession` will give you a reliable "yes" or "no" and tell you who they are, because the proof is sent with every request.

#### Why Firebase Fails on the Server (Without the Admin SDK)

**On the Client:** When we call `signInWithCustomToken` in the `FirebaseAuthProvider`, the Firebase client-side SDK establishes a session in the browser. It stores its own authentication token in the browser's IndexedDB. When your client-side code makes a request to Firestore, the SDK automatically attaches this token. Security rules see the token and say, "Okay, this key card is valid, open the vault."

**On the Server:** Your server-side code (in a Server Component or Server Action) is a completely separate environment. It has no browser and no access to the IndexedDB where the client's Firebase token is stored. The `signInWithCustomToken` call that happened in the browser is completely invisible to it.

When your server-side code tries to use the standard Firebase SDK (the one initialized in `firebase.ts`), it's like walking up to the vault with no key card at all. Firestore sees an unauthenticated request and correctly denies it, giving you the "Missing or insufficient permissions" error.

#### The Solution Implemented (Bridging the Gap)

**The Master Key (admin-sdk):** The Firebase Admin SDK is initialized with your service account credentials. This is the equivalent of a master key that can open any vault, bypassing the normal security rules. It's designed specifically for trusted server environments. This is why I created all the `-admin.ts` files—to ensure that any time our server needs to access the vault, it uses its master key.
