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

# AI Feature

When I told gemini 2.5 Pro to tell me two sentences about castor oil, it responded with this:
". However, while it can improve the health of existing hair, there is little scientific evidence to prove it directly stimulates new growth."

IT SEEMS IT CROPPED OUT CONTENT, that is way gemini respondend with nothing ("No response generated") on some requests, it crops out, slices some text, clearly it has other formatting.

# Repeating tasks

In one task, I can see that it has these properties inside firestore:
completedAt: 1763391253011 (This monday)
repetitionRule.completedAt [] (empty arr)

In the /tasks, I remember that I've completed it on monday. But it says 0/2 done, instead of 1/2. my only clue is that somehow we accidentally updated/reseted this task.

Human flag completedAt was yesterday, its repetitionRule.completions is 0 and repetitionRule.completedAt is []
