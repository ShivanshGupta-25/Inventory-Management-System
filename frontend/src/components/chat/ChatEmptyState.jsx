
import { MessageCircle } from "lucide-react";

const ChatEmptyState = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 text-amber-600">
        <MessageCircle size={36} />
      </div>

      <h2 className="mt-6 text-xl font-bold text-slate-900">
        Your team inbox
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Select a conversation to collaborate with your
        administrators, managers, and staff members.
      </p>
    </div>
  );
};

export default ChatEmptyState;