import React from "react";
import { ArrowLeft, Forward, Trash2 } from "lucide-react";

const MessageSelectionToolbar = ({
  selectedCount = 0,
  onCancel,
  onForward,
  onDelete,
  processing = false,
}) => {
  return (
    <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Cancel selection"
          title="Cancel"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {selectedCount} selected
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Choose an action
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onForward}
          disabled={processing || selectedCount === 0}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Forward selected messages"
          title="Forward"
        >
          <Forward size={20} />
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={processing || selectedCount === 0}
          className="flex h-10 w-10 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-950/30"
          aria-label="Delete selected messages"
          title="Delete"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default MessageSelectionToolbar;