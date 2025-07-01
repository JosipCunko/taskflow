import { SearchedTask, Task } from "@/app/_types/types";

export async function searchUserTasks(
  query: string,
  tasks: Task[]
): Promise<SearchedTask[]> {
  if (!query.trim()) {
    return [];
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  const filteredUserTasks = tasks.filter((task) => {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      icon: task.icon,
      color: task.color,
    };
  });

  const lowerCaseQuery = query.toLowerCase();
  return filteredUserTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(lowerCaseQuery) ||
      (task.description &&
        task.description.toLowerCase().includes(lowerCaseQuery))
  );
}
