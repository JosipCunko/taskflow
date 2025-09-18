import { Exercise } from "../app/_types/types";
export const defaultExercises: Omit<Exercise, "id">[] = [
  // ---------------------- CHEST ----------------------
  {
    name: "Barbell Bench Press",
    category: "Chest",
    muscleGroups: ["Chest", "Triceps", "Shoulders"],
    equipment: "Barbell",
    instructions: [
      "Lie flat on bench with feet on floor",
      "Grip bar slightly wider than shoulder width",
      "Lower bar to chest with control",
      "Press bar up to starting position",
    ],
  },
  {
    name: "Dumbbell Bench Press",
    category: "Chest",
    muscleGroups: ["Chest", "Triceps", "Shoulders"],
    equipment: "Dumbbells",
    instructions: [
      "Lie on bench holding dumbbells above chest",
      "Lower weights to chest level with elbows at 45°",
      "Press back up until arms are straight",
    ],
  },
  {
    name: "Incline Barbell Press",
    category: "Chest",
    muscleGroups: ["Upper Chest", "Triceps", "Shoulders"],
    equipment: "Barbell",
    instructions: [
      "Set bench at 30–45° incline",
      "Grip bar slightly wider than shoulders",
      "Lower to upper chest",
      "Press bar up in a straight line",
    ],
  },
  {
    name: "Incline Dumbbell Press",
    category: "Chest",
    muscleGroups: ["Upper Chest", "Triceps", "Shoulders"],
    equipment: "Dumbbells",
    instructions: [
      "Lie on incline bench with dumbbells",
      "Lower to chest while keeping elbows tucked",
      "Press upward until arms are extended",
    ],
  },
  {
    name: "Chest Fly (Dumbbell)",
    category: "Chest",
    muscleGroups: ["Chest"],
    equipment: "Dumbbells",
    instructions: [
      "Lie on bench holding dumbbells above chest",
      "With elbows slightly bent, open arms wide",
      "Bring weights back together over chest",
    ],
  },
  {
    name: "Cable Crossover",
    category: "Chest",
    muscleGroups: ["Chest"],
    equipment: "Cable Machine",
    instructions: [
      "Set pulleys to shoulder height",
      "Grasp handles with palms down",
      "Step forward and bring hands together",
      "Return slowly with control",
    ],
  },
  {
    name: "Push-ups",
    category: "Chest",
    muscleGroups: ["Chest", "Triceps", "Core"],
    equipment: "Bodyweight",
    instructions: [
      "Place hands slightly wider than shoulders",
      "Keep body straight from head to heels",
      "Lower chest to floor",
      "Push back up until arms are straight",
    ],
  },

  // ---------------------- BACK ----------------------
  {
    name: "Deadlift",
    category: "Back",
    muscleGroups: ["Back", "Glutes", "Hamstrings", "Core"],
    equipment: "Barbell",
    instructions: [
      "Stand with feet hip-width apart",
      "Grip bar with hands just outside legs",
      "Keep chest up and back flat",
      "Drive through heels to lift",
    ],
  },
  {
    name: "Pull-ups",
    category: "Back",
    muscleGroups: ["Lats", "Biceps", "Rhomboids"],
    equipment: "Pull-up Bar",
    instructions: [
      "Hang from bar with overhand grip",
      "Pull chest toward bar",
      "Lower under control",
    ],
  },
  {
    name: "Chin-ups",
    category: "Back",
    muscleGroups: ["Lats", "Biceps"],
    equipment: "Pull-up Bar",
    instructions: [
      "Use underhand grip, shoulder-width apart",
      "Pull until chin clears bar",
      "Lower slowly",
    ],
  },
  {
    name: "Barbell Rows",
    category: "Back",
    muscleGroups: ["Lats", "Rhomboids", "Middle Traps"],
    equipment: "Barbell",
    instructions: [
      "Bend at hips, keep back flat",
      "Pull bar toward lower ribcage",
      "Lower under control",
    ],
  },
  {
    name: "One-Arm Dumbbell Row",
    category: "Back",
    muscleGroups: ["Lats", "Rhomboids"],
    equipment: "Dumbbell",
    instructions: [
      "Place one knee and hand on bench",
      "Hold dumbbell in opposite hand",
      "Pull weight to hip",
      "Lower slowly",
    ],
  },
  {
    name: "Back Extensions",
    category: "Back",
    muscleGroups: ["Lower Back", "Glutes", "Hamstrings"],
    equipment: "Hyperextension Bench",
    instructions: [
      "Position hips on pad with ankles secured",
      "Cross arms over chest or hold weight",
      "Lower torso until just past neutral",
      "Extend back up while keeping spine straight",
    ],
  },
  {
    name: "Seated Machine Row",
    category: "Back",
    muscleGroups: ["Lats", "Rhomboids", "Traps"],
    equipment: "Row Machine",
    instructions: [
      "Sit with chest against pad and feet braced",
      "Grasp handles with arms extended",
      "Pull handles toward torso",
      "Slowly return to start",
    ],
  },
  {
    name: "Lat Pulldown",
    category: "Back",
    muscleGroups: ["Lats", "Biceps", "Rear Delts"],
    equipment: "Cable Machine",
    instructions: [
      "Sit with thighs secured under pad",
      "Grip bar wider than shoulders",
      "Pull bar to chest",
      "Slowly return overhead",
    ],
  },
  {
    name: "Seated Cable Row",
    category: "Back",
    muscleGroups: ["Lats", "Rhomboids", "Traps"],
    equipment: "Cable Machine",
    instructions: [
      "Sit on row bench with feet braced",
      "Hold handle with straight arms",
      "Pull handle to abdomen",
      "Return slowly",
    ],
  },
  {
    name: "T-Bar Row",
    category: "Back",
    muscleGroups: ["Lats", "Rhomboids", "Traps"],
    equipment: "T-Bar Row Machine",
    instructions: [
      "Stand over T-bar with knees bent",
      "Pull bar toward chest",
      "Lower with control",
    ],
  },

  // ---------------------- LEGS ----------------------
  {
    name: "Barbell Squat",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
    equipment: "Barbell",
    instructions: [
      "Place bar across upper back",
      "Stand with feet shoulder-width apart",
      "Squat until thighs are parallel",
      "Drive up through heels",
    ],
  },
  {
    name: "Front Squat",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes", "Core"],
    equipment: "Barbell",
    instructions: [
      "Rack bar across front shoulders",
      "Keep elbows high and chest up",
      "Lower into squat, then stand",
    ],
  },
  {
    name: "Romanian Deadlift",
    category: "Legs",
    muscleGroups: ["Hamstrings", "Glutes", "Lower Back"],
    equipment: "Barbell",
    instructions: [
      "Hold bar with overhand grip",
      "Push hips back with soft knees",
      "Lower bar to mid-shin",
      "Return to standing by extending hips",
    ],
  },
  {
    name: "Leg Press",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes"],
    equipment: "Leg Press Machine",
    instructions: [
      "Sit in machine with feet shoulder-width",
      "Lower platform by bending knees",
      "Push through heels to extend legs",
    ],
  },
  {
    name: "Walking Lunges",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
    equipment: "Dumbbells",
    instructions: [
      "Hold dumbbells at sides",
      "Step forward and lower back knee",
      "Push off front foot into next lunge",
    ],
  },
  {
    name: "Leg Extension",
    category: "Legs",
    muscleGroups: ["Quadriceps"],
    equipment: "Leg Extension Machine",
    instructions: [
      "Sit with pads above ankles",
      "Extend legs until straight",
      "Lower slowly",
    ],
  },
  {
    name: "Leg Curl",
    category: "Legs",
    muscleGroups: ["Hamstrings"],
    equipment: "Leg Curl Machine",
    instructions: [
      "Lie face down on machine",
      "Hook heels under pad",
      "Curl heels toward glutes",
      "Lower with control",
    ],
  },
  {
    name: "Calf Raises",
    category: "Legs",
    muscleGroups: ["Calves"],
    equipment: "Bodyweight / Machine",
    instructions: [
      "Stand on step with heels off edge",
      "Push up onto toes",
      "Lower slowly",
    ],
  },

  // ---------------------- SHOULDERS ----------------------
  {
    name: "Overhead Press",
    category: "Shoulders",
    muscleGroups: ["Shoulders", "Triceps", "Core"],
    equipment: "Barbell",
    instructions: [
      "Stand with bar at shoulder level",
      "Press bar overhead",
      "Lower to start",
    ],
  },
  {
    name: "Dumbbell Shoulder Press",
    category: "Shoulders",
    muscleGroups: ["Shoulders", "Triceps"],
    equipment: "Dumbbells",
    instructions: [
      "Sit upright on bench",
      "Press dumbbells overhead",
      "Lower with control",
    ],
  },
  {
    name: "Lateral Raises",
    category: "Shoulders",
    muscleGroups: ["Side Delts"],
    equipment: "Dumbbells",
    instructions: [
      "Stand with dumbbells at sides",
      "Raise arms to shoulder height",
      "Lower slowly",
    ],
  },
  {
    name: "Front Raises",
    category: "Shoulders",
    muscleGroups: ["Front Delts"],
    equipment: "Dumbbells",
    instructions: [
      "Hold dumbbells in front of thighs",
      "Raise to shoulder level",
      "Lower with control",
    ],
  },
  {
    name: "Rear Delt Fly",
    category: "Shoulders",
    muscleGroups: ["Rear Delts", "Upper Back"],
    equipment: "Dumbbells / Machine",
    instructions: [
      "Hinge at hips holding dumbbells",
      "Raise arms out to sides",
      "Lower slowly",
    ],
  },
  {
    name: "Face Pulls",
    category: "Shoulders",
    muscleGroups: ["Rear Delts", "Rhomboids"],
    equipment: "Cable Machine",
    instructions: [
      "Set pulleys at upper chest height",
      "Pull rope toward face",
      "Squeeze shoulder blades",
    ],
  },

  // ---------------------- ARMS ----------------------
  {
    name: "Barbell Curl",
    category: "Arms",
    muscleGroups: ["Biceps"],
    equipment: "Barbell",
    instructions: [
      "Stand holding barbell at thighs",
      "Curl bar toward shoulders",
      "Lower with control",
    ],
  },
  {
    name: "Dumbbell Curl",
    category: "Arms",
    muscleGroups: ["Biceps"],
    equipment: "Dumbbells",
    instructions: [
      "Hold dumbbells at sides, palms forward",
      "Curl weights up",
      "Lower slowly",
    ],
  },
  {
    name: "Hammer Curl",
    category: "Arms",
    muscleGroups: ["Biceps", "Forearms"],
    equipment: "Dumbbells",
    instructions: [
      "Hold dumbbells with thumbs up",
      "Curl weights to shoulders",
      "Lower under control",
    ],
  },
  {
    name: "Tricep Dips",
    category: "Arms",
    muscleGroups: ["Triceps"],
    equipment: "Parallel Bars / Bench",
    instructions: [
      "Support body on bars with arms straight",
      "Lower until elbows at 90°",
      "Press back up",
    ],
  },
  {
    name: "Close-Grip Bench Press",
    category: "Arms",
    muscleGroups: ["Triceps", "Chest"],
    equipment: "Barbell",
    instructions: [
      "Lie on bench with narrow grip",
      "Lower bar to mid-chest",
      "Press back up",
    ],
  },
  {
    name: "Tricep Pushdown",
    category: "Arms",
    muscleGroups: ["Triceps"],
    equipment: "Cable Machine",
    instructions: [
      "Stand facing cable machine with bar or rope attached",
      "Keep elbows close to torso",
      "Push attachment down until arms are straight",
      "Return slowly keeping tension",
    ],
  },
  {
    name: "Reverse Curl",
    category: "Arms",
    muscleGroups: ["Biceps", "Forearms"],
    equipment: "Barbell / EZ Bar",
    instructions: [
      "Hold barbell with overhand grip at hip height",
      "Curl bar toward shoulders keeping elbows still",
      "Lower under control",
    ],
  },
  {
    name: "Cable Wrist Curl",
    category: "Arms",
    muscleGroups: ["Forearms"],
    equipment: "Cable Machine",
    instructions: [
      "Sit holding cable handle with underhand grip",
      "Rest forearms on thighs",
      "Curl wrist upward then lower slowly",
    ],
  },
  {
    name: "Overhead Tricep Extension",
    category: "Arms",
    muscleGroups: ["Triceps"],
    equipment: "Dumbbell / Cable",
    instructions: [
      "Hold weight overhead with both hands",
      "Lower behind head",
      "Extend arms fully",
    ],
  },
  {
    name: "Preacher Curl",
    category: "Arms",
    muscleGroups: ["Biceps"],
    equipment: "Preacher Bench",
    instructions: [
      "Rest upper arms on pad",
      "Curl bar toward shoulders",
      "Lower slowly",
    ],
  },

  // ---------------------- CORE ----------------------
  {
    name: "Plank",
    category: "Core",
    muscleGroups: ["Core", "Shoulders"],
    equipment: "Bodyweight",
    instructions: [
      "Place forearms on floor under shoulders",
      "Keep body straight",
      "Hold position",
    ],
  },
  {
    name: "Hanging Leg Raise",
    category: "Core",
    muscleGroups: ["Lower Abs", "Hip Flexors"],
    equipment: "Pull-up Bar",
    instructions: [
      "Hang from bar",
      "Raise legs until parallel",
      "Lower with control",
    ],
  },
  {
    name: "Cable Crunch",
    category: "Core",
    muscleGroups: ["Abs"],
    equipment: "Cable Machine",
    instructions: [
      "Kneel facing high pulley",
      "Hold rope behind neck",
      "Crunch forward",
      "Return slowly",
    ],
  },
  {
    name: "Ab Wheel Rollout",
    category: "Core",
    muscleGroups: ["Abs", "Core", "Lats"],
    equipment: "Ab Wheel",
    instructions: [
      "Kneel with wheel in hands",
      "Roll forward keeping core tight",
      "Return to start",
    ],
  },
];
