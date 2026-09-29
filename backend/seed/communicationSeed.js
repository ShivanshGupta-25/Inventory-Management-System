require("dotenv").config();

const mongoose = require("mongoose");

const User = require("../models/User");
const Conversation = require("../models/Conversation");
const ConversationParticipant = require("../models/ConversationParticipant");
const Message = require("../models/Message");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error(
    "MONGO_URI is not defined. Check your backend .env file."
  );
}
const communicationSeed = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    /*
     * ============================================================
     * 1. FIND USERS
     * ============================================================
     */

    const manager = await User.findOne({
      email: "manager@test.com",
    });

    const staff2 = await User.findOne({
      email: "staff2@test.com",
    });

    const staff3 = await User.findOne({
      email: "staff3@test.com",
    });

    if (!manager || !staff2 || !staff3) {
      throw new Error(
        "Required users not found. Make sure manager@test.com, staff2@test.com and staff3@test.com exist."
      );
    }

    console.log("\nUsers found:");
    console.log(`Manager: ${manager.name}`);
    console.log(`Staff 2: ${staff2.name}`);
    console.log(`Staff 3: ${staff3.name}`);

    /*
     * ============================================================
     * 2. CLEAR OLD COMMUNICATION DATA
     * ============================================================
     *
     * DEV/TEST ONLY
     */

    await Message.deleteMany({});
    await ConversationParticipant.deleteMany({});
    await Conversation.deleteMany({});

    console.log("\nOld communication data cleared.");

    /*
     * ============================================================
     * 3. HELPER FUNCTIONS
     * ============================================================
     */

    const makeDirectKey = (userA, userB) => {
      return [userA.toString(), userB.toString()]
        .sort()
        .join(":");
    };

    const createConversation = async ({
      type,
      name = "",
      createdBy,
      participants,
      directKey = null,
    }) => {
      const conversation = await Conversation.create({
        type,
        name,
        directKey,
        createdBy,
      });

      const participantDocs = participants.map((participant) => ({
        conversationId: conversation._id,
        userId: participant.userId,
        role: participant.role || "member",
        lastReadAt: participant.lastReadAt || null,
        isPinned: participant.isPinned || false,
        isMuted: participant.isMuted || false,
      }));

      await ConversationParticipant.insertMany(participantDocs);

      return conversation;
    };

    const createMessage = async ({
      conversationId,
      senderId,
      text,
      replyTo = null,
      reactions = [],
      deletedFor = [],
      deletedForEveryone = false,
      createdAt,
      forwardedFrom = null,
    }) => {
      const message = await Message.create({
        conversationId,
        senderId,
        type: "text",
        text,
        replyTo,
        reactions,
        deletedFor,
        deletedForEveryone,
        forwardedFrom,
        createdAt,
        updatedAt: createdAt,
      });

      return message;
    };

    const updateLastMessage = async (conversationId, message) => {
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        lastMessageAt: message.createdAt,
        updatedAt: message.createdAt,
      });
    };

    /*
     * ============================================================
     * 4. CREATE CONVERSATIONS
     * ============================================================
     */

    /*
     * ------------------------------------------------------------
     * DIRECT 1
     * Manager <-> Staff 2
     * ------------------------------------------------------------
     */

    const managerStaff2 = await createConversation({
      type: "direct",
      createdBy: manager._id,
      directKey: makeDirectKey(manager._id, staff2._id),

      participants: [
        {
          userId: manager._id,
          role: "member",
          isPinned: true,
        },
        {
          userId: staff2._id,
          role: "member",
        },
      ],
    });

    /*
     * ------------------------------------------------------------
     * DIRECT 2
     * Manager <-> Staff 3
     * ------------------------------------------------------------
     */

    const managerStaff3 = await createConversation({
      type: "direct",
      createdBy: manager._id,
      directKey: makeDirectKey(manager._id, staff3._id),

      participants: [
        {
          userId: manager._id,
          role: "member",
        },
        {
          userId: staff3._id,
          role: "member",
          isPinned: true,
        },
      ],
    });

    /*
     * ------------------------------------------------------------
     * DIRECT 3
     * Staff 2 <-> Staff 3
     * ------------------------------------------------------------
     */

    const staff2Staff3 = await createConversation({
      type: "direct",
      createdBy: staff2._id,
      directKey: makeDirectKey(staff2._id, staff3._id),

      participants: [
        {
          userId: staff2._id,
          role: "member",
        },
        {
          userId: staff3._id,
          role: "member",
        },
      ],
    });

    /*
     * ------------------------------------------------------------
     * GROUP 1
     * Manager-created group
     * ------------------------------------------------------------
     */

    const inventoryTeam = await createConversation({
      type: "group",
      name: "Inventory Team",
      createdBy: manager._id,

      participants: [
        {
          userId: manager._id,
          role: "admin",
          isPinned: true,
        },
        {
          userId: staff2._id,
          role: "member",
        },
        {
          userId: staff3._id,
          role: "member",
        },
      ],
    });

    /*
     * ------------------------------------------------------------
     * GROUP 2
     * Manager-created group
     * ------------------------------------------------------------
     */

    const operationsTeam = await createConversation({
      type: "group",
      name: "Operations Team",
      createdBy: manager._id,

      participants: [
        {
          userId: manager._id,
          role: "admin",
        },
        {
          userId: staff2._id,
          role: "member",
          isMuted: true,
        },
        {
          userId: staff3._id,
          role: "member",
          isPinned: true,
        },
      ],
    });

    console.log("\nConversations created:");
    console.log("- Manager <-> Staff 2");
    console.log("- Manager <-> Staff 3");
    console.log("- Staff 2 <-> Staff 3");
    console.log("- Inventory Team");
    console.log("- Operations Team");

    /*
     * ============================================================
     * 5. MANAGER <-> STAFF 2 MESSAGES
     * ============================================================
     */

    const ms2_1 = await createMessage({
      conversationId: managerStaff2._id,
      senderId: manager._id,
      text: "Hi Staff 2, please check the current inventory levels.",
      createdAt: new Date("2026-09-29T09:00:00Z"),
    });

    const ms2_2 = await createMessage({
      conversationId: managerStaff2._id,
      senderId: staff2._id,
      text: "Sure, I will check the inventory and update you.",
      createdAt: new Date("2026-09-29T09:05:00Z"),
    });

    const ms2_3 = await createMessage({
      conversationId: managerStaff2._id,
      senderId: manager._id,
      text: "Please also check the products that are below minimum stock.",
      replyTo: ms2_2._id,
      createdAt: new Date("2026-09-29T09:10:00Z"),
    });

    const ms2_4 = await createMessage({
      conversationId: managerStaff2._id,
      senderId: staff2._id,
      text: "I found three products below the minimum stock level.",
      reactions: [
        {
          emoji: "👍",
          userIds: [manager._id],
        },
        {
          emoji: "✅",
          userIds: [manager._id],
        },
      ],
      createdAt: new Date("2026-09-29T09:15:00Z"),
    });

    const ms2_5 = await createMessage({
      conversationId: managerStaff2._id,
      senderId: manager._id,
      text: "Good. Create a purchase request for those products.",
      replyTo: ms2_4._id,
      createdAt: new Date("2026-09-29T09:20:00Z"),
    });

    await updateLastMessage(managerStaff2._id, ms2_5);

    /*
     * ============================================================
     * 6. MANAGER <-> STAFF 3 MESSAGES
     * ============================================================
     */

    const ms3_1 = await createMessage({
      conversationId: managerStaff3._id,
      senderId: staff3._id,
      text: "The morning stock-in operation has been completed.",
      createdAt: new Date("2026-09-29T08:30:00Z"),
    });

    const ms3_2 = await createMessage({
      conversationId: managerStaff3._id,
      senderId: manager._id,
      text: "How many items were received?",
      createdAt: new Date("2026-09-29T08:35:00Z"),
    });

    const ms3_3 = await createMessage({
      conversationId: managerStaff3._id,
      senderId: staff3._id,
      text: "We received 150 units in total.",
      replyTo: ms3_2._id,
      createdAt: new Date("2026-09-29T08:40:00Z"),
    });

    const ms3_4 = await createMessage({
      conversationId: managerStaff3._id,
      senderId: manager._id,
      text: "Please make sure the stock history is updated.",
      reactions: [
        {
          emoji: "👍",
          userIds: [staff3._id],
        },
      ],
      createdAt: new Date("2026-09-29T08:45:00Z"),
    });

    const ms3_5 = await createMessage({
      conversationId: managerStaff3._id,
      senderId: staff3._id,
      text: "Done. The stock history has been updated.",
      createdAt: new Date("2026-09-29T08:50:00Z"),
    });

    await updateLastMessage(managerStaff3._id, ms3_5);

    /*
     * ============================================================
     * 7. STAFF 2 <-> STAFF 3 MESSAGES
     * ============================================================
     */

    const ss_1 = await createMessage({
      conversationId: staff2Staff3._id,
      senderId: staff2._id,
      text: "Are you working on the stock report?",
      createdAt: new Date("2026-09-29T07:30:00Z"),
    });

    const ss_2 = await createMessage({
      conversationId: staff2Staff3._id,
      senderId: staff3._id,
      text: "Yes, I am almost finished with it.",
      replyTo: ss_1._id,
      createdAt: new Date("2026-09-29T07:35:00Z"),
    });

    const ss_3 = await createMessage({
      conversationId: staff2Staff3._id,
      senderId: staff2._id,
      text: "Great. Let me know once it is ready.",
      createdAt: new Date("2026-09-29T07:40:00Z"),
    });

    const ss_4 = await createMessage({
      conversationId: staff2Staff3._id,
      senderId: staff3._id,
      text: "The report is ready now.",
      reactions: [
        {
          emoji: "🔥",
          userIds: [staff2._id],
        },
      ],
      createdAt: new Date("2026-09-29T07:45:00Z"),
    });

    await updateLastMessage(staff2Staff3._id, ss_4);

    /*
     * ============================================================
     * 8. INVENTORY TEAM GROUP
     * ============================================================
     */

    const inv_1 = await createMessage({
      conversationId: inventoryTeam._id,
      senderId: manager._id,
      text: "Good morning team. Please complete today's inventory check.",
      createdAt: new Date("2026-09-29T06:00:00Z"),
    });

    const inv_2 = await createMessage({
      conversationId: inventoryTeam._id,
      senderId: staff2._id,
      text: "I will handle the warehouse inventory.",
      createdAt: new Date("2026-09-29T06:05:00Z"),
    });

    const inv_3 = await createMessage({
      conversationId: inventoryTeam._id,
      senderId: staff3._id,
      text: "I will handle stock movements and damaged items.",
      createdAt: new Date("2026-09-29T06:10:00Z"),
    });

    const inv_4 = await createMessage({
      conversationId: inventoryTeam._id,
      senderId: manager._id,
      text: "Perfect. Please report any discrepancies here.",
      createdAt: new Date("2026-09-29T06:15:00Z"),
    });

    const inv_5 = await createMessage({
      conversationId: inventoryTeam._id,
      senderId: staff2._id,
      text: "There is a discrepancy in the electronics category.",
      replyTo: inv_4._id,
      createdAt: new Date("2026-09-29T06:20:00Z"),
    });

    const inv_6 = await createMessage({
      conversationId: inventoryTeam._id,
      senderId: manager._id,
      text: "Please investigate the discrepancy and update the stock.",
      replyTo: inv_5._id,
      reactions: [
        {
          emoji: "👀",
          userIds: [staff2._id],
        },
        {
          emoji: "👍",
          userIds: [staff3._id],
        },
      ],
      createdAt: new Date("2026-09-29T06:25:00Z"),
    });

    const inv_7 = await createMessage({
      conversationId: inventoryTeam._id,
      senderId: staff3._id,
      text: "I have completed the verification.",
      createdAt: new Date("2026-09-29T06:30:00Z"),
    });

    await updateLastMessage(inventoryTeam._id, inv_7);

    /*
     * ============================================================
     * 9. OPERATIONS TEAM GROUP
     * ============================================================
     */

    const op_1 = await createMessage({
      conversationId: operationsTeam._id,
      senderId: manager._id,
      text: "Today's operations update will be discussed here.",
      createdAt: new Date("2026-09-28T10:00:00Z"),
    });

    const op_2 = await createMessage({
      conversationId: operationsTeam._id,
      senderId: staff3._id,
      text: "Sales operations are running normally.",
      createdAt: new Date("2026-09-28T10:10:00Z"),
    });

    const op_3 = await createMessage({
      conversationId: operationsTeam._id,
      senderId: staff2._id,
      text: "There was a small issue with one stock-out transaction.",
      createdAt: new Date("2026-09-28T10:15:00Z"),
    });

    const op_4 = await createMessage({
      conversationId: operationsTeam._id,
      senderId: manager._id,
      text: "What is the issue?",
      replyTo: op_3._id,
      createdAt: new Date("2026-09-28T10:20:00Z"),
    });

    const op_5 = await createMessage({
      conversationId: operationsTeam._id,
      senderId: staff2._id,
      text: "The quantity entered was incorrect initially, but it has been corrected.",
      replyTo: op_4._id,
      createdAt: new Date("2026-09-28T10:25:00Z"),
    });

    const op_6 = await createMessage({
      conversationId: operationsTeam._id,
      senderId: manager._id,
      text: "Okay, make sure the stock history reflects the correction.",
      reactions: [
        {
          emoji: "✅",
          userIds: [staff2._id, staff3._id],
        },
      ],
      createdAt: new Date("2026-09-28T10:30:00Z"),
    });

    /*
     * Test deleted-for-user message
     */
    const op_7 = await createMessage({
      conversationId: operationsTeam._id,
      senderId: staff3._id,
      text: "This message is deleted for Staff 2.",
      deletedFor: [staff2._id],
      createdAt: new Date("2026-09-28T10:35:00Z"),
    });

    /*
     * Test deleted-for-everyone message
     */
    const op_8 = await createMessage({
      conversationId: operationsTeam._id,
      senderId: staff2._id,
      text: "This message should appear as deleted for everyone.",
      deletedForEveryone: true,
      deletedAt: new Date("2026-09-28T10:40:00Z"),
      createdAt: new Date("2026-09-28T10:40:00Z"),
    });

    const op_9 = await createMessage({
      conversationId: operationsTeam._id,
      senderId: manager._id,
      text: "Let's continue with the remaining tasks.",
      createdAt: new Date("2026-09-28T10:45:00Z"),
    });

    await updateLastMessage(operationsTeam._id, op_9);

    /*
     * ============================================================
     * 10. FORWARDED MESSAGE TEST
     * ============================================================
     *
     * Forward a message from Inventory Team into Manager <-> Staff 2
     */

    const forwarded = await createMessage({
      conversationId: managerStaff2._id,
      senderId: staff2._id,
      text: "Forwarded: There is a discrepancy in the electronics category.",

      forwardedFrom: {
        messageId: inv_5._id,
        conversationId: inventoryTeam._id,
        senderId: staff2._id,
      },

      createdAt: new Date("2026-09-29T09:25:00Z"),
    });

    await updateLastMessage(managerStaff2._id, forwarded);

    /*
     * ============================================================
     * 11. UPDATE READ STATES
     * ============================================================
     */

    /*
     * Manager has read the Manager <-> Staff 2 conversation
     */
    await ConversationParticipant.findOneAndUpdate(
      {
        conversationId: managerStaff2._id,
        userId: manager._id,
      },
      {
        lastReadAt: new Date("2026-09-29T09:25:00Z"),
      }
    );

    /*
     * Staff 2 has NOT read the latest messages.
     *
     * This is intentional so you can test unread counts.
     */

    await ConversationParticipant.findOneAndUpdate(
      {
        conversationId: managerStaff3._id,
        userId: staff3._id,
      },
      {
        lastReadAt: new Date("2026-09-29T08:35:00Z"),
      }
    );

    /*
     * ============================================================
     * 12. SUMMARY
     * ============================================================
     */

    const conversationCount =
      await Conversation.countDocuments();

    const participantCount =
      await ConversationParticipant.countDocuments();

    const messageCount =
      await Message.countDocuments();

    console.log("\n========================================");
    console.log("COMMUNICATION SEED COMPLETED");
    console.log("========================================");

    console.log(`Conversations : ${conversationCount}`);
    console.log(`Participants  : ${participantCount}`);
    console.log(`Messages      : ${messageCount}`);

    console.log("\nTest users:");
    console.log(`Manager : ${manager.email}`);
    console.log(`Staff 2 : ${staff2.email}`);
    console.log(`Staff 3 : ${staff3.email}`);

    console.log("\nConversation types:");
    console.log("3 Direct conversations");
    console.log("2 Group conversations");

    console.log("\nSpecial test cases:");
    console.log("- Replies");
    console.log("- Reactions");
    console.log("- Forwarded message");
    console.log("- Deleted-for-user message");
    console.log("- Deleted-for-everyone message");
    console.log("- Pinned conversations");
    console.log("- Muted participant");
    console.log("- Unread messages");
    console.log("- Multiple group conversations");

    await mongoose.disconnect();

    console.log("\nMongoDB disconnected.");
  } catch (error) {
    console.error("\nCommunication seed failed:");
    console.error(error);

    await mongoose.disconnect();
    process.exit(1);
  }
};

communicationSeed();