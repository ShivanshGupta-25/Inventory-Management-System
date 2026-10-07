import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  MessageSquarePlus,
  Search,
  Users,
  Paperclip,
  Image as ImageIcon,
} from "lucide-react";

import ConversationActionMenu from "./ConversationActionMenu";

/* =========================================================
   HELPERS
========================================================= */

const getId = (value) => {
  if (!value) {
    return null;
  }

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
  if (!participant) {
    return null;
  }

  if (participant.user) {
    return participant.user;
  }

  return participant;
};

/* =========================================================
   CONVERSATION NAME
========================================================= */

const getConversationName = (
  conversation,
  currentUserId
) => {
  if (!conversation) {
    return "Conversation";
  }

  if (conversation.type === "group") {
    return (
      conversation.name ||
      "Unnamed group"
    );
  }

  const participants =
    conversation.participants ||
    conversation.users ||
    [];

  const currentId = String(
    currentUserId || ""
  );

  const otherParticipant =
    participants.find((participant) => {
      const user =
        getParticipantUser(
          participant
        );

      const participantId =
        getId(user) ||
        getId(participant);

      return (
        participantId &&
        String(participantId) !==
          currentId
      );
    });

  if (otherParticipant) {
    const user =
      getParticipantUser(
        otherParticipant
      );

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

/* =========================================================
   INITIALS
========================================================= */

const getInitials = (name = "") => {
  const value = name.trim();

  if (!value) {
    return "?";
  }

  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();
};

/* =========================================================
   LAST MESSAGE PREVIEW
========================================================= */

const getLastMessagePreview = (
  lastMessage
) => {
  if (!lastMessage) {
    return "No messages yet";
  }

  if (typeof lastMessage === "string") {
    return lastMessage;
  }

  const text =
    lastMessage.content ||
    lastMessage.text ||
    "";

  if (
    typeof text === "string" &&
    text.trim()
  ) {
    return text.trim();
  }

  const attachments =
    lastMessage.attachments || [];

  if (attachments.length > 0) {
    const hasImage =
      attachments.some(
        (attachment) =>
          attachment?.mimeType?.startsWith(
            "image/"
          )
      );

    return hasImage
      ? "Photo"
      : "File";
  }

  if (lastMessage.type === "image") {
    return "Photo";
  }

  if (lastMessage.type === "file") {
    return "File";
  }

  return "No messages yet";
};

/* =========================================================
   LAST MESSAGE TYPE
========================================================= */

const getLastMessageType = (
  lastMessage
) => {
  if (!lastMessage) {
    return null;
  }

  if (lastMessage.type === "image") {
    return "image";
  }

  if (lastMessage.type === "file") {
    return "file";
  }

  const attachments =
    lastMessage.attachments || [];

  if (
    attachments.some(
      (attachment) =>
        attachment?.mimeType?.startsWith(
          "image/"
        )
    )
  ) {
    return "image";
  }

  if (attachments.length > 0) {
    return "file";
  }

  return null;
};

/* =========================================================
   TIME
========================================================= */

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

/* =========================================================
   LEFT GROUP HELPERS
========================================================= */

const isGroupConversation = (
  conversation
) => {
  return (
    conversation?.type === "group"
  );
};

const hasLeftConversation = (
  conversation
) => {
  if (
    !isGroupConversation(
      conversation
    )
  ) {
    return false;
  }

  return (
    conversation?.isLeft === true
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const ConversationList = ({
  conversations = [],
  currentUserId,
  activeConversationId,
  onSelect,
  onNewConversation,
  loading,

  /*
   * Conversation actions.
   */
  onMarkUnread,
  onTogglePin,
  onToggleMute,
  onDeleteConversation,

  /*
   * Opens GroupInfo from the
   * ConversationActionMenu.
   *
   * Signature:
   *
   * onOpenGroupInfo(
   *   conversation,
   *   options
   * )
   */
  onOpenGroupInfo,
}) => {
  const [search, setSearch] =
    useState("");

  /*
   * Desktop context menu.
   */
  const [contextMenu, setContextMenu] =
    useState(null);

  /*
   * Mobile action sheet.
   */
  const [
    mobileActionConversation,
    setMobileActionConversation,
  ] = useState(null);

  /*
   * Long-press timer.
   */
  const longPressTimer =
    useRef(null);

  /*
   * Used to distinguish a long press
   * from a normal click.
   */
  const longPressTriggered =
    useRef(false);

  /* =====================================================
     SEARCH
  ====================================================== */

  const filteredConversations =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return conversations;
      }

      return conversations.filter(
        (conversation) => {
          const name =
            getConversationName(
              conversation,
              currentUserId
            );

          const preview =
            getLastMessagePreview(
              conversation.lastMessage
            );

          return (
            name
              .toLowerCase()
              .includes(value) ||
            preview
              .toLowerCase()
              .includes(value)
          );
        }
      );
    }, [
      conversations,
      currentUserId,
      search,
    ]);

  /* =====================================================
     CLOSE CONTEXT MENU
  ====================================================== */

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const closeMobileActionMenu = () => {
    setMobileActionConversation(
      null
    );
  };

  /* =====================================================
     ESCAPE
  ====================================================== */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeContextMenu();
        closeMobileActionMenu();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /* =====================================================
     OUTSIDE CLICK
  ====================================================== */

  useEffect(() => {
    if (!contextMenu) {
      return undefined;
    }

    const handleMouseDown = () => {
      closeContextMenu();
    };

    document.addEventListener(
      "mousedown",
      handleMouseDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleMouseDown
      );
    };
  }, [contextMenu]);

  /* =====================================================
     LONG PRESS CLEANUP
  ====================================================== */

  const clearLongPress = () => {
    if (longPressTimer.current) {
      window.clearTimeout(
        longPressTimer.current
      );

      longPressTimer.current = null;
    }
  };

  /* =====================================================
     LONG PRESS START
  ====================================================== */

  const startLongPress = (
    conversation
  ) => {
    clearLongPress();

    longPressTriggered.current =
      false;

    longPressTimer.current =
      window.setTimeout(() => {
        longPressTriggered.current =
          true;

        setMobileActionConversation(
          conversation
        );
      }, 550);
  };

  /* =====================================================
     LONG PRESS CANCEL
  ====================================================== */

  const cancelLongPress = () => {
    clearLongPress();
  };

  /* =====================================================
     RIGHT CLICK
  ====================================================== */

  const handleContextMenu = (
    event,
    conversation
  ) => {
    event.preventDefault();
    event.stopPropagation();

    clearLongPress();

    setMobileActionConversation(
      null
    );

    setContextMenu({
      conversation,
      x: event.clientX,
      y: event.clientY,
    });
  };

  /* =====================================================
     NORMAL CLICK
  ====================================================== */

  const handleConversationClick = (
    conversation
  ) => {
    /*
     * If the interaction was a mobile
     * long press, don't also open the chat.
     */
    if (
      longPressTriggered.current
    ) {
      longPressTriggered.current =
        false;

      return;
    }

    if (!conversation) {
      return;
    }

    const conversationId =
      getId(conversation);

    if (!conversationId) {
      return;
    }

    /*
     * A user who has left a group should
     * not be able to reopen the chat.
     *
     * The conversation remains visible so
     * the user can access Group Info and
     * delete it.
     */
    if (
      hasLeftConversation(
        conversation
      )
    ) {
      return;
    }

    closeContextMenu();

    closeMobileActionMenu();

    onSelect?.(conversationId);
  };

  /* =====================================================
     GROUP INFO HANDLER
  ====================================================== */

  /*
   * This wrapper makes sure the correct
   * conversation is passed back to
   * CommunicationLayout.
   *
   * ConversationActionMenu can call:
   *
   * onOpenGroupInfo({
   *   openExitDelete: true
   * })
   */
  const handleOpenGroupInfo = (
    conversation,
    options = {}
  ) => {
    if (!conversation) {
      return;
    }

    closeContextMenu();

    closeMobileActionMenu();

    onOpenGroupInfo?.(
      conversation,
      options
    );
  };

  /* =====================================================
     RENDER
  ====================================================== */

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="shrink-0 border-b border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">

          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900">
              Conversations
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              {conversations.length}{" "}
              conversation
              {conversations.length === 1
                ? ""
                : "s"}
            </p>
          </div>

          <button
            type="button"
            onClick={onNewConversation}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white transition hover:bg-slate-800"
            title="New conversation"
            aria-label="New conversation"
          >
            <MessageSquarePlus
              size={17}
            />
          </button>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="relative mt-4">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search conversations..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* =====================================================
          CONVERSATION SCROLL AREA
      ====================================================== */}

      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">

        {loading ? (
          <div className="p-3">
            {[
              1,
              2,
              3,
              4,
              5,
            ].map((item) => (
              <div
                key={item}
                className="mb-1 animate-pulse"
              >
                <div className="flex min-w-0 gap-3 rounded-xl p-3">

                  <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100" />

                  <div className="min-w-0 flex-1">
                    <div className="h-3 w-32 rounded bg-slate-100" />

                    <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length ===
          0 ? (
          <div className="flex min-h-full flex-col items-center justify-center px-6 py-10 text-center">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <MessageSquarePlus
                size={21}
                className="text-slate-400"
              />
            </div>

            <p className="mt-3 text-sm font-medium text-slate-700">
              No conversations
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Start a new conversation
              with your team.
            </p>

            <button
              type="button"
              onClick={
                onNewConversation
              }
              className="mt-4 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
            >
              New conversation
            </button>

          </div>
        ) : (
          <div className="w-full min-w-0 p-2">

            {filteredConversations.map(
              (conversation) => {
                const conversationId =
                  conversation.id ||
                  conversation._id;

                const name =
                  getConversationName(
                    conversation,
                    currentUserId
                  );

                const active =
                  String(
                    conversationId
                  ) ===
                  String(
                    activeConversationId
                  );

                const isLeft =
                  hasLeftConversation(
                    conversation
                  );

                const lastMessage =
                  conversation.lastMessage;

                const preview =
                  getLastMessagePreview(
                    lastMessage
                  );

                const messageType =
                  getLastMessageType(
                    lastMessage
                  );

                return (
                  <button
                    type="button"
                    key={conversationId}
                    onClick={() =>
                      handleConversationClick(
                        conversation
                      )
                    }
                    onContextMenu={(event) =>
                      handleContextMenu(
                        event,
                        conversation
                      )
                    }
                    onTouchStart={() =>
                      startLongPress(
                        conversation
                      )
                    }
                    onTouchEnd={
                      cancelLongPress
                    }
                    onTouchMove={
                      cancelLongPress
                    }
                    onTouchCancel={
                      cancelLongPress
                    }
                    className={`
                      mb-1 flex w-full min-w-0
                      touch-pan-y items-center gap-3
                      rounded-xl p-3 text-left
                      transition
                      ${
                        active
                          ? "bg-blue-50"
                          : isLeft
                          ? "bg-slate-50 hover:bg-slate-100"
                          : "hover:bg-slate-50"
                      }
                    `}
                  >

                    {/* =================================================
                        AVATAR
                    ================================================= */}

                    <div
                      className={`
                        flex h-10 w-10 shrink-0
                        items-center justify-center
                        rounded-full text-xs font-semibold
                        ${
                          active
                            ? "bg-blue-100 text-blue-700"
                            : isLeft
                            ? "bg-slate-200 text-slate-400"
                            : "bg-slate-100 text-slate-600"
                        }
                      `}
                    >
                      {conversation.type ===
                      "group" ? (
                        <Users
                          size={17}
                        />
                      ) : (
                        getInitials(name)
                      )}
                    </div>

                    {/* =================================================
                        CONTENT
                    ================================================= */}

                    <div className="min-w-0 flex-1">

                      <div className="flex min-w-0 items-center justify-between gap-2">

                        <p
                          className={`
                            min-w-0 flex-1 truncate
                            text-sm font-medium
                            ${
                              active
                                ? "text-blue-900"
                                : isLeft
                                ? "text-slate-500"
                                : "text-slate-800"
                            }
                          `}
                        >
                          {name}
                        </p>

                        {conversation.lastMessageAt && (
                          <span className="shrink-0 text-[10px] text-slate-400">
                            {formatTime(
                              conversation.lastMessageAt
                            )}
                          </span>
                        )}

                      </div>

                      {/* =================================================
                          LEFT GROUP STATUS
                      ================================================= */}

                      {isLeft ? (
                        <div className="mt-1 flex min-w-0 items-center">
                          <p className="truncate text-xs font-medium text-slate-400">
                            You left this group
                          </p>
                        </div>
                      ) : (
                        <div className="mt-1 flex min-w-0 items-center gap-1">

                          {messageType ===
                            "image" && (
                            <ImageIcon
                              size={12}
                              className="shrink-0 text-slate-400"
                            />
                          )}

                          {messageType ===
                            "file" && (
                            <Paperclip
                              size={12}
                              className="shrink-0 text-slate-400"
                            />
                          )}

                          <p className="min-w-0 truncate text-xs text-slate-400">
                            {preview}
                          </p>

                        </div>
                      )}

                    </div>

                  </button>
                );
              }
            )}

          </div>
        )}

      </div>

      {/* =====================================================
          DESKTOP ACTION MENU
      ====================================================== */}

      {contextMenu && (
        <ConversationActionMenu
          conversation={
            contextMenu.conversation
          }

          /*
           * Allows the action menu to determine
           * whether the current user has already
           * left a group.
           */
          currentUserId={
            currentUserId
          }

          x={contextMenu.x}
          y={contextMenu.y}

          onMarkUnread={
            onMarkUnread
          }

          onTogglePin={
            onTogglePin
          }

          onToggleMute={
            onToggleMute
          }

          onDelete={
            onDeleteConversation
          }

          /*
           * Opens GroupInfo from the action menu.
           */
          onOpenGroupInfo={(
            options
          ) =>
            handleOpenGroupInfo(
              contextMenu.conversation,
              options
            )
          }

          onClose={
            closeContextMenu
          }
        />
      )}

      {/* =====================================================
          MOBILE ACTION SHEET
      ====================================================== */}

      {mobileActionConversation && (
        <ConversationActionMenu
          conversation={
            mobileActionConversation
          }

          /*
           * Allows the action menu to determine
           * whether the current user has already
           * left a group.
           */
          currentUserId={
            currentUserId
          }

          mobile

          onMarkUnread={
            onMarkUnread
          }

          onTogglePin={
            onTogglePin
          }

          onToggleMute={
            onToggleMute
          }

          onDelete={
            onDeleteConversation
          }

          /*
           * Opens GroupInfo from the mobile
           * action sheet as well.
           */
          onOpenGroupInfo={(
            options
          ) =>
            handleOpenGroupInfo(
              mobileActionConversation,
              options
            )
          }

          onClose={
            closeMobileActionMenu
          }
        />
      )}

    </div>
  );
};

export default ConversationList;