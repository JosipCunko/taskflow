### Core Productivity Enhancements

**1. Enhanced Collaboration: Shared Projects and Task Assignment**

Allow users to invite others to their projects, assign tasks to specific people, and leave comments. This would transform Taskflow from a personal tool into a collaborative platform for families, students, or small teams.

- **Why?** Collaboration is a key feature for growth, allowing teams to use Taskflow for their work. Todoist's business plan is built around this.
- **Implementation Idea:**
  - You'd need to extend your data model to include project members and an `assignedTo` field on tasks.
  - Implement an invitation system (e.g., by email).
  - The UI would need to show who is assigned to each task and include a comments section within the `TaskCard` or a task detail view.
