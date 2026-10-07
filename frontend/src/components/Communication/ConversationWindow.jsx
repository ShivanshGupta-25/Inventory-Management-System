// import {
//   useEffect,
//   useLayoutEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";

// import {
//   ChevronDown,
//   ChevronUp,
//   FileText,
//   FolderOpen,
//   Image as ImageIcon,
//   Loader2,
//   MessageCircle,
//   Paperclip,
//   Search,
//   Send,
//   X,
// } from "lucide-react";

// import MessageItem from "./MessageItem";
// import MessageSelectionToolbar from "./MessageSelectionToolbar";
// import ForwardMessageModal from "./ForwardMessageModal";

// import { useCommunication } from "../../context/CommunicationContext";

// /* =========================================================
//    CONSTANTS
// ========================================================= */

// const MAX_ATTACHMENTS = 5;
// const MAX_FILE_SIZE = 10 * 1024 * 1024;

// const IMAGE_VIDEO_ACCEPT = "image/*,video/*";

// const DOCUMENT_ACCEPT = [
//   ".pdf",
//   ".doc",
//   ".docx",
//   ".xls",
//   ".xlsx",
//   ".ppt",
//   ".pptx",
//   ".txt",
//   ".csv",
//   ".rtf",
// ].join(",");

// const ACCEPTED_FILE_TYPES = [
//   "image/jpeg",
//   "image/png",
//   "image/gif",
//   "image/webp",
//   "image/svg+xml",
//   "video/mp4",
//   "video/webm",
//   "video/ogg",
//   "application/pdf",
//   "text/plain",
//   "text/csv",
//   "application/rtf",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "application/vnd.ms-excel",
//   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   "application/vnd.ms-powerpoint",
//   "application/vnd.openxmlformats-officedocument.presentationml.presentation",
// ];

// const ATTACHMENT_OPTIONS = [
//   {
//     id: "image",
//     label: "Photos & Videos",
//     description: "Images and videos",
//     accept: IMAGE_VIDEO_ACCEPT,
//     icon: ImageIcon,
//     iconClass: "bg-blue-50 text-blue-600",
//   },
//   {
//     id: "document",
//     label: "Documents",
//     description: "PDF, Word, Excel, PowerPoint, text",
//     accept: DOCUMENT_ACCEPT,
//     icon: FileText,
//     iconClass: "bg-emerald-50 text-emerald-600",
//   },
//   {
//     id: "other",
//     label: "Other files",
//     description: "Any file up to 10 MB",
//     accept: "*/*",
//     icon: FolderOpen,
//     iconClass: "bg-violet-50 text-violet-600",
//   },
// ];

// const DOCUMENT_EXTENSIONS = [
//   "pdf",
//   "doc",
//   "docx",
//   "xls",
//   "xlsx",
//   "ppt",
//   "pptx",
//   "txt",
//   "csv",
//   "rtf",
// ];

// /* =========================================================
//    HELPERS
// ========================================================= */

// const getMessageId = (message) =>
//   message?.id ||
//   message?._id ||
//   null;

// const getConversationId = (conversation) =>
//   conversation?.id ||
//   conversation?._id ||
//   null;

// const getConversationName = (conversation) => {
//   if (!conversation) {
//     return "Conversation";
//   }

//   return (
//     conversation.name ||
//     conversation.title ||
//     conversation.participantName ||
//     "Conversation"
//   );
// };

// const getFilePreviewUrl = (file) => {
//   if (!file) {
//     return null;
//   }

//   return URL.createObjectURL(file);
// };

// /* =========================================================
//    THREAD MESSAGE
// ========================================================= */

// const ThreadMessage = ({
//   message,
//   currentUserId,
// }) => {
//   const senderId =
//     message?.sender?.id ||
//     message?.sender?._id ||
//     message?.senderId;

//   const own =
//     String(senderId) ===
//     String(currentUserId);

//   const senderName =
//     message?.sender?.name ||
//     message?.sender?.fullName ||
//     message?.senderName ||
//     "Unknown user";

//   const deleted =
//     Boolean(message?.deletedForEveryone);

//   const text =
//     message?.text ||
//     message?.content ||
//     "";

//   const hasAttachments =
//     Array.isArray(message?.attachments) &&
//     message.attachments.length > 0;

//   return (
//     <div
//       className={`rounded-xl border px-3 py-2.5 ${
//         own
//           ? "border-blue-100 bg-blue-50"
//           : "border-slate-200 bg-white"
//       }`}
//     >
//       <div className="flex items-center justify-between gap-3">
//         <p
//           className={`truncate text-xs font-semibold ${
//             own
//               ? "text-blue-700"
//               : "text-slate-700"
//           }`}
//         >
//           {senderName}
//         </p>

//         {message?.createdAt && (
//           <span className="shrink-0 text-[10px] text-slate-400">
//             {new Date(
//               message.createdAt
//             ).toLocaleTimeString([], {
//               hour: "2-digit",
//               minute: "2-digit",
//             })}
//           </span>
//         )}
//       </div>

//       {deleted ? (
//         <p className="mt-1.5 text-sm italic text-slate-400">
//           This message was deleted
//         </p>
//       ) : (
//         <>
//           {text && (
//             <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
//               {text}
//             </p>
//           )}

//           {hasAttachments && (
//             <p className="mt-1.5 text-xs text-slate-400">
//               {message.attachments.length}{" "}
//               {message.attachments.length === 1
//                 ? "attachment"
//                 : "attachments"}
//             </p>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// /* =========================================================
//    MAIN COMPONENT
// ========================================================= */

// const ConversationWindow = ({
//   conversation,
//   messages,
//   currentUserId,
//   typingUsers,
//   loading,
//   onSend,
//   onTypingStart,
//   onTypingStop,
//   onBack,
//   onReply,
//   replyingTo,
//   onCancelReply,
// }) => {
//   const {
//     conversations,

//     deleteMessagesForMe,
//     deleteMessagesForEveryone,
//     forwardMessages,

//     getMessageThread,

//     messageSearchResults,
//     messageSearchLoading,
//     messageSearchError,
//     searchMessages,
//     loadMessageFromSearchResult,
//   } = useCommunication();

//   /* =======================================================
//      REFS
//   ======================================================== */

//   const messagesContainerRef =
//     useRef(null);

//   const messagesContentRef =
//     useRef(null);

//   const fileInputRef =
//     useRef(null);

//   const attachmentMenuRef =
//     useRef(null);

//   const filePreviewsRef =
//     useRef([]);

//   const messageSearchInputRef =
//     useRef(null);

//   const searchDebounceRef =
//     useRef(null);

//   const shouldScrollToBottomRef =
//     useRef(true);

//   /* =======================================================
//      COMPOSER
//   ======================================================== */

//   const [composerText, setComposerText] =
//     useState("");

//   const [selectedFiles, setSelectedFiles] =
//     useState([]);

//   const [filePreviews, setFilePreviews] =
//     useState([]);

//   const [sending, setSending] =
//     useState(false);

//   const [showAttachmentMenu, setShowAttachmentMenu] =
//     useState(false);

//   const [fileAccept, setFileAccept] =
//     useState(IMAGE_VIDEO_ACCEPT);

//   const [fileSelectionCategory, setFileSelectionCategory] =
//     useState("other");

//   filePreviewsRef.current =
//     filePreviews;

//   /* =======================================================
//      SELECTION
//   ======================================================== */

//   const [selectionMode, setSelectionMode] =
//     useState(false);

//   const [selectedMessageIds, setSelectedMessageIds] =
//     useState(new Set());

//   const [processingSelection, setProcessingSelection] =
//     useState(false);

//   const [activeMenuMessageId, setActiveMenuMessageId] =
//     useState(null);

//   /* =======================================================
//      FORWARD
//   ======================================================== */

//   const [showForwardModal, setShowForwardModal] =
//     useState(false);

//   /* =======================================================
//      THREAD
//   ======================================================== */

//   const [activeThread, setActiveThread] =
//     useState(null);

//   const [threadLoading, setThreadLoading] =
//     useState(false);

//   const [threadError, setThreadError] =
//     useState("");

//   /* =======================================================
//      SEARCH
//   ======================================================== */

//   const [messageSearchOpen, setMessageSearchOpen] =
//     useState(false);

//   const [messageSearchText, setMessageSearchText] =
//     useState("");

//   const [messageSearchFocused, setMessageSearchFocused] =
//     useState(false);

//   const [activeSearchResultIndex, setActiveSearchResultIndex] =
//     useState(-1);

//   const [searchNavigationLoading, setSearchNavigationLoading] =
//     useState(false);

//   /* =======================================================
//      ATTACHMENT MENU
//   ======================================================== */

//   useEffect(() => {
//     if (!showAttachmentMenu) {
//       return undefined;
//     }

//     const handleOutsideClick = (event) => {
//       if (
//         attachmentMenuRef.current &&
//         !attachmentMenuRef.current.contains(
//           event.target
//         )
//       ) {
//         setShowAttachmentMenu(false);
//       }
//     };

//     const handleEscape = (event) => {
//       if (event.key === "Escape") {
//         setShowAttachmentMenu(false);
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       handleOutsideClick
//     );

//     document.addEventListener(
//       "keydown",
//       handleEscape
//     );

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleOutsideClick
//       );

//       document.removeEventListener(
//         "keydown",
//         handleEscape
//       );
//     };
//   }, [showAttachmentMenu]);

//   /* =======================================================
//      CURRENT CONVERSATION
//   ======================================================== */

//   const conversationId =
//     getConversationId(conversation);

//   /* =======================================================
//      MESSAGE MAP
//   ======================================================== */

//   const messageById = useMemo(() => {
//     const map = new Map();

//     (messages || []).forEach(
//       (message) => {
//         const id =
//           getMessageId(message);

//         if (id) {
//           map.set(
//             String(id),
//             message
//           );
//         }
//       }
//     );

//     return map;
//   }, [messages]);

//   const selectedMessages = useMemo(
//     () =>
//       Array.from(selectedMessageIds)
//         .map((id) =>
//           messageById.get(
//             String(id)
//           )
//         )
//         .filter(Boolean),
//     [
//       selectedMessageIds,
//       messageById,
//     ]
//   );

//   const selectedCount =
//     selectedMessageIds.size;

//   const canDeleteForEveryone =
//     selectedMessages.length > 0 &&
//     selectedMessages.every(
//       (message) => {
//         const senderId =
//           message?.sender?.id ||
//           message?.sender?._id ||
//           message?.senderId;

//         return (
//           String(senderId) ===
//             String(currentUserId) &&
//           !message?.deletedForEveryone
//         );
//       }
//     );

//   const canForward =
//     selectedMessages.length > 0 &&
//     selectedMessages.every(
//       (message) =>
//         !message?.deletedForEveryone
//     );

//   /* =======================================================
//      SELECTION
//   ======================================================== */

//   const clearSelection = () => {
//     setSelectionMode(false);
//     setSelectedMessageIds(
//       new Set()
//     );
//     setShowForwardModal(false);
//   };

//   const enterSelectionMode = (
//     messageOrId
//   ) => {
//     const messageId =
//       typeof messageOrId === "object"
//         ? getMessageId(messageOrId)
//         : messageOrId;

//     if (!messageId) {
//       return;
//     }

//     setSelectionMode(true);
//     setSelectedMessageIds(
//       new Set([String(messageId)])
//     );
//     setShowForwardModal(false);
//   };

//   const toggleMessageSelection = (
//     messageOrId
//   ) => {
//     const messageId =
//       typeof messageOrId === "object"
//         ? getMessageId(messageOrId)
//         : messageOrId;

//     if (!messageId) {
//       return;
//     }

//     const id =
//       String(messageId);

//     setSelectedMessageIds(
//       (current) => {
//         const next =
//           new Set(current);

//         if (next.has(id)) {
//           next.delete(id);
//         } else {
//           next.add(id);
//         }

//         return next;
//       }
//     );
//   };

//   useEffect(() => {
//     if (
//       selectionMode &&
//       selectedMessageIds.size === 0
//     ) {
//       setSelectionMode(false);
//     }
//   }, [
//     selectionMode,
//     selectedMessageIds,
//   ]);

//   /* =======================================================
//      CONVERSATION CHANGE
//   ======================================================== */

//   useLayoutEffect(() => {
//     shouldScrollToBottomRef.current =
//       true;
//   }, [conversationId]);

//   useEffect(() => {
//     setSelectionMode(false);
//     setSelectedMessageIds(
//       new Set()
//     );

//     setShowForwardModal(false);

//     setActiveMenuMessageId(null);

//     setActiveThread(null);
//     setThreadError("");

//     setMessageSearchOpen(false);
//     setMessageSearchText("");
//     setMessageSearchFocused(false);
//     setActiveSearchResultIndex(-1);
//     setSearchNavigationLoading(false);

//     setShowAttachmentMenu(false);

//     filePreviewsRef.current.forEach(
//       (preview) => {
//         if (preview?.url) {
//           URL.revokeObjectURL(
//             preview.url
//           );
//         }
//       }
//     );

//     setSelectedFiles([]);
//     setFilePreviews([]);
//   }, [conversationId]);

//   /* =======================================================
//      MESSAGE SEARCH
//   ======================================================== */

//   useEffect(() => {
//     clearTimeout(
//       searchDebounceRef.current
//     );

//     const query =
//       messageSearchText.trim();

//     if (
//       !messageSearchOpen ||
//       !conversationId
//     ) {
//       return undefined;
//     }

//     if (!query) {
//       setActiveSearchResultIndex(-1);
//       searchMessages?.(
//         conversationId,
//         ""
//       );

//       return undefined;
//     }

//     setActiveSearchResultIndex(-1);

//     searchDebounceRef.current =
//       setTimeout(() => {
//         searchMessages?.(
//           conversationId,
//           query
//         );
//       }, 350);

//     return () => {
//       clearTimeout(
//         searchDebounceRef.current
//       );
//     };
//   }, [
//     messageSearchText,
//     messageSearchOpen,
//     conversationId,
//     searchMessages,
//   ]);

//   useEffect(() => {
//     return () => {
//       clearTimeout(
//         searchDebounceRef.current
//       );
//     };
//   }, []);

//   const handleOpenMessageSearch =
//     () => {
//       if (selectionMode) {
//         return;
//       }

//       setMessageSearchOpen(true);

//       requestAnimationFrame(() => {
//         messageSearchInputRef.current?.focus();
//       });
//     };

//   const handleCloseMessageSearch =
//     () => {
//       clearTimeout(
//         searchDebounceRef.current
//       );

//       setMessageSearchOpen(false);
//       setMessageSearchText("");
//       setMessageSearchFocused(false);
//       setActiveSearchResultIndex(-1);
//       setSearchNavigationLoading(false);

//       searchMessages?.(
//         conversationId,
//         ""
//       );
//     };

//   const handleMessageSearchChange =
//     (event) => {
//       const value =
//         event.target.value;

//       setMessageSearchText(value);
//       setActiveSearchResultIndex(-1);
//       setSearchNavigationLoading(false);

//       if (conversationId) {
//         searchMessages?.(
//           conversationId,
//           ""
//         );
//       }
//     };

//   const highlightSearchResult = (
//     resultId
//   ) => {
//     if (!resultId) {
//       return false;
//     }

//     const target =
//       document.getElementById(
//         `message-${resultId}`
//       );

//     if (!target) {
//       return false;
//     }

//     target.scrollIntoView({
//       behavior: "smooth",
//       block: "center",
//     });

//     target.classList.add(
//       "ring-2",
//       "ring-blue-400",
//       "ring-offset-2"
//     );

//     setTimeout(() => {
//       target.classList.remove(
//         "ring-2",
//         "ring-blue-400",
//         "ring-offset-2"
//       );
//     }, 1400);

//     return true;
//   };

//   const handleSearchResultClick =
//     async (
//       result,
//       resultIndex = -1
//     ) => {
//       const resultId =
//         getMessageId(result);

//       if (!resultId) {
//         return;
//       }

//       if (resultIndex >= 0) {
//         setActiveSearchResultIndex(
//           resultIndex
//         );
//       }

//       const existingElement =
//         document.getElementById(
//           `message-${resultId}`
//         );

//       if (existingElement) {
//         requestAnimationFrame(() => {
//           highlightSearchResult(
//             resultId
//           );
//         });

//         return;
//       }

//       if (
//         !loadMessageFromSearchResult
//       ) {
//         return;
//       }

//       try {
//         setSearchNavigationLoading(
//           true
//         );

//         shouldScrollToBottomRef.current =
//           false;

//         await loadMessageFromSearchResult(
//           result
//         );

//         requestAnimationFrame(() => {
//           requestAnimationFrame(() => {
//             highlightSearchResult(
//               resultId
//             );
//           });
//         });
//       } catch (error) {
//         console.error(
//           "Failed to navigate to search result:",
//           error
//         );
//       } finally {
//         setSearchNavigationLoading(
//           false
//         );
//       }
//     };

//   const navigateSearchResult =
//     async (direction) => {
//       const results =
//         messageSearchResults || [];

//       if (
//         !results.length ||
//         searchNavigationLoading
//       ) {
//         return;
//       }

//       let nextIndex;

//       if (
//         activeSearchResultIndex < 0
//       ) {
//         nextIndex =
//           direction > 0
//             ? 0
//             : results.length - 1;
//       } else {
//         nextIndex =
//           (
//             activeSearchResultIndex +
//             direction +
//             results.length
//           ) % results.length;
//       }

//       setActiveSearchResultIndex(
//         nextIndex
//       );

//       await handleSearchResultClick(
//         results[nextIndex],
//         nextIndex
//       );
//     };

//   useEffect(() => {
//     const results =
//       messageSearchResults || [];

//     if (
//       !messageSearchOpen ||
//       !messageSearchText.trim() ||
//       !results.length ||
//       activeSearchResultIndex >= 0 ||
//       searchNavigationLoading
//     ) {
//       return;
//     }

//     handleSearchResultClick(
//       results[0],
//       0
//     );

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     messageSearchResults,
//     messageSearchOpen,
//     messageSearchText,
//     activeSearchResultIndex,
//     searchNavigationLoading,
//   ]);

//   /* =======================================================
//      SCROLL
//   ======================================================== */

//   const scrollToBottom = (
//     behavior = "auto"
//   ) => {
//     const container =
//       messagesContainerRef.current;

//     if (!container) {
//       return;
//     }

//     container.scrollTo({
//       top: container.scrollHeight,
//       behavior,
//     });
//   };

//   const hasMessages =
//     Boolean(messages?.length);

//   useLayoutEffect(() => {
//     if (!hasMessages || loading) {
//       return;
//     }

//     if (
//       shouldScrollToBottomRef.current
//     ) {
//       scrollToBottom("auto");
//     }
//   }, [
//     messages,
//     conversationId,
//     loading,
//     hasMessages,
//   ]);

//   useEffect(() => {
//     const content =
//       messagesContentRef.current;

//     if (
//       !content ||
//       typeof ResizeObserver ===
//         "undefined"
//     ) {
//       return undefined;
//     }

//     const observer =
//       new ResizeObserver(() => {
//         if (
//           shouldScrollToBottomRef.current
//         ) {
//           scrollToBottom("auto");
//         }
//       });

//     observer.observe(content);

//     return () =>
//       observer.disconnect();
//   }, [
//     conversationId,
//     loading,
//     hasMessages,
//   ]);

//   const handleMessagesScroll =
//     () => {
//       const container =
//         messagesContainerRef.current;

//       if (!container) {
//         return;
//       }

//       const distanceFromBottom =
//         container.scrollHeight -
//         container.scrollTop -
//         container.clientHeight;

//       shouldScrollToBottomRef.current =
//         distanceFromBottom < 120;
//     };

//   /* =======================================================
//      COMPOSER
//   ======================================================== */

//   const handleComposerChange =
//     (event) => {
//       const value =
//         event.target.value;

//       if (selectionMode) {
//         clearSelection();
//       }

//       setComposerText(value);

//       if (conversationId) {
//         if (value.trim()) {
//           onTypingStart?.(
//             conversationId
//           );
//         } else {
//           onTypingStop?.(
//             conversationId
//           );
//         }
//       }
//     };

//   const handleSend = async () => {
//     const text =
//       composerText.trim();

//     if (
//       (!text &&
//         selectedFiles.length === 0) ||
//       sending
//     ) {
//       return;
//     }

//     const replyToId =
//       replyingTo?.id ||
//       replyingTo?._id ||
//       null;

//     try {
//       setSending(true);
//       setShowAttachmentMenu(false);

//       await onSend?.(
//         text,
//         selectedFiles,
//         replyToId
//       );

//       onCancelReply?.();

//       filePreviewsRef.current.forEach(
//         (preview) => {
//           if (preview?.url) {
//             URL.revokeObjectURL(
//               preview.url
//             );
//           }
//         }
//       );

//       setComposerText("");
//       setSelectedFiles([]);
//       setFilePreviews([]);

//       if (conversationId) {
//         onTypingStop?.(
//           conversationId
//         );
//       }

//       shouldScrollToBottomRef.current =
//         true;

//       requestAnimationFrame(() => {
//         scrollToBottom("smooth");
//       });
//     } catch (error) {
//       console.error(
//         "Failed to send message:",
//         error
//       );
//     } finally {
//       setSending(false);
//     }
//   };

//   const handleComposerKeyDown =
//     (event) => {
//       if (
//         event.key === "Enter" &&
//         !event.shiftKey
//       ) {
//         event.preventDefault();
//         handleSend();
//       }
//     };

//   /* =======================================================
//      FILE VALIDATION
//   ======================================================== */

//   const validateFile = (
//     file,
//     category = fileSelectionCategory
//   ) => {
//     if (!file) {
//       return false;
//     }

//     if (file.size > MAX_FILE_SIZE) {
//       window.alert(
//         `${file.name} is larger than 10 MB.`
//       );

//       return false;
//     }

//     if (category === "image") {
//       if (
//         !file.type.startsWith(
//           "image/"
//         ) &&
//         !file.type.startsWith(
//           "video/"
//         )
//       ) {
//         window.alert(
//           `${file.name} is not an image or video.`
//         );

//         return false;
//       }

//       return true;
//     }

//     if (category === "document") {
//       const extension =
//         file.name
//           .split(".")
//           .pop()
//           ?.toLowerCase() || "";

//       const isDocument =
//         DOCUMENT_EXTENSIONS.includes(
//           extension
//         ) ||
//         ACCEPTED_FILE_TYPES.includes(
//           file.type
//         );

//       if (!isDocument) {
//         window.alert(
//           `${file.name} is not a supported document type.`
//         );

//         return false;
//       }

//       return true;
//     }

//     return true;
//   };

//   /* =======================================================
//      FILE PICKER
//   ======================================================== */

//   const openFilePicker = (
//     category
//   ) => {
//     if (
//       sending ||
//       selectedFiles.length >=
//         MAX_ATTACHMENTS
//     ) {
//       setShowAttachmentMenu(false);
//       return;
//     }

//     const option =
//       ATTACHMENT_OPTIONS.find(
//         (item) =>
//           item.id === category
//       );

//     if (
//       !option ||
//       !fileInputRef.current
//     ) {
//       return;
//     }

//     setFileSelectionCategory(
//       category
//     );

//     setFileAccept(option.accept);
//     setShowAttachmentMenu(false);

//     fileInputRef.current.value =
//       "";

//     requestAnimationFrame(() => {
//       fileInputRef.current?.click();
//     });
//   };

//   const handleFilesSelected =
//     (event) => {
//       const incomingFiles =
//         Array.from(
//           event.target.files || []
//         );

//       if (!incomingFiles.length) {
//         return;
//       }

//       const remainingSlots =
//         MAX_ATTACHMENTS -
//         selectedFiles.length;

//       if (remainingSlots <= 0) {
//         event.target.value = "";
//         return;
//       }

//       const existingFiles =
//         new Set(
//           selectedFiles.map(
//             (file) =>
//               `${file.name}-${file.size}-${file.lastModified}`
//           )
//         );

//       const validFiles =
//         incomingFiles.filter(
//           (file) => {
//             const fileKey =
//               `${file.name}-${file.size}-${file.lastModified}`;

//             if (
//               existingFiles.has(
//                 fileKey
//               )
//             ) {
//               return false;
//             }

//             return validateFile(
//               file,
//               fileSelectionCategory
//             );
//           }
//         );

//       const filesToAdd =
//         validFiles.slice(
//           0,
//           remainingSlots
//         );

//       if (
//         validFiles.length >
//         filesToAdd.length
//       ) {
//         window.alert(
//           `You can attach up to ${MAX_ATTACHMENTS} files.`
//         );
//       }

//       if (!filesToAdd.length) {
//         event.target.value = "";
//         return;
//       }

//       setSelectedFiles(
//         (current) => [
//           ...current,
//           ...filesToAdd,
//         ]
//       );

//       setFilePreviews(
//         (current) => [
//           ...current,
//           ...filesToAdd.map(
//             (file) => ({
//               file,
//               url: getFilePreviewUrl(
//                 file
//               ),
//             })
//           ),
//         ]
//       );

//       event.target.value = "";
//     };

//   const removeSelectedFile = (
//     index
//   ) => {
//     setSelectedFiles(
//       (current) =>
//         current.filter(
//           (_, fileIndex) =>
//             fileIndex !== index
//         )
//     );

//     setFilePreviews(
//       (current) => {
//         const preview =
//           current[index];

//         if (preview?.url) {
//           URL.revokeObjectURL(
//             preview.url
//           );
//         }

//         return current.filter(
//           (_, fileIndex) =>
//             fileIndex !== index
//         );
//       }
//     );
//   };

//   useEffect(() => {
//     return () => {
//       filePreviewsRef.current.forEach(
//         (preview) => {
//           if (preview?.url) {
//             URL.revokeObjectURL(
//               preview.url
//             );
//           }
//         }
//       );
//     };
//   }, []);

//   /* =======================================================
//      REPLY
//   ======================================================== */

//   const handleReply = (
//     message
//   ) => {
//     if (selectionMode) {
//       return;
//     }

//     onReply?.(message);
//   };

//   /* =======================================================
//      THREAD
//   ======================================================== */

//   const handleOpenThread =
//     async (message) => {
//       const messageId =
//         getMessageId(message);

//       if (
//         !conversationId ||
//         !messageId
//       ) {
//         return;
//       }

//       try {
//         setThreadLoading(true);
//         setThreadError("");

//         const thread =
//           await getMessageThread(
//             conversationId,
//             messageId
//           );

//         if (!thread) {
//           setThreadError(
//             "Unable to load this thread."
//           );

//           return;
//         }

//         setActiveThread({
//           ...thread,
//           messageId,
//         });
//       } catch (error) {
//         console.error(
//           "Failed to open message thread:",
//           error
//         );

//         setThreadError(
//           error?.message ||
//             "Unable to load this thread."
//         );
//       } finally {
//         setThreadLoading(false);
//       }
//     };

//   /* =======================================================
//      BULK ACTIONS
//   ======================================================== */

//   const handleBulkDeleteForMe =
//     async () => {
//       if (
//         !selectedCount ||
//         processingSelection
//       ) {
//         return;
//       }

//       try {
//         setProcessingSelection(
//           true
//         );

//         await deleteMessagesForMe(
//           Array.from(
//             selectedMessageIds
//           )
//         );

//         clearSelection();
//       } catch (error) {
//         console.error(
//           "Failed to delete selected messages for me:",
//           error
//         );

//         window.alert(
//           "Some messages could not be deleted."
//         );
//       } finally {
//         setProcessingSelection(
//           false
//         );
//       }
//     };

//   const handleBulkDeleteForEveryone =
//     async () => {
//       if (
//         !selectedCount ||
//         !canDeleteForEveryone ||
//         processingSelection
//       ) {
//         return;
//       }

//       try {
//         setProcessingSelection(
//           true
//         );

//         await deleteMessagesForEveryone(
//           Array.from(
//             selectedMessageIds
//           )
//         );

//         clearSelection();
//       } catch (error) {
//         console.error(
//           "Failed to delete selected messages for everyone:",
//           error
//         );

//         window.alert(
//           "Some messages could not be deleted for everyone."
//         );
//       } finally {
//         setProcessingSelection(
//           false
//         );
//       }
//     };

//   const openForwardModal =
//     () => {
//       if (
//         !selectedCount ||
//         !canForward ||
//         processingSelection
//       ) {
//         return;
//       }

//       setShowForwardModal(true);
//     };

//   const closeForwardModal =
//     () => {
//       if (
//         processingSelection
//       ) {
//         return;
//       }

//       setShowForwardModal(false);
//     };

//   const handleForward =
//     async (
//       destinationConversationIds
//     ) => {
//       if (
//         !selectedCount ||
//         !destinationConversationIds?.length ||
//         processingSelection
//       ) {
//         return;
//       }

//       try {
//         setProcessingSelection(
//           true
//         );

//         await forwardMessages(
//           Array.from(
//             selectedMessageIds
//           ),
//           destinationConversationIds
//         );

//         setShowForwardModal(false);
//         clearSelection();
//       } catch (error) {
//         console.error(
//           "Failed to forward messages:",
//           error
//         );

//         window.alert(
//           "The selected messages could not be forwarded."
//         );
//       } finally {
//         setProcessingSelection(
//           false
//         );
//       }
//     };

//   /* =======================================================
//      TYPING
//   ======================================================== */

//   const typingLabel =
//     useMemo(() => {
//       const users =
//         Array.isArray(
//           typingUsers
//         )
//           ? typingUsers
//           : [];

//       if (!users.length) {
//         return "";
//       }

//       if (users.length === 1) {
//         return "typing...";
//       }

//       if (users.length === 2) {
//         return "2 people are typing...";
//       }

//       return `${users.length} people are typing...`;
//     }, [typingUsers]);

//   const conversationName =
//     getConversationName(
//       conversation
//     );

//   /* =======================================================
//      EMPTY CONVERSATION
//   ======================================================== */

//   if (!conversation) {
//     return (
//       <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-white">
//         <div className="text-center">
//           <p className="text-sm font-medium text-slate-700">
//             Select a conversation
//           </p>

//           <p className="mt-1 text-xs text-slate-400">
//             Choose a conversation to start messaging.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   /* =======================================================
//      RENDER
//   ======================================================== */

//   return (
//     <div className="relative flex h-full min-h-0 flex-1 flex-col bg-slate-50">

//       {/* =================================================
//           HEADER
//       ================================================= */}

//       {selectionMode ? (
//         <MessageSelectionToolbar
//           selectedCount={
//             selectedCount
//           }
//           onCancel={
//             clearSelection
//           }
//           onForward={
//             openForwardModal
//           }
//           onDeleteForMe={
//             handleBulkDeleteForMe
//           }
//           onDeleteForEveryone={
//             handleBulkDeleteForEveryone
//           }
//           canDeleteForEveryone={
//             canDeleteForEveryone
//           }
//           processing={
//             processingSelection
//           }
//         />
//       ) : (
//         <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 py-3">

//           {onBack && (
//             <button
//               type="button"
//               onClick={onBack}
//               className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 md:hidden"
//               aria-label="Back"
//             >
//               ←
//             </button>
//           )}

//           <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white shadow-sm">
//             {conversationName
//               .charAt(0)
//               .toUpperCase()}
//           </div>

//           <div className="min-w-0 flex-1">
//             <p className="truncate text-sm font-semibold text-slate-900">
//               {conversationName}
//             </p>

//             {typingLabel ? (
//               <p className="truncate text-xs font-medium text-blue-600">
//                 {typingLabel}
//               </p>
//             ) : (
//               <p className="truncate text-xs text-slate-400">
//                 {conversation?.type ===
//                 "group"
//                   ? "Group conversation"
//                   : "Conversation"}
//               </p>
//             )}
//           </div>

//           {/* SEARCH */}

//           <div className="relative shrink-0">
//             {messageSearchOpen ? (
//               <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 shadow-sm">

//                 <Search
//                   size={17}
//                   className="shrink-0 text-slate-400"
//                 />

//                 <input
//                   ref={
//                     messageSearchInputRef
//                   }
//                   type="text"
//                   value={
//                     messageSearchText
//                   }
//                   onChange={
//                     handleMessageSearchChange
//                   }
//                   onFocus={() =>
//                     setMessageSearchFocused(
//                       true
//                     )
//                   }
//                   onBlur={() =>
//                     setTimeout(
//                       () =>
//                         setMessageSearchFocused(
//                           false
//                         ),
//                       150
//                     )
//                   }
//                   onKeyDown={(
//                     event
//                   ) => {
//                     if (
//                       event.key ===
//                       "Escape"
//                     ) {
//                       handleCloseMessageSearch();
//                       return;
//                     }

//                     if (
//                       event.key ===
//                         "ArrowDown" ||
//                       (event.key ===
//                         "Enter" &&
//                         !event.shiftKey)
//                     ) {
//                       if (
//                         messageSearchResults?.length
//                       ) {
//                         event.preventDefault();

//                         navigateSearchResult(
//                           1
//                         );
//                       }

//                       return;
//                     }

//                     if (
//                       event.key ===
//                         "ArrowUp" ||
//                       (event.key ===
//                         "Enter" &&
//                         event.shiftKey)
//                     ) {
//                       if (
//                         messageSearchResults?.length
//                       ) {
//                         event.preventDefault();

//                         navigateSearchResult(
//                           -1
//                         );
//                       }
//                     }
//                   }}
//                   placeholder="Search messages..."
//                   className="w-28 bg-transparent px-1 text-xs text-slate-800 outline-none placeholder:text-slate-400 sm:w-40"
//                   aria-label="Search messages"
//                 />

//                 {messageSearchText.trim() &&
//                   messageSearchResults?.length >
//                     0 && (
//                     <>
//                       <span className="shrink-0 px-1 text-[10px] font-medium tabular-nums text-slate-400">
//                         {activeSearchResultIndex >=
//                         0
//                           ? activeSearchResultIndex +
//                             1
//                           : 0}
//                         /
//                         {
//                           messageSearchResults.length
//                         }
//                       </span>

//                       <button
//                         type="button"
//                         onMouseDown={(
//                           event
//                         ) =>
//                           event.preventDefault()
//                         }
//                         onClick={() =>
//                           navigateSearchResult(
//                             -1
//                           )
//                         }
//                         disabled={
//                           searchNavigationLoading
//                         }
//                         className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 hover:text-blue-600 disabled:opacity-40"
//                         aria-label="Previous search match"
//                       >
//                         <ChevronUp
//                           size={15}
//                         />
//                       </button>

//                       <button
//                         type="button"
//                         onMouseDown={(
//                           event
//                         ) =>
//                           event.preventDefault()
//                         }
//                         onClick={() =>
//                           navigateSearchResult(
//                             1
//                           )
//                         }
//                         disabled={
//                           searchNavigationLoading
//                         }
//                         className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 hover:text-blue-600 disabled:opacity-40"
//                         aria-label="Next search match"
//                       >
//                         <ChevronDown
//                           size={15}
//                         />
//                       </button>
//                     </>
//                   )}

//                 <button
//                   type="button"
//                   onMouseDown={(
//                     event
//                   ) =>
//                     event.preventDefault()
//                   }
//                   onClick={
//                     handleCloseMessageSearch
//                   }
//                   className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700"
//                   aria-label="Close message search"
//                 >
//                   <X size={15} />
//                 </button>
//               </div>
//             ) : (
//               <button
//                 type="button"
//                 onClick={
//                   handleOpenMessageSearch
//                 }
//                 className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600"
//                 aria-label="Search messages"
//               >
//                 <Search size={19} />
//               </button>
//             )}

//             {/* SEARCH RESULTS */}

//             {messageSearchOpen &&
//               messageSearchFocused &&
//               messageSearchText.trim() && (
//                 <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

//                   {messageSearchLoading ? (
//                     <div className="flex items-center gap-2 px-4 py-4 text-xs text-slate-500">
//                       <Loader2
//                         size={15}
//                         className="animate-spin"
//                       />
//                       Searching messages...
//                     </div>
//                   ) : messageSearchError ? (
//                     <div className="px-4 py-4 text-xs text-red-500">
//                       {
//                         messageSearchError
//                       }
//                     </div>
//                   ) : messageSearchResults?.length ? (
//                     <div className="max-h-[360px] overflow-y-auto py-1">
//                       {messageSearchResults.map(
//                         (
//                           result,
//                           resultIndex
//                         ) => {
//                           const resultId =
//                             getMessageId(
//                               result
//                             );

//                           const senderName =
//                             result?.sender?.name ||
//                             result?.sender?.fullName ||
//                             result?.senderName ||
//                             "Unknown user";

//                           const resultText =
//                             result?.text?.trim() ||
//                             (result?.attachments?.length
//                               ? "Attachment"
//                               : "Message");

//                           return (
//                             <button
//                               key={
//                                 resultId
//                               }
//                               type="button"
//                               onMouseDown={(
//                                 event
//                               ) =>
//                                 event.preventDefault()
//                               }
//                               onClick={() =>
//                                 handleSearchResultClick(
//                                   result,
//                                   resultIndex
//                                 )
//                               }
//                               className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50 ${
//                                 activeSearchResultIndex ===
//                                 resultIndex
//                                   ? "bg-blue-50"
//                                   : ""
//                               }`}
//                             >
//                               <div className="flex items-center justify-between gap-3">
//                                 <span className="truncate text-xs font-semibold text-slate-700">
//                                   {
//                                     senderName
//                                   }
//                                 </span>

//                                 {result?.createdAt && (
//                                   <span className="shrink-0 text-[10px] text-slate-400">
//                                     {new Date(
//                                       result.createdAt
//                                     ).toLocaleDateString(
//                                       [],
//                                       {
//                                         day: "2-digit",
//                                         month: "short",
//                                       }
//                                     )}
//                                   </span>
//                                 )}
//                               </div>

//                               <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-slate-500">
//                                 {
//                                   resultText
//                                 }
//                               </p>
//                             </button>
//                           );
//                         }
//                       )}
//                     </div>
//                   ) : (
//                     <div className="px-4 py-5 text-center text-xs text-slate-400">
//                       No messages found
//                     </div>
//                   )}
//                 </div>
//               )}
//           </div>
//         </div>
//       )}

//       {/* =================================================
//           MESSAGE AREA
//       ================================================= */}

//       <div
//         ref={
//           messagesContainerRef
//         }
//         onScroll={
//           handleMessagesScroll
//         }
//         className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 px-3 py-4 sm:px-5"
//       >
//         {loading ? (
//           <div className="flex h-full items-center justify-center">
//             <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 shadow-sm">
//               Loading messages...
//             </div>
//           </div>
//         ) : messages?.length ? (
//           <div
//             ref={
//               messagesContentRef
//             }
//             className="flex flex-col gap-3"
//           >
//             {messages.map(
//               (message) => {
//                 const messageId =
//                   getMessageId(
//                     message
//                   );

//                 const senderId =
//                   message?.sender?.id ||
//                   message?.sender?._id ||
//                   message?.senderId;

//                 const own =
//                   String(
//                     senderId
//                   ) ===
//                   String(
//                     currentUserId
//                   );

//                 return (
//                   <MessageItem
//                     key={
//                       messageId
//                     }
//                     message={
//                       message
//                     }
//                     own={own}
//                     onReply={
//                       handleReply
//                     }
//                     onOpenThread={
//                       handleOpenThread
//                     }
//                     selectionMode={
//                       selectionMode
//                     }
//                     selected={selectedMessageIds.has(
//                       String(
//                         messageId
//                       )
//                     )}
//                     onToggleSelect={
//                       toggleMessageSelection
//                     }
//                     onEnterSelectionMode={
//                       enterSelectionMode
//                     }
//                     onClearSelection={
//                       clearSelection
//                     }
//                     activeMenuMessageId={
//                       activeMenuMessageId
//                     }
//                     onMenuOpenChange={
//                       setActiveMenuMessageId
//                     }
//                   />
//                 );
//               }
//             )}
//           </div>
//         ) : (
//           <div className="flex h-full items-center justify-center">
//             <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
//               <p className="text-sm font-semibold text-slate-700">
//                 No messages yet
//               </p>

//               <p className="mt-1 text-xs text-slate-400">
//                 Send a message to start the conversation.
//               </p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* =================================================
//           REPLY PREVIEW
//       ================================================= */}

//       {!selectionMode &&
//         replyingTo && (
//           <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-2">
//             <div className="flex items-start gap-3">
//               <div className="min-w-0 flex-1 border-l-2 border-blue-500 pl-3">
//                 <p className="text-xs font-semibold text-blue-600">
//                   Replying to{" "}
//                   {replyingTo.sender?.name ||
//                     "message"}
//                 </p>

//                 <p className="mt-0.5 truncate text-xs text-slate-600">
//                   {replyingTo.text ||
//                     (replyingTo.attachments?.length
//                       ? "Attachment"
//                       : "Message")}
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={
//                   onCancelReply
//                 }
//                 className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
//                 aria-label="Cancel reply"
//               >
//                 <X size={16} />
//               </button>
//             </div>
//           </div>
//         )}

//       {/* =================================================
//           ATTACHMENT PREVIEW
//       ================================================= */}

//       {!selectionMode &&
//         filePreviews.length >
//           0 && (
//           <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-2">
//             <div className="flex gap-2 overflow-x-auto pb-1">
//               {filePreviews.map(
//                 (
//                   preview,
//                   index
//                 ) => {
//                   const file =
//                     preview.file;

//                   const isImage =
//                     file?.type?.startsWith(
//                       "image/"
//                     );

//                   const isVideo =
//                     file?.type?.startsWith(
//                       "video/"
//                     );

//                   return (
//                     <div
//                       key={`${file.name}-${index}`}
//                       className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
//                     >
//                       {isImage ? (
//                         <img
//                           src={
//                             preview.url
//                           }
//                           alt={
//                             file.name
//                           }
//                           className="h-full w-full object-cover"
//                         />
//                       ) : isVideo ? (
//                         <video
//                           src={
//                             preview.url
//                           }
//                           muted
//                           playsInline
//                           className="h-full w-full object-cover"
//                         />
//                       ) : (
//                         <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-1">
//                           <FileText
//                             size={
//                               20
//                             }
//                             className="text-slate-500"
//                           />

//                           <span className="max-w-full truncate px-1 text-[9px] text-slate-500">
//                             {
//                               file.name
//                             }
//                           </span>
//                         </div>
//                       )}

//                       <button
//                         type="button"
//                         onClick={() =>
//                           removeSelectedFile(
//                             index
//                           )
//                         }
//                         className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white"
//                         aria-label={`Remove ${file.name}`}
//                       >
//                         <X size={12} />
//                       </button>
//                     </div>
//                   );
//                 }
//               )}
//             </div>
//           </div>
//         )}

//       {/* =================================================
//           COMPOSER
//       ================================================= */}

//       <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-3">
//         <input
//           ref={fileInputRef}
//           type="file"
//           multiple
//           hidden
//           accept={fileAccept}
//           onChange={
//             handleFilesSelected
//           }
//         />

//         <div className="flex w-full items-end gap-2">

//           <div
//             ref={
//               attachmentMenuRef
//             }
//             className="relative shrink-0"
//           >
//             <button
//               type="button"
//               onClick={() =>
//                 setShowAttachmentMenu(
//                   (current) =>
//                     !current
//                 )
//               }
//               disabled={
//                 sending ||
//                 selectedFiles.length >=
//                   MAX_ATTACHMENTS
//               }
//               className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600 disabled:opacity-40"
//               aria-label="Attach files"
//             >
//               <Paperclip
//                 size={20}
//               />
//             </button>

//             {showAttachmentMenu && (
//               <div className="absolute bottom-12 left-0 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
//                 <div className="border-b border-slate-100 px-4 py-3">
//                   <p className="text-sm font-semibold text-slate-800">
//                     Attach file
//                   </p>

//                   <p className="mt-0.5 text-xs text-slate-400">
//                     Choose what you want to send
//                   </p>
//                 </div>

//                 <div className="p-2">
//                   {ATTACHMENT_OPTIONS.map(
//                     (option) => {
//                       const Icon =
//                         option.icon;

//                       return (
//                         <button
//                           key={
//                             option.id
//                           }
//                           type="button"
//                           onClick={() =>
//                             openFilePicker(
//                               option.id
//                             )
//                           }
//                           className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-50"
//                         >
//                           <span
//                             className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${option.iconClass}`}
//                           >
//                             <Icon
//                               size={20}
//                             />
//                           </span>

//                           <span className="min-w-0 flex-1">
//                             <span className="block text-sm font-medium text-slate-800">
//                               {
//                                 option.label
//                               }
//                             </span>

//                             <span className="mt-0.5 block truncate text-xs text-slate-400">
//                               {
//                                 option.description
//                               }
//                             </span>
//                           </span>
//                         </button>
//                       );
//                     }
//                   )}
//                 </div>

//                 <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
//                   <p className="text-[10px] text-slate-400">
//                     Maximum file size: 10 MB each
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="min-w-0 flex-1">
//             <textarea
//               value={
//                 composerText
//               }
//               onChange={
//                 handleComposerChange
//               }
//               onKeyDown={
//                 handleComposerKeyDown
//               }
//               rows={1}
//               placeholder={
//                 replyingTo
//                   ? "Type a reply..."
//                   : "Type a message..."
//               }
//               disabled={sending}
//               className="block max-h-32 min-h-[40px] w-full resize-none overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm leading-5 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
//             />
//           </div>

//           <button
//             type="button"
//             onClick={
//               handleSend
//             }
//             disabled={
//               sending ||
//               (!composerText.trim() &&
//                 selectedFiles.length ===
//                   0)
//             }
//             className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
//             aria-label="Send message"
//           >
//             <Send size={18} />
//           </button>
//         </div>

//         {selectedFiles.length >
//           0 && (
//           <div className="mt-1 flex items-center justify-between px-12">
//             <span className="text-[10px] text-slate-400">
//               {
//                 selectedFiles.length
//               }
//               /{MAX_ATTACHMENTS} files attached
//             </span>

//             <button
//               type="button"
//               onClick={() => {
//                 filePreviewsRef.current.forEach(
//                   (preview) => {
//                     if (
//                       preview?.url
//                     ) {
//                       URL.revokeObjectURL(
//                         preview.url
//                       );
//                     }
//                   }
//                 );

//                 setSelectedFiles(
//                   []
//                 );
//                 setFilePreviews(
//                   []
//                 );
//               }}
//               disabled={sending}
//               className="text-[10px] font-medium text-slate-400 hover:text-red-500"
//             >
//               Clear all
//             </button>
//           </div>
//         )}
//       </div>

//       {/* =================================================
//           THREAD PANEL
//       ================================================= */}

//       {activeThread && (
//         <div className="absolute inset-y-0 right-0 z-30 flex w-full max-w-[420px] flex-col border-l border-slate-200 bg-white shadow-2xl">

//           <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-3">
//             <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
//               <MessageCircle
//                 size={18}
//               />
//             </div>

//             <div className="min-w-0 flex-1">
//               <p className="text-sm font-semibold text-slate-900">
//                 Thread
//               </p>

//               <p className="text-xs text-slate-400">
//                 {activeThread.replies?.length ||
//                   0}{" "}
//                 {activeThread.replies?.length ===
//                 1
//                   ? "reply"
//                   : "replies"}
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={() =>
//                 setActiveThread(
//                   null
//                 )
//               }
//               className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
//               aria-label="Close thread"
//             >
//               <X size={18} />
//             </button>
//           </div>

//           <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-3 py-4">
//             {threadLoading ? (
//               <div className="flex h-full items-center justify-center">
//                 <div className="flex items-center gap-2 text-sm text-slate-400">
//                   <Loader2
//                     size={18}
//                     className="animate-spin"
//                   />
//                   Loading thread...
//                 </div>
//               </div>
//             ) : threadError ? (
//               <div className="flex h-full items-center justify-center px-6 text-center">
//                 <div>
//                   <p className="text-sm font-medium text-red-500">
//                     {threadError}
//                   </p>

//                   <button
//                     type="button"
//                     onClick={() =>
//                       activeThread?.messageId &&
//                       handleOpenThread({
//                         id: activeThread.messageId,
//                       })
//                     }
//                     className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
//                   >
//                     Try again
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-4">

//                 {activeThread.parent && (
//                   <div>
//                     <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
//                       Original message
//                     </p>

//                     <ThreadMessage
//                       message={
//                         activeThread.parent
//                       }
//                       currentUserId={
//                         currentUserId
//                       }
//                     />
//                   </div>
//                 )}

//                 <div>
//                   <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
//                     Replies
//                   </p>

//                   {activeThread.replies?.length ? (
//                     <div className="space-y-2">
//                       {activeThread.replies.map(
//                         (reply) => (
//                           <ThreadMessage
//                             key={getMessageId(
//                               reply
//                             )}
//                             message={
//                               reply
//                             }
//                             currentUserId={
//                               currentUserId
//                             }
//                           />
//                         )
//                       )}
//                     </div>
//                   ) : (
//                     <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center">
//                       <p className="text-sm text-slate-400">
//                         No replies yet.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* =================================================
//           FORWARD MODAL
//       ================================================= */}

//       <ForwardMessageModal
//         open={
//           showForwardModal
//         }
//         conversations={
//           conversations
//         }
//         onClose={
//           closeForwardModal
//         }
//         onForward={
//           handleForward
//         }
//         processing={
//           processingSelection
//         }
//       />
//     </div>
//   );
// };

// export default ConversationWindow;




import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Loader2,
  MessageCircle,
  X,
} from "lucide-react";

import ConversationHeader from "./ConversationHeader";
import GroupInfo from "./GroupInfo";
import MessageList from "./MessageList";
import MessageComposer from "./MessageComposer";
import MessageSelectionToolbar from "./MessageSelectionToolbar";
import ForwardMessageModal from "./ForwardMessageModal";

import { useCommunication } from "../../context/CommunicationContext";

/* =========================================================
   HELPERS
========================================================= */

const getMessageId = (message) =>
  message?.id ||
  message?._id ||
  null;

const getConversationId = (
  conversation
) =>
  conversation?.id ||
  conversation?._id ||
  null;

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
      className={`rounded-xl border px-3 py-2.5 ${
        own
          ? "border-blue-100 bg-blue-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={`truncate text-xs font-semibold ${
            own
              ? "text-blue-700"
              : "text-slate-700"
          }`}
        >
          {senderName}
        </p>

        {message?.createdAt && (
          <span className="shrink-0 text-[10px] text-slate-400">
            {new Date(
              message.createdAt
            ).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </span>
        )}
      </div>

      {deleted ? (
        <p className="mt-1.5 text-sm italic text-slate-400">
          This message was deleted
        </p>
      ) : (
        <>
          {text && (
            <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
              {text}
            </p>
          )}

          {hasAttachments && (
            <p className="mt-1.5 text-xs text-slate-400">
              {
                message.attachments
                  .length
              }{" "}
              {message.attachments
                .length === 1
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

  onOpenGroupInfo,
  onOpenDirectInfo,

  onReply,
  replyingTo,
  onCancelReply,
}) => {
  const {
    conversations,

    deleteMessagesForMe,
    deleteMessagesForEveryone,

    addGroupMembers,
    exitGroup,

    forwardMessages,

    getMessageThread,

    messageSearchResults,
    messageSearchLoading,
    messageSearchError,
    searchMessages,
    loadMessageFromSearchResult,
  } = useCommunication();

  /* =======================================================
     REFS
  ======================================================== */

  const messagesContainerRef =
    useRef(null);

  const messagesContentRef =
    useRef(null);

  const messageSearchInputRef =
    useRef(null);

  const searchDebounceRef =
    useRef(null);

  const shouldScrollToBottomRef =
    useRef(true);

  /* =======================================================
     CONVERSATION
  ======================================================== */

  const conversationId =
    getConversationId(
      conversation
    );

  /* =======================================================
     SELECTION
  ======================================================== */

  const [selectionMode, setSelectionMode] =
    useState(false);

  const [groupInfoOpen, setGroupInfoOpen] =
    useState(false);

  const [selectedMessageIds, setSelectedMessageIds] =
    useState(new Set());

  const [processingSelection, setProcessingSelection] =
    useState(false);

  const [activeMenuMessageId, setActiveMenuMessageId] =
    useState(null);

  /* =======================================================
     FORWARD
  ======================================================== */

  const [showForwardModal, setShowForwardModal] =
    useState(false);

  /* =======================================================
     THREAD
  ======================================================== */

  const [activeThread, setActiveThread] =
    useState(null);

  const [threadLoading, setThreadLoading] =
    useState(false);

  const [threadError, setThreadError] =
    useState("");

  /* =======================================================
     SEARCH
  ======================================================== */

  const [messageSearchOpen, setMessageSearchOpen] =
    useState(false);

  const [messageSearchText, setMessageSearchText] =
    useState("");

  const [messageSearchFocused, setMessageSearchFocused] =
    useState(false);

  const [activeSearchResultIndex, setActiveSearchResultIndex] =
    useState(-1);

  const [searchNavigationLoading, setSearchNavigationLoading] =
    useState(false);

  /* =======================================================
     MESSAGE MAP
  ======================================================== */

  const messageById =
    useMemo(() => {
      const map = new Map();

      (
        messages || []
      ).forEach((message) => {
        const id =
          getMessageId(message);

        if (id) {
          map.set(
            String(id),
            message
          );
        }
      });

      return map;
    }, [messages]);

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

  const canDeleteForEveryone =
    selectedMessages.length >
      0 &&
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

  const canForward =
    selectedMessages.length >
      0 &&
    selectedMessages.every(
      (message) =>
        !message?.deletedForEveryone
    );

  /* =======================================================
     SELECTION
  ======================================================== */

  const clearSelection = () => {
    setSelectionMode(false);
    setSelectedMessageIds(
      new Set()
    );
    setShowForwardModal(false);
  };

  const enterSelectionMode =
    (messageOrId) => {
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

  const toggleMessageSelection =
    (messageOrId) => {
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
     CONVERSATION CHANGE
  ======================================================== */

  useLayoutEffect(() => {
    shouldScrollToBottomRef.current =
      true;
  }, [conversationId]);

  useEffect(() => {
    setSelectionMode(false);

    setSelectedMessageIds(
      new Set()
    );

    setShowForwardModal(false);

    setGroupInfoOpen(false);

    setActiveMenuMessageId(null);

    setActiveThread(null);
    setThreadError("");

    setMessageSearchOpen(false);
    setMessageSearchText("");
    setMessageSearchFocused(false);
    setActiveSearchResultIndex(-1);
    setSearchNavigationLoading(
      false
    );
  }, [conversationId]);

  /* =======================================================
     MESSAGE SEARCH
  ======================================================== */

  useEffect(() => {
    clearTimeout(
      searchDebounceRef.current
    );

    const query =
      messageSearchText.trim();

    if (
      !messageSearchOpen ||
      !conversationId
    ) {
      return undefined;
    }

    if (!query) {
      setActiveSearchResultIndex(
        -1
      );

      searchMessages?.(
        conversationId,
        ""
      );

      return undefined;
    }

    setActiveSearchResultIndex(
      -1
    );

    searchDebounceRef.current =
      setTimeout(() => {
        searchMessages?.(
          conversationId,
          query
        );
      }, 350);

    return () => {
      clearTimeout(
        searchDebounceRef.current
      );
    };
  }, [
    messageSearchText,
    messageSearchOpen,
    conversationId,
    searchMessages,
  ]);

  useEffect(() => {
    return () => {
      clearTimeout(
        searchDebounceRef.current
      );
    };
  }, []);

  const handleOpenMessageSearch =
    () => {
      if (selectionMode) {
        return;
      }

      setMessageSearchOpen(true);

      requestAnimationFrame(() => {
        messageSearchInputRef.current?.focus();
      });
    };

  const handleCloseMessageSearch =
    () => {
      clearTimeout(
        searchDebounceRef.current
      );

      setMessageSearchOpen(false);
      setMessageSearchText("");
      setMessageSearchFocused(
        false
      );
      setActiveSearchResultIndex(
        -1
      );
      setSearchNavigationLoading(
        false
      );

      searchMessages?.(
        conversationId,
        ""
      );
    };

  const handleMessageSearchChange =
    (event) => {
      const value =
        event.target.value;

      setMessageSearchText(value);
      setActiveSearchResultIndex(
        -1
      );
      setSearchNavigationLoading(
        false
      );

      if (conversationId) {
        searchMessages?.(
          conversationId,
          ""
        );
      }
    };

  const highlightSearchResult =
    (resultId) => {
      if (!resultId) {
        return false;
      }

      const target =
        document.getElementById(
          `message-${resultId}`
        );

      if (!target) {
        return false;
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
      }, 1400);

      return true;
    };

  const handleSearchResultClick =
    async (
      result,
      resultIndex = -1
    ) => {
      const resultId =
        getMessageId(result);

      if (!resultId) {
        return;
      }

      if (resultIndex >= 0) {
        setActiveSearchResultIndex(
          resultIndex
        );
      }

      const existingElement =
        document.getElementById(
          `message-${resultId}`
        );

      if (existingElement) {
        requestAnimationFrame(() => {
          highlightSearchResult(
            resultId
          );
        });

        return;
      }

      if (
        !loadMessageFromSearchResult
      ) {
        return;
      }

      try {
        setSearchNavigationLoading(
          true
        );

        shouldScrollToBottomRef.current =
          false;

        await loadMessageFromSearchResult(
          result
        );

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            highlightSearchResult(
              resultId
            );
          });
        });
      } catch (error) {
        console.error(
          "Failed to navigate to search result:",
          error
        );
      } finally {
        setSearchNavigationLoading(
          false
        );
      }
    };

  const navigateSearchResult =
    async (direction) => {
      const results =
        messageSearchResults ||
        [];

      if (
        !results.length ||
        searchNavigationLoading
      ) {
        return;
      }

      let nextIndex;

      if (
        activeSearchResultIndex <
        0
      ) {
        nextIndex =
          direction > 0
            ? 0
            : results.length - 1;
      } else {
        nextIndex =
          (activeSearchResultIndex +
            direction +
            results.length) %
          results.length;
      }

      setActiveSearchResultIndex(
        nextIndex
      );

      await handleSearchResultClick(
        results[nextIndex],
        nextIndex
      );
    };

  useEffect(() => {
    const results =
      messageSearchResults ||
      [];

    if (
      !messageSearchOpen ||
      !messageSearchText.trim() ||
      !results.length ||
      activeSearchResultIndex >=
        0 ||
      searchNavigationLoading
    ) {
      return;
    }

    handleSearchResultClick(
      results[0],
      0
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    messageSearchResults,
    messageSearchOpen,
    messageSearchText,
    activeSearchResultIndex,
    searchNavigationLoading,
  ]);

  /* =======================================================
     SCROLL
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

  const hasMessages =
    Boolean(messages?.length);

  useLayoutEffect(() => {
    if (
      !hasMessages ||
      loading
    ) {
      return;
    }

    if (
      shouldScrollToBottomRef.current
    ) {
      scrollToBottom("auto");
    }
  }, [
    messages,
    conversationId,
    loading,
    hasMessages,
  ]);

  useEffect(() => {
    const content =
      messagesContentRef.current;

    if (
      !content ||
      typeof ResizeObserver ===
        "undefined"
    ) {
      return undefined;
    }

    const observer =
      new ResizeObserver(() => {
        if (
          shouldScrollToBottomRef.current
        ) {
          scrollToBottom("auto");
        }
      });

    observer.observe(content);

    return () =>
      observer.disconnect();
  }, [
    conversationId,
    loading,
    hasMessages,
  ]);

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
     MESSAGE HANDLERS
  ======================================================== */

  const handleReply = (
    message
  ) => {
    if (selectionMode) {
      return;
    }

    onReply?.(message);
  };

  const handleOpenThread =
    async (message) => {
      const messageId =
        getMessageId(message);

      if (
        !conversationId ||
        !messageId
      ) {
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
     BULK DELETE
  ======================================================== */

  const handleBulkDeleteForMe =
    async () => {
      if (
        !selectedCount ||
        processingSelection
      ) {
        return;
      }

      try {
        setProcessingSelection(
          true
        );

        await deleteMessagesForMe(
          Array.from(
            selectedMessageIds
          )
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
        setProcessingSelection(
          false
        );
      }
    };

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
        setProcessingSelection(
          true
        );

        await deleteMessagesForEveryone(
          Array.from(
            selectedMessageIds
          )
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
        setProcessingSelection(
          false
        );
      }
    };

  /* =======================================================
     FORWARD
  ======================================================== */

  const openForwardModal =
    () => {
      if (
        !selectedCount ||
        !canForward ||
        processingSelection
      ) {
        return;
      }

      setShowForwardModal(true);
    };

  const closeForwardModal =
    () => {
      if (
        processingSelection
      ) {
        return;
      }

      setShowForwardModal(false);
    };

  const handleForward =
    async (
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

        setShowForwardModal(false);
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
     EMPTY CONVERSATION
  ======================================================== */

  if (!conversation) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">
            Select a conversation
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Choose a conversation to
            start messaging.
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================== */

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col bg-slate-50">

      {/* =================================================
          HEADER
      ================================================= */}

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
        <ConversationHeader
          conversation={
            conversation
          }
          currentUserId={
            currentUserId
          }
          typingLabel={
            typingLabel
          }
          onBack={onBack}

          onOpenGroupInfo={onOpenGroupInfo}

          onOpenDirectInfo={onOpenDirectInfo}

          messageSearchOpen={
            messageSearchOpen
          }
          messageSearchText={
            messageSearchText
          }
          messageSearchFocused={
            messageSearchFocused
          }
          messageSearchInputRef={
            messageSearchInputRef
          }
          messageSearchResults={
            messageSearchResults
          }
          messageSearchLoading={
            messageSearchLoading
          }
          messageSearchError={
            messageSearchError
          }
          activeSearchResultIndex={
            activeSearchResultIndex
          }
          searchNavigationLoading={
            searchNavigationLoading
          }
          onOpenMessageSearch={
            handleOpenMessageSearch
          }
          onCloseMessageSearch={
            handleCloseMessageSearch
          }
          onMessageSearchChange={
            handleMessageSearchChange
          }
          onSearchResultClick={
            handleSearchResultClick
          }
          onNavigateSearchResult={
            navigateSearchResult
          }
          onSearchFocus={() =>
            setMessageSearchFocused(
              true
            )
          }
          onSearchBlur={() =>
            setTimeout(
              () =>
                setMessageSearchFocused(
                  false
                ),
              150
            )
          }
        />
      )}

      {/* =================================================
          MESSAGE LIST
      ================================================= */}

      <MessageList
        messages={messages}
        currentUserId={
          currentUserId
        }
        loading={loading}
        messagesContainerRef={
          messagesContainerRef
        }
        messagesContentRef={
          messagesContentRef
        }
        onScroll={
          handleMessagesScroll
        }
        onReply={
          handleReply
        }
        onOpenThread={
          handleOpenThread
        }
        selectionMode={
          selectionMode
        }
        selectedMessageIds={
          selectedMessageIds
        }
        onToggleSelect={
          toggleMessageSelection
        }
        onEnterSelectionMode={
          enterSelectionMode
        }
        onClearSelection={
          clearSelection
        }
        activeMenuMessageId={
          activeMenuMessageId
        }
        onMenuOpenChange={
          setActiveMenuMessageId
        }
      />

      {/* =================================================
          COMPOSER
      ================================================= */}

      {!selectionMode && (
        <MessageComposer
          conversationId={
            conversationId
          }
          replyingTo={
            replyingTo
          }
          onCancelReply={
            onCancelReply
          }
          onSend={onSend}
          onTypingStart={
            onTypingStart
          }
          onTypingStop={
            onTypingStop
          }
          disabled={false}
          onMessageSent={() => {
            shouldScrollToBottomRef.current =
              true;

            requestAnimationFrame(() => {
              scrollToBottom(
                "smooth"
              );
            });
          }}
        />
      )}

      {/* =================================================
          THREAD PANEL
      ================================================= */}

      {activeThread && (
        <div className="absolute inset-y-0 right-0 z-30 flex w-full max-w-[420px] flex-col border-l border-slate-200 bg-white shadow-2xl">

          {/* THREAD HEADER */}

          <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <MessageCircle
                size={18}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">
                Thread
              </p>

              <p className="truncate text-xs text-slate-400">
                {
                  activeThread
                    .replies?.length ||
                    0
                }{" "}
                {activeThread.replies
                  ?.length === 1
                  ? "reply"
                  : "replies"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setActiveThread(
                  null
                )
              }
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close thread"
            >
              <X size={18} />
            </button>
          </div>

          {/* THREAD CONTENT */}

          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-3 py-4">
            {threadLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Loading thread...
                </div>
              </div>
            ) : threadError ? (
              <div className="flex h-full items-center justify-center px-6 text-center">
                <div>
                  <p className="text-sm font-medium text-red-500">
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
                    className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">

                {/* ORIGINAL */}

                {activeThread.parent && (
                  <div>
                    <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
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
                  <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Replies
                  </p>

                  {activeThread
                    .replies
                    ?.length ? (
                    <div className="space-y-2">
                      {activeThread.replies.map(
                        (reply) => (
                          <ThreadMessage
                            key={getMessageId(
                              reply
                            )}
                            message={
                              reply
                            }
                            currentUserId={
                              currentUserId
                            }
                          />
                        )
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center">
                      <p className="text-sm text-slate-400">
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
          GROUP INFO
      ================================================= */}

      {groupInfoOpen &&
        conversation.type === "group" && (
          <GroupInfo
            conversation={conversation}
            currentUserId={currentUserId}
            onClose={() =>
              setGroupInfoOpen(false)
            }
            // onAddMembers={() => {
            //   console.log(
            //     "Add members:",
            //     conversation
            //   );
            // }}
            // onExitGroup={() => {
            //   console.log(
            //     "Exit group:",
            //     conversation
            //   );
            // }}
          />
        )}

      {/* =================================================
          FORWARD MODAL
      ================================================= */}

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