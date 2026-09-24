import React from "react";

import {
  FileSpreadsheet,
  FileText,
} from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

export const formatFileSize = (
  bytes = 0
) => {
  if (!bytes) {
    return "0 B";
  }

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

export const getFileExtension = (
  name = ""
) => {
  const parts = name.split(".");

  if (parts.length <= 1) {
    return "";
  }

  return parts
    .pop()
    .toLowerCase();
};

export const getFileType = (
  attachment
) => {
  const extension =
    getFileExtension(
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

export const isImageAttachment = (
  attachment
) => {
  return Boolean(
    attachment?.mimeType?.startsWith(
      "image/"
    )
  );
};

export const isPdfAttachment = (
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

export const isTextAttachment = (
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

export const isWordAttachment = (
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

export const isExcelAttachment = (
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
   IMAGE ATTACHMENT
========================================================= */

export const ImageAttachment = ({
  attachment,
  onOpen,
  compact = false,
}) => {
  const [failed, setFailed] =
    React.useState(false);

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
   DOCUMENT ATTACHMENT
========================================================= */

export const DocumentAttachment = ({
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
   MESSAGE ATTACHMENTS
========================================================= */

const MessageAttachments = ({
  attachments,
  hasText,
  repliedMessage,
  onOpenImage,
  onOpenDocument,
}) => {
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

  return (
    <>
      {imageAttachments.length >
        0 && (
        <div
          className={
            hasText || repliedMessage
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
                onOpenImage
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
                      onOpenImage
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      )}

      {documentAttachments.length >
        0 && (
        <div
          className={`flex min-w-0 flex-col gap-2 ${
            hasText ||
            imageAttachments.length >
              0 ||
            repliedMessage
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
                onOpen={
                  onOpenDocument
                }
              />
            )
          )}
        </div>
      )}
    </>
  );
};

export default MessageAttachments;