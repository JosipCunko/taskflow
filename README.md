# TaskFlow - Smart Task Management System

TaskFlow is a modern, feature-rich task management application designed to help users achieve their goals through disciplined task organization and tracking. Built with cutting-edge technologies, it offers a seamless experience for managing daily, weekly, and monthly tasks, as well as a dedicated space for personal notes.

## 🌟 Key Features

### 1. Smart Task Management

- **Task Organization**: Create and manage tasks with detailed descriptions, due dates, and priorities.
- **Repeating Tasks**: Define tasks that repeat at intervals, on specific days of the week, or a certain number of times per week, with customizable start dates.
- **Precondition System**: Set task dependencies with "Do X only after Y is done" logic (if applicable).
- **Auto-rescheduling**: Automatically reschedules missed non-repeating tasks to the next day.
- **Manual Rescheduling**: Flexible task rescheduling options for better time management (primarily for non-repeating tasks).
- **Task Status Tracking**: Monitor tasks as pending, completed, or delayed. Repeating tasks have specific action limitations (e.g., primarily deletion in main views).
- **Experience Points**: Gamified task completion with a point system for non-repeating tasks.
  - Success formula: (-2)\*n + 10 points (where n is delay count, 0 ≤ n ≤ 5)
  - Failure penalty: (-2)\*n - 8 points (where n is delay count, 0 ≤ n ≤ 5)

### 2. Advanced Tagging & Customization

- **Custom Tags**: Create personalized tags for tasks (e.g., morning routine, gym, personal, health, work).
- **Color Coding**: Custom color palette for visual task organization.
- **Priority Tags**: Special "focus" tag for highlighting critical tasks.
- **Icon Selection**: Choose from a wide range of task icons for better visual organization.

### 3. Smart Reminders & Notifications

- **Flexible Reminders**: Set up task reminders with customizable timing.
- **Snooze Feature**: "Remind me again in X minutes" functionality.
- **Dismiss Options**: Multiple ways to handle task notifications.

### 4. Progress Tracking & Analytics

- **Streak System**: Track consistent task completion with visual streak indicators.
- **Points System**: Earn reward points for task completion.
- **Performance Metrics**: View completion rates, delay statistics, and success rates.
- **Dashboard Analytics**: Visual representation of task performance and progress.

### 5. Notes Feature

- **Personal Notes**: Create, view, edit, and delete personal notes.
- **Simple Organization**: Notes include a title and content, automatically tracking the last update time.
- **Dedicated Interface**: Manage notes in a clean, focused `/notes` section.

### 6. User Experience

- **Dark Mode**: Modern, eye-friendly dark theme interface.
- **Responsive Design**: Fully responsive layout for all devices (ongoing improvements for mobile webapp view).
- **Intuitive Navigation**: Easy-to-use interface with quick access to all features.
- **Loading States**: Smooth loading transitions.

## 🛠️ Technology Stack

### Frontend

- **Next.js 15+**: React framework with App Router for optimal performance (version may vary slightly based on project updates, e.g., 15.3.2 mentioned previously).
- **React 19+**: Latest version for modern UI development (version may vary, e.g., 19.0.0 mentioned previously).
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

- **Dashboard**: Overview of tasks and performance metrics.
- **Tasks**: Comprehensive task management interface.
- **Calendar**: Calendar view of tasks.
- **Completed**: View of completed tasks.
- **Notes**: Dedicated section for managing personal notes.
- **Profile**: User settings and preferences.
- **Login**: Secure authentication page with multiple sign-in options.

### Key Components

- **Task Cards**: Visual representation of tasks with all relevant information and actions.
- **Note Cards**: Display and manage individual notes.
- **Dashboard Cards**: Quick overview of task statistics and progress.
- **Progress Tracking**: Visual indicators of task completion and streaks.
- **Analytics Panels**: Detailed performance metrics and statistics.

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

## 📝 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
