# Indexes and branches

Read the docs about indexes in firebase console and protecting the master branch in github, I'll need a step-by-step guide how to protect the branch and optimize indexes
My main branch isnt protected, also in Firebase console I got an warning about optimizing indexes.

# actions.js

- Is it a problem if every admin function needs a server action to be called from the client, also some of them are called from an api?

# Review

- offline support
- sw.js
- how do I test the push notifs?
- anonymous data deletion
- autoDelayIncompleteTasks

# clientCache and UploadFile not used

# chat sidebar

- when editing a title, chat sidebar expands a few pixels to fit in the input. I would like it to stay in place

# checkTutorialStatus

- I want to show that infoToast only if the user hasnt completed that tutorial and today was it first day of logging in to the app.
  Create a localstorage variable only if its users first day of logging in to the app.
  You can actually use our clientCache, then dont show that infoToast if tutorial was completed

# AI assitant

- I logged in as a guest and asked the AI 2 PROMPTS, not one, and after that I still see 1 prompt left today in the /webapp/ai page in the empty chat. In the today's usage, it still says 0/1 prompts used.
  so, our limit for the AI prompts used isnt working

- Also, our AI assitant cannot load images, it displays a loading indicator
  I asked the AI to create a diagram for stripe webhooks, I dont know why it is trying to load this:
  installHook.js:1 Failed to load image: https://stripe.com/img/v3/webhooks-diagram@2x.png

When I enter that in the url it says not found.

rounded-2xl on the parent

# anonymous cleanup

- when does it get executed
- does it make sense to delete users from one hour ago?
- Should we delete all anonymous users when the function runs?

# Barcode scanner

- ingredients are a bit misplaced
- I want nova score to be in color (red worst)
- nutrient levels are missing
- when logging, log settings needs to be right below the saved meal
- need a option to delete and view all saved meals
