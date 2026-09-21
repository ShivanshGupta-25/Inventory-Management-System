
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  FileText,
  Paperclip,
  Send,
  Users,
  X,
} from "lucide-react";

import MessageItem from "./MessageItem";

/* =====================================================
   CONSTANTS
===================================================== */

const MAX_FILES = 5;

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

/* =====================================================
   HELPERS
===================================================== */

const getId = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return (
      value._id ||
      value.id ||
      value.userId ||
      value.user?._id ||
      value.user?.id ||
      null
    );
  }

  return null;
};

const getParticipantUser = (participant) => {
  if (!participant) return null;

  if (participant.user) {
    return participant.user;
  }

  return participant;
};

const getConversationName = (
  conversation,
  currentUserId
) => {
  if (!conversation) {
    return "Conversation";
  }

  if (conversation.type === "group") {
    return conversation.name || "Unnamed group";
  }

  const participants =
    conversation.participants ||
    conversation.users ||
    [];

  const currentId = String(currentUserId || "");

  const otherParticipant = participants.find(
    (participant) => {
      const user = getParticipantUser(participant);

      const participantId =
        getId(user) ||
        getId(participant);

      return (
        participantId &&
        String(participantId) !== currentId
      );
    }
  );

  if (otherParticipant) {
    const user = getParticipantUser(otherParticipant);

    return (
      user?.name ||
      user?.email ||
      "Direct conversation"
    );
  }

  return (
    conversation.name ||
    "Direct conversation"
  );
};

const getInitials = (name = "") => {
  const value = name.trim();

  if (!value) return "?";

  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();
};

const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* =====================================================
   COMPONENT
===================================================== */

const ConversationWindow = ({
  conversation,
  messages = [],
  currentUserId,
  typingUsers,
  loading,
  onSend,
  onTypingStart,
  onTypingStop,
  onBack,
}) => {
  const [text, setText] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [filePreviews, setFilePreviews] = useState([]);

  const [fileError, setFileError] = useState("");

  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const fileInputRef = useRef(null);

  /* =====================================================
     CONVERSATION NAME
  ===================================================== */

  const conversationName = getConversationName(
    conversation,
    currentUserId
  );

  /* =====================================================
     SCROLL TO BOTTOM
  ===================================================== */

  useEffect(() => {
    if (!messagesEndRef.current) {
      return;
    }

    messagesEndRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  /* =====================================================
     FILE PREVIEWS
  ===================================================== */

  useEffect(() => {
    const previews = selectedFiles.map((file) => ({
      file,

      url: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));

    setFilePreviews(previews);

    return () => {
      previews.forEach((preview) => {
        if (preview.url) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [selectedFiles]);

  /* =====================================================
     FILE SELECTION
  ===================================================== */

  const handleFileChange = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) {
      return;
    }

    setFileError("");

    const availableSlots =
      MAX_FILES - selectedFiles.length;

    if (availableSlots <= 0) {
      setFileError(
        `You can attach up to ${MAX_FILES} files.`
      );

      event.target.value = "";
      return;
    }

    const filesToAdd = files.slice(
      0,
      availableSlots
    );

    const validFiles = [];

    for (const file of filesToAdd) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setFileError(
          `"${file.name}" is not a supported file type.`
        );

        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setFileError(
          `"${file.name}" exceeds the 10 MB file size limit.`
        );

        continue;
      }

      const duplicate = selectedFiles.some(
        (existingFile) =>
          existingFile.name === file.name &&
          existingFile.size === file.size &&
          existingFile.lastModified === file.lastModified
      );

      if (duplicate) {
        continue;
      }

      validFiles.push(file);
    }

    if (files.length > availableSlots) {
      setFileError(
        `You can attach up to ${MAX_FILES} files.`
      );
    }

    if (validFiles.length > 0) {
      setSelectedFiles((current) => [
        ...current,
        ...validFiles,
      ]);
    }

    event.target.value = "";
  };

  /* =====================================================
     REMOVE FILE
  ===================================================== */

  const removeSelectedFile = (index) => {
    setSelectedFiles((current) =>
      current.filter(
        (_, fileIndex) => fileIndex !== index
      )
    );

    setFileError("");
  };

  /* =====================================================
     CLEAR FILES
  ===================================================== */

  const clearSelectedFiles = () => {
    setSelectedFiles([]);

    setFileError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =====================================================
     FILE PICKER
  ===================================================== */

  const openFilePicker = () => {
    if (sending) {
      return;
    }

    if (selectedFiles.length >= MAX_FILES) {
      setFileError(
        `You can attach up to ${MAX_FILES} files.`
      );

      return;
    }

    fileInputRef.current?.click();
  };

  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  const submit = async (event) => {
    event.preventDefault();

    const value = text.trim();

    if (!value && selectedFiles.length === 0) {
      return;
    }

    try {
      setSending(true);

      await onSend(value, selectedFiles);

      setText("");

      setSelectedFiles([]);

      setFileError("");

      onTypingStop?.();

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  /* =====================================================
     TEXT INPUT
  ===================================================== */

  const handleChange = (event) => {
    const value = event.target.value;

    setText(value);

    if (value.trim()) {
      onTypingStart?.();
    } else {
      onTypingStop?.();
    }
  };

  /* =====================================================
     KEYBOARD
  ===================================================== */

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (!sending) {
        submit(event);
      }
    }
  };

  /* =====================================================
     EMPTY CONVERSATION
  ===================================================== */

  if (!conversation) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-white">
        <div className="text-center text-gray-500">
          <p className="text-sm">
            Select a conversation to start messaging.
          </p>
        </div>
      </div>
    );
  }

  const typingNames = Array.isArray(typingUsers)
    ? typingUsers
    : [];

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">

        {/* MOBILE BACK */}

        <button
          type="button"
          onClick={onBack}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          aria-label="Back"
        >
          <ArrowLeft size={19} />
        </button>

        {/* AVATAR */}

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
          {conversation.type === "group"
            ? "G"
            : getInitials(conversationName)}
        </div>

        {/* CONVERSATION DETAILS */}

        <div className="min-w-0 flex-1">

          <h2 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
            {conversationName}
          </h2>

          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <Users size={13} />

            <span>
              {conversation.participants?.length || 0} participants
            </span>
          </div>

        </div>

      </header>

      {/* =================================================
          MESSAGE AREA
      ================================================= */}

      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">

        <div className="min-h-full px-4 py-4 sm:px-5">

          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <p className="text-sm text-slate-500">
                Loading messages...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="text-center">

                <p className="text-sm font-medium text-slate-700">
                  No messages yet
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Send a message to start the conversation.
                </p>

              </div>
            </div>
          ) : (
            <div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-3">

              {messages.map((message) => {
                const senderId =
                  message.sender?._id ||
                  message.sender?.id ||
                  message.senderId ||
                  message.userId;

                const own =
                  String(senderId) ===
                  String(currentUserId);

                return (
                  <MessageItem
                    key={message.id || message._id}
                    message={message}
                    own={own}
                  />
                );
              })}

              <div
                ref={messagesEndRef}
                className="h-px"
              />

            </div>
          )}

        </div>
      </div>

      {/* =================================================
          TYPING INDICATOR
      ================================================= */}

      {typingNames.length > 0 && (
        <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-2">

          <div className="mx-auto max-w-4xl truncate text-xs text-slate-400">
            {typingNames.join(", ")}

            {typingNames.length === 1
              ? " is typing..."
              : " are typing..."}
          </div>

        </div>
      )}

      {/* =================================================
          ATTACHMENT PREVIEW
      ================================================= */}

      {selectedFiles.length > 0 && (
        <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-4 py-3">

          <div className="mx-auto min-w-0 max-w-4xl">

            <div className="mb-2 flex items-center justify-between">

              <p className="text-xs font-medium text-slate-600">
                Attachments ({selectedFiles.length}/{MAX_FILES})
              </p>

              <button
                type="button"
                onClick={clearSelectedFiles}
                className="text-xs text-slate-500 transition hover:text-slate-700"
              >
                Clear all
              </button>

            </div>

            <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">

              {filePreviews.map((preview, index) => {
                const file = preview.file;

                const isImage =
                  file.type.startsWith("image/");

                return (
                  <div
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="relative flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >

                    {isImage ? (
                      <img
                        src={preview.url}
                        alt={file.name}
                        className="h-24 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-24 items-center justify-center bg-slate-100">
                        <FileText
                          size={30}
                          className="text-slate-500"
                        />
                      </div>
                    )}

                    <div className="min-w-0 px-2 py-2">

                      <p className="truncate text-xs font-medium text-slate-700">
                        {file.name}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        {formatFileSize(file.size)}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={14} />
                    </button>

                  </div>
                );
              })}

            </div>
          </div>
        </div>
      )}

      {/* =================================================
          FILE ERROR
      ================================================= */}

      {fileError && (
        <div className="shrink-0 bg-white px-4 pb-2">

          <div className="mx-auto max-w-4xl rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {fileError}
          </div>

        </div>
      )}

      {/* =================================================
          MESSAGE COMPOSER
      ================================================= */}

      <form
        onSubmit={submit}
        className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-5"
      >

        <div className="mx-auto flex min-w-0 max-w-4xl items-end gap-2">

          {/* HIDDEN FILE INPUT */}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept={ALLOWED_MIME_TYPES.join(",")}
            onChange={handleFileChange}
          />

          {/* ATTACHMENT BUTTON */}

          <button
            type="button"
            onClick={openFilePicker}
            disabled={
              sending ||
              selectedFiles.length >= MAX_FILES
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Attach files"
            title="Attach files"
          >
            <Paperclip size={18} />
          </button>

          {/* TEXT INPUT */}

          <div className="flex min-h-11 min-w-0 flex-1 items-end rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">

            <textarea
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={() => onTypingStop?.()}
              rows={1}
              disabled={sending}
              placeholder="Type a message..."
              className="max-h-32 min-h-[27px] min-w-0 flex-1 resize-none border-0 bg-transparent p-0 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
            />

          </div>

          {/* SEND BUTTON */}

          <button
            type="submit"
            disabled={
              sending ||
              (!text.trim() && selectedFiles.length === 0)
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="Send message"
          >
            {sending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send size={17} />
            )}
          </button>

        </div>

        <p className="mx-auto mt-1.5 max-w-4xl text-[11px] text-slate-400">
          Enter to send · Shift + Enter for a new line · Up to 5 files, 10 MB each
        </p>

      </form>

    </div>
  );
};

export default ConversationWindow;