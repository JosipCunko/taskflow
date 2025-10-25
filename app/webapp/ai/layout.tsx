import ChatSidebar from "@/app/_components/AI/ChatSidebar";

export default function AILayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden items-center">
      <div>{children}</div>
      <ChatSidebar />
    </div>
  );
}
