# Tutorial System

A comprehensive interactive tutorial system for TaskFlow that guides new users through key features.

## Features

- **Automatic Display**: Shows tutorial automatically on first login of the day for new users
- **Interactive Overlay**: Step-by-step guided tour with highlights on specific UI elements
- **Keyboard Navigation**: Arrow keys, Enter, and Esc for accessibility
- **Manual Trigger**: Users can restart tutorial from Profile Settings
- **Non-blocking**: Can be skipped or closed without interfering with app usage
- **Responsive**: Adapts to different screen sizes (max 500x500px)
- **Toast Feedback**: Success notification upon completion

## Components

### `TutorialProvider`
- Context provider that manages tutorial state
- Detects first login of the day via API
- Stores completion status in localStorage
- Provides tutorial controls to child components

### `TutorialOverlay`
- Main tutorial UI component
- Interactive step-by-step guide
- Highlights target elements with visual overlay
- Progress tracking and navigation controls

### `API Route: /api/user/tutorial-check`
- Server-side endpoint to determine first login status
- Checks user's lastLoginAt timestamp
- Returns boolean for tutorial trigger logic

## Tutorial Steps

1. **Welcome** - Introduction to TaskFlow
2. **Dashboard** - Overview of main dashboard
3. **Add Task** - How to create new tasks
4. **View Tasks** - Navigate task sections (Today, All Tasks, Calendar)
5. **Health Section** - Introduction to nutrition tracking
6. **Save Meals** - Creating meal templates
7. **Log Meals** - Recording daily food intake

## Usage

The tutorial is automatically integrated into the webapp layout and will show for new users. Users can also manually trigger it from Profile > Settings > Help & Tutorial.

## Configuration

Tutorial steps are defined in `tutorialSteps` array within `TutorialOverlay.tsx`. Each step includes:
- `title` and `description`
- `icon` component
- `position` for tooltip placement
- Optional `targetSelector` and `highlight` for element targeting

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- Focus management
- Skip/close options always available
- Visual indicators and progress tracking