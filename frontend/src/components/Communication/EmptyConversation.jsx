import {
  MessageCircle,
  Plus,
} from "lucide-react";

const EmptyConversation = ({
  onNewConversation,
}) => {
  return (
    <div className="flex h-full min-h-[500px] items-center justify-center bg-slate-50/40 p-6">

      <div className="max-w-sm text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
          <MessageCircle
            size={30}
            className="text-blue-600"
          />
        </div>

        <h2 className="mt-5 text-lg font-semibold text-slate-900">
          No conversation selected
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Select a conversation from
          the list or start a new
          conversation with another
          member of your team.
        </p>

        <button
          type="button"
          onClick={onNewConversation}
          className="mx-auto mt-5 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={16} />

          New conversation
        </button>
      </div>
    </div>
  );
};

export default EmptyConversation;