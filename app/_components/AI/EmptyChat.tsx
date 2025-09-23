import Button from "../reusable/Button";

interface EmptyChatProps {
  onExampleClick: (query: string) => void;
}

export default function EmptyChat({ onExampleClick }: EmptyChatProps) {
  const exampleQueries = [
    "Show me my pending tasks for today",
    "Create a task to review project proposal due tomorrow",
    "Delay my gym workout task to next Monday",
    "Show me my priority tasks and suggest a schedule",
    "Complete my morning reading task with good experience",
    "Create a note about meeting ideas",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold mb-8">What can I help with?</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {exampleQueries.map((query) => (
          <Button
            variant="secondary"
            key={query}
            onClick={() => onExampleClick(query)}
            className="text-left"
          >
            <p className="text-sm">{query}</p>
          </Button>
        ))}
      </div>
    </div>
  );
}
