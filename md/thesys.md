Implementation Complete
I've successfully integrated Thesys AI alongside your existing OpenRouter implementation. Here's what was created/modified:
New Files Created:
app/api/ai/thesys/route.ts - API endpoint for Thesys
Connects to Thesys API at https://api.thesys.dev/v1/embed/chat/completions
Uses the c1-nightly model
Includes all your task management tools (show_tasks, create_task, complete_task, etc.)
Enhanced system prompt for rich UI generation (charts, tables, cards)
Handles streaming responses
app/\_components/AI/ThesysChat.tsx - Thesys C1Chat wrapper
Wraps the C1Chat component with TaskFlow theming
Dark mode theme matching your app's color scheme
Full-page form factor
app/\_components/AI/AIModeSelector.tsx - Mode switcher UI
Dropdown to switch between "Standard" (OpenRouter) and "Rich UI" (Thesys) modes
Shows "New" badge on Rich UI option
Animated dropdown with Framer Motion
app/\_components/AI/AIPageClient.tsx - Client-side page wrapper
Manages the mode state (defaults to Rich UI mode)
Conditionally renders Chat or ThesysChat based on mode
Shows ChatSidebar only in Standard mode
Modified Files:
app/webapp/ai/page.tsx - Updated to use AIPageClient
app/webapp/ai/[chatId]/page.tsx - Updated to use AIPageClient
app/webapp/ai/layout.tsx - Simplified (sidebar moved to AIPageClient)
app/globals.css - Added Thesys integration styles
package.json - Added Thesys SDK and peer dependencies
Dependencies Added:
@thesysai/genui-sdk
@crayonai/react-core
@crayonai/react-ui
@crayonai/stream
zustand
@radix-ui/react-dialog
How to Use:
Navigate to /webapp/ai
Use the mode selector at the top to switch between:
Standard: Your original OpenRouter text-based chat with history sidebar
Rich UI: Thesys-powered chat with interactive charts, tables, and formatted responses
