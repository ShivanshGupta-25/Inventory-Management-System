
import {
  ExternalLink,
  FileText,
} from "lucide-react";

/* =====================================================
   HELPERS
===================================================== */

const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatMessageTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =====================================================
   COMPONENT
===================================================== */

const MessageItem = ({
  message,
  own,
}) => {
  const time = formatMessageTime(message.createdAt);

  const attachments = message.attachments || [];

  const text =
    message.text ||
    message.content ||
    "";

  const imageAttachments = attachments.filter(
    (attachment) =>
      attachment?.mimeType?.startsWith("image/")
  );

  const fileAttachments = attachments.filter(
    (attachment) =>
      !attachment?.mimeType?.startsWith("image/")
  );

  return (
    <div
      className={`flex min-w-0 ${
        own
          ? "justify-end"
          : "justify-start"
      }`}
    >

      <div
        className={`flex min-w-0 max-w-[85%] flex-col sm:max-w-[75%] ${
          own
            ? "items-end"
            : "items-start"
        }`}
      >

        {/* =================================================
            SENDER NAME
        ================================================= */}

        {!own && (
          <div className="mb-1 px-1 text-xs font-medium text-slate-600">
            {message.sender?.name ||
              message.sender?.email ||
              "Unknown user"}
          </div>
        )}

        {/* =================================================
            MESSAGE BUBBLE
        ================================================= */}

        <div
          className={`min-w-0 max-w-full overflow-hidden rounded-2xl ${
            own
              ? "rounded-br-md bg-blue-600 text-white"
              : "rounded-bl-md bg-slate-100 text-slate-900"
          } ${
            !text && attachments.length > 0
              ? "p-1"
              : "px-3 py-2.5"
          }`}
        >

          {/* =================================================
              IMAGE ATTACHMENTS
          ================================================= */}

          {imageAttachments.length > 0 && (
            <div
              className={`grid gap-1 ${
                imageAttachments.length === 1
                  ? "grid-cols-1"
                  : "grid-cols-2"
              }`}
            >

              {imageAttachments.map((attachment) => (
                <a
                  key={
                    attachment._id ||
                    attachment.url
                  }
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-xl"
                >
                  <img
                    src={attachment.url}
                    alt={attachment.name || "Image"}
                    className="max-h-80 w-full min-w-0 object-cover transition hover:opacity-90"
                    loading="lazy"
                  />
                </a>
              ))}

            </div>
          )}

          {/* =================================================
              DOCUMENT ATTACHMENTS
          ================================================= */}

          {fileAttachments.length > 0 && (
            <div
              className={`space-y-2 ${
                imageAttachments.length > 0
                  ? "mt-2"
                  : ""
              }`}
            >

              {fileAttachments.map((attachment) => (
                <a
                  key={
                    attachment._id ||
                    attachment.url
                  }
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 transition ${
                    own
                      ? "border-white/20 bg-white/10 hover:bg-white/20"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      own
                        ? "bg-white/15"
                        : "bg-slate-100"
                    }`}
                  >
                    <FileText
                      size={18}
                      className={
                        own
                          ? "text-white"
                          : "text-slate-500"
                      }
                    />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p
                      className={`truncate text-xs font-medium ${
                        own
                          ? "text-white"
                          : "text-slate-700"
                      }`}
                    >
                      {attachment.name || "File"}
                    </p>

                    <p
                      className={`mt-0.5 text-[11px] ${
                        own
                          ? "text-blue-100"
                          : "text-slate-400"
                      }`}
                    >
                      {formatFileSize(attachment.size)}
                    </p>

                  </div>

                  <ExternalLink
                    size={15}
                    className={
                      own
                        ? "shrink-0 text-blue-100"
                        : "shrink-0 text-slate-400"
                    }
                  />

                </a>
              ))}

            </div>
          )}

          {/* =================================================
              TEXT CONTENT
          ================================================= */}

          {text && (
            <p
              className={`whitespace-pre-wrap break-words text-sm leading-relaxed ${
                attachments.length > 0
                  ? "mt-2 px-2 pb-1"
                  : ""
              }`}
            >
              {text}
            </p>
          )}

        </div>

        {/* =================================================
            TIMESTAMP
        ================================================= */}

        <div
          className={`mt-1 px-1 text-[11px] text-slate-400 ${
            own
              ? "text-right"
              : "text-left"
          }`}
        >
          {time}
        </div>

      </div>
    </div>
  );
};

export default MessageItem;