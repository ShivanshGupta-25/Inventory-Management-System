
import { useState } from "react";

import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import ChatEmptyState from "./ChatEmptyState";
import { useChat } from "../../context/ChatContext";

const ChatLayout = () => {
  const { selectedConversationId } = useChat();
  const [mobileView, setMobileView] = useState("conversations");

  const hasSelectedConversation = Boolean(
    selectedConversationId
  );

  const showConversation =
    mobileView === "chat" && hasSelectedConversation;

  return (
    <div className="h-[calc(100vh-190px)] min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex h-full">
        <div
          className={`w-full md:block md:w-80 ${
            showConversation ? "hidden" : "block"
          }`}
        >
          <ConversationList
            onConversationSelected={() => setMobileView("chat")}
          />
        </div>

        <div
          className={`min-w-0 flex-1 ${
            showConversation ? "block" : "hidden md:block"
          }`}
        >
          {hasSelectedConversation ? (
            <ChatWindow
              onBack={() => setMobileView("conversations")}
            />
          ) : (
            <ChatEmptyState />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;