// const mongoose = require("mongoose");

// const User = require("../models/User");
// const Conversation = require("../models/Conversation");
// const ConversationParticipant =
//   require("../models/ConversationParticipant");
// const Message = require("../models/Message");

// /* =====================================================
//    HELPERS
// ===================================================== */

// const isValidObjectId = (id) => {
//   return mongoose.Types.ObjectId.isValid(id);
// };

// const normalizeUser = (user) => {
//   if (!user) {
//     return null;
//   }

//   return {
//     id: user._id,
//     name: user.name,
//     email: user.email,
//     role: user.role,
//   };
// };

// const createServiceError = (
//   message,
//   statusCode = 400
// ) => {
//   const error = new Error(message);
//   error.statusCode = statusCode;
//   return error;
// };

// /* =====================================================
//    NORMALIZE MESSAGE
// ===================================================== */

// const normalizeMessage = (
//   message,
//   {
//     includeDeletedContent = false,
//   } = {}
// ) => {
//   if (!message) {
//     return null;
//   }

//   const deletedForEveryone =
//     Boolean(message.deletedForEveryone);

//   const hideContent =
//     deletedForEveryone &&
//     !includeDeletedContent;

//   return {
//     id: message._id,

//     conversationId:
//       message.conversationId,

//     type: message.type,

//     text: hideContent
//       ? ""
//       : message.text || "",

//     attachments: hideContent
//       ? []
//       : message.attachments || [],

//     reactions: hideContent
//       ? []
//       : message.reactions || [],

//     createdAt: message.createdAt,

//     updatedAt: message.updatedAt,

//     deletedForEveryone,

//     deletedAt:
//       message.deletedAt || null,

//     replyCount:
//       message.replyCount || 0,

//     sender: normalizeUser(
//       message.senderId
//     ),

//     forwardedFrom:
//       message.forwardedFrom
//         ? {
//             messageId:
//               message.forwardedFrom
//                 .messageId,

//             conversationId:
//               message.forwardedFrom
//                 .conversationId,

//             sender:
//               normalizeUser(
//                 message.forwardedFrom
//                   .senderId
//               ),
//           }
//         : null,

//     replyTo:
//       message.replyTo
//         ? {
//             id:
//               message.replyTo._id,

//             text:
//               message.replyTo
//                 .deletedForEveryone
//                 ? ""
//                 : message.replyTo.text ||
//                   "",

//             createdAt:
//               message.replyTo.createdAt,

//             sender:
//               normalizeUser(
//                 message.replyTo.senderId
//               ),

//             deletedForEveryone:
//               Boolean(
//                 message.replyTo
//                   .deletedForEveryone
//               ),

//             deletedAt:
//               message.replyTo.deletedAt ||
//               null,
//           }
//         : null,
//   };
// };

// /* =====================================================
//    GET COMMUNICATION USERS
// ===================================================== */

// const getCommunicationUsers = async (
//   currentUserId,
//   search = ""
// ) => {
//   const query = {
//     _id: {
//       $ne: currentUserId,
//     },
//   };

//   if (search.trim()) {
//     const escapedSearch = search
//       .trim()
//       .replace(
//         /[.*+?^${}()|[\]\\]/g,
//         "\\$&"
//       );

//     query.$or = [
//       {
//         name: {
//           $regex: escapedSearch,
//           $options: "i",
//         },
//       },
//       {
//         email: {
//           $regex: escapedSearch,
//           $options: "i",
//         },
//       },
//     ];
//   }

//   const users = await User.find(query)
//     .select("_id name email role")
//     .sort({ name: 1 })
//     .limit(50)
//     .lean();

//   return users.map(normalizeUser);
// };

// /* =====================================================
//    VERIFY USER
// ===================================================== */

// const findUserById = async (userId) => {
//   if (!isValidObjectId(userId)) {
//     throw createServiceError(
//       "Invalid user ID"
//     );
//   }

//   const user = await User.findById(userId)
//     .select("_id name email role")
//     .lean();

//   if (!user) {
//     throw createServiceError(
//       "User not found",
//       404
//     );
//   }

//   return user;
// };

// /* =====================================================
//    GET PARTICIPANT
// ===================================================== */

// const getParticipant = async (
//   conversationId,
//   userId
// ) => {
//   return ConversationParticipant.findOne({
//     conversationId,
//     userId,
//   });
// };

// /* =====================================================
//    REQUIRE PARTICIPANT
// ===================================================== */

// const requireParticipant = async (
//   conversationId,
//   userId
// ) => {
//   const participant =
//     await ConversationParticipant.findOne({
//       conversationId,
//       userId,
//       deletedAt: null,
//     });

//   if (!participant) {
//     throw createServiceError(
//       "You are not an active participant in this conversation",
//       403
//     );
//   }

//   return participant;
// };

// /* =====================================================
//    GET USER CONVERSATIONS
// ===================================================== */

// const getConversations = async (userId) => {
//   const participants =
//     await ConversationParticipant.find({
//       userId,
//       deletedAt: null,
//     })
//       .populate({
//         path: "conversationId",
//       })
//       .sort({
//         updatedAt: -1,
//       })
//       .lean();

//   const conversations = [];

//   for (const participant of participants) {
//     const conversation =
//       participant.conversationId;

//     if (!conversation) {
//       continue;
//     }

//     const lastVisibleMessage =
//       await Message.findOne({
//         conversationId:
//           conversation._id,

//         deletedFor: {
//           $ne: userId,
//         },
//       })
//         .populate({
//           path: "senderId",
//           select:
//             "_id name email role",
//         })
//         .populate({
//           path: "forwardedFrom.senderId",
//           select:
//             "_id name email role",
//         })
//         .sort({
//           createdAt: -1,
//         })
//         .lean();

//     const conversationParticipants =
//       await ConversationParticipant.find({
//         conversationId:
//           conversation._id,
//       })
//         .populate(
//           "userId",
//           "_id name email role"
//         )
//         .lean();

//     let lastMessage = null;

//     if (lastVisibleMessage) {
//       const normalized =
//         normalizeMessage(
//           lastVisibleMessage
//         );

//       lastMessage = {
//         ...normalized,

//         text:
//           lastVisibleMessage
//             .deletedForEveryone
//             ? "This message was deleted"
//             : normalized.text,
//       };
//     }

//     conversations.push({
//       id: conversation._id,

//       type:
//         conversation.type,

//       name:
//         conversation.name,

//       createdBy:
//         conversation.createdBy,

//       createdAt:
//         conversation.createdAt,

//       updatedAt:
//         conversation.updatedAt,

//       lastMessageAt:
//         lastVisibleMessage?.createdAt ||
//         null,

//       lastMessage,

//       participants:
//         conversationParticipants
//           .filter(
//             (item) => item.userId
//           )
//           .map((item) => ({
//             id: item.userId._id,
//             name: item.userId.name,
//             email: item.userId.email,
//             role: item.userId.role,

//             participantRole:
//               item.role,

//             joinedAt:
//               item.joinedAt,

//             lastReadAt:
//               item.lastReadAt,
//           })),

//       currentUserParticipant: {
//         role:
//           participant.role,

//         joinedAt:
//           participant.joinedAt,

//         lastReadAt:
//           participant.lastReadAt,
//       },
//     });
//   }

//   return conversations;
// };

// /* =====================================================
//    GET CONVERSATION
// ===================================================== */

// const getConversation = async (
//   conversationId,
//   userId
// ) => {
//   if (!isValidObjectId(conversationId)) {
//     throw createServiceError(
//       "Invalid conversation ID"
//     );
//   }

//   await requireParticipant(
//     conversationId,
//     userId
//   );

//   const conversation =
//     await Conversation.findById(
//       conversationId
//     ).lean();

//   if (!conversation) {
//     throw createServiceError(
//       "Conversation not found",
//       404
//     );
//   }

//   const participants =
//     await ConversationParticipant.find({
//       conversationId,
//     })
//       .populate(
//         "userId",
//         "_id name email role"
//       )
//       .lean();

//   return {
//     id: conversation._id,

//     type:
//       conversation.type,

//     name:
//       conversation.name,

//     createdBy:
//       conversation.createdBy,

//     createdAt:
//       conversation.createdAt,

//     updatedAt:
//       conversation.updatedAt,

//     lastMessageAt:
//       conversation.lastMessageAt,

//     participants:
//       participants
//         .filter(
//           (item) => item.userId
//         )
//         .map((item) => ({
//           id: item.userId._id,
//           name: item.userId.name,
//           email: item.userId.email,
//           role: item.userId.role,

//           participantRole:
//             item.role,

//           joinedAt:
//             item.joinedAt,

//           lastReadAt:
//             item.lastReadAt,
//         })),
//   };
// };

// /* =====================================================
//    DELETE CONVERSATION FOR ME
// ===================================================== */

// const deleteConversationForMe = async (
//   conversationId,
//   userId
// ) => {
//   if (!isValidObjectId(conversationId)) {
//     throw createServiceError(
//       "Invalid conversation ID"
//     );
//   }

//   const participant =
//     await ConversationParticipant.findOne({
//       conversationId,
//       userId,
//     });

//   if (!participant) {
//     throw createServiceError(
//       "You are not a participant in this conversation",
//       403
//     );
//   }

//   participant.deletedAt =
//     new Date();

//   await participant.save();

//   return {
//     conversationId,
//     deletedAt:
//       participant.deletedAt,
//   };
// };

// /* =====================================================
//    GET MESSAGES
// ===================================================== */

// const getMessages = async (
//   conversationId,
//   userId,
//   options = {}
// ) => {
//   await requireParticipant(
//     conversationId,
//     userId
//   );

//   const limit = Math.min(
//     Number(options.limit) || 50,
//     100
//   );

//   const search =
//     typeof options.search === "string"
//       ? options.search.trim()
//       : "";

//   const query = {
//     conversationId,

//     deletedFor: {
//       $ne: userId,
//     },
//   };

//   /*
//    * MESSAGE SEARCH
//    *
//    * Search only visible message text.
//    *
//    * deletedForEveryone messages are explicitly
//    * excluded so their original text can never
//    * appear in search results.
//    */
//   if (search) {
//     const escapedSearch = search.replace(
//       /[.*+?^${}()|[\]\\]/g,
//       "\\$&"
//     );

//     query.deletedForEveryone = {
//       $ne: true,
//     };

//     query.text = {
//       $regex: escapedSearch,
//       $options: "i",
//     };
//   }

//   /*
//    * PAGINATION
//    *
//    * Existing behavior is preserved.
//    */
//   if (
//     options.before &&
//     isValidObjectId(options.before)
//   ) {
//     const referenceMessage =
//       await Message.findById(
//         options.before
//       )
//         .select("createdAt")
//         .lean();

//     if (referenceMessage) {
//       query.createdAt = {
//         $lt:
//           referenceMessage.createdAt,
//       };
//     }
//   }

//   const messages =
//     await Message.find(query)
//       .populate(
//         "senderId",
//         "_id name email role"
//       )
//       .populate({
//         path: "replyTo",
//         populate: {
//           path: "senderId",
//           select:
//             "_id name email role",
//         },
//       })
//       .populate({
//         path:
//           "forwardedFrom.senderId",
//         select:
//           "_id name email role",
//       })
//       .sort({
//         createdAt: -1,
//       })
//       .limit(limit)
//       .lean();

//   /*
//    * REPLY COUNTS
//    */
//   const messageIds =
//     messages.map(
//       (message) => message._id
//     );

//   let replyCountMap =
//     new Map();

//   if (messageIds.length > 0) {
//     const replyCounts =
//       await Message.aggregate([
//         {
//           $match: {
//             replyTo: {
//               $in: messageIds,
//             },

//             deletedFor: {
//               $ne: userId,
//             },
//           },
//         },

//         {
//           $group: {
//             _id: "$replyTo",

//             count: {
//               $sum: 1,
//             },
//           },
//         },
//       ]);

//     replyCountMap =
//       new Map(
//         replyCounts.map(
//           (item) => [
//             String(item._id),
//             item.count,
//           ]
//         )
//       );
//   }

//   /*
//    * Existing API returns messages
//    * oldest → newest.
//    */
//   return messages
//     .reverse()
//     .map((message) => ({
//       ...normalizeMessage(
//         message
//       ),

//       replyCount:
//         replyCountMap.get(
//           String(message._id)
//         ) || 0,
//     }));
// };

// /* =====================================================
//    FIND OR CREATE DIRECT CONVERSATION
// ===================================================== */

// const createDirectConversation = async (
//   currentUserId,
//   targetUserId
// ) => {
//   if (
//     !isValidObjectId(targetUserId)
//   ) {
//     throw createServiceError(
//       "Invalid target user ID"
//     );
//   }

//   if (
//     String(currentUserId) ===
//     String(targetUserId)
//   ) {
//     throw createServiceError(
//       "You cannot create a conversation with yourself"
//     );
//   }

//   const targetUser =
//     await findUserById(
//       targetUserId
//     );

//   /*
//    * Find ALL conversations where the
//    * current user is a participant.
//    */
//   const currentParticipations =
//     await ConversationParticipant.find({
//       userId: currentUserId,
//     }).select("conversationId");

//   const conversationIds =
//     currentParticipations.map(
//       (item) =>
//         item.conversationId
//     );

//   let conversation = null;

//   /*
//    * Look specifically for an existing
//    * DIRECT conversation containing
//    * both users.
//    *
//    * We do NOT simply pick one shared
//    * participation because the two users
//    * may also belong to groups together.
//    */
//   if (conversationIds.length) {
//     const directConversations =
//       await Conversation.find({
//         _id: {
//           $in: conversationIds,
//         },
//         type: "direct",
//       })
//         .select("_id")
//         .lean();

//     if (directConversations.length) {
//       const directConversationIds =
//         directConversations.map(
//           (item) => item._id
//         );

//       /*
//        * Find a conversation where the
//        * target user is also a participant.
//        */
//       const targetParticipation =
//         await ConversationParticipant.findOne({
//           userId: targetUserId,
//           conversationId: {
//             $in: directConversationIds,
//           },
//         }).lean();

//       if (targetParticipation) {
//         /*
//          * Extra safety:
//          *
//          * A valid direct conversation must
//          * contain exactly two participants.
//          */
//         const participantCount =
//           await ConversationParticipant.countDocuments({
//             conversationId:
//               targetParticipation.conversationId,
//           });

//         if (participantCount === 2) {
//           conversation =
//             await Conversation.findById(
//               targetParticipation.conversationId
//             ).lean();

//           if (conversation) {
//             await ConversationParticipant.updateMany(
//               {
//                 conversationId:
//                   conversation._id,
//                 userId: {
//                   $in: [
//                     currentUserId,
//                     targetUserId,
//                   ],
//                 },
//               },
//               {
//                 $set: {
//                   deletedAt: null,
//                 },
//               }
//             );
//           }
//         }
//       }
//     }
//   }

//   /*
//    * No existing direct conversation found.
//    *
//    * Create a new one.
//    */
//   if (!conversation) {
//     conversation =
//       await Conversation.create({
//         type: "direct",
//         name: "",
//         createdBy:
//           currentUserId,
//       });

//     await ConversationParticipant.insertMany([
//       {
//         conversationId:
//           conversation._id,
//         userId:
//           currentUserId,
//         role: "member",
//       },
//       {
//         conversationId:
//           conversation._id,
//         userId:
//           targetUser._id,
//         role: "member",
//       },
//     ]);
//   }

//   /*
//    * Return the complete normalized
//    * conversation exactly like the
//    * existing flow.
//    */
//   return getConversation(
//     conversation._id,
//     currentUserId
//   );
// };

// /* =====================================================
//    CREATE GROUP
// ===================================================== */

// const createGroupConversation =
//   async (
//     currentUserId,
//     {
//       name,
//       participantIds = [],
//     }
//   ) => {
//     // Only admin and manager can create groups
//     const currentUser =
//       await User.findById(currentUserId)
//         .select("_id role")
//         .lean();

//     if (!currentUser) {
//       throw createServiceError(
//         "Current user not found",
//         404
//       );
//     }

//     const currentUserRole =
//       String(
//         currentUser.role || ""
//       ).toLowerCase();

//     if (
//       currentUserRole !== "admin" &&
//       currentUserRole !== "manager"
//     ) {
//       throw createServiceError(
//         "Staff members cannot create group conversations",
//         403
//       );
//     }

//     const trimmedName =
//       name?.trim();

//     // ...existing code continues...
//     if (!trimmedName) {
//       throw createServiceError(
//         "Group name is required"
//       );
//     }

//     if (trimmedName.length > 100) {
//       throw createServiceError(
//         "Group name cannot exceed 100 characters"
//       );
//     }

//     if (!Array.isArray(participantIds)) {
//       throw createServiceError(
//         "Participant IDs must be an array"
//       );
//     }

//     const uniqueParticipantIds = [
//       currentUserId,
//       ...participantIds,
//     ].map(String);

//     const uniqueIds = [
//       ...new Set(
//         uniqueParticipantIds
//       ),
//     ];

//     for (const id of uniqueIds) {
//       if (!isValidObjectId(id)) {
//         throw createServiceError(
//           "One or more participant IDs are invalid"
//         );
//       }
//     }

//     const users =
//       await User.find({
//         _id: {
//           $in: uniqueIds,
//         },
//       })
//         .select(
//           "_id name email role"
//         )
//         .lean();

//     if (
//       users.length !==
//       uniqueIds.length
//     ) {
//       throw createServiceError(
//         "One or more participants were not found"
//       );
//     }

//     if (uniqueIds.length < 3) {
//       throw createServiceError(
//         "A group conversation requires at least three participants"
//       );
//     }

//     const conversation =
//       await Conversation.create({
//         type: "group",
//         name: trimmedName,
//         createdBy:
//           currentUserId,
//       });

//     await ConversationParticipant.insertMany(
//       uniqueIds.map((id) => ({
//         conversationId:
//           conversation._id,

//         userId: id,

//         role:
//           String(id) ===
//           String(currentUserId)
//             ? "admin"
//             : "member",
//       }))
//     );

//     return getConversation(
//       conversation._id,
//       currentUserId
//     );
//   };

// /* ===================================================== */
// /* =====================================================
//    ADD MEMBERS TO GROUP
// ===================================================== */

// const addGroupMembers = async (
//   conversationId,
//   currentUserId,
//   memberIds = []
// ) => {
//   if (!isValidObjectId(conversationId)) {
//     throw createServiceError(
//       "Invalid conversation ID"
//     );
//   }

//   if (!Array.isArray(memberIds)) {
//     throw createServiceError(
//       "Member IDs must be an array"
//     );
//   }

//   if (memberIds.length === 0) {
//     throw createServiceError(
//       "At least one member is required"
//     );
//   }

//   const conversation =
//     await Conversation.findById(
//       conversationId
//     );

//   if (!conversation) {
//     throw createServiceError(
//       "Conversation not found",
//       404
//     );
//   }

//   if (conversation.type !== "group") {
//     throw createServiceError(
//       "Members can only be added to group conversations"
//     );
//   }

//   const currentParticipant =
//     await ConversationParticipant.findOne({
//       conversationId,
//       userId: currentUserId,
//       deletedAt: null,
//     });

//   if (!currentParticipant) {
//     throw createServiceError(
//       "You are not an active member of this group",
//       403
//     );
//   }

//   if (currentParticipant.role !== "admin") {
//     throw createServiceError(
//       "Only group admins can add members",
//       403
//     );
//   }

//   const uniqueIds = [
//     ...new Set(
//       memberIds.map(String)
//     ),
//   ];

//   for (const id of uniqueIds) {
//     if (!isValidObjectId(id)) {
//       throw createServiceError(
//         "One or more member IDs are invalid"
//       );
//     }
//   }

//   const users = await User.find({
//     _id: {
//       $in: uniqueIds,
//     },
//   })
//     .select("_id name email role")
//     .lean();

//   if (users.length !== uniqueIds.length) {
//     throw createServiceError(
//       "One or more users were not found"
//     );
//   }

//   /*
//    * Check existing participant records.
//    */
//   const existingParticipants =
//     await ConversationParticipant.find({
//       conversationId,
//       userId: {
//         $in: uniqueIds,
//       },
//     });

//   const existingMap = new Map(
//     existingParticipants.map(
//       (participant) => [
//         String(participant.userId),
//         participant,
//       ]
//     )
//   );

//   const addedUsers = [];
//   const restoredUsers = [];

//   for (const userId of uniqueIds) {
//     const existing =
//       existingMap.get(String(userId));

//     if (existing) {
//       /*
//        * User previously left the group.
//        * Restore their membership instead of
//        * creating a duplicate participant.
//        */
//       if (existing.deletedAt) {
//         existing.deletedAt = null;
//         existing.joinedAt = new Date();
//         existing.lastReadAt = null;

//         await existing.save();

//         restoredUsers.push(userId);
//       }

//       /*
//        * Already active -> do nothing.
//        */
//       continue;
//     }

//     await ConversationParticipant.create({
//       conversationId,
//       userId,
//       role: "member",
//     });

//     addedUsers.push(userId);
//   }

//   /*
//    * Return the complete updated conversation.
//    */
//   const updatedConversation =
//     await getConversation(
//       conversationId,
//       currentUserId
//     );

//   return {
//     conversation: updatedConversation,
//     addedUserIds: addedUsers,
//     restoredUserIds: restoredUsers,
//   };
// };


// /* =====================================================
//    EXIT GROUP
// ===================================================== */

// const exitGroupConversation = async (
//   conversationId,
//   userId
// ) => {
//   if (!isValidObjectId(conversationId)) {
//     throw createServiceError(
//       "Invalid conversation ID"
//     );
//   }

//   const conversation =
//     await Conversation.findById(
//       conversationId
//     );

//   if (!conversation) {
//     throw createServiceError(
//       "Conversation not found",
//       404
//     );
//   }

//   if (conversation.type !== "group") {
//     throw createServiceError(
//       "You can only exit a group conversation"
//     );
//   }

//   const participant =
//     await ConversationParticipant.findOne({
//       conversationId,
//       userId,
//       deletedAt: null,
//     });

//   if (!participant) {
//     throw createServiceError(
//       "You are not an active member of this group",
//       403
//     );
//   }

//   /*
//    * If the current user is an admin,
//    * make sure another admin remains.
//    */
//   if (participant.role === "admin") {
//     const otherAdmin =
//       await ConversationParticipant.findOne({
//         conversationId,
//         userId: {
//           $ne: userId,
//         },
//         role: "admin",
//         deletedAt: null,
//       });

//     if (!otherAdmin) {
//       throw createServiceError(
//         "You are the only group admin. Promote another member to admin before leaving.",
//         400
//       );
//     }
//   }

//   participant.deletedAt = new Date();

//   await participant.save();

//   return {
//     conversationId,
//     userId,
//     exitedAt: participant.deletedAt,
//   };
// };

// /* =====================================================
//    SEND MESSAGE
// ===================================================== */

// const sendMessage = async (
//   conversationId,
//   senderId,
//   {
//     text = "",
//     replyTo = null,
//     files = [],
//     baseUrl,
//   }
// ) => {
//   await requireParticipant(
//     conversationId,
//     senderId
//   );

//   const trimmedText =
//     typeof text === "string"
//       ? text.trim()
//       : "";

//   if (trimmedText.length > 5000) {
//     throw createServiceError(
//       "Message cannot exceed 5000 characters"
//     );
//   }

//   if (
//     replyTo &&
//     !isValidObjectId(replyTo)
//   ) {
//     throw createServiceError(
//       "Invalid reply message ID"
//     );
//   }

//   if (replyTo) {
//     const repliedMessage =
//       await Message.findOne({
//         _id: replyTo,
//         conversationId,
//       }).lean();

//     if (!repliedMessage) {
//       throw createServiceError(
//         "Reply message not found in this conversation"
//       );
//     }
//   }

//   if (
//     !trimmedText &&
//     (!files || files.length === 0)
//   ) {
//     throw createServiceError(
//       "Message must contain text or an attachment"
//     );
//   }

//   const attachments = (
//     files || []
//   ).map((file) => {
//     const isImage =
//       file.mimetype.startsWith(
//         "image/"
//       );

//     return {
//       name:
//         file.originalname,

//       mimeType:
//         file.mimetype,

//       size:
//         file.size,

//       url: `${baseUrl}/uploads/${
//         isImage
//           ? "images"
//           : "documents"
//       }/${file.filename}`,

//       path:
//         file.path,
//     };
//   });

//   let type = "text";

//   if (attachments.length > 0) {
//     const allImages =
//       attachments.every(
//         (attachment) =>
//           attachment.mimeType.startsWith(
//             "image/"
//           )
//       );

//     type = allImages
//       ? "image"
//       : "file";
//   }

//   const message =
//     await Message.create({
//       conversationId,
//       senderId,
//       type,
//       text: trimmedText,
//       attachments,

//       replyTo:
//         replyTo || null,
//     });

//   await Conversation.findByIdAndUpdate(
//     conversationId,
//     {
//       $set: {
//         lastMessage:
//           message._id,

//         lastMessageAt:
//           message.createdAt,
//       },
//     }
//   );

//   const populatedMessage =
//     await Message.findById(
//       message._id
//     )
//       .populate(
//         "senderId",
//         "_id name email role"
//       )
//       .populate({
//         path: "replyTo",

//         populate: {
//           path: "senderId",
//           select:
//             "_id name email role",
//         },
//       })
//       .populate({
//         path:
//           "forwardedFrom.senderId",

//         select:
//           "_id name email role",
//       })
//       .lean();

//   const replyCount =
//     await Message.countDocuments({
//       replyTo: message._id,
//     });

//   return {
//     ...normalizeMessage(
//       populatedMessage
//     ),

//     replyCount,
//   };
// };

// /* =====================================================
//    MARK CONVERSATION AS READ
// ===================================================== */

// const markConversationRead = async (
//   conversationId,
//   userId
// ) => {
//   const participant =
//     await requireParticipant(
//       conversationId,
//       userId
//     );

//   participant.lastReadAt =
//     new Date();

//   await participant.save();

//   return {
//     conversationId,

//     lastReadAt:
//       participant.lastReadAt,
//   };
// };

// /* =====================================================
//    TOGGLE MESSAGE REACTION
// ===================================================== */

// const toggleMessageReaction =
//   async ({
//     messageId,
//     userId,
//     emoji,
//   }) => {
//     if (!isValidObjectId(messageId)) {
//       throw createServiceError(
//         "Invalid message ID"
//       );
//     }

//     if (
//       !emoji ||
//       typeof emoji !== "string"
//     ) {
//       throw createServiceError(
//         "Emoji is required"
//       );
//     }

//     const cleanEmoji =
//       emoji.trim();

//     if (!cleanEmoji) {
//       throw createServiceError(
//         "Emoji is required"
//       );
//     }

//     if (cleanEmoji.length > 20) {
//       throw createServiceError(
//         "Emoji is too long"
//       );
//     }

//     const message =
//       await Message.findById(
//         messageId
//       );

//     if (!message) {
//       throw createServiceError(
//         "Message not found",
//         404
//       );
//     }

//     await requireParticipant(
//       message.conversationId,
//       userId
//     );

//     if (
//       message.deletedForEveryone
//     ) {
//       throw createServiceError(
//         "Cannot react to a deleted message"
//       );
//     }

//     if (
//       !Array.isArray(
//         message.reactions
//       )
//     ) {
//       message.reactions = [];
//     }

//     const currentReaction =
//       message.reactions.find(
//         (reaction) =>
//           reaction.userIds?.some(
//             (id) =>
//               String(id) ===
//               String(userId)
//           )
//       );

//     if (
//       currentReaction?.emoji ===
//       cleanEmoji
//     ) {
//       currentReaction.userIds =
//         currentReaction.userIds.filter(
//           (id) =>
//             String(id) !==
//             String(userId)
//         );

//       if (
//         currentReaction.userIds
//           .length === 0
//       ) {
//         message.reactions =
//           message.reactions.filter(
//             (reaction) =>
//               reaction.emoji !==
//               cleanEmoji
//           );
//       }

//       await message.save();

//       return {
//         id:
//           message._id,

//         conversationId:
//           message.conversationId,

//         reactions:
//           message.reactions,
//       };
//     }

//     if (currentReaction) {
//       currentReaction.userIds =
//         currentReaction.userIds.filter(
//           (id) =>
//             String(id) !==
//             String(userId)
//         );

//       if (
//         currentReaction.userIds
//           .length === 0
//       ) {
//         message.reactions =
//           message.reactions.filter(
//             (reaction) =>
//               reaction.emoji !==
//               currentReaction.emoji
//           );
//       }
//     }

//     const newReaction =
//       message.reactions.find(
//         (reaction) =>
//           reaction.emoji ===
//           cleanEmoji
//       );

//     if (newReaction) {
//       newReaction.userIds.push(
//         userId
//       );
//     } else {
//       message.reactions.push({
//         emoji: cleanEmoji,
//         userIds: [userId],
//       });
//     }

//     await message.save();

//     return {
//       id:
//         message._id,

//       conversationId:
//         message.conversationId,

//       reactions:
//         message.reactions,
//     };
//   };

// /* =====================================================
//    DELETE MESSAGE FOR ME
// ===================================================== */

// const deleteMessageForMe = async ({
//   messageId,
//   userId,
// }) => {
//   if (!isValidObjectId(messageId)) {
//     throw createServiceError(
//       "Invalid message ID"
//     );
//   }

//   const message =
//     await Message.findById(
//       messageId
//     );

//   if (!message) {
//     throw createServiceError(
//       "Message not found",
//       404
//     );
//   }

//   await requireParticipant(
//     message.conversationId,
//     userId
//   );

//   if (
//     !Array.isArray(
//       message.deletedFor
//     )
//   ) {
//     message.deletedFor = [];
//   }

//   const alreadyDeleted =
//     message.deletedFor.some(
//       (id) =>
//         String(id) ===
//         String(userId)
//     );

//   if (!alreadyDeleted) {
//     message.deletedFor.push(
//       userId
//     );

//     await message.save();
//   }

//   return {
//     id:
//       message._id,

//     conversationId:
//       message.conversationId,
//   };
// };

// /* =====================================================
//    DELETE MESSAGE FOR EVERYONE
// ===================================================== */

// const deleteMessageForEveryone =
//   async ({
//     messageId,
//     userId,
//   }) => {
//     if (!isValidObjectId(messageId)) {
//       throw createServiceError(
//         "Invalid message ID"
//       );
//     }

//     const message =
//       await Message.findById(
//         messageId
//       );

//     if (!message) {
//       throw createServiceError(
//         "Message not found",
//         404
//       );
//     }

//     await requireParticipant(
//       message.conversationId,
//       userId
//     );

//     if (
//       String(message.senderId) !==
//       String(userId)
//     ) {
//       throw createServiceError(
//         "You can only delete your own messages for everyone",
//         403
//       );
//     }

//     if (
//       !message.deletedForEveryone
//     ) {
//       message.deletedForEveryone =
//         true;

//       message.deletedAt =
//         new Date();

//       await message.save();
//     }

//     return {
//       id:
//         message._id,

//       conversationId:
//         message.conversationId,

//       deletedForEveryone:
//         message.deletedForEveryone,

//       deletedAt:
//         message.deletedAt,
//     };
//   };

// /* =====================================================
//    BULK DELETE MESSAGE FOR ME
// ===================================================== */

// const deleteMessagesForMe =
//   async ({
//     messageIds,
//     userId,
//   }) => {
//     if (
//       !Array.isArray(messageIds) ||
//       messageIds.length === 0
//     ) {
//       throw createServiceError(
//         "At least one message ID is required"
//       );
//     }

//     const uniqueMessageIds = [
//       ...new Set(
//         messageIds.map(String)
//       ),
//     ];

//     if (
//       uniqueMessageIds.length >
//       100
//     ) {
//       throw createServiceError(
//         "You can delete up to 100 messages at once"
//       );
//     }

//     for (const messageId of
//       uniqueMessageIds) {
//       if (
//         !isValidObjectId(
//           messageId
//         )
//       ) {
//         throw createServiceError(
//           `Invalid message ID: ${messageId}`
//         );
//       }
//     }

//     const messages =
//       await Message.find({
//         _id: {
//           $in: uniqueMessageIds,
//         },
//       }).lean();

//     if (
//       messages.length !==
//       uniqueMessageIds.length
//     ) {
//       throw createServiceError(
//         "One or more messages were not found",
//         404
//       );
//     }

//     const conversationIds = [
//       ...new Set(
//         messages.map(
//           (message) =>
//             String(
//               message.conversationId
//             )
//         )
//       ),
//     ];

//     for (const conversationId of
//       conversationIds) {
//       await requireParticipant(
//         conversationId,
//         userId
//       );
//     }

//     const updateResult =
//       await Message.updateMany(
//         {
//           _id: {
//             $in: uniqueMessageIds,
//           },

//           deletedFor: {
//             $ne: userId,
//           },
//         },

//         {
//           $addToSet: {
//             deletedFor: userId,
//           },
//         }
//       );

//     return {
//       messageIds:
//         uniqueMessageIds,

//       conversationIds,

//       modifiedCount:
//         updateResult.modifiedCount ||
//         0,
//     };
//   };

// /* =====================================================
//    GET CONVERSATION LAST MESSAGE
// ===================================================== */

// const getConversationLastMessage =
//   async (conversationId) => {
//     const message =
//       await Message.findOne({
//         conversationId,
//       })
//         .populate(
//           "senderId",
//           "_id name email role"
//         )
//         .populate({
//           path:
//             "forwardedFrom.senderId",

//           select:
//             "_id name email role",
//         })
//         .sort({
//           createdAt: -1,
//         })
//         .lean();

//     if (!message) {
//       return null;
//     }

//     const normalized =
//       normalizeMessage(message);

//     if (
//       message.deletedForEveryone
//     ) {
//       normalized.text =
//         "This message was deleted";
//     }

//     return normalized;
//   };

// /* =====================================================
//    BULK DELETE MESSAGE FOR EVERYONE
// ===================================================== */

// const deleteMessagesForEveryone =
//   async ({
//     messageIds,
//     userId,
//   }) => {
//     if (
//       !Array.isArray(messageIds) ||
//       messageIds.length === 0
//     ) {
//       throw createServiceError(
//         "At least one message ID is required"
//       );
//     }

//     const uniqueMessageIds = [
//       ...new Set(
//         messageIds.map(String)
//       ),
//     ];

//     if (
//       uniqueMessageIds.length >
//       100
//     ) {
//       throw createServiceError(
//         "You can delete up to 100 messages at once"
//       );
//     }

//     for (const messageId of
//       uniqueMessageIds) {
//       if (
//         !isValidObjectId(
//           messageId
//         )
//       ) {
//         throw createServiceError(
//           `Invalid message ID: ${messageId}`
//         );
//       }
//     }

//     const messages =
//       await Message.find({
//         _id: {
//           $in: uniqueMessageIds,
//         },
//       }).lean();

//     if (
//       messages.length !==
//       uniqueMessageIds.length
//     ) {
//       throw createServiceError(
//         "One or more messages were not found",
//         404
//       );
//     }

//     const conversationIds = [
//       ...new Set(
//         messages.map(
//           (message) =>
//             String(
//               message.conversationId
//             )
//         )
//       ),
//     ];

//     for (const conversationId of
//       conversationIds) {
//       await requireParticipant(
//         conversationId,
//         userId
//       );
//     }

//     const unauthorizedMessage =
//       messages.find(
//         (message) =>
//           String(message.senderId) !==
//           String(userId)
//       );

//     if (unauthorizedMessage) {
//       throw createServiceError(
//         "You can only delete your own messages for everyone",
//         403
//       );
//     }

//     const now = new Date();

//     await Message.updateMany(
//       {
//         _id: {
//           $in: uniqueMessageIds,
//         },

//         senderId: userId,

//         deletedForEveryone: {
//           $ne: true,
//         },
//       },

//       {
//         $set: {
//           deletedForEveryone:
//             true,

//           deletedAt: now,
//         },
//       }
//     );

//     const conversationUpdates =
//       [];

//     for (const conversationId of
//       conversationIds) {
//       const lastMessage =
//         await getConversationLastMessage(
//           conversationId
//         );

//       conversationUpdates.push({
//         conversationId,
//         lastMessage,
//       });

//       if (lastMessage) {
//         await Conversation.findByIdAndUpdate(
//           conversationId,
//           {
//             $set: {
//               lastMessage:
//                 lastMessage.id,

//               lastMessageAt:
//                 lastMessage.createdAt,
//             },
//           }
//         );
//       } else {
//         await Conversation.findByIdAndUpdate(
//           conversationId,
//           {
//             $set: {
//               lastMessage: null,
//               lastMessageAt: null,
//             },
//           }
//         );
//       }
//     }

//     return {
//       messageIds:
//         uniqueMessageIds,

//       conversationIds,

//       deletedAt: now,

//       conversationUpdates,
//     };
//   };

// /* =====================================================
//    FORWARD MESSAGES
// ===================================================== */

// const forwardMessages = async ({
//   messageIds,
//   conversationIds,
//   userId,
// }) => {
//   if (
//     !Array.isArray(messageIds) ||
//     messageIds.length === 0
//   ) {
//     throw createServiceError(
//       "At least one message ID is required"
//     );
//   }

//   if (
//     !Array.isArray(conversationIds) ||
//     conversationIds.length === 0
//   ) {
//     throw createServiceError(
//       "At least one destination conversation is required"
//     );
//   }

//   const uniqueMessageIds = [
//     ...new Set(
//       messageIds.map(String)
//     ),
//   ];

//   const uniqueConversationIds = [
//     ...new Set(
//       conversationIds.map(String)
//     ),
//   ];

//   if (
//     uniqueMessageIds.length >
//     100
//   ) {
//     throw createServiceError(
//       "You can forward up to 100 messages at once"
//     );
//   }

//   if (
//     uniqueConversationIds.length >
//     50
//   ) {
//     throw createServiceError(
//       "You can forward to up to 50 conversations at once"
//     );
//   }

//   for (const messageId of
//     uniqueMessageIds) {
//     if (
//       !isValidObjectId(
//         messageId
//       )
//     ) {
//       throw createServiceError(
//         `Invalid message ID: ${messageId}`
//       );
//     }
//   }

//   for (const conversationId of
//     uniqueConversationIds) {
//     if (
//       !isValidObjectId(
//         conversationId
//       )
//     ) {
//       throw createServiceError(
//         `Invalid conversation ID: ${conversationId}`
//       );
//     }
//   }

//   const sourceMessages =
//     await Message.find({
//       _id: {
//         $in: uniqueMessageIds,
//       },

//       deletedFor: {
//         $ne: userId,
//       },
//     })
//       .populate(
//         "senderId",
//         "_id name email role"
//       )
//       .sort({
//         createdAt: 1,
//       })
//       .lean();

//   if (
//     sourceMessages.length !==
//     uniqueMessageIds.length
//   ) {
//     throw createServiceError(
//       "One or more selected messages are unavailable"
//     );
//   }

//   const deletedMessage =
//     sourceMessages.find(
//       (message) =>
//         message.deletedForEveryone
//     );

//   if (deletedMessage) {
//     throw createServiceError(
//       "Deleted messages cannot be forwarded"
//     );
//   }

//   const sourceConversationIds = [
//     ...new Set(
//       sourceMessages.map(
//         (message) =>
//           String(
//             message.conversationId
//           )
//       )
//     ),
//   ];

//   for (const conversationId of
//     sourceConversationIds) {
//     await requireParticipant(
//       conversationId,
//       userId
//     );
//   }

//   for (const conversationId of
//     uniqueConversationIds) {
//     await requireParticipant(
//       conversationId,
//       userId
//     );
//   }

//   const createdMessages = [];
//   const conversationResults = [];

//   for (const conversationId of
//     uniqueConversationIds) {
//     const destinationMessages = [];

//     for (const sourceMessage of
//       sourceMessages) {
//       const sourceSenderId =
//         sourceMessage.senderId?._id ||
//         sourceMessage.senderId;

//       const forwardedMessage =
//         await Message.create({
//           conversationId,

//           senderId:
//             userId,

//           type:
//             sourceMessage.type,

//           text:
//             sourceMessage.text || "",

//           attachments:
//             sourceMessage.attachments ||
//             [],

//           replyTo: null,

//           reactions: [],

//           deletedFor: [],

//           deletedForEveryone:
//             false,

//           deletedAt: null,

//           forwardedFrom: {
//             messageId:
//               sourceMessage._id,

//             conversationId:
//               sourceMessage.conversationId,

//             senderId:
//               sourceSenderId,
//           },
//         });

//       destinationMessages.push(
//         forwardedMessage
//       );
//     }

//     const lastCreatedMessage =
//       destinationMessages[
//         destinationMessages.length - 1
//       ];

//     if (lastCreatedMessage) {
//       await Conversation.findByIdAndUpdate(
//         conversationId,
//         {
//           $set: {
//             lastMessage:
//               lastCreatedMessage._id,

//             lastMessageAt:
//               lastCreatedMessage.createdAt,
//           },
//         }
//       );
//     }

//     const createdMessageIds =
//       destinationMessages.map(
//         (message) =>
//           message._id
//       );

//     const populatedMessages =
//       await Message.find({
//         _id: {
//           $in:
//             createdMessageIds,
//         },
//       })
//         .populate(
//           "senderId",
//           "_id name email role"
//         )
//         .populate({
//           path:
//             "forwardedFrom.senderId",

//           select:
//             "_id name email role",
//         })
//         .sort({
//           createdAt: 1,
//         })
//         .lean();

//     const normalizedMessages =
//       populatedMessages.map(
//         (message) =>
//           normalizeMessage(
//             message
//           )
//       );

//     createdMessages.push(
//       ...normalizedMessages
//     );

//     conversationResults.push({
//       conversationId,

//       messages:
//         normalizedMessages,

//       lastMessage:
//         normalizedMessages[
//           normalizedMessages.length - 1
//         ] || null,
//     });
//   }

//   return {
//     messages:
//       createdMessages,

//     conversations:
//       conversationResults,
//   };
// };

// /* =====================================================
//    GET MESSAGE THREAD
// ===================================================== */

// const getMessageThread = async (
//   conversationId,
//   messageId,
//   userId
// ) => {
//   await requireParticipant(
//     conversationId,
//     userId
//   );

//   if (!isValidObjectId(messageId)) {
//     throw createServiceError(
//       "Invalid message ID"
//     );
//   }

//   const parentMessage =
//     await Message.findOne({
//       _id: messageId,
//       conversationId,
//     })
//       .populate(
//         "senderId",
//         "_id name email role"
//       )
//       .populate({
//         path:
//           "forwardedFrom.senderId",

//         select:
//           "_id name email role",
//       })
//       .lean();

//   if (!parentMessage) {
//     throw createServiceError(
//       "Message not found",
//       404
//     );
//   }

//   const replies =
//     await Message.find({
//       conversationId,

//       replyTo: messageId,

//       deletedFor: {
//         $ne: userId,
//       },
//     })
//       .populate(
//         "senderId",
//         "_id name email role"
//       )
//       .populate({
//         path:
//           "forwardedFrom.senderId",

//         select:
//           "_id name email role",
//       })
//       .sort({
//         createdAt: 1,
//       })
//       .lean();

//   return {
//     parent:
//       normalizeMessage(
//         parentMessage,
//         {
//           includeDeletedContent:
//             false,
//         }
//       ),

//     replies:
//       replies.map(
//         (message) =>
//           normalizeMessage(
//             message
//           )
//       ),
//   };
// };

// /* =====================================================
//    EXPORT
// ===================================================== */

// module.exports = {
//   getCommunicationUsers,
//   getConversations,
//   getConversation,
//   deleteConversationForMe,
//   getMessages,
//   getMessageThread,
//   createDirectConversation,
//   createGroupConversation,

//   addGroupMembers,
//   exitGroupConversation,
//   sendMessage,
//   markConversationRead,
//   toggleMessageReaction,
//   deleteMessageForMe,
//   deleteMessageForEveryone,
//   deleteMessagesForMe,
//   deleteMessagesForEveryone,
//   forwardMessages,
// };















const mongoose = require("mongoose");

const User = require("../models/User");
const Conversation = require("../models/Conversation");
const ConversationParticipant = require("../models/ConversationParticipant");
const Message = require("../models/Message");

/* =====================================================
   HELPERS
===================================================== */

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getConversationLastMessage = async (conversationId, userId = null) => {
  const query = {
    conversationId,
  };

  if (userId) {
    query.deletedFor = { $ne: userId };
  }

  const lastMessage = await Message.findOne(query)
    .populate({
      path: "senderId",
      select: "_id name email role",
    })
    .populate({
      path: "forwardedFrom.senderId",
      select: "_id name email role",
    })
    .sort({ createdAt: -1 })
    .lean();

  return normalizeMessage(lastMessage);
};

/* =====================================================
   NORMALIZE MESSAGE
===================================================== */

const normalizeMessage = (
  message,
  { includeDeletedContent = false } = {}
) => {
  if (!message) {
    return null;
  }

  const deletedForEveryone = Boolean(message.deletedForEveryone);
  const hideContent = deletedForEveryone && !includeDeletedContent;

  return {
    id: message._id,
    conversationId: message.conversationId,
    type: message.type,
    text: hideContent ? "" : message.text || "",
    attachments: hideContent ? [] : message.attachments || [],
    reactions: hideContent ? [] : message.reactions || [],
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    deletedForEveryone,
    deletedAt: message.deletedAt || null,
    replyCount: message.replyCount || 0,
    sender: normalizeUser(message.senderId),
    forwardedFrom: message.forwardedFrom
      ? {
          messageId: message.forwardedFrom.messageId,
          conversationId: message.forwardedFrom.conversationId,
          sender: normalizeUser(message.forwardedFrom.senderId),
        }
      : null,
    replyTo: message.replyTo
      ? {
          id: message.replyTo._id,
          text: message.replyTo.deletedForEveryone
            ? ""
            : message.replyTo.text || "",
          createdAt: message.replyTo.createdAt,
          sender: normalizeUser(message.replyTo.senderId),
          deletedForEveryone: Boolean(message.replyTo.deletedForEveryone),
          deletedAt: message.replyTo.deletedAt || null,
        }
      : null,
  };
};

/* =====================================================
   GET COMMUNICATION USERS
===================================================== */

const getCommunicationUsers = async (currentUserId, search = "") => {
  const query = {
    _id: {
      $ne: currentUserId,
    },
  };

  if (search.trim()) {
    const escapedSearch = search
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    query.$or = [
      {
        name: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
      {
        email: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
    ];
  }

  const users = await User.find(query)
    .select("_id name email role")
    .sort({ name: 1 })
    .limit(50)
    .lean();

  return users.map(normalizeUser);
};

/* =====================================================
   VERIFY USER
===================================================== */

const findUserById = async (userId) => {
  if (!isValidObjectId(userId)) {
    throw createServiceError("Invalid user ID");
  }

  const user = await User.findById(userId)
    .select("_id name email role")
    .lean();

  if (!user) {
    throw createServiceError("User not found", 404);
  }

  return user;
};

/* =====================================================
   GET PARTICIPANT
===================================================== */

const getParticipant = async (conversationId, userId) => {
  return ConversationParticipant.findOne({
    conversationId,
    userId,
  });
};

/* =====================================================
   REQUIRE PARTICIPANT
===================================================== */

const requireParticipant = async (conversationId, userId) => {
  const participant = await ConversationParticipant.findOne({
    conversationId,
    userId,
    deletedAt: null,
  });

  if (!participant) {
    throw createServiceError(
      "You are not an active participant in this conversation",
      403
    );
  }

  return participant;
};

/* =====================================================
   CONVERSATION CREATION
===================================================== */

const createDirectConversation = async (currentUserId, recipientId) => {
  if (!isValidObjectId(recipientId)) {
    throw createServiceError("Invalid recipient ID");
  }

  if (String(currentUserId) === String(recipientId)) {
    throw createServiceError("Cannot create a conversation with yourself");
  }

  await findUserById(recipientId);

  const existingParticipant = await ConversationParticipant.aggregate([
    {
      $match: {
        userId: { $in: [new mongoose.Types.ObjectId(currentUserId), new mongoose.Types.ObjectId(recipientId)] },
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: "$conversationId",
        count: { $sum: 1 },
      },
    },
    {$match: { count: 2 },
    },
  ]);

  if (existingParticipant.length > 0) {
    const directConv = await Conversation.findOne({
      _id: existingParticipant[0]._id,
      type: "direct",
    });

    if (directConv) {
      return getConversation(directConv._id, currentUserId);
    }
  }

  const conversation = await Conversation.create({
    type: "direct",
    createdBy: currentUserId,
  });

  await ConversationParticipant.create([
    { conversationId: conversation._id, userId: currentUserId, role: "member" },
    { conversationId: conversation._id, userId: recipientId, role: "member" },
  ]);

  return getConversation(conversation._id, currentUserId);
};

const createGroupConversation = async (currentUserId, { name, memberIds = [] }) => {
  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (!trimmedName) {
    throw createServiceError("Group name is required");
  }

  const uniqueMemberIds = [
    ...new Set(
      memberIds
        .map(String)
        .filter((id) => String(id) !== String(currentUserId))
    ),
  ];

  if (uniqueMemberIds.length === 0) {
    throw createServiceError("Group must contain at least one other member");
  }

  for (const id of uniqueMemberIds) {
    if (!isValidObjectId(id)) {
      throw createServiceError("One or more member IDs are invalid");
    }
  }

  const users = await User.find({ _id: { $in: uniqueMemberIds } }).lean();
  if (users.length !== uniqueMemberIds.length) {
    throw createServiceError("One or more users were not found");
  }

  const conversation = await Conversation.create({
    type: "group",
    name: trimmedName,
    createdBy: currentUserId,
  });

  const participantDocs = [
    { conversationId: conversation._id, userId: currentUserId, role: "admin" },
    ...uniqueMemberIds.map((id) => ({
      conversationId: conversation._id,
      userId: id,
      role: "member",
    })),
  ];

  await ConversationParticipant.insertMany(participantDocs);

  return getConversation(conversation._id, currentUserId);
};

/* =====================================================
   GET USER CONVERSATIONS
===================================================== */

const getConversations = async (userId) => {
  const participants = await ConversationParticipant.find({
    userId,
    deletedAt: null,
  })
    .populate({
      path: "conversationId",
    })
    .sort({
      updatedAt: -1,
    })
    .lean();

  const conversations = [];

  for (const participant of participants) {
    const conversation = participant.conversationId;

    if (!conversation) {
      continue;
    }

    const lastVisibleMessage = await Message.findOne({
      conversationId: conversation._id,
      deletedFor: {
        $ne: userId,
      },
    })
      .populate({
        path: "senderId",
        select: "_id name email role",
      })
      .populate({
        path: "forwardedFrom.senderId",
        select: "_id name email role",
      })
      .sort({
        createdAt: -1,
      })
      .lean();

    const conversationParticipants = await ConversationParticipant.find({
      conversationId: conversation._id,
      deletedAt: null,
    })
      .populate("userId", "_id name email role")
      .lean();

    let lastMessage = null;

    if (lastVisibleMessage) {
      const normalized = normalizeMessage(lastVisibleMessage);

      lastMessage = {
        ...normalized,
        text: lastVisibleMessage.deletedForEveryone
          ? "This message was deleted"
          : normalized.text,
      };
    }

    conversations.push({
      id: conversation._id,
      type: conversation.type,
      name: conversation.name,
      createdBy: conversation.createdBy,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      lastMessageAt: lastVisibleMessage?.createdAt || null,
      lastMessage,
      participants: conversationParticipants
        .filter((item) => item.userId)
        .map((item) => ({
          id: item.userId._id,
          name: item.userId.name,
          email: item.userId.email,
          role: item.userId.role,
          participantRole: item.role,
          joinedAt: item.joinedAt,
          lastReadAt: item.lastReadAt,
        })),
      currentUserParticipant: {
        role: participant.role,
        joinedAt: participant.joinedAt,
        lastReadAt: participant.lastReadAt,
      },
    });
  }

  return conversations;
};

/* =====================================================
   GET CONVERSATION
===================================================== */

const getConversation = async (conversationId, userId) => {
  if (!isValidObjectId(conversationId)) {
    throw createServiceError("Invalid conversation ID");
  }

  await requireParticipant(conversationId, userId);

  const conversation = await Conversation.findById(conversationId).lean();

  if (!conversation) {
    throw createServiceError("Conversation not found", 404);
  }

  const participants = await ConversationParticipant.find({
    conversationId,
    deletedAt: null,
  })
    .populate("userId", "_id name email role")
    .lean();

  return {
    id: conversation._id,
    type: conversation.type,
    name: conversation.name,
    createdBy: conversation.createdBy,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    lastMessageAt: conversation.lastMessageAt,
    participants: participants
      .filter((item) => item.userId)
      .map((item) => ({
        id: item.userId._id,
        name: item.userId.name,
        email: item.userId.email,
        role: item.userId.role,
        participantRole: item.role,
        joinedAt: item.joinedAt,
        lastReadAt: item.lastReadAt,
      })),
  };
};

/* =====================================================
   GET MESSAGES
===================================================== */

const getMessages = async (conversationId, userId, { limit = 50, before = null } = {}) => {
  await requireParticipant(conversationId, userId);

  const query = {
    conversationId,
    deletedFor: { $ne: userId },
  };

  if (before && isValidObjectId(before)) {
    const beforeMessage = await Message.findById(before).lean();
    if (beforeMessage) {
      query.createdAt = { $lt: beforeMessage.createdAt };
    }
  }

  const messages = await Message.find(query)
    .populate("senderId", "_id name email role")
    .populate({
      path: "replyTo",
      populate: { path: "senderId", select: "_id name email role" },
    })
    .populate({
      path: "forwardedFrom.senderId",
      select: "_id name email role",
    })
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

  return messages.reverse().map((msg) => normalizeMessage(msg));
};

/* =====================================================
   DELETE CONVERSATION FOR ME
===================================================== */

const deleteConversationForMe = async (conversationId, userId) => {
  await requireParticipant(conversationId, userId);

  const participant = await ConversationParticipant.findOne({
    conversationId,
    userId,
    deletedAt: null,
  });

  if (!participant) {
    throw createServiceError(
      "You are not an active participant in this conversation",
      403
    );
  }

  participant.deletedAt = new Date();
  await participant.save();

  return {
    conversationId,
    userId,
    deletedAt: participant.deletedAt,
  };
};

/* =====================================================
   ADD MEMBERS TO GROUP
===================================================== */

const addGroupMembers = async (conversationId, currentUserId, memberIds = []) => {
  if (!isValidObjectId(conversationId)) {
    throw createServiceError("Invalid conversation ID");
  }

  if (!Array.isArray(memberIds)) {
    throw createServiceError("Member IDs must be an array");
  }

  if (memberIds.length === 0) {
    throw createServiceError("At least one member is required");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw createServiceError("Conversation not found", 404);
  }

  if (conversation.type !== "group") {
    throw createServiceError("Members can only be added to group conversations");
  }

  const currentParticipant = await ConversationParticipant.findOne({
    conversationId,
    userId: currentUserId,
    deletedAt: null,
  });

  if (!currentParticipant) {
    throw createServiceError("You are not an active member of this group", 403);
  }

  if (currentParticipant.role !== "admin") {
    throw createServiceError("Only group admins can add members", 403);
  }

  const uniqueIds = [
    ...new Set(
      memberIds
        .map(String)
        .filter((id) => String(id) !== String(currentUserId))
    ),
  ];

  if (uniqueIds.length === 0) {
    throw createServiceError("You are already a member of this group");
  }

  for (const id of uniqueIds) {
    if (!isValidObjectId(id)) {
      throw createServiceError("One or more member IDs are invalid");
    }
  }

  const users = await User.find({ _id: { $in: uniqueIds } })
    .select("_id name email role")
    .lean();

  if (users.length !== uniqueIds.length) {
    throw createServiceError("One or more users were not found");
  }

  const existingParticipants = await ConversationParticipant.find({
    conversationId,
    userId: { $in: uniqueIds },
  });

  const existingMap = new Map(
    existingParticipants.map((participant) => [
      String(participant.userId),
      participant,
    ])
  );

  const addedUsers = [];
  const restoredUsers = [];

  for (const userId of uniqueIds) {
    const existing = existingMap.get(String(userId));

    if (existing) {
      if (existing.deletedAt) {
        existing.deletedAt = null;
        existing.joinedAt = new Date();
        existing.lastReadAt = null;
        await existing.save();

        restoredUsers.push(userId);
      }
      continue;
    }

    await ConversationParticipant.create({
      conversationId,
      userId,
      role: "member",
    });

    addedUsers.push(userId);
  }

  const updatedConversation = await getConversation(
    conversationId,
    currentUserId
  );

  return {
    conversation: updatedConversation,
    addedUserIds: addedUsers,
    restoredUserIds: restoredUsers,
  };
};

/* =====================================================
   EXIT GROUP
===================================================== */

const exitGroupConversation = async (conversationId, userId) => {
  if (!isValidObjectId(conversationId)) {
    throw createServiceError("Invalid conversation ID");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw createServiceError("Conversation not found", 404);
  }

  if (conversation.type !== "group") {
    throw createServiceError("You can only exit a group conversation");
  }

  const participant = await ConversationParticipant.findOne({
    conversationId,
    userId,
    deletedAt: null,
  });

  if (!participant) {
    throw createServiceError("You are not an active member of this group", 403);
  }

  if (participant.role === "admin") {
    const otherAdmin = await ConversationParticipant.findOne({
      conversationId,
      userId: { $ne: userId },
      role: "admin",
      deletedAt: null,
    });

    if (!otherAdmin) {
      throw createServiceError(
        "You are the only group admin. Promote another member to admin before leaving.",
        400
      );
    }
  }

  participant.deletedAt = new Date();
  await participant.save();

  return {
    conversationId,
    userId,
    exitedAt: participant.deletedAt,
  };
};

/* =====================================================
   SEND MESSAGE
===================================================== */

const sendMessage = async (
  conversationId,
  senderId,
  { text = "", replyTo = null, files = [], baseUrl }
) => {
  await requireParticipant(conversationId, senderId);

  const trimmedText = typeof text === "string" ? text.trim() : "";

  if (trimmedText.length > 5000) {
    throw createServiceError("Message cannot exceed 5000 characters");
  }

  if (replyTo && !isValidObjectId(replyTo)) {
    throw createServiceError("Invalid reply message ID");
  }

  if (replyTo) {
    const repliedMessage = await Message.findOne({
      _id: replyTo,
      conversationId,
    }).lean();

    if (!repliedMessage) {
      throw createServiceError("Reply message not found", 404);
    }
  }

  if (!trimmedText && (!Array.isArray(files) || files.length === 0)) {
    throw createServiceError("Message cannot be empty");
  }

  const attachments = [];

  if (Array.isArray(files)) {
    for (const file of files) {
      if (!file) continue;

      attachments.push({
        name: file.originalname || file.filename || "file",
        url: baseUrl
          ? `${baseUrl}/uploads/${file.filename}`
          : `/uploads/${file.filename}`,
        type: file.mimetype || "application/octet-stream",
        size: file.size || 0,
      });
    }
  }

  const message = await Message.create({
    conversationId,
    senderId,
    type: attachments.length > 0 ? "file" : "text",
    text: trimmedText,
    attachments,
    replyTo: replyTo || null,
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    $set: {
      lastMessage: message._id,
      lastMessageAt: message.createdAt,
    },
  });

  const populatedMessage = await Message.findById(message._id)
    .populate("senderId", "_id name email role")
    .populate({
      path: "replyTo",
      populate: {
        path: "senderId",
        select: "_id name email role",
      },
    })
    .populate({
      path: "forwardedFrom.senderId",
      select: "_id name email role",
    })
    .lean();

  return normalizeMessage(populatedMessage);
};

/* =====================================================
   MARK CONVERSATION READ
===================================================== */

const markConversationRead = async (conversationId, userId) => {
  await requireParticipant(conversationId, userId);

  const lastReadAt = new Date();

  await ConversationParticipant.findOneAndUpdate(
    {
      conversationId,
      userId,
      deletedAt: null,
    },
    {
      $set: { lastReadAt },
    },
    { new: true }
  );

  return {
    conversationId,
    userId,
    lastReadAt,
  };
};

/* =====================================================
   TOGGLE MESSAGE REACTION
===================================================== */

const toggleMessageReaction = async (messageId, userId, reaction) => {
  if (!isValidObjectId(messageId)) {
    throw createServiceError("Invalid message ID");
  }

  const trimmedReaction = typeof reaction === "string" ? reaction.trim() : "";

  if (!trimmedReaction) {
    throw createServiceError("Reaction is required");
  }

  const message = await Message.findById(messageId);

  if (!message) {
    throw createServiceError("Message not found", 404);
  }

  await requireParticipant(message.conversationId, userId);

  if (message.deletedForEveryone) {
    throw createServiceError("Cannot react to a deleted message");
  }

  if (!Array.isArray(message.reactions)) {
    message.reactions = [];
  }

  const existingIndex = message.reactions.findIndex(
    (item) =>
      String(item.userId) === String(userId) &&
      item.reaction === trimmedReaction
  );

  if (existingIndex >= 0) {
    message.reactions.splice(existingIndex, 1);
  } else {
    message.reactions = message.reactions.filter(
      (item) => String(item.userId) !== String(userId)
    );

    message.reactions.push({
      userId,
      reaction: trimmedReaction,
    });
  }

  await message.save();

  const updatedMessage = await Message.findById(message._id)
    .populate("senderId", "_id name email role")
    .populate({
      path: "forwardedFrom.senderId",
      select: "_id name email role",
    })
    .lean();

  return normalizeMessage(updatedMessage);
};

/* =====================================================
   DELETE MESSAGE FOR ME / EVERYONE
===================================================== */

const deleteMessageForMe = async (messageId, userId) => {
  if (!isValidObjectId(messageId)) {
    throw createServiceError("Invalid message ID");
  }

  const message = await Message.findById(messageId);
  if (!message) {
    throw createServiceError("Message not found", 404);
  }

  await requireParticipant(message.conversationId, userId);

  await Message.findByIdAndUpdate(messageId, {
    $addToSet: { deletedFor: userId },
  });

  return { messageId, userId };
};

const deleteMessageForEveryone = async (messageId, userId) => {
  return deleteMessagesForEveryone({ messageIds: [messageId], userId });
};

const deleteMessagesForMe = async ({ messageIds = [], userId }) => {
  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    throw createServiceError("At least one message ID is required");
  }

  for (const id of messageIds) {
    if (!isValidObjectId(id)) {
      throw createServiceError(`Invalid message ID: ${id}`);
    }
  }

  await Message.updateMany(
    { _id: { $in: messageIds } },
    { $addToSet: { deletedFor: userId } }
  );

  return { messageIds, userId };
};

const deleteMessagesForEveryone = async ({ messageIds = [], userId }) => {
  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    throw createServiceError("At least one message ID is required");
  }

  const uniqueMessageIds = [...new Set(messageIds.map(String))];

  for (const id of uniqueMessageIds) {
    if (!isValidObjectId(id)) {
      throw createServiceError(`Invalid message ID: ${id}`);
    }
  }

  const messages = await Message.find({
    _id: { $in: uniqueMessageIds },
  });

  if (messages.length !== uniqueMessageIds.length) {
    throw createServiceError("One or more messages were not found", 404);
  }

  const conversationIds = [
    ...new Set(messages.map((msg) => String(msg.conversationId))),
  ];

  for (const conversationId of conversationIds) {
    await requireParticipant(conversationId, userId);
  }

  const unauthorizedMessage = messages.find(
    (message) => String(message.senderId) !== String(userId)
  );

  if (unauthorizedMessage) {
    throw createServiceError(
      "You can only delete your own messages for everyone",
      403
    );
  }

  const now = new Date();

  await Message.updateMany(
    {
      _id: { $in: uniqueMessageIds },
      senderId: userId,
      deletedForEveryone: { $ne: true },
    },
    {
      $set: {
        deletedForEveryone: true,
        deletedAt: now,
      },
    }
  );

  const conversationUpdates = [];

  for (const conversationId of conversationIds) {
    const lastMessage = await getConversationLastMessage(
      conversationId
    );

    conversationUpdates.push({
      conversationId,
      lastMessage,
    });

    if (lastMessage) {
      await Conversation.findByIdAndUpdate(conversationId, {
        $set: {
          lastMessage: lastMessage.id,
          lastMessageAt: lastMessage.createdAt,
        },
      });
    } else {
      await Conversation.findByIdAndUpdate(conversationId, {
        $set: {
          lastMessage: null,
          lastMessageAt: null,
        },
      });
    }
  }

  return {
    messageIds: uniqueMessageIds,
    conversationIds,
    deletedAt: now,
    conversationUpdates,
  };
};

/* =====================================================
   FORWARD MESSAGES
===================================================== */

const forwardMessages = async ({
  messageIds,
  conversationIds,
  userId,
}) => {
  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    throw createServiceError("At least one message ID is required");
  }

  if (!Array.isArray(conversationIds) || conversationIds.length === 0) {
    throw createServiceError(
      "At least one destination conversation is required"
    );
  }

  const uniqueMessageIds = [...new Set(messageIds.map(String))];
  const uniqueConversationIds = [...new Set(conversationIds.map(String))];

  if (uniqueMessageIds.length > 100) {
    throw createServiceError("You can forward up to 100 messages at once");
  }

  if (uniqueConversationIds.length > 50) {
    throw createServiceError(
      "You can forward to up to 50 conversations at once"
    );
  }

  for (const messageId of uniqueMessageIds) {
    if (!isValidObjectId(messageId)) {
      throw createServiceError(`Invalid message ID: ${messageId}`);
    }
  }

  for (const conversationId of uniqueConversationIds) {
    if (!isValidObjectId(conversationId)) {
      throw createServiceError(`Invalid conversation ID: ${conversationId}`);
    }
  }

  const sourceMessages = await Message.find({
    _id: { $in: uniqueMessageIds },
    deletedFor: { $ne: userId },
  })
    .populate("senderId", "_id name email role")
    .sort({ createdAt: 1 })
    .lean();

  if (sourceMessages.length !== uniqueMessageIds.length) {
    throw createServiceError(
      "One or more selected messages are unavailable"
    );
  }

  const deletedMessage = sourceMessages.find(
    (message) => message.deletedForEveryone
  );

  if (deletedMessage) {
    throw createServiceError("Deleted messages cannot be forwarded");
  }

  const sourceConversationIds = [
    ...new Set(sourceMessages.map((message) => String(message.conversationId))),
  ];

  for (const conversationId of sourceConversationIds) {
    await requireParticipant(conversationId, userId);
  }

  for (const conversationId of uniqueConversationIds) {
    await requireParticipant(conversationId, userId);
  }

  const createdMessages = [];
  const conversationResults = [];

  for (const conversationId of uniqueConversationIds) {
    const destinationMessages = [];

    for (const sourceMessage of sourceMessages) {
      const sourceSenderId =
        sourceMessage.senderId?._id || sourceMessage.senderId;

      const forwardedMessage = await Message.create({
        conversationId,
        senderId: userId,
        type: sourceMessage.type,
        text: sourceMessage.text || "",
        attachments: sourceMessage.attachments || [],
        replyTo: null,
        reactions: [],
        deletedFor: [],
        deletedForEveryone: false,
        deletedAt: null,
        forwardedFrom: {
          messageId: sourceMessage._id,
          conversationId: sourceMessage.conversationId,
          senderId: sourceSenderId,
        },
      });

      destinationMessages.push(forwardedMessage);
    }

    const lastCreatedMessage =
      destinationMessages[destinationMessages.length - 1];

    if (lastCreatedMessage) {
      await Conversation.findByIdAndUpdate(conversationId, {
        $set: {
          lastMessage: lastCreatedMessage._id,
          lastMessageAt: lastCreatedMessage.createdAt,
        },
      });
    }

    const createdMessageIds = destinationMessages.map((message) => message._id);

    const populatedMessages = await Message.find({
      _id: { $in: createdMessageIds },
    })
      .populate("senderId", "_id name email role")
      .populate({
        path: "forwardedFrom.senderId",
        select: "_id name email role",
      })
      .sort({ createdAt: 1 })
      .lean();

    const normalizedMessages = populatedMessages.map((message) =>
      normalizeMessage(message)
    );

    createdMessages.push(...normalizedMessages);

    conversationResults.push({
      conversationId,
      messages: normalizedMessages,
      lastMessage:
        normalizedMessages[normalizedMessages.length - 1] || null,
    });
  }

  return {
    messages: createdMessages,
    conversations: conversationResults,
  };
};

/* =====================================================
   GET MESSAGE THREAD
===================================================== */

const getMessageThread = async (conversationId, messageId, userId) => {
  await requireParticipant(conversationId, userId);

  if (!isValidObjectId(messageId)) {
    throw createServiceError("Invalid message ID");
  }

  const parentMessage = await Message.findOne({
    _id: messageId,
    conversationId,
  })
    .populate("senderId", "_id name email role")
    .populate({
      path: "forwardedFrom.senderId",
      select: "_id name email role",
    })
    .lean();

  if (!parentMessage) {
    throw createServiceError("Message not found", 404);
  }

  const replies = await Message.find({
    conversationId,
    replyTo: messageId,
    deletedFor: { $ne: userId },
  })
    .populate("senderId", "_id name email role")
    .populate({
      path: "forwardedFrom.senderId",
      select: "_id name email role",
    })
    .sort({ createdAt: 1 })
    .lean();

  return {
    parent: normalizeMessage(parentMessage, {
      includeDeletedContent: false,
    }),
    replies: replies.map((message) => normalizeMessage(message)),
  };
};

/* =====================================================
   EXPORT
===================================================== */

module.exports = {
  getCommunicationUsers,
  getConversations,
  getConversation,
  deleteConversationForMe,
  getMessages,
  getMessageThread,
  createDirectConversation,
  createGroupConversation,
  addGroupMembers,
  exitGroupConversation,
  sendMessage,
  markConversationRead,
  toggleMessageReaction,
  deleteMessageForMe,
  deleteMessageForEveryone,
  deleteMessagesForMe,
  deleteMessagesForEveryone,
  forwardMessages,
};