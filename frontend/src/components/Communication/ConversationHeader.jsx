import {
  ChevronDown,
  ChevronUp,
  Search,
  ArrowLeft,
  X,
} from "lucide-react";

const ConversationHeader = ({
  conversation,
  currentUserId,
  typingLabel,
  onBack,

  /*
   * Group Info
   */
  onOpenGroupInfo,

  /*
   * Direct Info
   */
  onOpenDirectInfo,

  /*
   * Search
   */
  messageSearchOpen,
  messageSearchText,
  messageSearchFocused,
  messageSearchInputRef,
  messageSearchResults,
  messageSearchLoading,
  messageSearchError,
  activeSearchResultIndex,
  searchNavigationLoading,

  onOpenMessageSearch,
  onCloseMessageSearch,
  onMessageSearchChange,
  onSearchResultClick,
  onNavigateSearchResult,
  onSearchFocus,
  onSearchBlur,
}) => {
  if (!conversation) {
    return null;
  }

  /* =========================================================
     HELPERS
  ========================================================= */

  const getConversationName = () => {
    /*
     * DIRECT CONVERSATION
     */
    if (conversation.type === "direct") {
      const other =
        conversation.participants?.find(
          (participant) =>
            String(
              participant?.id ||
                participant?._id ||
                participant?.userId
            ) !== String(currentUserId)
        );

      return (
        other?.name ||
        other?.fullName ||
        other?.email ||
        "Unknown user"
      );
    }

    /*
     * GROUP CONVERSATION
     */
    return (
      conversation.name ||
      conversation.title ||
      "Conversation"
    );
  };

  const conversationName =
    getConversationName();

  /*
   * Find the other participant in a direct
   * conversation.
   */
  const otherParticipant =
    conversation.type === "direct"
      ? conversation.participants?.find(
          (participant) =>
            String(
              participant?.id ||
                participant?._id ||
                participant?.userId
            ) !== String(currentUserId)
        )
      : null;

  /*
   * Subtitle
   */
  const subtitle =
    conversation.type === "group"
      ? `${
          conversation.participants?.length ||
          0
        } participants`
      : otherParticipant?.role || "";

  /*
   * Open the appropriate information panel.
   *
   * Group  -> GroupInfo
   * Direct -> DirectInfo
   */
  const handleConversationInfoClick = () => {
    if (conversation.type === "group") {
      onOpenGroupInfo?.(conversation);
      return;
    }

    if (conversation.type === "direct") {
      onOpenDirectInfo?.(conversation);
    }
  };  

  const canOpenConversationInfo =
    (conversation.type === "group" &&
      Boolean(onOpenGroupInfo)) ||
    (conversation.type === "direct" &&
      Boolean(onOpenDirectInfo));

  return (
    <header
      className="
        relative
        z-20
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
      {/* =================================================
          MOBILE BACK
      ================================================= */}

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
          "
          aria-label="Back"
          title="Back"
        >
          <span className="text-lg">
            <ArrowLeft size={18} />
          </span>
        </button>
      )}

      {/* =================================================
          CONVERSATION INFORMATION
          
          The entire profile/header area is clickable,
          similar to modern SaaS messaging interfaces.
      ================================================= */}

      <button
        type="button"
        onClick={
          canOpenConversationInfo
            ? handleConversationInfoClick
            : undefined
        }
        disabled={!canOpenConversationInfo}
        className={`
          flex
          min-w-0
          flex-1
          items-center
          gap-3
          rounded-xl
          px-1.5
          py-1
          text-left
          transition
          ${
            canOpenConversationInfo
              ? "cursor-pointer hover:bg-slate-50 active:bg-slate-100"
              : "cursor-default"
          }
        `}
        aria-label={
          conversation.type === "group"
            ? "Open group information"
            : "Open contact information"
        }
        title={
          conversation.type === "group"
            ? "Open group information"
            : "Open contact information"
        }
      >
        {/* =================================================
            AVATAR
        ================================================= */}

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

        {/* =================================================
            CONVERSATION INFO
        ================================================= */}

        <div className="min-w-0 flex-1">
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
              {conversation.type === "group"
                ? "Group conversation"
                : subtitle || "Conversation"}
            </p>
          )}
        </div>
      </button>

      {/* =================================================
          MESSAGE SEARCH
      ================================================= */}

      <div className="relative z-50 shrink-0">
        {messageSearchOpen ? (
          <div
            className="
              flex
              items-center
              gap-1
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-2
              py-1.5
              shadow-sm
            "
          >
            <Search
              size={17}
              className="shrink-0 text-slate-400"
            />

            <input
              ref={messageSearchInputRef}
              type="text"
              value={messageSearchText}
              onChange={onMessageSearchChange}
              onFocus={onSearchFocus}
              onBlur={onSearchBlur}
              onKeyDown={(event) => {
                /*
                 * Close search
                 */
                if (event.key === "Escape") {
                  onCloseMessageSearch();
                  return;
                }

                /*
                 * Next result
                 */
                if (
                  event.key === "ArrowDown" ||
                  (event.key === "Enter" &&
                    !event.shiftKey)
                ) {
                  if (
                    messageSearchResults?.length
                  ) {
                    event.preventDefault();

                    onNavigateSearchResult(1);
                  }

                  return;
                }

                /*
                 * Previous result
                 */
                if (
                  event.key === "ArrowUp" ||
                  (event.key === "Enter" &&
                    event.shiftKey)
                ) {
                  if (
                    messageSearchResults?.length
                  ) {
                    event.preventDefault();

                    onNavigateSearchResult(-1);
                  }
                }
              }}
              placeholder="Search messages..."
              className="
                w-28
                bg-transparent
                px-1
                text-xs
                text-slate-800
                outline-none
                placeholder:text-slate-400
                sm:w-40
              "
              aria-label="Search messages"
            />

            {/* =================================================
                SEARCH RESULT COUNT + NAVIGATION
            ================================================= */}

            {messageSearchText.trim() &&
              messageSearchResults?.length >
                0 && (
                <>
                  <span
                    className="
                      shrink-0
                      px-1
                      text-[10px]
                      font-medium
                      tabular-nums
                      text-slate-400
                    "
                  >
                    {activeSearchResultIndex >=
                    0
                      ? activeSearchResultIndex + 1
                      : 0}
                    /
                    {
                      messageSearchResults.length
                    }
                  </span>

                  {/* Previous */}

                  <button
                    type="button"
                    onMouseDown={(event) =>
                      event.preventDefault()
                    }
                    onClick={() =>
                      onNavigateSearchResult(-1)
                    }
                    disabled={
                      searchNavigationLoading
                    }
                    className="
                      flex
                      h-6
                      w-6
                      shrink-0
                      items-center
                      justify-center
                      rounded-md
                      text-slate-500
                      transition
                      hover:bg-slate-200
                      hover:text-blue-600
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                    aria-label="Previous search match"
                    title="Previous match"
                  >
                    <ChevronUp size={15} />
                  </button>

                  {/* Next */}

                  <button
                    type="button"
                    onMouseDown={(event) =>
                      event.preventDefault()
                    }
                    onClick={() =>
                      onNavigateSearchResult(1)
                    }
                    disabled={
                      searchNavigationLoading
                    }
                    className="
                      flex
                      h-6
                      w-6
                      shrink-0
                      items-center
                      justify-center
                      rounded-md
                      text-slate-500
                      transition
                      hover:bg-slate-200
                      hover:text-blue-600
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                    aria-label="Next search match"
                    title="Next match"
                  >
                    <ChevronDown size={15} />
                  </button>
                </>
              )}

            {/* =================================================
                CLOSE SEARCH
            ================================================= */}

            <button
              type="button"
              onMouseDown={(event) =>
                event.preventDefault()
              }
              onClick={
                onCloseMessageSearch
              }
              className="
                flex
                h-6
                w-6
                shrink-0
                items-center
                justify-center
                rounded-full
                text-slate-400
                transition
                hover:bg-slate-200
                hover:text-slate-700
              "
              aria-label="Close message search"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={
              onOpenMessageSearch
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-blue-600
            "
            aria-label="Search messages"
            title="Search messages"
          >
            <Search size={19} />
          </button>
        )}

        {/* =================================================
            SEARCH RESULTS DROPDOWN

            High z-index so it remains above
            messages and other conversation UI.
        ================================================= */}

        {messageSearchOpen &&
          messageSearchFocused &&
          messageSearchText.trim() && (
            <div
              className="
                absolute
                right-0
                top-[calc(100%+8px)]
                z-[100]
                w-[min(360px,calc(100vw-32px))]
                overflow-hidden
                rounded-xl
                border
                border-slate-200
                bg-white
                shadow-2xl
              "
            >
              {messageSearchLoading ? (
                <div
                  className="
                    px-4
                    py-4
                    text-xs
                    text-slate-500
                  "
                >
                  Searching messages...
                </div>
              ) : messageSearchError ? (
                <div
                  className="
                    px-4
                    py-4
                    text-xs
                    text-red-500
                  "
                >
                  {messageSearchError}
                </div>
              ) : messageSearchResults?.length ? (
                <div
                  className="
                    max-h-[360px]
                    overflow-y-auto
                    py-1
                  "
                >
                  {messageSearchResults.map(
                    (
                      result,
                      resultIndex
                    ) => {
                      const resultId =
                        result?.id ||
                        result?._id;

                      const senderName =
                        result?.sender?.name ||
                        result?.sender?.fullName ||
                        result?.senderName ||
                        "Unknown user";

                      const resultText =
                        result?.text?.trim() ||
                        (result?.attachments
                          ?.length
                          ? "Attachment"
                          : "Message");

                      return (
                        <button
                          key={resultId}
                          type="button"
                          onMouseDown={(event) =>
                            event.preventDefault()
                          }
                          onClick={() =>
                            onSearchResultClick(
                              result,
                              resultIndex
                            )
                          }
                          className={`
                            block
                            w-full
                            border-b
                            border-slate-100
                            px-4
                            py-3
                            text-left
                            transition
                            last:border-b-0
                            hover:bg-slate-50
                            ${
                              activeSearchResultIndex ===
                              resultIndex
                                ? "bg-blue-50"
                                : ""
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
                            <span
                              className="
                                truncate
                                text-xs
                                font-semibold
                                text-slate-700
                              "
                            >
                              {senderName}
                            </span>

                            {result?.createdAt && (
                              <span
                                className="
                                  shrink-0
                                  text-[10px]
                                  text-slate-400
                                "
                              >
                                {new Date(
                                  result.createdAt
                                ).toLocaleDateString(
                                  [],
                                  {
                                    day: "2-digit",
                                    month: "short",
                                  }
                                )}
                              </span>
                            )}
                          </div>

                          <p
                            className="
                              mt-1
                              line-clamp-2
                              break-words
                              text-xs
                              leading-5
                              text-slate-500
                            "
                          >
                            {resultText}
                          </p>
                        </button>
                      );
                    }
                  )}
                </div>
              ) : (
                <div
                  className="
                    px-4
                    py-5
                    text-center
                    text-xs
                    text-slate-400
                  "
                >
                  No messages found
                </div>
              )}
            </div>
          )}
      </div>
    </header>
  );
};

export default ConversationHeader;