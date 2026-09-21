import {
  FileText,
  ExternalLink,
} from "lucide-react";

const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const MessageItem = ({
  message,
  own,
}) => {
  const time = new Date(
    message.createdAt
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const attachments =
    message.attachments || [];

  const text =
    message.text ||
    message.content ||
    "";

  return (
    <div
      className={`flex ${
        own
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`w-fit min-w-0 max-w-[75%] ${
          own
            ? "items-end"
            : "items-start"
        }`}
      >
        {!own && (
          <div className="mb-1 px-1 text-xs font-medium text-gray-600">
            {message.sender?.name ||
              "Unknown user"}
          </div>
        )}

        <div
          className={`overflow-hidden rounded-2xl ${
            own
              ? "rounded-br-md bg-blue-600 text-white"
              : "rounded-bl-md bg-gray-100 text-gray-900"
          }`}
        >
          {/* Attachments */}
          {attachments.length > 0 && (
            <div
              className={
                attachments.length > 1
                  ? "grid grid-cols-2 gap-1 p-1"
                  : "p-1"
              }
            >
              {attachments.map(
                (attachment) => {
                  const isImage =
                    attachment.mimeType?.startsWith(
                      "image/"
                    );

                  if (isImage) {
                    return (
                      <a
                        key={
                          attachment._id ||
                          attachment.url
                        }
                        href={
                          attachment.url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-xl"
                      >
                        <img
                          src={
                            attachment.url
                          }
                          alt={
                            attachment.name
                          }
                          className="max-h-[320px] w-full object-cover transition hover:opacity-90"
                        />
                      </a>
                    );
                  }

                  return (
                    <div
                      key={
                        attachment._id ||
                        attachment.url
                      }
                      className={`flex w-full min-w-0 items-center gap-3 rounded-xl p-3 ${
                        own
                          ? "bg-blue-500"
                          : "bg-white"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          own
                            ? "bg-blue-400"
                            : "bg-gray-100"
                        }`}
                      >
                        <FileText
                          size={20}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {attachment.name}
                        </p>

                        <p
                          className={`text-xs ${
                            own
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {formatFileSize(
                            attachment.size
                          )}
                        </p>
                      </div>

                      <a
                        href={
                          attachment.url
                        }
                        target="_blank"
                        rel="noreferrer"
                        title="Open file"
                        className={`shrink-0 rounded-lg p-2 transition ${
                          own
                            ? "hover:bg-blue-400"
                            : "hover:bg-gray-200"
                        }`}
                      >
                        <ExternalLink
                          size={17}
                        />
                      </a>
                    </div>
                  );
                }
              )}
            </div>
          )}

          {/* Text */}
          {text && (
            <div className="px-4 py-2.5">
              <p className="whitespace-pre-wrap break-words text-sm">
                {text}
              </p>
            </div>
          )}
        </div>

        {/* Timestamp */}
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
  );
};

export default MessageItem;