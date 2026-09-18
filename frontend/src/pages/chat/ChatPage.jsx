
import ChatLayout from "../../components/chat/ChatLayout";
import ChatProvider from "../../context/ChatContext";

const ChatPage = () => {
  return (
    <ChatProvider>
      <main className="min-h-full bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
              Team Collaboration
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Team Chat
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Communicate securely with your inventory team.
            </p>
          </div>

          <ChatLayout />
        </div>
      </main>
    </ChatProvider>
  );
};

export default ChatPage;