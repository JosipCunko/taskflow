import { Inbox, Smile } from "lucide-react";

export default function InboxPage() {
  return (
    <div className="p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <Inbox className="w-8 h-8 mr-3 text-primary-500" />
          Inbox
        </h1>
        <p className="text-text-low flex items-center gap-2">
          Inbox functionality comming up... <Smile className="w-4 h-4" />
        </p>
      </div>
    </div>
  );
}
