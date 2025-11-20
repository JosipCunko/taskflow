# Indexes and branches

Read the docs about indexes in firebase console and protecting the master branch in github, I'll need a step-by-step guide how to protect the branch and optimize indexes
My main branch isnt protected, also in Firebase console I got an warning about optimizing indexes.

# actions.js

- Is it a problem if every admin function needs a server action to be called from the client, also some of them are called from an api?

# Youtube summarizer

- Needs review:

YoutubeBackgroundProcessor
route.ts /create-tasks
route.ts /process

The plan is this: I want to fetch the videos that were newly created by accounts I am subscribed to. The max is last 7 days
I dont have the API key from youtube, so I dont know how to get it, how and from where do I get it?

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

# Inbox

unread number is often unread messages + 1

# Tasks on Dashboard (/webapp)

### Test Scenario 1: Repeating Task Completion

1. Create a repeating task (e.g., "5 times per week")
2. Complete 1 instance today
3. Check dashboard:
   - ✅ Completed count should increase by 1
   - ✅ Pending count should decrease by 1
   - ✅ Available points should decrease by task points

### Test Scenario 2: Mixed Tasks

1. Have both regular and repeating tasks due today
2. Complete some of each type
3. Verify:
   - ✅ Pending count reflects both types of incomplete tasks
   - ✅ Completed count reflects both types of completed tasks
   - ✅ Available points shows sum of all incomplete tasks

### Test Scenario 3: Points Accuracy

1. Create repeating task (starts at 10 points)
2. Complete it several times
3. Verify:
   - ✅ Points increase to max 10 (for interval tasks)
   - ✅ Available points match the current task points value
