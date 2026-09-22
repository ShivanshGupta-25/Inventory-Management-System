import { useState, useEffect } from "react";

import {
  ExternalLink,
  FileText,
  Image as ImageIcon,
  X,
} from "lucide-react";

import { useCommunication } from "../../context/CommunicationContext";
import { useAuth } from "../../context/AuthContext";

/* =========================================================
  CONSTANTS
========================================================= */

const QUICK_REACTIONS = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "🙏",
];

/* =========================================================
  HELPERS
========================================================= */

const formatFileSize = (bytes = 0) => {
  if (!bytes) {
    return "0 B";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImageAttachment = (attachment) => {
  return Boolean(
    attachment?.mimeType?.startsWith("image/")
  );
};

/* =========================================================
  IMAGE PREVIEW MODAL
========================================================= */

const ImagePreview = ({
  attachment,
  onClose,
}) => {
  if (!attachment) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Close image preview"
      >
        <X size={20} />
      </button>

      <div
        className="flex max-h-[90vh] max-w-[90vw] items-center justify-center"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <img
          src={attachment.url}
          alt={attachment.name}
          loading="lazy"
          decoding="async"
          className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
        />
      </div>
    </div>
  );
};

/* =========================================================
  IMAGE ATTACHMENT
========================================================= */

const ImageAttachment = ({
  attachment,
  onOpen,
  compact = false,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-24 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition hover:bg-gray-100"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-400">
          <ImageIcon size={19} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-700">
            {attachment.name}
          </p>

          <p className="mt-0.5 text-xs text-gray-400">
            Image unavailable · Open file
          </p>
        </div>

        <ExternalLink
          size={16}
          className="ml-auto shrink-0 text-gray-400"
        />
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(attachment)}
      className={`group relative block overflow-hidden rounded-xl bg-gray-100 ${
        compact
          ? "h-36 w-36"
          : "max-h-[420px] max-w-full"
      }`}
    >
      <img
        src={attachment.url}
        alt={attachment.name}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`block max-h-[420px] max-w-full rounded-xl object-contain transition duration-200 group-hover:scale-[1.02] ${
          compact
            ? "h-36 w-36 object-cover"
            : ""
        }`}
      />

      <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
    </button>
  );
};

/* =========================================================
  DOCUMENT ATTACHMENT
========================================================= */

const DocumentAttachment = ({
  attachment,
}) => {
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
      className="group flex min-w-0 max-w-[360px] items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-gray-300 hover:bg-gray-50"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <FileText size={21} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-800">
          {attachment.name}
        </p>

        <p className="mt-0.5 text-xs text-gray-400">
          {formatFileSize(attachment.size)}
        </p>
      </div>

      <ExternalLink
        size={16}
        className="shrink-0 text-gray-400 transition group-hover:text-gray-600"
      />
    </a>
  );
};

/* =========================================================
  MAIN MESSAGE
========================================================= */

const MessageItem = ({
  message,
  own,
}) => {
  const [previewAttachment, setPreviewAttachment] =
    useState(null);

  const [showReactionPicker, setShowReactionPicker] =
    useState(false);

  const [reacting, setReacting] =
    useState(false);

  const { toggleMessageReaction } =
    useCommunication();

  const { user } = useAuth();

  const time = new Date(
    message.createdAt
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const text =
    message.text ||
    message.content ||
    "";

  const attachments =
    Array.isArray(message.attachments)
      ? message.attachments
      : [];

  const imageAttachments =
    attachments.filter(
      isImageAttachment
    );

  const documentAttachments =
    attachments.filter(
      (attachment) =>
        !isImageAttachment(attachment)
    );

  const hasText = Boolean(text.trim());

  const hasAttachments =
    attachments.length > 0;

  const reactions = Array.isArray(
    message.reactions
  )
    ? message.reactions
    : [];

  /* =========================================================
    CLOSE REACTION MENU WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {
    if (!showReactionPicker) {
      return;
    }

    const handleOutsideClick = () => {
      setShowReactionPicker(false);
    };

    document.addEventListener(
      "click",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "click",
        handleOutsideClick
      );
    };
  }, [showReactionPicker]);

  /* =========================================================
    REACTION HANDLER
  ========================================================= */

  const handleReaction = async (emoji) => {
    if (
      !message?.id ||
      !emoji ||
      reacting
    ) {
      return;
    }

    try {
      setReacting(true);

      await toggleMessageReaction(
        message.id,
        emoji
      );

      setShowReactionPicker(false);
    } catch (error) {
      console.error(
        "Failed to update reaction:",
        error
      );
    } finally {
      setReacting(false);
    }
  };

  /* =========================================================
    RIGHT CLICK
  ========================================================= */

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!reacting) {
      setShowReactionPicker(true);
    }
  };

  /* =========================================================
    CHECK CURRENT USER REACTION
  ========================================================= */

  const hasReacted = (reaction) => {
    return Boolean(
      reaction?.userIds?.some(
        (id) =>
          String(id) ===
          String(user?.id)
      )
    );
  };

  return (
    <>
      <div
        className={`flex min-w-0 ${
          own
            ? "justify-end"
            : "justify-start"
        }`}
      >
        <div
          className={`group relative flex min-w-0 w-fit max-w-[min(90%,520px)] flex-col sm:max-w-[min(75%,520px)] ${
            own
              ? "items-end"
              : "items-start"
          }`}
          onContextMenu={
            handleContextMenu
          }
        >
          {/* =================================================
              SENDER
          ================================================= */}

          {!own && (
            <div className="mb-1 px-1 text-xs font-medium text-gray-600">
              {message.sender?.name ||
                "Unknown user"}
            </div>
          )}

          {/* =================================================
              MESSAGE CONTENT
          ================================================= */}

          <div
            className={`min-w-0 ${
              hasAttachments &&
              !hasText
                ? ""
                : own
                ? "rounded-2xl rounded-br-md bg-blue-600 px-4 py-2.5 text-white"
                : "rounded-2xl rounded-bl-md bg-gray-100 px-4 py-2.5 text-gray-900"
            }`}
          >
            {/* Text */}

            {hasText && (
              <p className="whitespace-pre-wrap break-words text-sm">
                {text}
              </p>
            )}

            {/* =================================================
                IMAGES
            ================================================= */}

            {imageAttachments.length > 0 && (
              <div
                className={
                  hasText
                    ? "mt-2"
                    : ""
                }
              >
                {imageAttachments.length ===
                1 ? (
                  <ImageAttachment
                    attachment={
                      imageAttachments[0]
                    }
                    onOpen={
                      setPreviewAttachment
                    }
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    {imageAttachments.map(
                      (attachment) => (
                        <ImageAttachment
                          key={
                            attachment._id ||
                            attachment.url
                          }
                          attachment={
                            attachment
                          }
                          compact
                          onOpen={
                            setPreviewAttachment
                          }
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                DOCUMENTS
            ================================================= */}

            {documentAttachments.length >
              0 && (
              <div
                className={`flex min-w-0 flex-col gap-2 ${
                  hasText ||
                  imageAttachments.length >
                    0
                    ? "mt-2"
                    : ""
                }`}
              >
                {documentAttachments.map(
                  (attachment) => (
                    <DocumentAttachment
                      key={
                        attachment._id ||
                        attachment.url
                      }
                      attachment={
                        attachment
                      }
                    />
                  )
                )}
              </div>
            )}

            {/* =================================================
                EMPTY MESSAGE FALLBACK
            ================================================= */}

            {!hasText &&
              !hasAttachments && (
                <p className="text-sm text-gray-500">
                  Empty message
                </p>
              )}
          </div>

          {/* =================================================
              REACTION PICKER

              IMPORTANT:
              This is NOT visible by default.

              It only opens after right-click.
          ================================================= */}

          {showReactionPicker && (
            <div
              className={`absolute bottom-8 z-50 ${
                own
                  ? "right-0"
                  : "left-0"
              }`}
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 shadow-xl">
                {QUICK_REACTIONS.map(
                  (emoji) => {
                    const selected =
                      reactions.some(
                        (reaction) =>
                          reaction.emoji ===
                            emoji &&
                          hasReacted(
                            reaction
                          )
                      );

                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() =>
                          handleReaction(
                            emoji
                          )
                        }
                        disabled={
                          reacting
                        }
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition ${
                          selected
                            ? "bg-blue-100 ring-2 ring-blue-400"
                            : "hover:bg-slate-100"
                        } ${
                          reacting
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                        aria-label={
                          selected
                            ? `Remove ${emoji} reaction`
                            : `React with ${emoji}`
                        }
                      >
                        {emoji}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* =================================================
              EXISTING REACTIONS
          ================================================= */}

          {reactions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1 px-1">
              {reactions.map(
                (reaction) => {
                  const selected =
                    hasReacted(
                      reaction
                    );

                  return (
                    <button
                      key={
                        reaction.emoji
                      }
                      type="button"
                      onClick={() =>
                        handleReaction(
                          reaction.emoji
                        )
                      }
                      disabled={reacting}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs shadow-sm transition ${
                        selected
                          ? "border-blue-300 bg-blue-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      } ${
                        reacting
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                      aria-label={
                        selected
                          ? `Remove ${reaction.emoji} reaction`
                          : `Add ${reaction.emoji} reaction`
                      }
                    >
                      <span>
                        {
                          reaction.emoji
                        }
                      </span>

                      <span className="font-medium text-slate-600">
                        {reaction
                          .userIds
                          ?.length ||
                          0}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          )}

          {/* =================================================
              TIME
          ================================================= */}

          <div
            className={`mt-1 px-1 text-[11px] text-gray-400 ${
              own
                ? "text-right"
                : "text-left"
            }`}
          >
            {time}
          </div>
        </div>
      </div>

      {/* ===================================================
          FULL IMAGE PREVIEW
      =================================================== */}

      {previewAttachment && (
        <ImagePreview
          attachment={
            previewAttachment
          }
          onClose={() =>
            setPreviewAttachment(null)
          }
        />
      )}
    </>
  );
};

export default MessageItem;