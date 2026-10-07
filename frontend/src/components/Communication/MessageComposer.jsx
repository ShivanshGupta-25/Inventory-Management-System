import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Paperclip,
  Send,
  X,
} from "lucide-react";

/* =========================================================
   CONSTANTS
========================================================= */

const MAX_ATTACHMENTS = 5;

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const IMAGE_VIDEO_ACCEPT =
  "image/*,video/*";

const DOCUMENT_ACCEPT = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".csv",
  ".rtf",
].join(",");

const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/rtf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const DOCUMENT_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
  "rtf",
];

const ATTACHMENT_OPTIONS = [
  {
    id: "image",
    label: "Photos & Videos",
    description: "Images and videos",
    accept: IMAGE_VIDEO_ACCEPT,
    icon: ImageIcon,
    iconClass:
      "bg-blue-50 text-blue-600",
  },
  {
    id: "document",
    label: "Documents",
    description:
      "PDF, Word, Excel, PowerPoint, text",
    accept: DOCUMENT_ACCEPT,
    icon: FileText,
    iconClass:
      "bg-emerald-50 text-emerald-600",
  },
  {
    id: "other",
    label: "Other files",
    description:
      "Any file up to 10 MB",
    accept: "*/*",
    icon: FolderOpen,
    iconClass:
      "bg-violet-50 text-violet-600",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const MessageComposer = ({
  conversationId,
  replyingTo,
  onCancelReply,

  onSend,
  onTypingStart,
  onTypingStop,

  disabled = false,
  onMessageSent,
}) => {
  const [text, setText] =
    useState("");

  const [selectedFiles, setSelectedFiles] =
    useState([]);

  const [filePreviews, setFilePreviews] =
    useState([]);

  const [sending, setSending] =
    useState(false);

  const [showAttachmentMenu, setShowAttachmentMenu] =
    useState(false);

  const [fileAccept, setFileAccept] =
    useState(
      IMAGE_VIDEO_ACCEPT
    );

  const [fileSelectionCategory, setFileSelectionCategory] =
    useState("other");

  const fileInputRef =
    useRef(null);

  const attachmentMenuRef =
    useRef(null);

  const filePreviewsRef =
    useRef([]);

  const typingTimeoutRef =
    useRef(null);

  filePreviewsRef.current =
    filePreviews;

  /* =======================================================
     OUTSIDE CLICK / ESCAPE
  ======================================================== */

  useEffect(() => {
    if (!showAttachmentMenu) {
      return undefined;
    }

    const handleOutsideClick =
      (event) => {
        if (
          attachmentMenuRef.current &&
          !attachmentMenuRef.current.contains(
            event.target
          )
        ) {
          setShowAttachmentMenu(
            false
          );
        }
      };

    const handleEscape =
      (event) => {
        if (
          event.key === "Escape"
        ) {
          setShowAttachmentMenu(
            false
          );
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [showAttachmentMenu]);

  /* =======================================================
     CLEANUP
  ======================================================== */

  useEffect(() => {
    return () => {
      clearTimeout(
        typingTimeoutRef.current
      );

      filePreviewsRef.current.forEach(
        (preview) => {
          if (preview?.url) {
            URL.revokeObjectURL(
              preview.url
            );
          }
        }
      );
    };
  }, []);

  /* =======================================================
     TEXT / TYPING
  ======================================================== */

  const handleChange = (
    event
  ) => {
    const value =
      event.target.value;

    setText(value);

    clearTimeout(
      typingTimeoutRef.current
    );

    if (!value.trim()) {
      onTypingStop?.(
        conversationId
      );

      return;
    }

    onTypingStart?.(
      conversationId
    );

    typingTimeoutRef.current =
      setTimeout(() => {
        onTypingStop?.(
          conversationId
        );
      }, 1000);
  };

  /* =======================================================
     FILE VALIDATION
  ======================================================== */

  const validateFile = (
    file,
    category
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

    if (category === "image") {
      if (
        !file.type.startsWith(
          "image/"
        ) &&
        !file.type.startsWith(
          "video/"
        )
      ) {
        window.alert(
          `${file.name} is not an image or video.`
        );

        return false;
      }

      return true;
    }

    if (category === "document") {
      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() || "";

      const isDocument =
        DOCUMENT_EXTENSIONS.includes(
          extension
        ) ||
        ACCEPTED_FILE_TYPES.includes(
          file.type
        );

      if (!isDocument) {
        window.alert(
          `${file.name} is not a supported document type.`
        );

        return false;
      }

      return true;
    }

    return true;
  };

  /* =======================================================
     OPEN FILE PICKER
  ======================================================== */

  const openFilePicker = (
    category
  ) => {
    if (
      disabled ||
      sending ||
      selectedFiles.length >=
        MAX_ATTACHMENTS
    ) {
      setShowAttachmentMenu(
        false
      );

      return;
    }

    const option =
      ATTACHMENT_OPTIONS.find(
        (item) =>
          item.id === category
      );

    if (
      !option ||
      !fileInputRef.current
    ) {
      return;
    }

    setFileSelectionCategory(
      category
    );

    setFileAccept(
      option.accept
    );

    setShowAttachmentMenu(
      false
    );

    fileInputRef.current.value =
      "";

    requestAnimationFrame(() => {
      fileInputRef.current?.click();
    });
  };

  /* =======================================================
     FILE SELECTION
  ======================================================== */

  const handleFilesSelected =
    (event) => {
      const incomingFiles =
        Array.from(
          event.target.files || []
        );

      if (!incomingFiles.length) {
        return;
      }

      const remainingSlots =
        MAX_ATTACHMENTS -
        selectedFiles.length;

      if (remainingSlots <= 0) {
        event.target.value = "";
        return;
      }

      const existingFiles =
        new Set(
          selectedFiles.map(
            (file) =>
              `${file.name}-${file.size}-${file.lastModified}`
          )
        );

      const validFiles =
        incomingFiles.filter(
          (file) => {
            const key =
              `${file.name}-${file.size}-${file.lastModified}`;

            if (
              existingFiles.has(
                key
              )
            ) {
              return false;
            }

            return validateFile(
              file,
              fileSelectionCategory
            );
          }
        );

      const filesToAdd =
        validFiles.slice(
          0,
          remainingSlots
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
                URL.createObjectURL(
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

  const clearAllFiles = () => {
    filePreviewsRef.current.forEach(
      (preview) => {
        if (preview?.url) {
          URL.revokeObjectURL(
            preview.url
          );
        }
      }
    );

    setSelectedFiles([]);
    setFilePreviews([]);
  };

  /* =======================================================
     SEND
  ======================================================== */

  const submit = async (
    event
  ) => {
    event?.preventDefault();

    const trimmedText =
      text.trim();

    if (
      (!trimmedText &&
        selectedFiles.length ===
          0) ||
      disabled ||
      sending
    ) {
      return;
    }

    const replyToId =
      replyingTo?.id ||
      replyingTo?._id ||
      null;

    try {
      setSending(true);

      setShowAttachmentMenu(
        false
      );

      await onSend?.(
        trimmedText,
        selectedFiles,
        replyToId
      );

      clearTimeout(
        typingTimeoutRef.current
      );

      onTypingStop?.(
        conversationId
      );

      setText("");

      clearAllFiles();

      if (replyingTo) {
        onCancelReply?.();
      }

      onMessageSent?.();
    } catch (error) {
      console.error(
        "Failed to send message:",
        error
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      submit(event);
    }
  };

  const replyText =
    replyingTo?.text ||
    replyingTo?.content ||
    (replyingTo?.attachments
      ?.length
      ? "Attachment"
      : "Message");

  const replySender =
    replyingTo?.sender?.name ||
    replyingTo?.sender?.fullName ||
    replyingTo?.senderName ||
    "message";

  /* =======================================================
     RENDER
  ======================================================== */

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white">

      {/* =================================================
          REPLY PREVIEW
      ================================================= */}

      {replyingTo && (
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 border-l-2 border-blue-500 pl-3">
              <p className="text-xs font-semibold text-blue-600">
                Replying to{" "}
                {replySender}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-600">
                {replyText}
              </p>
            </div>

            <button
              type="button"
              onClick={
                onCancelReply
              }
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Cancel reply"
              title="Cancel reply"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          FILE PREVIEWS
      ================================================= */}

      {filePreviews.length >
        0 && (
        <div className="border-b border-slate-200 bg-white px-3 py-2">
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

                const isVideo =
                  file?.type?.startsWith(
                    "video/"
                  );

                return (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
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
                    ) : isVideo ? (
                      <video
                        src={
                          preview.url
                        }
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-1">
                        <FileText
                          size={
                            20
                          }
                          className="text-slate-500"
                        />

                        <span className="max-w-full truncate px-1 text-[9px] text-slate-500">
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
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white transition hover:bg-slate-900"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={12} />
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
      ================================================= */}

      <div className="px-3 py-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          accept={fileAccept}
          onChange={
            handleFilesSelected
          }
        />

        <div className="flex w-full items-end gap-2">

          {/* ATTACHMENT */}

          <div
            ref={
              attachmentMenuRef
            }
            className="relative shrink-0"
          >
            <button
              type="button"
              onClick={() =>
                setShowAttachmentMenu(
                  (current) =>
                    !current
                )
              }
              disabled={
                disabled ||
                sending ||
                selectedFiles.length >=
                  MAX_ATTACHMENTS
              }
              className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                showAttachmentMenu
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-500 hover:bg-slate-100 hover:text-blue-600"
              } disabled:cursor-not-allowed disabled:opacity-40`}
              aria-label="Attach files"
              aria-haspopup="menu"
              aria-expanded={
                showAttachmentMenu
              }
            >
              <Paperclip
                size={20}
                className={
                  showAttachmentMenu
                    ? "rotate-45 transition-transform"
                    : "transition-transform"
                }
              />
            </button>

            {showAttachmentMenu && (
              <div className="absolute bottom-12 left-0 z-[100] w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Attach file
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Choose what you want to send
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                      {
                        selectedFiles.length
                      }
                      /{MAX_ATTACHMENTS}
                    </span>
                  </div>
                </div>

                <div className="p-2">
                  {ATTACHMENT_OPTIONS.map(
                    (option) => {
                      const Icon =
                        option.icon;

                      return (
                        <button
                          key={
                            option.id
                          }
                          type="button"
                          onClick={() =>
                            openFilePicker(
                              option.id
                            )
                          }
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
                        >
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${option.iconClass}`}
                          >
                            <Icon
                              size={20}
                            />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-slate-800">
                              {
                                option.label
                              }
                            </span>

                            <span className="mt-0.5 block truncate text-xs text-slate-400">
                              {
                                option.description
                              }
                            </span>
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>

                <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
                  <p className="text-[10px] text-slate-400">
                    Maximum file size:
                    {" "}
                    10 MB each
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* INPUT */}

          <div className="min-w-0 flex-1">
            <textarea
              value={text}
              onChange={
                handleChange
              }
              onKeyDown={
                handleKeyDown
              }
              rows={1}
              maxLength={5000}
              placeholder={
                replyingTo
                  ? "Write a reply..."
                  : "Type a message..."
              }
              disabled={
                disabled ||
                sending
              }
              className="block max-h-32 min-h-[40px] w-full resize-none overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm leading-5 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* SEND */}

          <button
            type="button"
            onClick={submit}
            disabled={
              disabled ||
              sending ||
              (!text.trim() &&
                selectedFiles.length ===
                  0)
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:bg-none disabled:shadow-none"
            aria-label="Send message"
            title="Send message"
          >
            <Send size={18} />
          </button>
        </div>

        {/* ATTACHMENT INFO */}

        {selectedFiles.length >
          0 && (
          <div className="mt-1 flex items-center justify-between gap-3 px-12">
            <span className="truncate text-[10px] text-slate-400">
              {
                selectedFiles.length
              }
              /{MAX_ATTACHMENTS} files
              attached
            </span>

            <div className="flex items-center gap-2">
              {selectedFiles.length >=
                MAX_ATTACHMENTS && (
                <span className="text-[10px] text-amber-500">
                  Limit reached
                </span>
              )}

              <button
                type="button"
                onClick={
                  clearAllFiles
                }
                disabled={
                  disabled ||
                  sending
                }
                className="text-[10px] font-medium text-slate-400 transition hover:text-red-500 disabled:opacity-50"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageComposer;