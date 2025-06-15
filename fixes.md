# Done

## These actions are performed / set state values by user in order:

1. Duration is defined, startTime is undefined, endTime is undefined
   normally set duration, startTime is set at 00:00 (beginning of a day), set endTime to 23:59 (end of a day)
   task can be completed at any time of a day (basically startTime until endTime)

2. Duration is defined, startTime is defined, endTime is undefined
   normally set duration and startTime, endTime is calculated based on a startTime + duration
   task can be completed from startTime to endTime

3. Duration is defined, startTime is defined, endTime is defined
   ! Will never be the case if executed in this order, action 2. will ocur (calc the endTime)

4. Duration is undefined, startTime is defined, endTime is undefined
   dont set duration, set normally startTime, set endTime to 23:59 (end of a day)
   task can be completed any time from startTime until the end of a day (23:59)

5. Duration is undefined, startTime is defined, endTime is defined
   calculate the duration using endTime - startTime, normally set startTime and endTime
   task can be completed any time from startTime until endTime

6. Duration is undefined, startTime is undefined, endTime is defined
   dont set duration, startTime is set at 00:00 (beginning of a day), normally set endTime
   task can be completed at any time of a day until endTime (basically startTime until endTime)

7. Duration is undefined, startTime is undefined, endTime is undefined
   dont set duration, set startTime to 00:00 (beginning of a day) and endTime to 23:59 (end of a day)
   task can be completed at any time of a day (basically startTime until endTime)

8. Duration is defined, startTime is undefined, endTime is defined
   normally set duration and endTime but dont calculate startTime, it should stay at 00:00
   task can be completed until endTime (basically startTime until endTime)

# Fixes

handleDurationChange is being called only when both number are specified in the any duration field (hour || min)
