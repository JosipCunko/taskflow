# TaskFlow - Smart Task Management System

TaskFlow is a modern, feature-rich task management application designed to help users achieve their goals through disciplined task organization and tracking. Built with cutting-edge technologies, it offers a seamless experience for managing daily, weekly, and monthly tasks.

## 🌟 Key Features

### 1. Smart Task Management

- **Task Organization**: Create and manage tasks with detailed descriptions, due dates, and priorities
- **Precondition System**: Set task dependencies with "Do X only after Y is done" logic
- **Auto-rescheduling**: Automatically reschedules missed tasks to the next day
- **Manual Rescheduling**: Flexible task rescheduling options for better time management
- **Task Status Tracking**: Monitor tasks as pending, completed, or delayed
- **Experience Points**: Gamified task completion with a point system
  - Success formula: (-2)\*n + 10 points (where n is delay count, 0 ≤ n ≤ 5)
  - Failure penalty: (-2)\*n - 8 points (where n is delay count, 0 ≤ n ≤ 5)

### 2. Advanced Tagging System

- **Custom Tags**: Create personalized tags for tasks (e.g., morning routine, gym, personal, health, work)
- **Color Coding**: Custom color palette for visual task organization
- **Priority Tags**: Special "focus" tag for highlighting critical tasks
- **Icon Selection**: Choose from a wide range of task icons for better visual organization

### 3. Smart Reminders & Notifications

- **Flexible Reminders**: Set up task reminders with customizable timing
- **Snooze Feature**: "Remind me again in X minutes" functionality
- **Dismiss Options**: Multiple ways to handle task notifications

### 4. Progress Tracking & Analytics

- **Streak System**: Track consistent task completion with visual streak indicators
- **Points System**: Earn reward points for task completion
- **Performance Metrics**: View completion rates, delay statistics, and success rates
- **Dashboard Analytics**: Visual representation of task performance and progress

### 5. User Experience

- **Dark Mode**: Modern, eye-friendly dark theme interface
- **Responsive Design**: Fully responsive layout for all devices
- **Intuitive Navigation**: Easy-to-use interface with quick access to all features
- **Loading States**: Smooth loading transitions with skeleton screens

## 🛠️ Technology Stack

### Frontend

- **Next.js 15.3.2**: React framework with App Router for optimal performance
- **React 19.0.0**: Latest version for modern UI development
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Modern icon library
- **React Hot Toast**: Toast notifications
- **React Tooltip**: Enhanced tooltip functionality

### Backend & Authentication

- **Firebase**: Backend-as-a-Service
  - Firestore: NoSQL database for task storage
  - Authentication: Google Sign-in integration
- **NextAuth.js**: Authentication framework
- **Firebase Admin**: Server-side Firebase operations

### Development Tools

- **ESLint**: Code quality and style enforcement
- **TypeScript**: Static type checking
- **Turbopack**: Fast development server

## 📱 Application Structure

### Routes

- **Dashboard**: Overview of tasks and performance metrics
- **Tasks**: Comprehensive task management interface
- **Profile**: User settings and preferences
- **Login**: Secure authentication page

### Key Components

- **Task Cards**: Visual representation of tasks with all relevant information
- **Dashboard Cards**: Quick overview of task statistics and progress
- **Progress Tracking**: Visual indicators of task completion and streaks
- **Analytics Panels**: Detailed performance metrics and statistics

## 🔒 Security Features

- Secure Google Authentication
- Protected API routes
- Environment variable management
- Secure session handling

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
