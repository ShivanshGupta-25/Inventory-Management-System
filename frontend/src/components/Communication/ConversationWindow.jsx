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

const MAX_FILES = 5;

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

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

const formatFileSize = (
  bytes = 0
) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
};

const ConversationWindow = ({
  conversation,
  messages,
  currentUserId,
  typingUsers,
  loading,
  onSend,
  onTypingStart,
  onTypingStop,
  onBack,
}) => {
  const [text, setText] =
    useState("");

  const [selectedFiles, setSelectedFiles] =
    useState([]);

  const [filePreviews, setFilePreviews] =
    useState([]);

  const [fileError, setFileError] =
    useState("");

  const [sending, setSending] =
    useState(false);

  /*
   * =====================================================
   * MESSAGE SCROLL REFS
   * =====================================================
   */

  const messagesContainerRef =
    useRef(null);

  const messagesContentRef =
    useRef(null);

  const previousConversationIdRef =
    useRef(null);

  const hasInitializedScrollRef =
    useRef(false);

  /*
   * true when the user is currently close enough
   * to the bottom that new messages should auto-scroll.
   */
  const shouldAutoScrollRef =
    useRef(true);

  /*
   * =====================================================
   * CONVERSATION ID
   * =====================================================
   */

  const conversationId =
    conversation?.id ||
    conversation?._id;

  /*
   * =====================================================
   * MESSAGE SCROLL HANDLER
   * =====================================================
   */

  const handleMessagesScroll = () => {
    const container =
      messagesContainerRef.current;

    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    /*
     * Consider the user "at the bottom" if they are
     * within 120px of it.
     */
    shouldAutoScrollRef.current =
      distanceFromBottom <= 120;
  };

  /*
   * =====================================================
   * SCROLL TO MOST RECENT MESSAGE
   *
   * When a conversation is opened:
   * - wait for messages to render
   * - scroll directly to the bottom
   *
   * When new messages arrive:
   * - scroll only if user was already near bottom
   * - do not interrupt users reading older messages
   * =====================================================
   */

  useEffect(() => {
    const container =
      messagesContainerRef.current;

    if (!container) {
      return;
    }

    const isNewConversation =
      previousConversationIdRef.current !==
      conversationId;

    if (isNewConversation) {
      previousConversationIdRef.current =
        conversationId;

      /*
       * Every time the user switches to a conversation,
       * we want to open at the newest message.
       */
      shouldAutoScrollRef.current =
        true;

      hasInitializedScrollRef.current =
        false;
    }

    /*
     * Don't try to scroll while there are no messages.
     */
    if (!messages.length) {
      return;
    }

    /*
     * Wait until React has rendered the messages.
     */
    requestAnimationFrame(() => {
      const currentContainer =
        messagesContainerRef.current;

      if (!currentContainer) {
        return;
      }

      /*
       * FIRST LOAD OF THIS CONVERSATION
       *
       * Always go to the newest message.
       */
      if (
        !hasInitializedScrollRef.current
      ) {
        currentContainer.scrollTop =
          currentContainer.scrollHeight;

        hasInitializedScrollRef.current =
          true;

        return;
      }

      /*
       * EXISTING CONVERSATION
       *
       * Only follow new messages if the user
       * was already near the bottom.
       */
      if (
        shouldAutoScrollRef.current
      ) {
        currentContainer.scrollTop =
          currentContainer.scrollHeight;
      }
    });
  }, [
    conversationId,
    messages.length,
  ]);

  /*
   * =====================================================
   * KEEP BOTTOM POSITION WHEN CONTENT HEIGHT CHANGES
   *
   * This is especially useful for:
   * - images
   * - attachments
   * - lazy-loaded content
   * - fonts/layout changes
   * =====================================================
   */

  useEffect(() => {
    const container =
      messagesContainerRef.current;

    const content =
      messagesContentRef.current;

    if (
      !container ||
      !content
    ) {
      return;
    }

    if (
      typeof ResizeObserver ===
      "undefined"
    ) {
      return;
    }

    const observer =
      new ResizeObserver(() => {
        if (
          shouldAutoScrollRef.current
        ) {
          container.scrollTop =
            container.scrollHeight;
        }
      });

    observer.observe(content);

    return () => {
      observer.disconnect();
    };
  }, [conversationId]);

  /*
   * =====================================================
   * FILE PREVIEWS
   * =====================================================
   */

  useEffect(() => {
    const previews =
      selectedFiles.map(
        (file) => ({
          file,

          url: file.type.startsWith(
            "image/"
          )
            ? URL.createObjectURL(
                file
              )
            : null,
        })
      );

    setFilePreviews(previews);

    return () => {
      previews.forEach(
        (preview) => {
          if (preview.url) {
            URL.revokeObjectURL(
              preview.url
            );
          }
        }
      );
    };
  }, [selectedFiles]);

  /*
   * =====================================================
   * FILE SELECTION
   * =====================================================
   */

  const handleFileChange = (
    event
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) {
      return;
    }

    setFileError("");

    const availableSlots =
      MAX_FILES -
      selectedFiles.length;

    if (availableSlots <= 0) {
      setFileError(
        `You can attach up to ${MAX_FILES} files.`
      );

      event.target.value = "";

      return;
    }

    const filesToAdd =
      files.slice(
        0,
        availableSlots
      );

    const validFiles = [];

    for (const file of filesToAdd) {
      if (
        !ALLOWED_MIME_TYPES.includes(
          file.type
        )
      ) {
        setFileError(
          `"${file.name}" is not a supported file type.`
        );

        continue;
      }

      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        setFileError(
          `"${file.name}" exceeds the 10 MB file size limit.`
        );

        continue;
      }

      const duplicate =
        selectedFiles.some(
          (existingFile) =>
            existingFile.name ===
              file.name &&
            existingFile.size ===
              file.size &&
            existingFile.lastModified ===
              file.lastModified
        );

      if (duplicate) {
        continue;
      }

      validFiles.push(file);
    }

    if (
      files.length >
      availableSlots
    ) {
      setFileError(
        `You can attach up to ${MAX_FILES} files.`
      );
    }

    if (validFiles.length > 0) {
      setSelectedFiles(
        (current) => [
          ...current,
          ...validFiles,
        ]
      );
    }

    event.target.value = "";
  };

  /*
   * =====================================================
   * REMOVE FILE
   * =====================================================
   */

  const removeSelectedFile = (
    index
  ) => {
    setSelectedFiles(
      (current) =>
        current.filter(
          (_, fileIndex) =>
            fileIndex !== index
        )
    );

    setFileError("");
  };

  /*
   * =====================================================
   * CLEAR FILES
   * =====================================================
   */

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
    setFileError("");

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  /*
   * =====================================================
   * FILE INPUT REF
   * =====================================================
   */

  const fileInputRef =
    useRef(null);

  /*
   * =====================================================
   * OPEN FILE PICKER
   * =====================================================
   */

  const openFilePicker = () => {
    if (sending) {
      return;
    }

    if (
      selectedFiles.length >=
      MAX_FILES
    ) {
      setFileError(
        `You can attach up to ${MAX_FILES} files.`
      );

      return;
    }

    fileInputRef.current?.click();
  };

  /*
   * =====================================================
   * SEND
   * =====================================================
   */

  const submit = async (
    event
  ) => {
    event.preventDefault();

    const value =
      text.trim();

    if (
      !value &&
      selectedFiles.length ===
        0
    ) {
      return;
    }

    try {
      setSending(true);

      /*
       * Keep the user at the bottom when
       * sending their own message.
       */
      shouldAutoScrollRef.current =
        true;

      await onSend(
        value,
        selectedFiles
      );

      setText("");
      setSelectedFiles([]);
      setFileError("");

      onTypingStop?.();

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    } catch {
      /*
       * Keep the composer contents
       * so the user can retry.
       */
    } finally {
      setSending(false);
    }
  };

  /*
   * =====================================================
   * TEXT
   * =====================================================
   */

  const handleChange = (
    event
  ) => {
    const value =
      event.target.value;

    setText(value);

    if (value.trim()) {
      onTypingStart?.();
    } else {
      onTypingStop?.();
    }
  };

  /*
   * =====================================================
   * KEYBOARD
   * =====================================================
   */

  const handleKeyDown = (
    event
  ) => {
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

  /*
   * =====================================================
   * EMPTY CONVERSATION
   * =====================================================
   */

  if (!conversation) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center overflow-hidden bg-white">
        <div className="text-center text-gray-500">
          <p className="text-sm">
            Select a conversation
            to start messaging.
          </p>
        </div>
      </div>
    );
  }

  const typingNames =
    Array.isArray(typingUsers)
      ? typingUsers
      : [];

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
      {/* =====================================================
          CHAT HEADER
      ====================================================== */}

      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex min-h-[64px] items-center gap-3 px-4">
          {/* BACK */}

          <button
            type="button"
            onClick={onBack}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 md:hidden"
            aria-label="Back"
          >
            <ArrowLeft size={19} />
          </button>

          {/* AVATAR */}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
            {conversation.name
              ?.charAt(0)
              ?.toUpperCase() ||
              "C"}
          </div>

          {/* CONVERSATION INFO */}

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-slate-900">
              {conversation.name ||
                "Conversation"}
            </h2>

            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Users size={13} />

              <span>
                {conversation
                  .participants
                  ?.length || 0}{" "}
                participants
              </span>
            </div>
          </div>

          {/* EXISTING HEADER ACTIONS CAN GO HERE */}
        </div>
      </header>

      {/* =====================================================
          MESSAGES

          THIS IS THE ONLY MESSAGE SCROLL AREA
      ====================================================== */}

      <div
        ref={messagesContainerRef}
        onScroll={
          handleMessagesScroll
        }
        className="
          min-h-0
          min-w-0
          flex-1
          overflow-x-hidden
          overflow-y-auto
          overscroll-contain
          px-4
          py-4
        "
      >
        <div
          ref={messagesContentRef}
          className="
            flex
            min-h-full
            w-full
            min-w-0
            flex-col
            gap-2
            pb-2
          "
        >
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <p className="text-sm text-gray-500">
                Loading messages...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  No messages yet
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Send a message to
                  start the conversation.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map(
                (message) => {
                  const senderId =
                    message.sender?._id ||
                    message.sender?.id ||
                    message.senderId ||
                    message.userId;

                  const own =
                    String(
                      senderId
                    ) ===
                    String(
                      currentUserId
                    );

                  return (
                    <MessageItem
                      key={
                        message.id ||
                        message._id
                      }
                      message={message}
                      own={own}
                    />
                  );
                }
              )}
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          TYPING INDICATOR
      ====================================================== */}

      {typingNames.length > 0 && (
        <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-2">
          <div className="truncate text-xs text-gray-400">
            {typingNames.join(", ")}

            {typingNames.length === 1
              ? " is typing..."
              : " are typing..."}
          </div>
        </div>
      )}

      {/* =====================================================
          SELECTED FILES
      ====================================================== */}

      {selectedFiles.length > 0 && (
        <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-4 py-3">
          <div className="min-w-0">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-gray-600">
                Attachments (
                {selectedFiles.length}
                /{MAX_FILES})
              </p>

              <button
                type="button"
                onClick={
                  clearSelectedFiles
                }
                className="text-xs text-gray-500 transition hover:text-gray-700"
              >
                Clear all
              </button>
            </div>

            <div className="flex min-w-0 gap-2 overflow-x-auto overscroll-contain pb-1">
              {filePreviews.map(
                (
                  preview,
                  index
                ) => {
                  const file =
                    preview.file;

                  const isImage =
                    file.type.startsWith(
                      "image/"
                    );

                  return (
                    <div
                      key={`${file.name}-${file.lastModified}-${index}`}
                      className="relative flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white"
                    >
                      {isImage ? (
                        <img
                          src={
                            preview.url
                          }
                          alt={
                            file.name
                          }
                          className="h-24 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-24 items-center justify-center bg-gray-100">
                          <FileText
                            size={30}
                            className="text-gray-500"
                          />
                        </div>
                      )}

                      <div className="min-w-0 px-2 py-2">
                        <p className="truncate text-xs font-medium text-gray-700">
                          {file.name}
                        </p>

                        <p className="text-[11px] text-gray-400">
                          {formatFileSize(
                            file.size
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeSelectedFile(
                            index
                          )
                        }
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FILE ERROR
      ====================================================== */}

      {fileError && (
        <div className="shrink-0 px-4 py-2">
          <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {fileError}
          </div>
        </div>
      )}

      {/* =====================================================
          COMPOSER
      ====================================================== */}

      <div className="shrink-0 border-t border-slate-200 bg-white">
        <form
          onSubmit={submit}
          className="px-4 py-3"
        >
          <div className="flex min-w-0 items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept={ALLOWED_MIME_TYPES.join(
                ","
              )}
              onChange={
                handleFileChange
              }
            />

            {/* ATTACH */}

            <button
              type="button"
              onClick={
                openFilePicker
              }
              disabled={
                sending ||
                selectedFiles.length >=
                  MAX_FILES
              }
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Attach files"
              title="Attach files"
            >
              <Paperclip size={18} />
            </button>

            {/* TEXT */}

            <div className="flex min-h-11 min-w-0 flex-1 items-end rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 transition focus-within:border-blue-400 focus-within:bg-white">
              <textarea
                value={text}
                onChange={
                  handleChange
                }
                onKeyDown={
                  handleKeyDown
                }
                onBlur={() =>
                  onTypingStop?.()
                }
                rows={1}
                disabled={sending}
                placeholder="Type a message..."
                className="max-h-32 min-h-[27px] min-w-0 flex-1 resize-none border-0 bg-transparent p-0 text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
              />
            </div>

            {/* SEND */}

            <button
              type="submit"
              disabled={
                sending ||
                (!text.trim() &&
                  selectedFiles.length ===
                    0)
              }
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              aria-label="Send message"
            >
              {sending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send size={17} />
              )}
            </button>
          </div>

          <p className="mt-1.5 text-[11px] text-gray-400">
            Enter to send · Shift + Enter
            for a new line · Up to 5
            files, 10 MB each
          </p>
        </form>
      </div>
    </div>
  );
};

export default ConversationWindow;