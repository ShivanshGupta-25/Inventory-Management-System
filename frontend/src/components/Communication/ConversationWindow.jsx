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
  MessageCircle,
  Loader2,
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

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

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

const getMessageId = (
  message
) =>
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

  return URL.createObjectURL(
    file
  );
};

/* =========================================================
   THREAD MESSAGE
========================================================= */

const ThreadMessage = ({
  message,
  currentUserId,
}) => {
  const senderId =
    message?.sender?.id ||
    message?.sender?._id ||
    message?.senderId;

  const own =
    String(senderId) ===
    String(currentUserId);

  const senderName =
    message?.sender?.name ||
    message?.sender?.fullName ||
    message?.senderName ||
    "Unknown user";

  const deleted =
    Boolean(
      message?.deletedForEveryone
    );

  const text =
    message?.text ||
    message?.content ||
    "";

  const hasAttachments =
    Array.isArray(
      message?.attachments
    ) &&
    message.attachments.length > 0;

  return (
    <div
      className={`
        rounded-xl
        border
        px-3
        py-2.5
        ${
          own
            ? "border-blue-100 bg-blue-50"
            : "border-slate-200 bg-white"
        }
      `}
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <p
          className={`
            truncate
            text-xs
            font-semibold
            ${
              own
                ? "text-blue-700"
                : "text-slate-700"
            }
          `}
        >
          {senderName}
        </p>

        {message?.createdAt && (
          <span
            className="
              shrink-0
              text-[10px]
              text-slate-400
            "
          >
            {new Date(
              message.createdAt
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {deleted ? (
        <p
          className="
            mt-1.5
            text-sm
            italic
            text-slate-400
          "
        >
          This message was deleted
        </p>
      ) : (
        <>
          {text && (
            <p
              className="
                mt-1.5
                whitespace-pre-wrap
                break-words
                text-sm
                leading-6
                text-slate-700
              "
            >
              {text}
            </p>
          )}

          {hasAttachments && (
            <p
              className="
                mt-1.5
                text-xs
                text-slate-400
              "
            >
              {message.attachments.length}{" "}
              {message.attachments.length === 1
                ? "attachment"
                : "attachments"}
            </p>
          )}
        </>
      )}
    </div>
  );
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

    /* Bulk */
    deleteMessagesForMe,
    deleteMessagesForEveryone,
    forwardMessages,

    /* Single */
    toggleMessageReaction,
    deleteMessageForMe,
    deleteMessageForEveryone,

    /* Thread */
    getMessageThread,
  } = useCommunication();

  /* =======================================================
     COMPOSER
  ======================================================== */

  const [
    composerText,
    setComposerText,
  ] = useState("");

  const [
    selectedFiles,
    setSelectedFiles,
  ] = useState([]);

  const [
    filePreviews,
    setFilePreviews,
  ] = useState([]);

  const [sending, setSending] =
    useState(false);

  /* =======================================================
     SELECTION
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
     FORWARD MODAL
  ======================================================== */

  const [
    showForwardModal,
    setShowForwardModal,
  ] = useState(false);

  /* =======================================================
     MESSAGE THREAD
  ======================================================= */

  const [
    activeThread,
    setActiveThread,
  ] = useState(null);

  const [
    threadLoading,
    setThreadLoading,
  ] = useState(false);

  const [
    threadError,
    setThreadError,
  ] = useState("");

  /* =======================================================
     REFS
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

  const selectedMessages =
    useMemo(
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
     DELETE-FOR-EVERYONE ELIGIBILITY
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
            String(
              currentUserId
            ) &&
          !message?.deletedForEveryone
        );
      }
    );

  /* =======================================================
     FORWARD ELIGIBILITY
  ======================================================== */

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
      typeof messageOrId ===
      "object"
        ? getMessageId(
            messageOrId
          )
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
     TOGGLE SELECTION
  ======================================================== */

  const toggleMessageSelection = (
    messageOrId
  ) => {
    const messageId =
      typeof messageOrId ===
      "object"
        ? getMessageId(
            messageOrId
          )
        : messageOrId;

    if (!messageId) {
      return;
    }

    const id =
      String(messageId);

    setSelectedMessageIds(
      (current) => {
        const next =
          new Set(current);

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

    setActiveThread(null);
    setThreadError("");
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
     MESSAGE SCROLL
  ======================================================== */

  const handleMessagesScroll =
    () => {
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
     COMPOSER
  ======================================================== */

  const handleComposerChange = (
    event
  ) => {
    const value =
      event.target.value;

    /*
     * If the user starts composing while messages are
     * selected, immediately exit selection mode.
     *
     * IMPORTANT:
     * Only the selection is cleared. The typed value is
     * preserved in composerText.
     */
    if (selectionMode) {
      clearSelection();
    }

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
    const text = composerText.trim();

    if (
      (!text && selectedFiles.length === 0) ||
      sending
    ) {
      return;
    }

    /*
     * Capture the reply target BEFORE sending.
     *
     * This is important because the reply state is cleared
     * after a successful send.
     */
    const replyToId =
      replyingTo?.id ||
      replyingTo?._id ||
      null;

    try {
      setSending(true);

      /*
       * IMPORTANT:
       *
       * The third argument is the original message ID.
       *
       * ConversationContext.sendMessage()
       * already accepts:
       *
       *   (text, files, replyTo)
       *
       * and communicationService.sendMessage()
       * already sends replyTo to the backend.
       */
      await onSend?.(
        text,
        selectedFiles,
        replyToId
      );

      /*
       * Clear reply state only after the message
       * has been successfully sent.
       */
      onCancelReply?.();

      setComposerText("");
      setSelectedFiles([]);
      setFilePreviews([]);

      if (conversationId) {
        onTypingStop?.(conversationId);
      }

      shouldScrollToBottomRef.current = true;

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
            url:
              getFilePreviewUrl(
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
     OPEN MESSAGE THREAD
  ======================================================== */

  const handleOpenThread = async (
    message
  ) => {
    const messageId =
      getMessageId(message);

    if (!conversationId || !messageId) {
      return;
    }

    try {
      setThreadLoading(true);
      setThreadError("");

      const thread =
        await getMessageThread(
          conversationId,
          messageId
        );

      if (!thread) {
        setThreadError(
          "Unable to load this thread."
        );
        return;
      }

      setActiveThread({
        ...thread,
        messageId,
      });
    } catch (error) {
      console.error(
        "Failed to open message thread:",
        error
      );

      setThreadError(
        error?.message ||
          "Unable to load this thread."
      );
    } finally {
      setThreadLoading(false);
    }
  };

  /* =======================================================
     CANCEL REPLY
  ======================================================== */

  const handleCancelReply =
    () => {
      onCancelReply?.();
    };

  /* =======================================================
     SINGLE REACTION
  ======================================================== */

  const handleMessageReaction =
    async (
      messageId,
      emoji
    ) => {
      if (
        !toggleMessageReaction
      ) {
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

  /* =======================================================
     SINGLE DELETE FOR ME
  ======================================================== */

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

  /* =======================================================
     SINGLE DELETE FOR EVERYONE
  ======================================================== */

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
     BULK DELETE FOR ME
  ======================================================== */

  const handleBulkDeleteForMe = async () => {
    if (
      !selectedCount ||
      processingSelection
    ) {
      return;
    }

    try {
      setProcessingSelection(true);

      await deleteMessagesForMe(
        Array.from(selectedMessageIds)
      );

      clearSelection();
    } catch (error) {
      console.error(
        "Failed to delete selected messages for me:",
        error
      );

      window.alert(
        "Some messages could not be deleted."
      );
    } finally {
      setProcessingSelection(false);
    }
  };

  /* =======================================================
     BULK DELETE FOR EVERYONE
  ======================================================== */

  const handleBulkDeleteForEveryone =
    async () => {
      if (
        !selectedCount ||
        !canDeleteForEveryone ||
        processingSelection
      ) {
        return;
      }

      try {
        setProcessingSelection(true);

        await deleteMessagesForEveryone(
          Array.from(selectedMessageIds)
        );

        clearSelection();
      } catch (error) {
        console.error(
          "Failed to delete selected messages for everyone:",
          error
        );

        window.alert(
          "Some messages could not be deleted for everyone."
        );
      } finally {
        setProcessingSelection(false);
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

    setShowForwardModal(
      true
    );
  };

  /* =======================================================
     CLOSE FORWARD MODAL
  ======================================================== */

  const closeForwardModal = () => {
    if (processingSelection) {
      return;
    }

    setShowForwardModal(
      false
    );
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

      setShowForwardModal(
        false
      );

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

  const typingLabel =
    useMemo(() => {
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
      <div
        className="
          flex
          h-full
          min-h-0
          flex-1
          items-center
          justify-center
          bg-white
        "
      >
        <div className="text-center">
          <p
            className="
              text-sm
              font-medium
              text-slate-700
            "
          >
            Select a conversation
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-400
            "
          >
            Choose a conversation
            to start messaging.
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================== */

  return (
    <div
      className="
        relative
        flex
        h-full
        min-h-0
        flex-1
        flex-col
        bg-slate-50
      "
    >
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
          onDeleteForMe={
            handleBulkDeleteForMe
          }
          onDeleteForEveryone={
            handleBulkDeleteForEveryone
          }
          canDeleteForEveryone={
            canDeleteForEveryone
          }
          processing={
            processingSelection
          }
        />
      ) : (
        <div
          className="
            flex
            shrink-0
            items-center
            gap-3
            border-b
            border-slate-200
            bg-white
            px-3
            py-3
          "
        >
          {/* BACK */}

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                text-slate-600
                transition
                hover:bg-slate-100
                md:hidden
              "
              aria-label="Back"
            >
              <ArrowLeft
                size={20}
              />
            </button>
          )}

          {/* AVATAR */}

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-blue-500
              to-indigo-600
              text-sm
              font-semibold
              text-white
              shadow-sm
            "
          >
            {conversationName
              .charAt(0)
              .toUpperCase()}
          </div>

          {/* INFO */}

          <div
            className="
              min-w-0
              flex-1
            "
          >
            <p
              className="
                truncate
                text-sm
                font-semibold
                text-slate-900
              "
            >
              {conversationName}
            </p>

            {typingLabel ? (
              <p
                className="
                  truncate
                  text-xs
                  font-medium
                  text-blue-600
                "
              >
                {typingLabel}
              </p>
            ) : (
              <p
                className="
                  truncate
                  text-xs
                  text-slate-400
                "
              >
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
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overflow-x-hidden
          bg-gradient-to-b
          from-slate-50
          via-white
          to-slate-50
          px-3
          py-4
          sm:px-5
        "
      >
        {loading ? (
          <div
            className="
              flex
              h-full
              items-center
              justify-center
            "
          >
            <div
              className="
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                text-sm
                text-slate-400
                shadow-sm
              "
            >
              Loading messages...
            </div>
          </div>
        ) : messages?.length ? (
          <div
            className="
              flex
              flex-col
              gap-3
            "
          >
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
                  String(
                    senderId
                  ) ===
                  String(
                    currentUserId
                  );

                return (
                  <MessageItem
                    key={
                      messageId
                    }
                    message={
                      message
                    }
                    own={own}
                    onReply={
                      handleReply
                    }
                    onOpenThread={
                      handleOpenThread
                    }
                    selectionMode={
                      selectionMode
                    }
                    selected={selectedMessageIds.has(
                      String(
                        messageId
                      )
                    )}
                    onToggleSelect={
                      toggleMessageSelection
                    }
                    onEnterSelectionMode={
                      enterSelectionMode
                    }
                    onClearSelection={
                      clearSelection
                    }
                  />
                );
              }
            )}
          </div>
        ) : (
          <div
            className="
              flex
              h-full
              items-center
              justify-center
            "
          >
            <div
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-8
                py-7
                text-center
                shadow-sm
              "
            >
              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                No messages yet
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                Send a message to
                start the conversation.
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
          <div
            className="
              shrink-0
              border-t
              border-slate-200
              bg-white
              px-3
              py-2
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <div
                className="
                  min-w-0
                  flex-1
                  border-l-2
                  border-blue-500
                  pl-3
                "
              >
                <p
                  className="
                    text-xs
                    font-semibold
                    text-blue-600
                  "
                >
                  Replying to{" "}
                  {replyingTo.sender
                    ?.name ||
                    "message"}
                </p>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-xs
                    text-slate-600
                  "
                >
                  {replyingTo.text ||
                    (replyingTo
                      .attachments
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
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-700
                "
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
        filePreviews.length >
          0 && (
          <div
            className="
              shrink-0
              border-t
              border-slate-200
              bg-white
              px-3
              py-2
            "
          >
            <div
              className="
                flex
                gap-2
                overflow-x-auto
                pb-1
              "
            >
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
                      className="
                        relative
                        h-16
                        w-16
                        shrink-0
                        overflow-hidden
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        shadow-sm
                      "
                    >
                      {isImage ? (
                        <img
                          src={
                            preview.url
                          }
                          alt={
                            file.name
                          }
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />
                      ) : (
                        <div
                          className="
                            flex
                            h-full
                            w-full
                            flex-col
                            items-center
                            justify-center
                            gap-1
                            p-1
                          "
                        >
                          <FileText
                            size={
                              20
                            }
                            className="
                              text-slate-500
                            "
                          />

                          <span
                            className="
                              max-w-full
                              truncate
                              px-1
                              text-[9px]
                              text-slate-500
                            "
                          >
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
                        className="
                          absolute
                          right-1
                          top-1
                          flex
                          h-5
                          w-5
                          items-center
                          justify-center
                          rounded-full
                          bg-slate-900/70
                          text-white
                          transition
                          hover:bg-slate-900
                        "
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

      <div
        className="
          shrink-0
          border-t
          border-slate-200
          bg-white
          px-3
          py-3
        "
      >
        <div
          className="
            flex
            items-end
            gap-2
          "
        >
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
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-blue-600
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
            aria-label="Attach files"
            title="Attach files"
          >
            <Paperclip
              size={20}
            />
          </button>

          {/* TEXT AREA */}

          <div
            className="
              min-w-0
              flex-1
            "
          >
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
              className="
                max-h-32
                min-h-[40px]
                w-full
                resize-none
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-2.5
                text-sm
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-blue-400
                focus:bg-white
                focus:ring-2
                focus:ring-blue-100
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
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
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-blue-600
              to-indigo-600
              text-white
              shadow-sm
              transition-all
              hover:from-blue-700
              hover:to-indigo-700
              hover:shadow-md
              active:scale-95
              disabled:cursor-not-allowed
              disabled:bg-slate-300
              disabled:bg-none
            "
            aria-label="Send message"
            title="Send"
          >
            <Send size={18} />
          </button>
        </div>

        {/* ATTACHMENT LIMIT */}

        {selectedFiles.length >
          0 && (
          <p
            className="
              mt-1
              px-12
              text-[10px]
              text-slate-400
            "
          >
            {selectedFiles.length}/
            {MAX_ATTACHMENTS}{" "}
            files attached
          </p>
        )}
      </div>

      {/* =================================================
          MESSAGE THREAD
      ================================================== */}

      {activeThread && (
        <div
          className="
            absolute
            inset-y-0
            right-0
            z-30
            flex
            w-full
            max-w-[420px]
            flex-col
            border-l
            border-slate-200
            bg-white
            shadow-2xl
          "
        >
          {/* THREAD HEADER */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-3
              border-b
              border-slate-200
              bg-white
              px-4
              py-3
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-blue-50
                text-blue-600
              "
            >
              <MessageCircle
                size={18}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-900
                "
              >
                Thread
              </p>

              <p
                className="
                  truncate
                  text-xs
                  text-slate-400
                "
              >
                {Array.isArray(
                  activeThread.replies
                )
                  ? activeThread.replies.length
                  : 0}{" "}
                {Array.isArray(
                  activeThread.replies
                ) &&
                activeThread.replies.length === 1
                  ? "reply"
                  : "replies"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setActiveThread(null)
              }
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                text-slate-400
                transition
                hover:bg-slate-100
                hover:text-slate-700
              "
              aria-label="Close thread"
            >
              <X size={18} />
            </button>
          </div>

          {/* THREAD CONTENT */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              bg-slate-50
              px-3
              py-4
            "
          >
            {threadLoading ? (
              <div
                className="
                  flex
                  h-full
                  items-center
                  justify-center
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-slate-400
                  "
                >
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Loading thread...
                </div>
              </div>
            ) : threadError ? (
              <div
                className="
                  flex
                  h-full
                  items-center
                  justify-center
                  px-6
                  text-center
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-medium
                      text-red-500
                    "
                  >
                    {threadError}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      activeThread?.messageId &&
                      handleOpenThread({
                        id: activeThread.messageId,
                      })
                    }
                    className="
                      mt-3
                      rounded-lg
                      bg-blue-600
                      px-3
                      py-2
                      text-xs
                      font-medium
                      text-white
                      hover:bg-blue-700
                    "
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* ORIGINAL MESSAGE */}

                {activeThread.parent && (
                  <div>
                    <p
                      className="
                        mb-2
                        px-1
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-wide
                        text-slate-400
                      "
                    >
                      Original message
                    </p>

                    <ThreadMessage
                      message={
                        activeThread.parent
                      }
                      currentUserId={
                        currentUserId
                      }
                    />
                  </div>
                )}

                {/* REPLIES */}

                <div>
                  <p
                    className="
                      mb-2
                      px-1
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-400
                    "
                  >
                    Replies
                  </p>

                  {activeThread.replies?.length ? (
                    <div className="space-y-2">
                      {activeThread.replies.map(
                        (reply) => (
                          <ThreadMessage
                            key={getMessageId(
                              reply
                            )}
                            message={reply}
                            currentUserId={
                              currentUserId
                            }
                          />
                        )
                      )}
                    </div>
                  ) : (
                    <div
                      className="
                        rounded-xl
                        border
                        border-dashed
                        border-slate-200
                        bg-white
                        px-4
                        py-6
                        text-center
                      "
                    >
                      <p
                        className="
                          text-sm
                          text-slate-400
                        "
                      >
                        No replies yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
