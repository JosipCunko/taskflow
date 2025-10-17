import Button from "../reusable/Button";

interface EmptyChatProps {
  onExampleClick: (query: string) => void;
}

export default function EmptyChat({ onExampleClick }: EmptyChatProps) {
  const exampleQueries = [
    "Show me my pending tasks for today",
    "Explain the concept of AI in a way that is easy to understand.",
    "What are some healthy, quick lunch ideas?",
    "Generate a gym workout plan for 3 days a week.",
    "Give me 5 tips to stay focused and avoid procrastination.",
    "Show me my priority tasks and suggest a schedule",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-3 sm:px-4 md:px-6 pt-16 md:pt-0">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center">
        What can I help with?
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl">
        {exampleQueries.map((query) => (
          <Button
            variant="secondary"
            key={query}
            onClick={() => onExampleClick(query)}
            className="text-left"
          >
            <p className="text-xs sm:text-sm">{query}</p>
          </Button>
        ))}
      </div>
    </div>
  );
}
