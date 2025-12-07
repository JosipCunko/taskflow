**1. Recipe Discovery and Suggestions**

Integrate a recipe discovery feature that allows users to search for recipes by name or ingredients. Include filtering options for cuisine, diet, meal type, and preparation time. Also, provide a section for daily recipe suggestions to inspire users.

- **Why?** This would greatly enhance the health module by helping users with meal planning, finding new healthy meal ideas, and making the app more engaging for users focused on their nutrition.
- **Implementation Idea:**
  - Build a search interface with various filters.
  - Display recipe cards with key information (image, title, cooking time).
  - A recipe detail view could show ingredients and instructions.
  - A "suggestions" component could show a few random recipes on the health dashboard.

**2. Firebase Storage for User-Generated Content**

- **Idea:** Use Firebase Storage to manage user-uploaded images. This includes photos of meals for the health tracker and profile pictures for users who sign up with an email address instead of an OAuth provider.
- **Why?** Storing binary data like images requires a dedicated solution. Firebase Storage is secure, scalable, and integrates seamlessly with the rest of the Firebase ecosystem (like Firestore and Authentication).
- **Implementation Idea:**
  - Set up a Firebase Storage bucket.
  - Create security rules to control access (e.g., users can only write to their own folder and read public profile pictures).
  - Build UI components for uploading and displaying images in the user's profile settings and the meal logging flow.

**3. Upgrading to Firebase "Blaze" Plan for Advanced Features**

- **Idea:** Move from the free "Spark" plan to the pay-as-you-go "Blaze" plan to unlock Firebase's more powerful features.
- **Why?** The Spark plan has strict limitations that prevent the implementation of more advanced, scalable features. The Blaze plan offers generous free tiers for most services, so costs remain low for small projects while providing the flexibility to scale.
- **Explanation of Blaze Plan Benefits:**
  The Blaze plan unlocks a suite of powerful tools essential for building a feature-rich application. This includes **Cloud Functions**, which allow for running server-side code in response to events (e.g., sending a welcome email on user signup or processing an image after upload). It also provides **Cloud Messaging (FCM)** for sending push notifications to keep users engaged. For more advanced capabilities, it opens up Firebase's **AI/ML services** for tasks like text recognition or creating smart replies, expanded **Cloud Storage** quotas, and **Crashlytics** for real-time crash reporting to quickly identify and fix bugs.

**4. Point reduction**

- task that are set as priority need to have bigger points reduction

**5. Middleware**

- read @middleware.md to get ideas and insights of how can taskflow benifit of middleware

**6. Stripe**
I want to include some kind of payments inside my app. It is only monthly subscriptions for now. I want to have 3 options:
Base, Pro and Ultra.
Base plan is free plan, user can prompt the AI assistant at any model once per day and cant view analytics dashboard component in the dashboard page, but the data is still stored, just that user cant monitor it. On the pro plan, user can view the analyticsdashboard page and can prompt ai assitant at any model 10 times per day. At ultra plan, user dont have limitation on the AI assistant and can view analyticsdashboard component. That is just for now, if you think of some features that should be prohibited on the lower plans feel free to add it but let me know.
Base plan is $0, Pro $4.99 and Ultra $14.99 per month. Feel free to add some suggestions for the prices and features of specific plans.

We need to create new section in the landing page (pricing plan cards) so users can see the pricing plan, also add a link component in the navbar to scroll to the pricing section.

Its optimal to store specific data about current plan on the user object. For now I think of these properties:
currentPlan: "base" | "pro" | "ultra"
planExpiresAt: number // unix timestamp

- feel free to add some more properties but let me know

I want to use stripe for handling subscriptions:
I just created a new account in stripe called Taskflow.
It asks me how do I want to start, and need to select any or more of the following:
non-recurring and recurring payments, invoices, tax collection, identity verification, fraud protection, build a platform or marketplace, card issuing, climate contributions, bank data access, connect with a business that's using stripe

I dont know how to set an API key and configure it or anything, so please search the web and for the stripe docs.

**7. Sendgrid**

- password reset and welcome mail
