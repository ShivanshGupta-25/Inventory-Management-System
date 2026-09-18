const EmptyConversation = ({
  onNewConversation,
}) => {
  return (
    <div className="flex h-full flex-1 items-center justify-center bg-gray-50">
      <div className="max-w-sm px-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl">
          💬
        </div>

        <h2 className="text-lg font-semibold text-gray-900">
          Team communication
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Select a conversation or
          start a new direct or group
          conversation.
        </p>

        <button
          type="button"
          onClick={onNewConversation}
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Start conversation
        </button>
      </div>
    </div>
  );
};

export default EmptyConversation;