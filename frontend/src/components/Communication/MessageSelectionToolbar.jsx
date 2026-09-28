import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Forward,
  Trash2,
  Loader2,
  X,
} from "lucide-react";

const MessageSelectionToolbar = ({
  selectedCount = 0,

  onCancel,
  onForward,

  onDeleteForMe,
  onDeleteForEveryone,

  canDeleteForEveryone = false,
  processing = false,
}) => {
  const [showDeleteMenu, setShowDeleteMenu] =
    useState(false);

  const deleteMenuRef = useRef(null);

  const disabled =
    processing || selectedCount === 0;

  /* =========================================================
     CLOSE DELETE MENU ON OUTSIDE CLICK
  ========================================================= */

  useEffect(() => {
    if (!showDeleteMenu) {
      return;
    }

    const handleOutsideClick = (event) => {
      if (
        deleteMenuRef.current &&
        !deleteMenuRef.current.contains(
          event.target
        )
      ) {
        setShowDeleteMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowDeleteMenu(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [showDeleteMenu]);

  /* =========================================================
     OPEN DELETE MENU
  ========================================================= */

  const handleOpenDeleteMenu = () => {
    if (disabled) {
      return;
    }

    setShowDeleteMenu(
      (current) => !current
    );
  };

  /* =========================================================
     DELETE FOR ME
  ========================================================= */

  const handleDeleteForMe = () => {
    if (processing || !selectedCount) {
      return;
    }

    setShowDeleteMenu(false);

    onDeleteForMe?.();
  };

  /* =========================================================
     DELETE FOR EVERYONE
  ========================================================= */

  const handleDeleteForEveryone = () => {
    if (
      processing ||
      !selectedCount ||
      !canDeleteForEveryone
    ) {
      return;
    }

    setShowDeleteMenu(false);

    onDeleteForEveryone?.();
  };

  /* =========================================================
     CANCEL DELETE MENU
  ========================================================= */

  const handleCancelDelete = () => {
    setShowDeleteMenu(false);
  };

  return (
    <div
      className="
        relative
        z-50
        flex
        h-16
        shrink-0
        items-center
        justify-between
        border-b
        border-slate-200
        bg-white/95
        px-4
        shadow-sm
        backdrop-blur-md
      "
    >
      {/* =====================================================
          LEFT
      ====================================================== */}

      <div
        className="
          flex
          min-w-0
          items-center
          gap-3
        "
      >
        <button
          type="button"
          onClick={() => {
            setShowDeleteMenu(false);
            onCancel?.();
          }}
          disabled={processing}
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            text-slate-600
            transition
            hover:bg-slate-100
            active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
          aria-label="Cancel selection"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="min-w-0">
          <div
            className="
              text-sm
              font-semibold
              text-slate-900
            "
          >
            {selectedCount}{" "}
            {selectedCount === 1
              ? "selected"
              : "selected"}
          </div>

          <div
            className="
              text-xs
              text-slate-500
            "
          >
            Choose an action
          </div>
        </div>
      </div>

      {/* =====================================================
          RIGHT ACTIONS
      ====================================================== */}

      <div
        className="
          flex
          items-center
          gap-1
        "
      >
        {/* =================================================
            FORWARD
        ================================================== */}

        <button
          type="button"
          onClick={onForward}
          disabled={disabled}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            text-slate-600
            transition
            hover:bg-slate-100
            hover:text-slate-900
            active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
          aria-label="Forward selected messages"
          title="Forward"
        >
          <Forward size={19} />
        </button>

        {/* =================================================
            DELETE BUTTON + FLOATING MENU
        ================================================== */}

        <div
          ref={deleteMenuRef}
          className="
            relative
          "
        >
          {/* DELETE ICON */}

          <button
            type="button"
            onClick={handleOpenDeleteMenu}
            disabled={disabled}
            className={`
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              transition
              active:scale-95
              disabled:cursor-not-allowed
              disabled:opacity-40

              ${
                showDeleteMenu
                  ? "bg-red-50 text-red-600"
                  : "text-slate-600 hover:bg-red-50 hover:text-red-600"
              }
            `}
            aria-label="Delete selected messages"
            aria-expanded={showDeleteMenu}
            aria-haspopup="menu"
            title="Delete"
          >
            {processing ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={18} />
            )}
          </button>

          {/* =================================================
              DELETE FLOATING MENU
          ================================================== */}

          {showDeleteMenu && (
            <div
              role="menu"
              className="
                absolute
                right-0
                top-full
                mt-2
                w-64
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-1.5
                shadow-[0_14px_45px_rgba(15,23,42,0.18)]
                animate-in
                fade-in
                slide-in-from-top-1
                duration-150
              "
            >
              {/* HEADER */}

              <div
                className="
                  px-3
                  pb-2
                  pt-2.5
                "
              >
                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  Delete selected messages
                </p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-slate-400
                  "
                >
                  {selectedCount}{" "}
                  {selectedCount === 1
                    ? "message"
                    : "messages"}{" "}
                  selected
                </p>
              </div>

              <div
                className="
                  my-1
                  border-t
                  border-slate-100
                "
              />

              {/* ===========================================
                  DELETE FOR ME
              ============================================ */}

              <button
                type="button"
                role="menuitem"
                onClick={handleDeleteForMe}
                disabled={processing}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  font-medium
                  text-slate-700
                  transition
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-100
                    text-slate-600
                  "
                >
                  <Trash2 size={16} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block">
                    Delete for me
                  </span>

                  <span
                    className="
                      mt-0.5
                      block
                      text-[11px]
                      font-normal
                      text-slate-400
                    "
                  >
                    Remove from your view
                  </span>
                </span>
              </button>

              {/* ===========================================
                  DELETE FOR EVERYONE
              ============================================ */}

              {canDeleteForEveryone && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={
                    handleDeleteForEveryone
                  }
                  disabled={processing}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    font-medium
                    text-red-600
                    transition
                    hover:bg-red-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <span
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-red-50
                      text-red-600
                    "
                  >
                    <Trash2 size={16} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block">
                      Delete for everyone
                    </span>

                    <span
                      className="
                        mt-0.5
                        block
                        text-[11px]
                        font-normal
                        text-red-400
                      "
                    >
                      Remove for all participants
                    </span>
                  </span>
                </button>
              )}

              {/* ===========================================
                  DIVIDER
              ============================================ */}

              <div
                className="
                  my-1
                  border-t
                  border-slate-100
                "
              />

              {/* ===========================================
                  CANCEL
              ============================================ */}

              <button
                type="button"
                role="menuitem"
                onClick={
                  handleCancelDelete
                }
                disabled={processing}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  font-medium
                  text-slate-500
                  transition
                  hover:bg-slate-50
                  hover:text-slate-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-100
                  "
                >
                  <X size={16} />
                </span>

                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageSelectionToolbar;