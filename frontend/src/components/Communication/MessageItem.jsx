import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Reply,
  X,
} from "lucide-react";

import * as mammoth from "mammoth";
// import * as XLSX from "xlsx";

import {
  Document,
  Page,
  pdfjs,
} from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { useCommunication } from "../../context/CommunicationContext";
import { useAuth } from "../../context/AuthContext";

/* =========================================================
   PDF WORKER
========================================================= */

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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

const getFileExtension = (name = "") => {
  const parts = name.split(".");

  if (parts.length <= 1) {
    return "";
  }

  return parts.pop().toLowerCase();
};

const getFileType = (attachment) => {
  const extension = getFileExtension(
    attachment?.name
  );

  if (
    attachment?.mimeType ===
    "application/pdf"
  ) {
    return "PDF";
  }

  if (
    extension === "doc" ||
    extension === "docx"
  ) {
    return "WORD";
  }

  if (
    extension === "xls" ||
    extension === "xlsx"
  ) {
    return "EXCEL";
  }

  if (extension === "txt") {
    return "TEXT";
  }

  return (
    extension?.toUpperCase() ||
    "FILE"
  );
};

const isImageAttachment = (
  attachment
) => {
  return Boolean(
    attachment?.mimeType?.startsWith(
      "image/"
    )
  );
};

const isPdfAttachment = (
  attachment
) => {
  return (
    attachment?.mimeType ===
      "application/pdf" ||
    getFileExtension(
      attachment?.name
    ) === "pdf"
  );
};

const isTextAttachment = (
  attachment
) => {
  return (
    attachment?.mimeType ===
      "text/plain" ||
    getFileExtension(
      attachment?.name
    ) === "txt"
  );
};

const isWordAttachment = (
  attachment
) => {
  const extension =
    getFileExtension(
      attachment?.name
    );

  return (
    extension === "doc" ||
    extension === "docx"
  );
};

const isExcelAttachment = (
  attachment
) => {
  const extension =
    getFileExtension(
      attachment?.name
    );

  return (
    extension === "xls" ||
    extension === "xlsx"
  );
};

/* =========================================================
   IMAGE PREVIEW
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Close preview"
      >
        <X size={20} />
      </button>

      <div
        className="flex max-h-[90vh] max-w-[95vw] items-center justify-center"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-h-[88vh] max-w-[95vw] rounded-xl object-contain shadow-2xl"
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
  const [failed, setFailed] =
    useState(false);

  if (failed) {
    return (
      <button
        type="button"
        onClick={() =>
          onOpen(attachment)
        }
        className="flex min-h-24 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-400">
          <FileText size={19} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-700">
            {attachment.name}
          </p>

          <p className="text-xs text-gray-400">
            Image unavailable
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        onOpen(attachment)
      }
      className={`group relative overflow-hidden rounded-xl bg-gray-100 ${
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
        onError={() =>
          setFailed(true)
        }
        className={`block max-h-[420px] max-w-full rounded-xl object-contain transition duration-200 group-hover:scale-[1.02] ${
          compact
            ? "h-36 w-36 object-cover"
            : ""
        }`}
      />
    </button>
  );
};

/* =========================================================
   PDF PREVIEW
========================================================= */

const PdfPreview = ({
  attachment,
}) => {
  const [numPages, setNumPages] =
    useState(null);

  const [pageWidth, setPageWidth] =
    useState(800);

  useEffect(() => {
    const updateWidth = () => {
      const width =
        Math.min(
          window.innerWidth - 80,
          900
        );

      setPageWidth(
        Math.max(width, 320)
      );
    };

    updateWidth();

    window.addEventListener(
      "resize",
      updateWidth
    );

    return () =>
      window.removeEventListener(
        "resize",
        updateWidth
      );
  }, []);

  return (
    <div className="h-full overflow-auto bg-slate-100 p-4 sm:p-6">
      <div className="flex flex-col items-center gap-4">
        <Document
          file={attachment.url}
          onLoadSuccess={({
            numPages: totalPages,
          }) =>
            setNumPages(totalPages)
          }
          loading={
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2
                size={28}
                className="animate-spin text-blue-600"
              />
            </div>
          }
          error={
            <PreviewError
              message="Unable to preview this PDF."
            />
          }
        >
          {Array.from(
            new Array(numPages || 0),
            (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={pageWidth}
                renderTextLayer
                renderAnnotationLayer
                className="mb-4 overflow-hidden rounded-lg bg-white shadow-lg"
              />
            )
          )}
        </Document>
      </div>
    </div>
  );
};

/* =========================================================
   TEXT PREVIEW
========================================================= */

const TextPreview = ({
  attachment,
}) => {
  const [content, setContent] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadText = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            attachment.url
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load file"
          );
        }

        const text =
          await response.text();

        if (!cancelled) {
          setContent(text);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            "Unable to preview this text file."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadText();

    return () => {
      cancelled = true;
    };
  }, [attachment]);

  if (loading) {
    return <PreviewLoading />;
  }

  if (error) {
    return (
      <PreviewError
        message={error}
      />
    );
  }

  return (
    <div className="h-full overflow-auto bg-slate-100 p-4 sm:p-8">
      <pre className="mx-auto max-w-5xl whitespace-pre-wrap break-words rounded-xl bg-white p-6 font-mono text-sm leading-6 text-slate-800 shadow-lg">
        {content}
      </pre>
    </div>
  );
};

/* =========================================================
   WORD PREVIEW
========================================================= */

const WordPreview = ({
  attachment,
}) => {
  const [html, setHtml] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDocument = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            attachment.url
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load document"
          );
        }

        const arrayBuffer =
          await response.arrayBuffer();

        const result =
          await mammoth.convertToHtml({
            arrayBuffer,
          });

        if (!cancelled) {
          setHtml(result.value);
        }
      } catch (err) {
        console.error(
          "Word preview error:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to preview this Word document."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      cancelled = true;
    };
  }, [attachment]);

  if (loading) {
    return <PreviewLoading />;
  }

  if (error) {
    return (
      <PreviewError
        message={error}
      />
    );
  }

  return (
    <div className="h-full overflow-auto bg-slate-100 p-4 sm:p-8">
      <article className="mx-auto min-h-full max-w-4xl rounded-xl bg-white p-8 shadow-lg sm:p-12">
        <div
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />
      </article>
    </div>
  );
};

/* =========================================================
   EXCEL PREVIEW
========================================================= */

const ExcelPreview = ({
  attachment,
}) => {
  const [workbook, setWorkbook] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadWorkbook = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            attachment.url
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load spreadsheet"
          );
        }

        const arrayBuffer =
          await response.arrayBuffer();

        const parsedWorkbook =
          XLSX.read(
            arrayBuffer,
            {
              type: "array",
            }
          );

        if (!cancelled) {
          setWorkbook(
            parsedWorkbook
          );
        }
      } catch (err) {
        console.error(
          "Excel preview error:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to preview this spreadsheet."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadWorkbook();

    return () => {
      cancelled = true;
    };
  }, [attachment]);

  const sheets = useMemo(() => {
    if (!workbook) {
      return [];
    }

    return workbook.SheetNames.map(
      (sheetName) => {
        const sheet =
          workbook.Sheets[
            sheetName
          ];

        return {
          name: sheetName,
          rows: XLSX.utils.sheet_to_json(
            sheet,
            {
              header: 1,
              defval: "",
            }
          ),
        };
      }
    );
  }, [workbook]);

  if (loading) {
    return <PreviewLoading />;
  }

  if (error) {
    return (
      <PreviewError
        message={error}
      />
    );
  }

  return (
    <div className="h-full overflow-auto bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {sheets.map((sheet) => (
          <div
            key={sheet.name}
            className="overflow-hidden rounded-xl bg-white shadow-lg"
          >
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-700">
                {sheet.name}
              </p>
            </div>

            <div className="overflow-auto">
              <table className="min-w-full border-collapse text-sm">
                <tbody>
                  {sheet.rows.map(
                    (row, rowIndex) => (
                      <tr
                        key={
                          rowIndex
                        }
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        {row.map(
                          (
                            cell,
                            cellIndex
                          ) => (
                            <td
                              key={
                                cellIndex
                              }
                              className="whitespace-nowrap border-r border-slate-100 px-4 py-2 text-slate-700 last:border-r-0"
                            >
                              {String(
                                cell ?? ""
                              )}
                            </td>
                          )
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   LOADING / ERROR
========================================================= */

const PreviewLoading = () => {
  return (
    <div className="flex h-full items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-3">
        <Loader2
          size={32}
          className="animate-spin text-blue-600"
        />

        <p className="text-sm text-slate-500">
          Preparing preview...
        </p>
      </div>
    </div>
  );
};

const PreviewError = ({
  message,
}) => {
  return (
    <div className="flex h-full items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <FileText size={26} />
        </div>

        <h3 className="mt-4 text-base font-semibold text-slate-900">
          Preview unavailable
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {message}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   DOCUMENT PREVIEW
========================================================= */

const DocumentPreview = ({
  attachment,
  onClose,
}) => {
  if (!attachment) {
    return null;
  }

  const type =
    getFileType(attachment);

  const isPdf =
    isPdfAttachment(
      attachment
    );

  const isText =
    isTextAttachment(
      attachment
    );

  const isWord =
    isWordAttachment(
      attachment
    );

  const isExcel =
    isExcelAttachment(
      attachment
    );

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95"
      onClick={onClose}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <header
        className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-slate-950 px-4 py-3 text-white sm:px-6"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
          {isExcel ? (
            <FileSpreadsheet
              size={20}
            />
          ) : (
            <FileText size={20} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {attachment.name}
          </p>

          <p className="mt-0.5 text-xs text-white/50">
            {type} ·{" "}
            {formatFileSize(
              attachment.size
            )}
          </p>
        </div>

        {/* DOWNLOAD ONLY */}

        <a
          href={attachment.url}
          download={attachment.name}
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/20"
        >
          <Download size={15} />

          <span className="hidden sm:inline">
            Download
          </span>
        </a>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Close preview"
        >
          <X size={19} />
        </button>
      </header>

      {/* =================================================
          PREVIEW CONTENT
      ================================================= */}

      <main
        className="min-h-0 flex-1 overflow-hidden"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {isPdf && (
          <PdfPreview
            attachment={attachment}
          />
        )}

        {isText && (
          <TextPreview
            attachment={attachment}
          />
        )}

        {isWord && (
          <WordPreview
            attachment={attachment}
          />
        )}

        {isExcel && (
          <ExcelPreview
            attachment={attachment}
          />
        )}

        {!isPdf &&
          !isText &&
          !isWord &&
          !isExcel && (
            <PreviewError message="This file type does not have an in-app preview yet. Use Download to save the file." />
          )}
      </main>
    </div>
  );
};

/* =========================================================
   DOCUMENT ATTACHMENT
========================================================= */

const DocumentAttachment = ({
  attachment,
  onOpen,
}) => {
  const type =
    getFileType(attachment);

  const isExcel =
    isExcelAttachment(
      attachment
    );

  return (
    <button
      type="button"
      onClick={() =>
        onOpen(attachment)
      }
      className="group flex min-w-0 max-w-[380px] items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/30"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {isExcel ? (
          <FileSpreadsheet
            size={21}
          />
        ) : (
          <FileText size={21} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-800">
          {attachment.name}
        </p>

        <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
          <span>{type}</span>

          <span>•</span>

          <span>
            {formatFileSize(
              attachment.size
            )}
          </span>
        </div>
      </div>

      <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-700">
        Preview
      </span>
    </button>
  );
};

/* =========================================================
   REPLY QUOTE (shown inside a message that is itself a reply)
========================================================= */

const ReplyQuote = ({
  repliedMessage,
  own,
  onJump,
}) => {
  if (!repliedMessage) {
    return null;
  }

  const previewText =
    repliedMessage.text ||
    (Array.isArray(
      repliedMessage.attachments
    ) &&
    repliedMessage.attachments.length > 0
      ? repliedMessage.attachments[0]
          ?.name
      : null) ||
    "Attachment";

  return (
    <button
      type="button"
      onClick={() =>
        onJump?.(repliedMessage.id)
      }
      className={`mb-1.5 block w-full min-w-0 rounded-lg border-l-4 px-2.5 py-1.5 text-left transition ${
        own
          ? "border-white/50 bg-white/10 hover:bg-white/20"
          : "border-blue-500 bg-black/5 hover:bg-black/10"
      }`}
    >
      <p
        className={`truncate text-xs font-semibold ${
          own
            ? "text-white/90"
            : "text-blue-600"
        }`}
      >
        {repliedMessage.sender
          ?.name || "Unknown user"}
      </p>

      <p
        className={`mt-0.5 truncate text-xs ${
          own
            ? "text-white/70"
            : "text-gray-500"
        }`}
      >
        {previewText}
      </p>
    </button>
  );
};

/* =========================================================
   MAIN MESSAGE ITEM
========================================================= */

const MessageItem = ({
  message,
  own,
  onReply,
}) => {
  const [
    previewAttachment,
    setPreviewAttachment,
  ] = useState(null);

  const [
    previewDocument,
    setPreviewDocument,
  ] = useState(null);

  const [
    showReactionPicker,
    setShowReactionPicker,
  ] = useState(false);

  const [reacting, setReacting] =
    useState(false);

  const {
    toggleMessageReaction,
  } = useCommunication();

  const { user } = useAuth();

  /* =======================================================
     SWIPE-TO-REPLY (touch/mobile)
  ======================================================= */

  const SWIPE_TRIGGER_DISTANCE = 56;
  const SWIPE_MAX_DISTANCE = 88;

  const [swipeOffset, setSwipeOffset] =
    useState(0);

  const [isSwiping, setIsSwiping] =
    useState(false);

  const touchStateRef = useRef({
    startX: 0,
    startY: 0,
    tracking: false,
    lockedAxis: null,
  });

  const longPressTimerRef =
    useRef(null);

  const handleTouchStart = (
    event
  ) => {
    const touch =
      event.touches?.[0];

    if (!touch) {
      return;
    }

    touchStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      tracking: true,
      lockedAxis: null,
    };

    // Backup long-press trigger for the
    // reaction picker on touch devices.
    clearTimeout(
      longPressTimerRef.current
    );

    longPressTimerRef.current =
      setTimeout(() => {
        setShowReactionPicker(true);

        if (
          window.navigator?.vibrate
        ) {
          window.navigator.vibrate(10);
        }
      }, 500);
  };

  const handleTouchMove = (
    event
  ) => {
    const state = touchStateRef.current;

    if (!state.tracking) {
      return;
    }

    const touch =
      event.touches?.[0];

    if (!touch) {
      return;
    }

    const deltaX =
      touch.clientX - state.startX;

    const deltaY =
      touch.clientY - state.startY;

    if (!state.lockedAxis) {
      if (
        Math.abs(deltaX) > 8 ||
        Math.abs(deltaY) > 8
      ) {
        state.lockedAxis =
          Math.abs(deltaX) >
          Math.abs(deltaY)
            ? "x"
            : "y";
      }
    }

    // A vertical drag means the user is
    // scrolling the message list, not swiping.
    if (state.lockedAxis === "y") {
      return;
    }

    if (state.lockedAxis === "x") {
      clearTimeout(
        longPressTimerRef.current
      );

      // Own messages swipe left to reply,
      // incoming messages swipe right,
      // matching WhatsApp/Telegram convention.
      const directional = own
        ? Math.min(deltaX, 0)
        : Math.max(deltaX, 0);

      const clamped = Math.max(
        -SWIPE_MAX_DISTANCE,
        Math.min(
          SWIPE_MAX_DISTANCE,
          directional
        )
      );

      setIsSwiping(true);
      setSwipeOffset(clamped);
    }
  };

  const handleTouchEnd = (
    event
  ) => {
    clearTimeout(
      longPressTimerRef.current
    );

    if (
      Math.abs(swipeOffset) >=
      SWIPE_TRIGGER_DISTANCE
    ) {
      // Swallow the trailing click so an
      // image/document preview doesn't
      // also open right after a swipe-reply.
      event?.preventDefault?.();

      onReply?.(message);

      if (
        window.navigator?.vibrate
      ) {
        window.navigator.vibrate(10);
      }
    }

    touchStateRef.current.tracking = false;
    setIsSwiping(false);
    setSwipeOffset(0);
  };

  useEffect(() => {
    return () => {
      clearTimeout(
        longPressTimerRef.current
      );
    };
  }, []);

  /* =======================================================
     DATA
  ======================================================= */

  const messageId =
    message.id || message._id;

  const text =
    message.text ||
    message.content ||
    "";

  const attachments =
    Array.isArray(
      message.attachments
    )
      ? message.attachments
      : [];

  const imageAttachments =
    attachments.filter(
      isImageAttachment
    );

  const documentAttachments =
    attachments.filter(
      (attachment) =>
        !isImageAttachment(
          attachment
        )
    );

  const reactions =
    Array.isArray(
      message.reactions
    )
      ? message.reactions
      : [];

  const hasText =
    Boolean(text.trim());

  const hasAttachments =
    attachments.length > 0;

  /*
   * The message this one is replying to
   * (populated by the backend with id/text/sender).
   */
  const repliedMessage =
    message.replyTo || null;

  const time = new Date(
    message.createdAt
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  /* =======================================================
     JUMP TO ORIGINAL MESSAGE
  ======================================================= */

  const scrollToMessage = (
    targetId
  ) => {
    if (!targetId) {
      return;
    }

    const target =
      document.getElementById(
        `message-${targetId}`
      );

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    target.classList.add(
      "ring-2",
      "ring-blue-400",
      "ring-offset-2"
    );

    setTimeout(() => {
      target.classList.remove(
        "ring-2",
        "ring-blue-400",
        "ring-offset-2"
      );
    }, 1200);
  };

  /* =======================================================
     CLOSE REACTION PICKER
  ======================================================= */

  useEffect(() => {
    if (!showReactionPicker) {
      return;
    }

    const closePicker = () => {
      setShowReactionPicker(false);
    };

    document.addEventListener(
      "click",
      closePicker
    );

    return () => {
      document.removeEventListener(
        "click",
        closePicker
      );
    };
  }, [showReactionPicker]);

  /* =======================================================
     REACTION
  ======================================================= */

  const handleReaction = async (
    emoji
  ) => {
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

  const handleContextMenu = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!reacting) {
      setShowReactionPicker(true);
    }
  };

  const hasReacted = (
    reaction
  ) => {
    return Boolean(
      reaction?.userIds?.some(
        (id) =>
          String(id) ===
          String(user?.id)
      )
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

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
            own ? "items-end" : "items-start"
          }`}
          onContextMenu={handleContextMenu}
        >
          {!own && (
            <div className="mb-1 px-1 text-xs font-medium text-gray-600">
              {message.sender?.name || "Unknown user"}
            </div>
          )}

          {/* SWIPE-TO-REPLY INDICATOR (mobile) */}
          <div
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-opacity ${
              own ? "right-0" : "left-0"
            }`}
            style={{
              opacity: Math.min(
                Math.abs(swipeOffset) /
                  SWIPE_TRIGGER_DISTANCE,
                1
              ),
            }}
          >
            <Reply size={15} />
          </div>

          {/* MESSAGE */}
          <div
            id={`message-${messageId}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            style={{
              transform: `translateX(${swipeOffset}px)`,
              transition: isSwiping
                ? "none"
                : "transform 200ms ease-out",
              touchAction: "pan-y",
            }}
            className={`min-w-0 rounded-2xl select-none transition-shadow ${
              own
                ? "rounded-br-md bg-blue-600 text-white"
                : "rounded-bl-md bg-gray-100 text-gray-900"
            } ${
              hasAttachments && !hasText && !repliedMessage
                ? "overflow-hidden"
                : "px-4 py-2.5"
            }`}
          >
            {/* REPLY QUOTE */}
            {repliedMessage && (
              <ReplyQuote
                repliedMessage={repliedMessage}
                own={own}
                onJump={scrollToMessage}
              />
            )}

            {/* TEXT */}
            {hasText && (
              <p className="whitespace-pre-wrap break-words text-sm">
                {text}
              </p>
            )}

            {/* IMAGES */}
            {imageAttachments.length > 0 && (
              <div className={hasText || repliedMessage ? "mt-2" : ""}>
                {imageAttachments.length === 1 ? (
                  <ImageAttachment
                    attachment={imageAttachments[0]}
                    onOpen={setPreviewAttachment}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    {imageAttachments.map((attachment) => (
                      <ImageAttachment
                        key={attachment._id || attachment.url}
                        attachment={attachment}
                        compact
                        onOpen={setPreviewAttachment}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DOCUMENTS */}
            {documentAttachments.length > 0 && (
              <div
                className={`flex min-w-0 flex-col gap-2 ${
                  hasText || imageAttachments.length > 0 || repliedMessage
                    ? "mt-2"
                    : ""
                }`}
              >
                {documentAttachments.map((attachment) => (
                  <DocumentAttachment
                    key={attachment._id || attachment.url}
                    attachment={attachment}
                    onOpen={setPreviewDocument}
                  />
                ))}
              </div>
            )}

            {!hasText && !hasAttachments && (
              <p className="text-sm text-gray-500">
                Empty message
              </p>
            )}
          </div>

          {/* REACTION PICKER */}
          {showReactionPicker && (
            <div
              className={`absolute bottom-8 z-50 ${
                own ? "right-0" : "left-0"
              }`}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 shadow-xl">
                {QUICK_REACTIONS.map((emoji) => {
                  const selected = reactions.some(
                    (reaction) =>
                      reaction.emoji === emoji &&
                      hasReacted(reaction)
                  );

                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleReaction(emoji)}
                      disabled={reacting}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition ${
                        selected
                          ? "bg-blue-100 ring-2 ring-blue-400"
                          : "hover:bg-slate-100"
                      } ${
                        reacting
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* REACTIONS */}
          {reactions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1 px-1">
              {reactions.map((reaction) => {
                const selected = hasReacted(reaction);

                return (
                  <button
                    key={reaction.emoji}
                    type="button"
                    onClick={() => handleReaction(reaction.emoji)}
                    disabled={reacting}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs shadow-sm transition ${
                      selected
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <span>{reaction.emoji}</span>

                    <span className="font-medium text-slate-600">
                      {reaction.userIds?.length || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* THREAD / REPLY ACTION */}
          <div
            className={`mt-1 flex items-center gap-3 px-1 ${
              own ? "justify-end" : "justify-start"
            }`}
          >
            <button
              type="button"
              onClick={() => onReply?.(message)}
              className="-mx-1 flex min-h-[28px] items-center px-1 text-xs font-medium text-gray-400 opacity-100 transition hover:text-blue-600 focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            >
              Reply
            </button>

            {/* Show reply count when the message has replies */}
            {Number(message.replyCount || 0) > 0 && (
              <button
                type="button"
                onClick={() => onReply?.(message)}
                className="text-xs font-medium text-blue-600 transition hover:text-blue-700"
              >
                {Number(message.replyCount)}{" "}
                {Number(message.replyCount) === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>

          {/* TIME */}
          <div
            className={`mt-1 px-1 text-[11px] text-gray-400 ${
              own ? "text-right" : "text-left"
            }`}
          >
            {time}
          </div>
        </div>
      </div>

      {/* IMAGE PREVIEW */}

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

      {/* DOCUMENT PREVIEW */}

      {previewDocument && (
        <DocumentPreview
          attachment={
            previewDocument
          }
          onClose={() =>
            setPreviewDocument(null)
          }
        />
      )}
    </>
  );
};

export default MessageItem;
