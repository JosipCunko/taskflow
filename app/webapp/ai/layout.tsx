import ChatSidebar from "@/app/_components/AI/ChatSidebar";

export default function AILayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex-1 h-full overflow-hidden">{children}</div>
      <ChatSidebar />
    </div>
  );
}
