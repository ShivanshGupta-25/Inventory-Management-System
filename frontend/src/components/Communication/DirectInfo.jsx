import { useMemo } from "react";

import {
  X,
  User,
  Mail,
  Shield,
  CalendarDays,
  MessageSquare,
} from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

const getParticipantId = (participant) => {
  if (!participant) {
    return null;
  }

  return (
    participant.id ||
    participant._id ||
    participant.userId ||
    participant.user?.id ||
    participant.user?._id ||
    null
  );
};

const getParticipantName = (participant) => {
  if (!participant) {
    return "Unknown user";
  }

  return (
    participant.name ||
    participant.fullName ||
    participant.user?.name ||
    participant.user?.fullName ||
    participant.email ||
    participant.user?.email ||
    "Unknown user"
  );
};

const getParticipantEmail = (participant) => {
  if (!participant) {
    return "";
  }

  return (
    participant.email ||
    participant.user?.email ||
    ""
  );
};

const getInitials = (name = "") => {
  const value = String(name).trim();

  if (!value) {
    return "?";
  }

  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item.charAt(0))
    .join("")
    .toUpperCase();
};

const formatDate = (value) => {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   COMPONENT
========================================================= */

const DirectInfo = ({
  conversation,
  currentUserId,
  onClose,
}) => {
  /* =======================================================
     FIND OTHER PARTICIPANT
  ======================================================= */

  const otherParticipant = useMemo(() => {
    if (!conversation) {
      return null;
    }

    const participants =
      conversation.participants || [];

    return (
      participants.find(
        (participant) =>
          String(
            getParticipantId(participant)
          ) !== String(currentUserId)
      ) || null
    );
  }, [conversation, currentUserId]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const name = getParticipantName(
    otherParticipant
  );

  const email = getParticipantEmail(
    otherParticipant
  );

  const role =
    otherParticipant?.role ||
    otherParticipant?.user?.role ||
    "";

  const joinedAt =
    otherParticipant?.joinedAt ||
    null;

  if (!conversation) {
    return null;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* ===================================================
          BACKDROP
      =================================================== */}

      <div
        className="
          fixed
          inset-0
          z-[180]
          bg-black/40
          backdrop-blur-[2px]
        "
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ===================================================
          FLOATING WINDOW
      =================================================== */}

      <div
        className="
          fixed
          inset-x-3
          top-1/2
          z-[190]
          mx-auto
          w-auto
          max-w-md
          -translate-y-1/2
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-2xl
          sm:inset-x-auto
          sm:left-1/2
          sm:w-[420px]
          sm:-translate-x-1/2
        "
        role="dialog"
        aria-modal="true"
        aria-label="Direct conversation information"
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            px-4
            py-3
          "
        >
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-900">
              Contact Info
            </h2>

            <p className="text-xs text-slate-500">
              Direct conversation
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
            aria-label="Close contact info"
            title="Close"
          >
            <X size={19} />
          </button>
        </div>

        {/* =================================================
            PROFILE
        ================================================= */}

        <div className="px-5 py-6">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}

            <div
              className="
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-blue-500
                to-indigo-600
                text-xl
                font-semibold
                text-white
                shadow-md
              "
            >
              {getInitials(name)}
            </div>

            {/* Name */}

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              {name}
            </h3>

            {/* Email */}

            {email && (
              <p className="mt-1 break-all text-sm text-slate-500">
                {email}
              </p>
            )}
          </div>

          {/* =================================================
              INFORMATION
          ================================================= */}

          <div className="mt-7 space-y-2">
            {/* Email */}

            {email && (
              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  py-3
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white
                    text-slate-500
                    shadow-sm
                  "
                >
                  <Mail size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Email
                  </p>

                  <p className="truncate text-sm text-slate-700">
                    {email}
                  </p>
                </div>
              </div>
            )}

            {/* Role */}

            {role && (
              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  py-3
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white
                    text-slate-500
                    shadow-sm
                  "
                >
                  <Shield size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Role
                  </p>

                  <p className="text-sm capitalize text-slate-700">
                    {role}
                  </p>
                </div>
              </div>
            )}

            {/* Joined */}

            {joinedAt && (
              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  py-3
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white
                    text-slate-500
                    shadow-sm
                  "
                >
                  <CalendarDays size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Conversation started
                  </p>

                  <p className="text-sm text-slate-700">
                    {formatDate(joinedAt)}
                  </p>
                </div>
              </div>
            )}

            {/* Conversation type */}

            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                py-3
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-white
                  text-slate-500
                  shadow-sm
                "
              >
                <MessageSquare size={17} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Conversation
                </p>

                <p className="text-sm text-slate-700">
                  Direct message
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            border-t
            border-slate-200
            bg-slate-50
            px-4
            py-3
            text-center
          "
        >
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <User size={14} />

            <span>
              Private conversation
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default DirectInfo;