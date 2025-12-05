# Indexes and branches

Read the docs about indexes in firebase console and protecting the master branch in github, I'll need a step-by-step guide how to protect the branch and optimize indexes
My main branch isnt protected, also in Firebase console I got an warning about optimizing indexes.

# actions.js

- Is it a problem if every admin function needs a server action to be called from the client, also some of them are called from an api?

# Review

- offline support - works but still needs review
- sw.js
- how do I test the push notifs?
- anonymous data deletion
- autoDelayIncompleteTasks

# Repeating tasks

In one task, I can see that it has these properties inside firestore:
completedAt: 1763391253011 (This monday)
repetitionRule.completedAt [] (empty arr)

In the /tasks, I remember that I've completed it on monday. But it says 0/2 done, instead of 1/2. my only clue is that somehow we accidentally updated/reseted this task.

Human flag completedAt was yesterday, its repetitionRule.completions is 0 and repetitionRule.completedAt is []

# Thesys

## Fonts - I noticed that C1Component uses a different font then mine

Inter is the default font used by C1 components. You can add it to your project by importing it in your global CSS file. The font and other styles can be customized later.
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

# stlying

https://docs.thesys.dev/guides/styling
