import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  FileText,
  Paperclip,
  Send,
  X,
} from "lucide-react";

import MessageItem from "./MessageItem";
import MessageSelectionToolbar from "./MessageSelectionToolbar";
import ForwardMessageModal from "./ForwardMessageModal";

import {
  useCommunication,
} from "../../context/CommunicationContext";

/* =========================================================
   CONSTANTS
========================================================= */

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

/* =========================================================
   HELPERS
========================================================= */

const getMessageId = (message) =>
  message?.id ||
  message?._id ||
  null;

const getConversationId = (
  conversation
) =>
  conversation?.id ||
  conversation?._id ||
  null;

const getConversationName = (
  conversation
) => {
  if (!conversation) {
    return "Conversation";
  }

  return (
    conversation.name ||
    conversation.title ||
    conversation.participantName ||
    "Conversation"
  );
};

const getFilePreviewUrl = (
  file
) => {
  if (!file) {
    return null;
  }

  return URL.createObjectURL(file);
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

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
  onReply,
  replyingTo,
  onCancelReply,
}) => {
  /* =======================================================
     COMMUNICATION
  ======================================================== */

  const {
    conversations,

    // Bulk actions
    deleteMessagesForMe,
    deleteMessagesForEveryone,
    forwardMessages,

    // Existing single-message actions
    toggleMessageReaction,
    deleteMessageForMe,
    deleteMessageForEveryone,
  } = useCommunication();

  /* =======================================================
     COMPOSER STATE
  ======================================================== */

  const [composerText, setComposerText] =
    useState("");

  const [selectedFiles, setSelectedFiles] =
    useState([]);

  const [filePreviews, setFilePreviews] =
    useState([]);

  const [sending, setSending] =
    useState(false);

  /* =======================================================
     SELECTION STATE
  ======================================================== */

  const [
    selectionMode,
    setSelectionMode,
  ] = useState(false);

  const [
    selectedMessageIds,
    setSelectedMessageIds,
  ] = useState(new Set());

  const [
    processingSelection,
    setProcessingSelection,
  ] = useState(false);

  /* =======================================================
     FORWARD MODAL STATE
  ======================================================== */

  const [
    showForwardModal,
    setShowForwardModal,
  ] = useState(false);

  /* =======================================================
     SCROLL
  ======================================================== */

  const messagesContainerRef =
    useRef(null);

  const fileInputRef =
    useRef(null);

  const shouldScrollToBottomRef =
    useRef(true);

  /* =======================================================
     CURRENT CONVERSATION
  ======================================================== */

  const conversationId =
    getConversationId(
      conversation
    );

  /* =======================================================
     MESSAGE MAP
  ======================================================== */

  const messageById = useMemo(() => {
    const map = new Map();

    (messages || []).forEach(
      (message) => {
        const id =
          getMessageId(message);

        if (id) {
          map.set(
            String(id),
            message
          );
        }
      }
    );

    return map;
  }, [messages]);

  /* =======================================================
     SELECTED MESSAGES
  ======================================================== */

  const selectedMessages = useMemo(
    () =>
      Array.from(
        selectedMessageIds
      )
        .map((id) =>
          messageById.get(
            String(id)
          )
        )
        .filter(Boolean),
    [
      selectedMessageIds,
      messageById,
    ]
  );

  const selectedCount =
    selectedMessageIds.size;

  /* =======================================================
     SELECTION ELIGIBILITY
  ======================================================== */

  const canDeleteForEveryone =
    selectedMessages.length > 0 &&
    selectedMessages.every(
      (message) => {
        const senderId =
          message?.sender?.id ||
          message?.sender?._id ||
          message?.senderId;

        return (
          String(senderId) ===
            String(currentUserId) &&
          !message?.deletedForEveryone
        );
      }
    );

  const canForward =
    selectedMessages.length > 0 &&
    selectedMessages.every(
      (message) =>
        !message?.deletedForEveryone
    );

  /* =======================================================
     CLEAR SELECTION
  ======================================================== */

  const clearSelection = () => {
    setSelectionMode(false);

    setSelectedMessageIds(
      new Set()
    );

    setShowForwardModal(false);
  };

  /* =======================================================
     ENTER SELECTION MODE
  ======================================================== */

  const enterSelectionMode = (
    messageOrId
  ) => {
    const messageId =
      typeof messageOrId === "object"
        ? getMessageId(messageOrId)
        : messageOrId;

    if (!messageId) {
      return;
    }

    setSelectionMode(true);

    setSelectedMessageIds(
      new Set([
        String(messageId),
      ])
    );

    setShowForwardModal(false);
  };

  /* =======================================================
     TOGGLE MESSAGE SELECTION
  ======================================================== */

  const toggleMessageSelection = (
    messageOrId
  ) => {
    const messageId =
      typeof messageOrId === "object"
        ? getMessageId(messageOrId)
        : messageOrId;

    if (!messageId) {
      return;
    }

    const id = String(messageId);

    setSelectedMessageIds(
      (current) => {
        const next = new Set(
          current
        );

        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }

        return next;
      }
    );
  };

  /* =======================================================
     EXIT SELECTION WHEN EMPTY
  ======================================================== */

  useEffect(() => {
    if (
      selectionMode &&
      selectedMessageIds.size === 0
    ) {
      setSelectionMode(false);
    }
  }, [
    selectionMode,
    selectedMessageIds,
  ]);

  /* =======================================================
     CLEAR SELECTION WHEN
     CONVERSATION CHANGES
  ======================================================== */

  useEffect(() => {
    setSelectionMode(false);

    setSelectedMessageIds(
      new Set()
    );

    setShowForwardModal(false);
  }, [conversationId]);

  /* =======================================================
     SCROLL TO BOTTOM
  ======================================================== */

  const scrollToBottom = (
    behavior = "auto"
  ) => {
    const container =
      messagesContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  useEffect(() => {
    if (!messages?.length) {
      return;
    }

    if (
      shouldScrollToBottomRef.current
    ) {
      requestAnimationFrame(() => {
        scrollToBottom("auto");
      });
    }
  }, [
    messages,
    conversationId,
  ]);

  /* =======================================================
     DETECT USER SCROLL POSITION
  ======================================================== */

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

    shouldScrollToBottomRef.current =
      distanceFromBottom < 120;
  };

  /* =======================================================
     REPLY TARGET
  ======================================================== */

  useEffect(() => {
    if (!replyingTo) {
      return;
    }

    /*
     * Do not modify scroll position merely
     * because a reply was selected.
     */
  }, [replyingTo]);

  /* =======================================================
     COMPOSER
  ======================================================== */

  const handleComposerChange = (
    event
  ) => {
    const value =
      event.target.value;

    setComposerText(value);

    if (conversationId) {
      if (value.trim()) {
        onTypingStart?.(
          conversationId
        );
      } else {
        onTypingStop?.(
          conversationId
        );
      }
    }
  };

  /* =======================================================
     SEND
  ======================================================== */

  const handleSend = async () => {
    const text =
      composerText.trim();

    if (
      (!text &&
        selectedFiles.length === 0) ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);

      await onSend?.(
        text,
        selectedFiles
      );

      setComposerText("");

      setSelectedFiles([]);

      setFilePreviews([]);

      if (conversationId) {
        onTypingStop?.(
          conversationId
        );
      }

      shouldScrollToBottomRef.current =
        true;

      requestAnimationFrame(() => {
        scrollToBottom("smooth");
      });
    } catch (error) {
      console.error(
        "Failed to send message:",
        error
      );
    } finally {
      setSending(false);
    }
  };

  /* =======================================================
     KEYBOARD
  ======================================================== */

  const handleComposerKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSend();
    }
  };

  /* =======================================================
     FILE VALIDATION
  ======================================================== */

  const validateFile = (
    file
  ) => {
    if (!file) {
      return false;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      window.alert(
        `${file.name} is larger than 10 MB.`
      );

      return false;
    }

    if (
      file.type &&
      !ACCEPTED_FILE_TYPES.includes(
        file.type
      )
    ) {
      window.alert(
        `${file.name} is not a supported file type.`
      );

      return false;
    }

    return true;
  };

  /* =======================================================
     ADD FILES
  ======================================================== */

  const handleFilesSelected = (
    event
  ) => {
    const incomingFiles =
      Array.from(
        event.target.files || []
      );

    if (!incomingFiles.length) {
      return;
    }

    const validFiles =
      incomingFiles.filter(
        validateFile
      );

    const remainingSlots =
      MAX_ATTACHMENTS -
      selectedFiles.length;

    const filesToAdd =
      validFiles.slice(
        0,
        Math.max(
          0,
          remainingSlots
        )
      );

    if (
      validFiles.length >
      filesToAdd.length
    ) {
      window.alert(
        `You can attach up to ${MAX_ATTACHMENTS} files.`
      );
    }

    if (!filesToAdd.length) {
      event.target.value = "";
      return;
    }

    setSelectedFiles(
      (current) => [
        ...current,
        ...filesToAdd,
      ]
    );

    setFilePreviews(
      (current) => [
        ...current,
        ...filesToAdd.map(
          (file) => ({
            file,
            url: getFilePreviewUrl(
              file
            ),
          })
        ),
      ]
    );

    event.target.value = "";
  };

  /* =======================================================
     REMOVE FILE
  ======================================================== */

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

    setFilePreviews(
      (current) => {
        const preview =
          current[index];

        if (preview?.url) {
          URL.revokeObjectURL(
            preview.url
          );
        }

        return current.filter(
          (_, fileIndex) =>
            fileIndex !== index
        );
      }
    );
  };

  /* =======================================================
     CLEANUP FILE PREVIEWS
  ======================================================== */

  useEffect(() => {
    return () => {
      filePreviews.forEach(
        (preview) => {
          if (preview?.url) {
            URL.revokeObjectURL(
              preview.url
            );
          }
        }
      );
    };
  }, [filePreviews]);

  /* =======================================================
     REPLY
  ======================================================== */

  const handleReply = (
    message
  ) => {
    if (selectionMode) {
      return;
    }

    onReply?.(message);
  };

  /* =======================================================
     CANCEL REPLY
  ======================================================== */

  const handleCancelReply = () => {
    onCancelReply?.();
  };

  /* =======================================================
     SINGLE MESSAGE ACTIONS
  ======================================================== */

  const handleMessageReaction = async (
    messageId,
    emoji
  ) => {
    if (!toggleMessageReaction) {
      return;
    }

    try {
      await toggleMessageReaction(
        messageId,
        emoji
      );
    } catch (error) {
      console.error(
        "Failed to toggle message reaction:",
        error
      );
    }
  };

  const handleSingleDeleteForMe =
    async (message) => {
      const messageId =
        getMessageId(message);

      if (
        !messageId ||
        !deleteMessageForMe
      ) {
        return;
      }

      try {
        await deleteMessageForMe(
          messageId
        );
      } catch (error) {
        console.error(
          "Failed to delete message for me:",
          error
        );
      }
    };

  const handleSingleDeleteForEveryone =
    async (message) => {
      const messageId =
        getMessageId(message);

      if (
        !messageId ||
        !deleteMessageForEveryone
      ) {
        return;
      }

      try {
        await deleteMessageForEveryone(
          messageId
        );
      } catch (error) {
        console.error(
          "Failed to delete message for everyone:",
          error
        );
      }
    };

  /* =======================================================
     DELETE SELECTION
  ======================================================== */

  const handleDeleteSelection =
    async () => {
      if (
        !selectedCount ||
        processingSelection
      ) {
        return;
      }

      const ids = Array.from(
        selectedMessageIds
      );

      /*
       * If every selected message belongs
       * to the current user, it can be
       * deleted for everyone.
       */
      if (canDeleteForEveryone) {
        const deleteForEveryone =
          window.confirm(
            `Delete ${selectedCount} ${
              selectedCount === 1
                ? "message"
                : "messages"
            } for everyone?\n\nClick OK to delete for everyone.`
          );

        if (deleteForEveryone) {
          try {
            setProcessingSelection(
              true
            );

            await deleteMessagesForEveryone(
              ids
            );

            clearSelection();

            return;
          } catch (error) {
            console.error(
              "Failed to delete selected messages for everyone:",
              error
            );

            window.alert(
              "Some messages could not be deleted for everyone."
            );

            return;
          } finally {
            setProcessingSelection(
              false
            );
          }
        }
      }

      /*
       * Delete for me.
       */
      const deleteForMe =
        window.confirm(
          `Delete ${selectedCount} ${
            selectedCount === 1
              ? "message"
              : "messages"
          } for you?`
        );

      if (!deleteForMe) {
        return;
      }

      try {
        setProcessingSelection(
          true
        );

        await deleteMessagesForMe(
          ids
        );

        clearSelection();
      } catch (error) {
        console.error(
          "Failed to delete selected messages:",
          error
        );

        window.alert(
          "Some messages could not be deleted."
        );
      } finally {
        setProcessingSelection(
          false
        );
      }
    };

  /* =======================================================
     OPEN FORWARD MODAL
  ======================================================== */

  const openForwardModal = () => {
    if (
      !selectedCount ||
      !canForward ||
      processingSelection
    ) {
      return;
    }

    setShowForwardModal(true);
  };

  /* =======================================================
     CLOSE FORWARD MODAL
  ======================================================== */

  const closeForwardModal = () => {
    if (processingSelection) {
      return;
    }

    setShowForwardModal(false);
  };

  /* =======================================================
     FORWARD
  ======================================================== */

  const handleForward = async (
    destinationConversationIds
  ) => {
    if (
      !selectedCount ||
      !destinationConversationIds?.length ||
      processingSelection
    ) {
      return;
    }

    try {
      setProcessingSelection(
        true
      );

      await forwardMessages(
        Array.from(
          selectedMessageIds
        ),
        destinationConversationIds
      );

      setShowForwardModal(false);

      clearSelection();
    } catch (error) {
      console.error(
        "Failed to forward messages:",
        error
      );

      window.alert(
        "The selected messages could not be forwarded."
      );
    } finally {
      setProcessingSelection(
        false
      );
    }
  };

  /* =======================================================
     TYPING LABEL
  ======================================================== */

  const typingLabel = useMemo(() => {
    const users =
      Array.isArray(
        typingUsers
      )
        ? typingUsers
        : [];

    if (!users.length) {
      return "";
    }

    if (users.length === 1) {
      return "typing...";
    }

    if (users.length === 2) {
      return "2 people are typing...";
    }

    return `${users.length} people are typing...`;
  }, [typingUsers]);

  /* =======================================================
     CONVERSATION TITLE
  ======================================================== */

  const conversationName =
    getConversationName(
      conversation
    );

  /* =======================================================
     EMPTY CONVERSATION
  ======================================================== */

  if (!conversation) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            Select a conversation
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Choose a conversation to
            start messaging.
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================== */

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-white">
      {/* =================================================
          HEADER
      ================================================== */}

      {selectionMode ? (
        <MessageSelectionToolbar
          selectedCount={
            selectedCount
          }
          onCancel={
            clearSelection
          }
          onForward={
            openForwardModal
          }
          onDelete={
            handleDeleteSelection
          }
          processing={
            processingSelection
          }
        />
      ) : (
        <div className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-3 py-3">
          {/* BACK */}

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 md:hidden"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          {/* AVATAR */}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {conversationName
              .charAt(0)
              .toUpperCase()}
          </div>

          {/* CONVERSATION INFO */}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {conversationName}
            </p>

            {typingLabel ? (
              <p className="truncate text-xs font-medium text-blue-600">
                {typingLabel}
              </p>
            ) : (
              <p className="truncate text-xs text-gray-400">
                {conversation?.type ===
                "group"
                  ? "Group conversation"
                  : "Conversation"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* =================================================
          MESSAGE AREA
      ================================================== */}

      <div
        ref={
          messagesContainerRef
        }
        onScroll={
          handleMessagesScroll
        }
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-5"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-sm text-gray-400">
              Loading messages...
            </div>
          </div>
        ) : messages?.length ? (
          <div className="flex flex-col gap-3">
            {messages.map(
              (message) => {
                const messageId =
                  getMessageId(
                    message
                  );

                const senderId =
                  message?.sender?.id ||
                  message?.sender?._id ||
                  message?.senderId;

                const own =
                  String(senderId) ===
                  String(
                    currentUserId
                  );

                return (
                  <MessageItem
                    key={messageId}
                    message={message}
                    own={own}
                    currentUserId={currentUserId}
                    onReply={handleReply}
                    onReaction={handleMessageReaction}
                    onDeleteForMe={handleSingleDeleteForMe}
                    onDeleteForEveryone={
                      handleSingleDeleteForEveryone
                    }
                    selectionMode={selectionMode}
                    selected={selectedMessageIds.has(
                      String(messageId)
                    )}
                    onToggleSelect={
                      toggleMessageSelection
                    }
                    onEnterSelectionMode={
                      enterSelectionMode
                    }
                  />
                );
              }
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                No messages yet
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Send a message to start
                the conversation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          REPLY PREVIEW
      ================================================== */}

      {!selectionMode &&
        replyingTo && (
          <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-3 py-2">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1 border-l-2 border-blue-500 pl-3">
                <p className="text-xs font-semibold text-blue-600">
                  Replying to{" "}
                  {replyingTo.sender
                    ?.name ||
                    "message"}
                </p>

                <p className="mt-0.5 truncate text-xs text-gray-600">
                  {replyingTo.text ||
                    (replyingTo.attachments
                      ?.length
                      ? "Attachment"
                      : "Message")}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCancelReply
                }
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                aria-label="Cancel reply"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

      {/* =================================================
          ATTACHMENT PREVIEW
      ================================================== */}

      {!selectionMode &&
        filePreviews.length > 0 && (
          <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-3 py-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filePreviews.map(
                (
                  preview,
                  index
                ) => {
                  const file =
                    preview.file;

                  const isImage =
                    file?.type?.startsWith(
                      "image/"
                    );

                  return (
                    <div
                      key={`${file.name}-${index}`}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white"
                    >
                      {isImage ? (
                        <img
                          src={
                            preview.url
                          }
                          alt={
                            file.name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-1">
                          <FileText
                            size={20}
                            className="text-gray-500"
                          />

                          <span className="max-w-full truncate px-1 text-[9px] text-gray-500">
                            {
                              file.name
                            }
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          removeSelectedFile(
                            index
                          )
                        }
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X
                          size={12}
                        />
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

      {/* =================================================
          COMPOSER
      ================================================== */}

      {!selectionMode && (
        <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-3">
          <div className="flex items-end gap-2">
            {/* FILE INPUT */}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              accept={ACCEPTED_FILE_TYPES.join(
                ","
              )}
              onChange={
                handleFilesSelected
              }
            />

            {/* ATTACH */}

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={
                sending ||
                selectedFiles.length >=
                  MAX_ATTACHMENTS
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Attach files"
              title="Attach files"
            >
              <Paperclip
                size={20}
              />
            </button>

            {/* TEXT AREA */}

            <div className="min-w-0 flex-1">
              <textarea
                value={
                  composerText
                }
                onChange={
                  handleComposerChange
                }
                onKeyDown={
                  handleComposerKeyDown
                }
                rows={1}
                placeholder="Type a message..."
                disabled={sending}
                className="max-h-32 min-h-[40px] w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* SEND */}

            <button
              type="button"
              onClick={
                handleSend
              }
              disabled={
                sending ||
                (!composerText.trim() &&
                  selectedFiles.length ===
                    0)
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              aria-label="Send message"
              title="Send"
            >
              <Send size={18} />
            </button>
          </div>

          {/* ATTACHMENT LIMIT */}

          {selectedFiles.length >
            0 && (
            <p className="mt-1 px-12 text-[10px] text-gray-400">
              {selectedFiles.length}/
              {MAX_ATTACHMENTS} files
              attached
            </p>
          )}
        </div>
      )}

      {/* =================================================
          FORWARD MODAL
      ================================================== */}

      <ForwardMessageModal
        open={
          showForwardModal
        }
        conversations={
          conversations
        }
        onClose={
          closeForwardModal
        }
        onForward={
          handleForward
        }
        processing={
          processingSelection
        }
      />
    </div>
  );
};

export default ConversationWindow;