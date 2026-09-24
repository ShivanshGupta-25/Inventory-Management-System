import {
  useEffect,
  useState,
} from "react";

import {
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
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

import {
  formatFileSize,
  getFileType,
  isExcelAttachment,
  isPdfAttachment,
  isTextAttachment,
  isWordAttachment,
} from "./MessageAttachments";

/* =========================================================
   PDF WORKER
========================================================= */

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
            <PreviewError message="Unable to preview this PDF." />
          }
        >
          {Array.from(
            new Array(
              numPages || 0
            ),
            (_, index) => (
              <Page
                key={`page_${
                  index + 1
                }`}
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
      } catch {
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
          await mammoth.convertToHtml(
            {
              arrayBuffer,
            }
          );

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

    const loadWorkbook =
      async () => {
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
            XLSX.read(arrayBuffer, {
              type: "array",
            });

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

  const sheets = workbook
    ? workbook.SheetNames.map(
        (sheetName) => {
          const sheet =
            workbook.Sheets[
              sheetName
            ];

          return {
            name: sheetName,
            rows:
              XLSX.utils.sheet_to_json(
                sheet,
                {
                  header: 1,
                  defval: "",
                }
              ),
          };
        }
      )
    : [];

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
                    (
                      row,
                      rowIndex
                    ) => (
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
                                cell ??
                                  ""
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
   PUBLIC PREVIEW COMPONENT
========================================================= */

const MessagePreviewModals = ({
  previewAttachment,
  previewDocument,
  onCloseImage,
  onCloseDocument,
}) => {
  return (
    <>
      {previewAttachment && (
        <ImagePreview
          attachment={
            previewAttachment
          }
          onClose={
            onCloseImage
          }
        />
      )}

      {previewDocument && (
        <DocumentPreview
          attachment={
            previewDocument
          }
          onClose={
            onCloseDocument
          }
        />
      )}
    </>
  );
};

export default MessagePreviewModals;