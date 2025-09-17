import { Exercise } from "../_types/types";

export const defaultExercises: Omit<Exercise, "id">[] = [
  // Chest
  {
    name: "Barbell Bench Press",
    category: "Chest",
    muscleGroups: ["Chest", "Triceps", "Shoulders"],
    equipment: "Barbell",
    instructions: [
      "Lie flat on bench with feet on floor",
      "Grip bar slightly wider than shoulder width",
      "Lower bar to chest with control",
      "Press bar up to starting position"
    ]
  },
  {
    name: "Dumbbell Bench Press",
    category: "Chest",
    muscleGroups: ["Chest", "Triceps", "Shoulders"],
    equipment: "Dumbbells",
    instructions: [
      "Lie on bench with dumbbells in each hand",
      "Start with arms extended above chest",
      "Lower weights to chest level",
      "Press weights back to starting position"
    ]
  },
  {
    name: "Incline Barbell Press",
    category: "Chest",
    muscleGroups: ["Upper Chest", "Triceps", "Shoulders"],
    equipment: "Barbell",
  },
  {
    name: "Push-ups",
    category: "Chest",
    muscleGroups: ["Chest", "Triceps", "Core"],
    equipment: "Bodyweight",
  },
  
  // Back
  {
    name: "Deadlift",
    category: "Back",
    muscleGroups: ["Back", "Glutes", "Hamstrings", "Core"],
    equipment: "Barbell",
    instructions: [
      "Stand with feet hip-width apart",
      "Grip bar with hands just outside legs",
      "Keep back straight, chest up",
      "Drive through heels to lift bar"
    ]
  },
  {
    name: "Pull-ups",
    category: "Back",
    muscleGroups: ["Lats", "Biceps", "Rhomboids"],
    equipment: "Pull-up Bar",
  },
  {
    name: "Barbell Rows",
    category: "Back",
    muscleGroups: ["Lats", "Rhomboids", "Middle Traps"],
    equipment: "Barbell",
  },
  {
    name: "Lat Pulldowns",
    category: "Back",
    muscleGroups: ["Lats", "Biceps", "Rhomboids"],
    equipment: "Cable Machine",
  },
  
  // Legs
  {
    name: "Barbell Squat",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
    equipment: "Barbell",
    instructions: [
      "Position bar on upper back",
      "Stand with feet shoulder-width apart",
      "Lower by pushing hips back and bending knees",
      "Drive through heels to return to standing"
    ]
  },
  {
    name: "Romanian Deadlift",
    category: "Legs",
    muscleGroups: ["Hamstrings", "Glutes", "Lower Back"],
    equipment: "Barbell",
  },
  {
    name: "Leg Press",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes"],
    equipment: "Leg Press Machine",
  },
  {
    name: "Walking Lunges",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
    equipment: "Dumbbells",
  },
  
  // Shoulders
  {
    name: "Overhead Press",
    category: "Shoulders",
    muscleGroups: ["Shoulders", "Triceps", "Core"],
    equipment: "Barbell",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Grip bar at shoulder width",
      "Press bar straight up overhead",
      "Lower bar back to shoulder level"
    ]
  },
  {
    name: "Dumbbell Shoulder Press",
    category: "Shoulders",
    muscleGroups: ["Shoulders", "Triceps"],
    equipment: "Dumbbells",
  },
  {
    name: "Lateral Raises",
    category: "Shoulders",
    muscleGroups: ["Side Delts"],
    equipment: "Dumbbells",
  },
  {
    name: "Face Pulls",
    category: "Shoulders",
    muscleGroups: ["Rear Delts", "Rhomboids"],
    equipment: "Cable Machine",
  },
  
  // Arms
  {
    name: "Barbell Curls",
    category: "Arms",
    muscleGroups: ["Biceps"],
    equipment: "Barbell",
  },
  {
    name: "Tricep Dips",
    category: "Arms",
    muscleGroups: ["Triceps"],
    equipment: "Bodyweight",
  },
  {
    name: "Hammer Curls",
    category: "Arms",
    muscleGroups: ["Biceps", "Forearms"],
    equipment: "Dumbbells",
  },
  {
    name: "Close-Grip Bench Press",
    category: "Arms",
    muscleGroups: ["Triceps", "Chest"],
    equipment: "Barbell",
  },
  
  // Core
  {
    name: "Plank",
    category: "Core",
    muscleGroups: ["Core", "Shoulders"],
    equipment: "Bodyweight",
  },
  {
    name: "Russian Twists",
    category: "Core",
    muscleGroups: ["Obliques", "Core"],
    equipment: "Bodyweight",
  },
  {
    name: "Hanging Leg Raises",
    category: "Core",
    muscleGroups: ["Lower Abs", "Hip Flexors"],
    equipment: "Pull-up Bar",
  },
  {
    name: "Mountain Climbers",
    category: "Core",
    muscleGroups: ["Core", "Shoulders", "Legs"],
    equipment: "Bodyweight",
  }
];