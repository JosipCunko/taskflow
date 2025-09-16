**1. Enhanced Collaboration: Shared Projects and Task Assignment**

Allow users to invite others to their projects, assign tasks to specific people, and leave comments. This would transform Taskflow from a personal tool into a collaborative platform for families, students, or small teams.

- **Why?** Collaboration is a key feature for growth, allowing teams to use Taskflow for their work. Todoist's business plan is built around this.
- **Implementation Idea:**
  - You'd need to extend your data model to include project members and an `assignedTo` field on tasks.
  - Implement an invitation system (e.g., by email).
  - The UI would need to show who is assigned to each task and include a comments section within the `TaskCard` or a task detail view.

**2. Recipe Discovery and Suggestions**

Integrate a recipe discovery feature that allows users to search for recipes by name or ingredients. Include filtering options for cuisine, diet, meal type, and preparation time. Also, provide a section for daily recipe suggestions to inspire users.

- **Why?** This would greatly enhance the health module by helping users with meal planning, finding new healthy meal ideas, and making the app more engaging for users focused on their nutrition.
- **Implementation Idea:**
  - Build a search interface with various filters.
  - Display recipe cards with key information (image, title, cooking time).
  - A recipe detail view could show ingredients and instructions.
  - A "suggestions" component could show a few random recipes on the health dashboard.

**3. Firebase Storage for User-Generated Content**

- **Idea:** Use Firebase Storage to manage user-uploaded images. This includes photos of meals for the health tracker and profile pictures for users who sign up with an email address instead of an OAuth provider.
- **Why?** Storing binary data like images requires a dedicated solution. Firebase Storage is secure, scalable, and integrates seamlessly with the rest of the Firebase ecosystem (like Firestore and Authentication).
- **Implementation Idea:**
  - Set up a Firebase Storage bucket.
  - Create security rules to control access (e.g., users can only write to their own folder and read public profile pictures).
  - Build UI components for uploading and displaying images in the user's profile settings and the meal logging flow.

**4. Upgrading to Firebase "Blaze" Plan for Advanced Features**

- **Idea:** Move from the free "Spark" plan to the pay-as-you-go "Blaze" plan to unlock Firebase's more powerful features.
- **Why?** The Spark plan has strict limitations that prevent the implementation of more advanced, scalable features. The Blaze plan offers generous free tiers for most services, so costs remain low for small projects while providing the flexibility to scale.
- **Explanation of Blaze Plan Benefits:**
  The Blaze plan unlocks a suite of powerful tools essential for building a feature-rich application. This includes **Cloud Functions**, which allow for running server-side code in response to events (e.g., sending a welcome email on user signup or processing an image after upload). It also provides **Cloud Messaging (FCM)** for sending push notifications to keep users engaged. For more advanced capabilities, it opens up Firebase's **AI/ML services** for tasks like text recognition or creating smart replies, expanded **Cloud Storage** quotas, and **Crashlytics** for real-time crash reporting to quickly identify and fix bugs.

**5. Super Advanced Gym Tracking Module**
- **Idea:** Create a new, dedicated route (`/gym`) for comprehensive workout and progress tracking.
- **Why?** Many users, including myself, struggle to track gym progress effectively. A dedicated tool for this would add significant value to the app's health and wellness offerings.
- **Implementation Idea:**
  - Design a data model in Firestore to store exercises, sets, reps, and weight.
  - Implement an analytics backend (potentially using Cloud Functions) to process this data. // Will do cloud functions on firebase later, ignore them for now
  - Use a charting library (like Chart.js or Recharts) to display progress for specific exercises over time with line graphs, showing trends in weight, reps, or volume.
### Extended Plan for Gym Tracking Module
Here is a more detailed breakdown of how the Gym Tracking Module could be implemented, turning it into a core feature of TaskFlow.

#### **5.1. Detailed Data Model (Firestore)**

A structured database is key. We'd create a few collections, mostly nested under the `users` collection to keep data user-specific and secure. That's different what our db structure was before.

- **Workout Sessions:**

  - `users/{userId}/workouts/{workoutId}`
    - `date`: `Timestamp` - When the workout started.
    - `name`: `String` - e.g., "Morning Push Day", "Pull day", "Leg day"
    - `duration`: `Number` - Total minutes, calculated on completion.
    - `notes`: `String` - (Optional) General notes about the session.
      
- **Logged Exercises (within a workout):**
  - `users/{userId}/workouts/{workoutId}/loggedExercises/{loggedExerciseId}`
    - `exerciseName`: `String` - e.g., "Barbell Bench Press". Denormalized for easy display.
    - `order`: `Number` (Optional) - To keep exercises in the order they were performed.
    - `volume`: `array` - each item is an object with this properties, every new item represents a new set, so "set" as a property we wont track
      {
          weight: number,
          reps: number,
          rest?: number,
          //maybe more later
      }
---

#### **5.2. UI/UX and User Flow**

The user journey should be smooth and intuitive, from starting a workout to viewing progress.

- **Gym Dashboard (`/webapp/gym`):**

  - This will be the main hub. It should feature a calendar view highlighting past workout days.
  - A prominent "Start New Workout" button. Users can either start an empty session or choose from a pre-saved template.
  - A section for "My Workout Templates" for quick access.
    

- **Workout Logging Screen (Active Session):**

  - A live timer at the top showing workout duration.
  - A list of exercises added to the session. Each exercise card will show:
    - The sets logged so far (e.g., `100kg x 8`, `100kg x 8`, `105kg x 6`).
    - An "Add Set" button.
    - **Progressive Overload Hint:** A small note showing the stats from the last time this exercise was performed (e.g., "Last time: 3x8 @ 100kg").
  - An "Add Exercise" button that opens a searchable modal of the `exercises` library.
  - A built-in **Rest Timer** that can be started after each set.

- **Progress Visualization Screen (`/webapp/gym/progress`):**
  - The core of progress tracking.
  - A dropdown allows the user to select an exercise they want to analyze.
  - A large **line graph** will display progress over time. The user can toggle the metric shown on the Y-axis:
    - **Max Weight:** The heaviest weight lifted for any set.
    - **Total Volume:** The total volume (weight _ reps _ sets) for that exercise in each session.
    - **Estimated 1 Rep Max (e1RM):** Calculated from the best set (e.g., using the Brzycki formula) to show true strength gains.
  - A "Personal Records" section below the graph highlighting their best lifts (e.g., "Heaviest Squat: 140kg", "Most Bench Press Reps: 10 at 100kg").

---

#### **5.3. Advanced Features & Logic** // I will implement later, dont do this now

- **Estimated 1 Rep Max (e1RM) Calculation:** After every heavy set (e.g., < 10 reps), automatically calculate the e1RM using a standard formula. This is the single best metric for tracking strength over time.
  - `e1RM = Weight / (1.0278 - 0.0278 * Reps)` 
- **Volume Tracking:** On workout completion, a Cloud Function could process all sets to calculate the total volume for the session and for each muscle group worked, which can be stored in the workout document.
- **Workout Templates:** Allow users to create and save a list of exercises as a template. When they start a workout from a template, all exercises are pre-loaded, saving time.

This detailed approach would create a powerful and engaging gym tracking module that provides real, actionable insights for users looking to get stronger.

**6. YouTube Subscription Summarizer**

- **Idea:** Fetch the latest videos from a user's subscribed YouTube channels, use an AI model to generate a summary, and send a notification with the summary and a link to watch.
- **Why?** This is a unique productivity feature that helps users stay on top of their subscriptions without having to watch every video. It's a "nice-to-have" feature that could make the app stand out.
- **Implementation Idea:**
  - Use the YouTube Data API v3 to fetch video data (requires user authentication via Google OAuth).
  - Pipe the video transcript or title/description into a cost-effective AI model's API for summarization.
  - Use Firebase Cloud Messaging to send a push notification to the user's device.

**7. In-App AI Assistant**

- **Idea:** Integrate an AI-powered assistant to help users navigate Taskflow and answer their questions.
- **Why?** An AI assistant can improve user onboarding, answer FAQs, and provide a more interactive and helpful user experience, reducing user friction.
  - The AI could be "primed" with information about Taskflow's features to provide accurate answers.
  - saved chats
