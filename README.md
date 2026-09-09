# Prioritron - All-in-One Productivity & Life Management System

Prioritron is a comprehensive, modern productivity platform that goes beyond simple task management. It's your personal command center for boosting productivity and optimizing your life, combining intelligent task organization, fitness tracking, nutrition monitoring, and gamified progress tracking—all wrapped in a beautiful, offline-capable Progressive Web App.

Whether you're planning your day, tracking your workouts, counting calories and macros, or getting help from AI, Prioritron brings everything together in one seamless, distraction-free experience. Built with cutting-edge technologies and designed for both desktop and mobile, it adapts to your workflow and keeps you productive.

## ✨ What Makes Prioritron Special

- **🔥 All in one place**: Everything you need to boost productivity and optimize every detail of your life
- **🤖 AI-Powered**: Let the AI do the heavy lifting for you with integrated AI assistant with multi-model support (GPT, Claude, Gemini)
- **🏋️ Holistic Approach**: Not just tasks—track workouts, nutrition, and habits all in one beautiful interface
- **📊 Gamification**: Earn points, maintain streaks, unlock achievements, and rate your experiences
- **⚡ Lightning Fast**: Optimistic UI updates, instant feedback, and smooth animations for delightful UX
- **🔐 Privacy First**: Only you can see your data — Firestore security rules restrict every read/write to its owner, and the free-text content you type (task titles/descriptions and note titles/content) is encrypted at rest with AES-256-GCM before it's ever stored
- **📱 True PWA**: Install on any device, get push notifications, and enjoy native app experience
- **🌐 Offline-First**: Full offline functionality with PWA support—work anywhere, anytime, even without internet

## 🚀 Core Capabilities at a Glance

| Feature              | Description                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| **Smart Tasks**      | Advanced scheduling, repeating tasks, priorities, fun customization...     |
| **Today View**       | Time grid view with scheduled tasks and whole-day tasks                    |
| **Fitness Tracking** | Workout logging, templates, exercise library, and progress visualization   |
| **Nutrition**        | Macro tracking, food scanning, meal logging, and daily goals               |
| **AI Assistant**     | Multi-model AI with function calling and contextual help                   |
| **Analytics**        | Streaks, achievements, completion statistics, and performance insights     |
| **Notifications**    | Notification system with priority levels and inbox management      	      |

## 💰 Subscription Plans

Prioritron offers flexible pricing tiers designed to scale with your productivity needs:

### Base Plan ($0/month)

- Unlimited tasks & notes
- Calendar & scheduling
- 1 AI prompt per day
- Health & fitness tracking
- Mobile PWA support

### Pro Plan ($4.99/month)

- Everything in Base
- 10 AI prompts per day
- Analytics dashboard
- Advanced insights
- 7-day free trial available

### Ultra Plan ($14.99/month)

- Everything in Pro
- Unlimited AI prompts
- Early access to new features

**🔄 Flexible Billing**: Cancel or change plans anytime. Secure payment processing through Stripe with customer portal access.

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

- **Custom Tags**: Create personalized tags for tasks (e.g., morning routine, fitness, personal, health, work).
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

- **Advanced Gamification Engine**:
  - **Multi-Tier Achievement System**: Points milestones, streak milestones, and task completionist achievements with automatic unlocking.
  - **Dynamic Streak Tracking**: Real-time streak monitoring with best streak records and consistency rewards.
  - **Reward Points System**: Earn points for task completion with tiered milestone unlocks and progress visualization.
- **Comprehensive Analytics Dashboard**:
  - **Session Analytics**: Detailed tracking of app usage time, page views, and active engagement metrics.
  - **Performance Insights**: Productivity scores, consistency ratings, and trend analysis with visual charts.
  - **Task Analytics**: Event-based tracking of task creation, completion, delays, and behavioral patterns.
  - **Time Management Intelligence**: On-time completion rates, delay analysis, and productive hour identification.
- **Activity Audit Trail**: Immutable log of all user interactions with detailed task lifecycle tracking and historical data export.
- **Progress Visualization**: Interactive charts showing productivity trends, point growth, achievement progress, and performance metrics over time.

### 5. Health & Nutrition Tracker

- **Advanced Nutrition Intelligence**: Comprehensive nutrition tracking with barcode scanning, NutriScore ratings, and NOVA food processing classifications.
- **Barcode Scanning**: Scan product barcodes for instant nutritional information, ingredients, and health ratings.
- **Smart Food Database**: Extensive food library with detailed nutritional profiles, including micro-nutrients and health classifications.
- **NutriScore & NOVA Classification**: Automatic food quality assessment with color-coded health ratings (A-E) and processing level indicators (1-4).
- **Dietary Filters**: Identify vegan, vegetarian, and allergen-specific foods with comprehensive labeling.
- **Daily Nutrition Dashboard**:
  - Visual progress bars showing calories, protein, carbs, and fat intake vs. personalized goals.
  - Historical tracking with nutrition graphs and trends analysis.
- **Advanced Meal Logging**:
  - Log foods for breakfast, lunch, dinner, or snacks with flexible serving sizes.
  - Saved meals system for quick re-logging of favorite foods.
  - Automatic nutrient calculation with detailed micro-nutrient tracking.
- **Personalized Goal Setting**: Set custom daily targets for calories and macronutrients with smart recommendations.

### 6. Advanced Fitness Tracking Module

- **Comprehensive Workout Logging**:

  - **Workout Sessions**: Create and track detailed workout sessions with duration, exercises, sets, reps, and weights.
  - **Exercise Library**: Access to extensive exercise database with categories and muscle group targeting.
  - **Real-time Workout Timer**: Built-in workout duration tracking and rest timers between sets.
  - **Session Notes**: Add personal notes and observations to each workout session.

- **Workout Templates**:

  - **Template Creation**: Save frequently used workout routines as reusable templates.
  - **Quick Start**: Launch workouts instantly from saved templates with pre-loaded exercises.
  - **Template Management**: Organize and categorize workout templates by type (Push, Pull, Legs, etc.).

- **Progress Visualization & Analytics**:

  - **Interactive Charts**: Visualize progress over time with line graphs showing weight, volume, and strength trends.
  - **Exercise-Specific Analysis**: Detailed progress tracking for individual exercises with historical data and personal record tracking.

- **Personal Records**: Automatic tracking of your best weights, reps, and performance metrics for each exercise.

- **Progressive Overload Intelligence**:

  - **Smart Suggestions**: AI-powered recommendations based on previous performance data.
  - **Last Performance Hints**: See your previous workout stats for each exercise to guide progressive overload.
  - **Strength Progression**: Automatic suggestions for weight and rep increases based on historical data.

- **Dashboard & Analytics**:
  - **Weekly Overview**: Calendar view showing workout frequency and consistency.
  - **Workout Statistics**: Track weekly workout count, total sessions, and average duration.
  - **Recent Activity**: Quick access to recent workouts and performance summaries.

### 7. AI Assistant & Automation

- **Advanced Multi-Model AI**: Integrated AI assistant with support for cutting-edge models including GPT-4.1, GPT-5, Claude Sonnet 4, and Claude 3.5 Haiku.
- **Multiple AI Providers**: Seamless integration with CrayonAI, ThesysAI, and OpenRouter for diverse AI capabilities and optimal performance.
- **Intelligent Function Calling**: AI can directly interact with your tasks, retrieve data, create new tasks, update existing ones, and perform complex operations on your behalf.
- **Contextual Productivity Coaching**: AI understands your current app context, task history, and productivity patterns to provide personalized recommendations and insights.
- **Persistent Chat History**: Full conversation history with model tracking and function call results for continuous productivity coaching.
- **Usage Limits & Billing**: Daily AI prompt limits based on subscription tier (1/day Base, 10/day Pro, unlimited Ultra) with automatic reset and usage tracking.
- **Advanced Chat Features**: Model switching mid-conversation, function result visualization, and streaming responses for enhanced user experience.

### 8. Notes

- **Personal Notes**: A dedicated space to create, view, edit, and delete personal notes.
- **Simple & Effective**: Each note has a title and content, with automatic tracking of the last update time.

### 10. Tutorial & Onboarding

- **Interactive Tutorial**: First-time user tutorial with step-by-step guidance through key features.
- **Contextual Tooltips**: Helpful hints and tips throughout the app for feature discovery.
- **Skip & Resume**: Users can skip tutorials or resume them later from settings.

### 11. User Profile & Settings

- **Personalized Experience**: Customize notification preferences for reminders and achievements.
- **Authentication Management**: Securely manage your account connected via Email/Password, Google, or GitHub.
- **Activity Log**: Comprehensive audit trail of all task interactions and system events.
- **Achievement Showcase**: Display unlocked achievements and progress toward new milestones.

### 12. Progressive Web App (PWA) & Offline Support

- **Install as Native App**: Add Prioritron to your home screen on any device (iOS, Android, desktop) for app-like experience.
- **Offline Functionality**: Full offline support with service workers—access your tasks even without internet.
- **Offline Mode Detection**: Automatic detection of network status with dedicated offline page and graceful degradation.
- **Background Sync**: Smart synchronization when connection is restored.
- **App Shortcuts**: Quick access shortcuts in the PWA for common actions (Add Task, Today's Tasks, Fitness, Health).
- **Push Notifications**: Receive native push notifications for task reminders and achievements (when installed as PWA).
- **App Update Notifications**: Automatic detection and user-friendly prompts for PWA updates with seamless installation.
- **Installable**: Beautiful install prompt with app icon and description for easy installation.

### 13. Today's View & Daily Planning

- **Visual Time Grid**: Interactive 24-hour timeline view showing your scheduled tasks with visual time blocks.
- **Scheduled vs Whole-Day Tasks**: Separate views for time-specific tasks and general daily tasks.
- **Quick Task Creation**: Add tasks directly to today's schedule with one click.
- **Time Block Visualization**: See your day at a glance with color-coded time blocks for each task.
- **Priority Indicators**: Visual priority badges on scheduled tasks.

### 14. User Experience & Design

- **Modern Dark UI**: A clean, dark-themed interface designed for focus and clarity with carefully crafted color palette.
- **Fully Responsive**: Pixel-perfect experience across desktop, tablet, and mobile devices with adaptive layouts.
- **Intuitive Navigation**: Animated sidebar with logical organization and quick access to all features.
- **Smooth Animations**: Polished micro-interactions powered by Framer Motion for delightful user experience.
- **Performant & Fast**:
  - **Optimistic UI Updates**: Instant feedback on actions like task creation or completion.
  - **Seamless Loading**: Utilizes React Suspense for smooth loading transitions without jarring layout shifts.
  - **Fast Navigation**: Built on the Next.js App Router for near-instant page loads.
  - **Efficient Caching**: Smart client-side caching for improved performance.
- **Accessibility**: Built with accessibility in mind—keyboard navigation, ARIA labels, and screen reader support.
- **Visual Feedback**: Toast notifications, loading states, and error handling for clear communication.
- **Customizable Themes**: Personal color preferences for tasks and visual organization.

## 🛠️ Technology Stack

### Frontend

- **Next.js 15+**: React framework with App Router for optimal performance and server-side rendering
- **React 19+**: Latest version for modern UI development with concurrent features
- **TypeScript**: Type-safe development with full type coverage
- **Tailwind CSS**: Utility-first CSS framework for responsive design with custom theme
- **Framer Motion**: Smooth animations, transitions, and micro-interactions
- **Lucide React**: Modern, customizable icon library
- **React Hot Toast**: Beautiful toast notifications with custom styling
- **React Tooltip**: Enhanced tooltip functionality for better UX
- **Recharts**: Interactive, responsive charts for fitness progress and analytics visualization
- **Service Workers**: Offline support, background sync, and push notifications

### Backend & Authentication

- **Firebase**
  - **Firestore**: NoSQL real-time database
  - **Firebase Cloud Messaging (FCM)**: Push notification delivery for web and mobile
  - **Firebase Admin SDK**: Server-side operations with elevated privileges
- **NextAuth**
  - **Credentials Provider**: Firebase custom tokens for Google Sign-In & Email/Password
  - **GitHub OAuth**
  - **Session Management**: Secure, encrypted JWT sessions

### APIs & External Services

- **Stripe**: Payment processing and subscription management with webhooks and customer portal integration
- **CrayonAI**: Advanced AI model orchestration and streaming capabilities
- **ThesysAI**: Additional AI model provider for enhanced conversational experiences
- **ZXing WASM**: Barcode scanning and QR code processing for nutrition tracking
- **[cron-job.org](https://cron-job.org)**: free external scheduler for FCM reminder sweeps and anonymous-account cleanup (see [Scheduled jobs](#scheduled-jobs-cron-joborg) below)

### Development Tools & Infrastructure

- **ESLint**: Code quality and style enforcement with custom rules
- **TypeScript**: Static type checking with strict mode
- **Git**: Version control
- **Environment Variables**: for API keys and secrets
- **Service Worker API**: Native browser API for offline functionality

## 📱 Application Structure

### Main Routes

- **`/`**: Landing page
- **`/login`**
- **`/webapp`** (Dashboard): Overview of tasks, analytics, and performance metrics with visual charts
- **`/webapp/inbox`**: Notification center with filtering, priority indicators, and read/unread management
- **`/webapp/today`**: Today's view with interactive time grid and daily task planning
- **`/webapp/tasks`**: Comprehensive task management interface with filtering and bulk actions
- **`/webapp/completed`**
- **`/webapp/calendar`**
- **`/webapp/notes`**
- **`/webapp/health`**: Nutrition tracking with calorie counting, and macro goals
- **`/webapp/fitness`**: Workout logging, exercise library, templates, and progress visualization
- **`/webapp/ai`**: AI assistant chat interface with multi-model support and function calling
- **`/webapp/profile`**: User profile, tutorial, settings and subscription portal
- **`/offline`**
- **`/terms`**: Terms of Use
- **`/privacy`**: Privacy Policy

## 🔒 Security Features

- **Secure Authentication**: Support for Google Sign-in, Email/Password, and GitHub OAuth, managed by NextAuth and Firebase
- **Custom Firebase Tokens**: Secure bridge between NextAuth sessions and Firebase authentication
- **Protected API Routes**: All API endpoints require authentication and validate user permissions
- **Server Actions Security**: Server-side operations protected by NextAuth session validation
- **Firestore Security Rules**: Granular security rules ensuring users can only access their own data
- **Row-Level Security**: Each document includes userId validation at the database level
- **Field-Level Encryption at Rest**: Task titles/descriptions, note titles/content, and the task-title snapshots stored in the activity log are encrypted with **AES-256-GCM** (a random IV per value + an authentication tag, so ciphertext can't be tampered with unnoticed) before being written to Firestore, and transparently decrypted on read. See [`app/_lib/encryption.ts`](./app/_lib/encryption.ts). This does **not** currently apply to workouts, nutrition logs, or other structured data.
- **Environment Variable Management**: Sensitive keys and configurations, including the `DATA_ENCRYPTION_KEY` used for field-level encryption, secured via environment variables
- **Secure Session Handling**: Encrypted JWT sessions managed by NextAuthjs with httpOnly cookies
- **Advanced Security Headers**: Comprehensive HTTP security headers including X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and Strict-Transport-Security
- **Performance Monitoring**: Real-time performance tracking with request timing headers, user agent logging, and analytics integration
- **Feature Flag Security**: Environment-based feature toggles for controlled rollout and beta testing capabilities
- **XSS Protection**: Input sanitization and output encoding to prevent cross-site scripting
- **CSRF Protection**: Built-in CSRF token validation for all state-changing operations
- **Rate Limiting**: Protection against API abuse and brute force attacks
- **Admin Operations**: Separate admin SDK operations with elevated privileges for system tasks
- **Legal Pages**: Public [`/terms`](./app/terms/page.tsx) (Terms of Use) and [`/privacy`](./app/privacy/page.tsx) (Privacy Policy) pages, linked from the landing page footer

### 🔐 How Task/Note Encryption Works

1. **On create/update**: `title`/`description` (tasks) and `title`/`content` (notes) are encrypted with `encryptField()` before the Firestore write. Each value gets its own random 96-bit IV, so identical text never produces identical ciphertext.
2. **On read**: every read path (`getTasksByUserId`, `getTaskByTaskId`, `loadNotesByUserId`, and the activity log) runs the stored value through `decryptField()` before it reaches the rest of the app.
3. **Backward compatibility**: `decryptField()` only decrypts values that carry the `enc:v1:` prefix. Any older, pre-encryption plaintext record is returned unchanged, so existing data keeps working without a manual migration — new writes are encrypted going forward.
4. **Key management**: encryption uses a single symmetric key from the `DATA_ENCRYPTION_KEY` environment variable (a 64-char hex string, i.e. 32 bytes — generate one with `openssl rand -hex 32`). This key never leaves the server; only server-side code (Server Actions, `_lib` admin modules) can encrypt/decrypt.
5. **Scope**: intentionally limited to free-text fields the user types. Workouts, nutrition data, and other structured records are **not** encrypted at rest today.

## 🚀 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://your-repository-url.git
    cd prioritron
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
    - **Required Variables**:
      - Firebase project configuration (API key, project ID, etc.)
      - `NEXTAUTH_SECRET` and `NEXTAUTH_URL` for authentication (production: `https://prioritron.dev`)
      - Firebase Admin SDK credentials path
      - `DATA_ENCRYPTION_KEY`: 32-byte key (64-char hex, e.g. from `openssl rand -hex 32`) used to encrypt/decrypt task and note content at rest
      - Stripe configuration (`STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
    - **Optional Variables**:
      - `GITHUB_ID` and `GITHUB_SECRET` for GitHub OAuth (callback URL: `http://localhost:3000/api/auth/callback/github` locally, `https://prioritron.dev/api/auth/callback/github` in production)
      - `OPENAI_API_KEY` for OpenAI GPT models in AI assistant
      - `CRAYON_API_KEY` for CrayonAI integration
      - `THESYS_API_KEY` for ThesysAI integration
      - `CRON_SECRET`: shared Bearer token for `/api/cron/notifications` and `/api/admin/cleanup-anonymous`. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Must be set on Vercel production as well as locally. **Never put this value in the job URL or in this README.**

4.  **Run the development server**:

    ```bash
    npm run dev
    # or yarn dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scheduled jobs (cron-job.org)

Two secret-protected endpoints are pinged by [cron-job.org](https://cron-job.org) (free). Vercel Hobby cron can only run **once per day**, which is enough for a backup cleanup but useless for “task starts in 15 minutes” reminders — those must stay on the external scheduler.

Both jobs send:

```
Authorization: Bearer <CRON_SECRET>
```

Do not put the secret in the URL. Production host is `https://prioritron.dev`.

| Job | URL | Method | Schedule | What it does |
| --- | --- | --- | --- | --- |
| FCM reminders | `https://prioritron.dev/api/cron/notifications` | GET or POST | every 10 minutes | For users with `notifyReminders` and an FCM token: create overdue / due-soon / time-window notifications and push via Firebase Cloud Messaging. Also expires old inbox items. Implemented in [`app/api/cron/notifications/route.ts`](./app/api/cron/notifications/route.ts). |
| Anonymous cleanup | `https://prioritron.dev/api/admin/cleanup-anonymous` | GET or POST | every 3 hours | Deletes guest accounts older than **3 hours**, plus their tasks, notes, notifications, workouts, and health data. Implemented in [`app/api/admin/cleanup-anonymous/route.ts`](./app/api/admin/cleanup-anonymous/route.ts) and [`app/_lib/anonymous-cleanup.ts`](./app/_lib/anonymous-cleanup.ts). |


### Recreating the jobs on cron-job.org

1. Sign in at [https://console.cron-job.org](https://console.cron-job.org) → **Create cronjob**.
2. Set the URL from the table above. Enable the job.
3. **Advanced**: request method GET (POST also works). Add header `Authorization` = `Bearer <CRON_SECRET>` (space after `Bearer`, no quotes).
4. **Test / Run now**. History should show HTTP 200. Failure emails are optional; jobs auto-disable after ~25 consecutive failures.

## Some Typescript types

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
  autoDelay?: boolean; // Automatically delay task to next day if missed
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  experience?: "bad" | "okay" | "good" | "best";
  location?: string;
  dueDate: number;
  startDate?: number;
  startTime?: { hour: number; minute: number };
  completedAt?: number;
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

```typescript
interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: number;
  provider: string;
  notifyReminders: boolean;
  notifyAchievements: boolean;
  rewardPoints: number;
  achievements: Achievement[];
  completedTasksCount: number;
  currentStreak: number;
  bestStreak: number;
  lastLoginAt?: number;
  nutritionGoals: UserNutritionGoals;
  // Anonymous user fields
  isAnonymous?: boolean;
  anonymousCreatedAt?: number;
}
```


## 🌐 Browser Support & Compatibility

Prioritron is built with modern web standards and supports all major browsers:

| Browser              | Version | PWA Support | Offline Mode | Notes                           |
| -------------------- | ------- | ----------- | ------------ | ------------------------------- |
| **Chrome**           | 90+     | ✅ Full     | ✅ Full      | Recommended for best experience |
| **Edge**             | 90+     | ✅ Full     | ✅ Full      | Chromium-based, full support    |
| **Firefox**          | 88+     | ⚠️ Partial  | ✅ Full      | PWA install may vary by OS      |
| **Safari**           | 14+     | ⚠️ Limited  | ✅ Full      | iOS: Add to Home Screen         |
| **Opera**            | 76+     | ✅ Full     | ✅ Full      | Chromium-based                  |
| **Samsung Internet** | 14+     | ✅ Full     | ✅ Full      | Android devices                 |

**Requirements:**

- JavaScript enabled
- LocalStorage and IndexedDB support
- Service Worker support for offline functionality
- Modern CSS Grid and Flexbox support

## 🎯 Use Cases

## 🤝 Contributing

This is currently a personal project, but contributions, issues, and feature requests are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Contact & Support

For questions, feedback, or support:

- **Issues**: Open an issue on GitHub
- **Email**: ultrabrzitranzijent@gmail.com

---

**Built with ❤️ by Josip Čunko**
