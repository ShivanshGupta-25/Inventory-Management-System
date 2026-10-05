import {
  Edit3,
  Eye,
  MoreHorizontal,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserX,
  Trash2,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

const AdminUserActions = ({
  user,
  currentUser = null,
  onView,
  onEdit,
  onRoleChange,
  onStatusChange,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);

  /*
   * Menu position is calculated relative to the viewport.
   *
   * {
   *   top: number,
   *   left: number,
   *   placement: "top" | "bottom"
   * }
   */
  const [menuPosition, setMenuPosition] = useState(null);

  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // --------------------------------------------------
  // USER IDS
  // --------------------------------------------------

  const userId = user?._id || user?.id;

  const currentUserId =
    currentUser?._id || currentUser?.id;

  // --------------------------------------------------
  // USER STATE
  // --------------------------------------------------

  const isAdmin = user?.role === "admin";

  const isCurrentUser =
    Boolean(currentUserId) &&
    Boolean(userId) &&
    String(currentUserId) === String(userId);

  /*
   * Backend rules:
   *
   * - Admin accounts cannot have their role changed
   * - Admin accounts cannot be disabled
   * - Admin accounts cannot be deleted
   * - Current user cannot change own role
   * - Current user cannot change own status
   * - Current user cannot delete themselves
   */

  const canManageRole =
    Boolean(user) &&
    !isAdmin &&
    !isCurrentUser;

  const canManageStatus =
    Boolean(user) &&
    !isAdmin &&
    !isCurrentUser;

  const canDelete =
    Boolean(user) &&
    !isAdmin &&
    !isCurrentUser;

  // --------------------------------------------------
  // CALCULATE MENU POSITION
  // --------------------------------------------------

  const updateMenuPosition = useCallback(() => {
    if (!open || !triggerRef.current || !menuRef.current) {
      return;
    }

    const triggerRect =
      triggerRef.current.getBoundingClientRect();

    const menuRect =
      menuRef.current.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const GAP = 8;
    const VIEWPORT_PADDING = 12;

    /*
     * ------------------------------------------------
     * VERTICAL POSITION
     * ------------------------------------------------
     *
     * Prefer opening below the button.
     *
     * If there isn't enough room below, open above.
     */

    const spaceBelow =
      viewportHeight - triggerRect.bottom;

    const spaceAbove =
      triggerRect.top;

    let top;
    let placement;

    if (
      spaceBelow >=
      menuRect.height + GAP + VIEWPORT_PADDING
    ) {
      // Open downward
      top = triggerRect.bottom + GAP;
      placement = "bottom";
    } else if (
      spaceAbove >=
      menuRect.height + GAP + VIEWPORT_PADDING
    ) {
      // Open upward
      top = triggerRect.top - menuRect.height - GAP;
      placement = "top";
    } else {
      /*
       * There isn't enough complete space on either side.
       *
       * Choose the side with more available space and
       * constrain the menu inside the viewport.
       */

      if (spaceBelow >= spaceAbove) {
        placement = "bottom";

        top = Math.min(
          triggerRect.bottom + GAP,
          viewportHeight -
            menuRect.height -
            VIEWPORT_PADDING
        );
      } else {
        placement = "top";

        top = Math.max(
          VIEWPORT_PADDING,
          triggerRect.top -
            menuRect.height -
            GAP
        );
      }
    }

    /*
     * ------------------------------------------------
     * HORIZONTAL POSITION
     * ------------------------------------------------
     *
     * Align the right edge of the menu with the
     * right edge of the trigger.
     */

    let left =
      triggerRect.right - menuRect.width;

    /*
     * Prevent the menu from going outside the
     * left side of the viewport.
     */

    left = Math.max(
      VIEWPORT_PADDING,
      left
    );

    /*
     * Prevent the menu from going outside the
     * right side of the viewport.
     */

    left = Math.min(
      left,
      viewportWidth -
        menuRect.width -
        VIEWPORT_PADDING
    );

    setMenuPosition({
      top,
      left,
      placement,
    });
  }, [open]);

  // --------------------------------------------------
  // UPDATE POSITION WHEN MENU OPENS
  // --------------------------------------------------

  useEffect(() => {
    if (!open) {
      setMenuPosition(null);
      return;
    }

    /*
     * Wait until the portal menu has actually been
     * rendered before measuring its dimensions.
     */
    const frame = requestAnimationFrame(() => {
      updateMenuPosition();
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [open, updateMenuPosition]);

  // --------------------------------------------------
  // REPOSITION ON SCROLL / RESIZE
  // --------------------------------------------------

  useEffect(() => {
    if (!open) return;

    const handleViewportChange = () => {
      updateMenuPosition();
    };

    /*
     * Capture scroll events so scrolling inside the
     * table/card also updates the menu position.
     */
    window.addEventListener(
      "scroll",
      handleViewportChange,
      true
    );

    window.addEventListener(
      "resize",
      handleViewportChange
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleViewportChange,
        true
      );

      window.removeEventListener(
        "resize",
        handleViewportChange
      );
    };
  }, [open, updateMenuPosition]);

  // --------------------------------------------------
  // CLOSE ON OUTSIDE CLICK
  // --------------------------------------------------

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event) => {
      const target = event.target;

      const clickedInsideMenu =
        menuRef.current?.contains(target);

      const clickedTrigger =
        triggerRef.current?.contains(target);

      if (
        !clickedInsideMenu &&
        !clickedTrigger
      ) {
        setOpen(false);
      }
    };

    /*
     * Use mousedown so the menu closes before
     * subsequent click interactions.
     */
    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [open]);

  // --------------------------------------------------
  // CLOSE ON ESCAPE
  // --------------------------------------------------

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open]);

  // --------------------------------------------------
  // ACTION HANDLER
  // --------------------------------------------------

  const handleAction = (callback) => {
    setOpen(false);

    if (callback) {
      callback(user);
    }
  };

  // --------------------------------------------------
  // TOGGLE
  // --------------------------------------------------

  const toggleMenu = () => {
    setOpen((previous) => !previous);
  };

  // --------------------------------------------------
  // NO USER
  // --------------------------------------------------

  if (!user) {
    return null;
  }

  // --------------------------------------------------
  // MENU CONTENT
  // --------------------------------------------------

  const actionMenu = open
    ? createPortal(
        <div
          ref={menuRef}
          role="menu"
          aria-label={`Actions for ${
            user.name || "user"
          }`}
          className="fixed z-[9999] w-60 max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-2xl shadow-slate-900/10"
          style={{
            top:
              menuPosition?.top ?? 0,
            left:
              menuPosition?.left ?? 0,

            /*
             * Hide the menu for the first frame while
             * its position is being calculated.
             *
             * This prevents a visible jump from the
             * top-left corner of the viewport.
             */
            opacity: menuPosition ? 1 : 0,

            pointerEvents:
              menuPosition ? "auto" : "none",

            maxHeight:
              "calc(100vh - 24px)",

            overflowY: "auto",

            transition:
              "opacity 120ms ease",
          }}
        >
          {/* ==================================================
              VIEW
          ================================================== */}

          <button
            type="button"
            role="menuitem"
            onClick={() => handleAction(onView)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Eye
              size={16}
              className="shrink-0 text-slate-500"
            />

            <span>View User</span>
          </button>

          {/* ==================================================
              EDIT
          ================================================== */}

          <button
            type="button"
            role="menuitem"
            onClick={() => handleAction(onEdit)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Edit3
              size={16}
              className="shrink-0 text-slate-500"
            />

            <span>Edit Details</span>
          </button>

          <div className="my-1 border-t border-slate-100" />

          {/* ==================================================
              CHANGE ROLE
          ================================================== */}

          <button
            type="button"
            role="menuitem"
            disabled={!canManageRole}
            onClick={() => {
              if (canManageRole) {
                handleAction(onRoleChange);
              }
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isAdmin ? (
              <ShieldCheck
                size={16}
                className="shrink-0 text-violet-500"
              />
            ) : (
              <UserCog
                size={16}
                className="shrink-0 text-slate-500"
              />
            )}

            <span>Change Role</span>
          </button>

          {/* ==================================================
              STATUS
          ================================================== */}

          <button
            type="button"
            role="menuitem"
            disabled={!canManageStatus}
            onClick={() => {
              if (canManageStatus) {
                handleAction(onStatusChange);
              }
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {user.status === "disabled" ? (
              <UserCheck
                size={16}
                className="shrink-0 text-emerald-600"
              />
            ) : (
              <UserX
                size={16}
                className="shrink-0 text-amber-600"
              />
            )}

            <span>
              {user.status === "disabled"
                ? "Enable Account"
                : "Disable Account"}
            </span>
          </button>

          <div className="my-1 border-t border-slate-100" />

          {/* ==================================================
              DELETE
          ================================================== */}

          <button
            type="button"
            role="menuitem"
            disabled={!canDelete}
            onClick={() => {
              if (canDelete) {
                handleAction(onDelete);
              }
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2
              size={16}
              className="shrink-0"
            />

            <span>Delete User</span>
          </button>

          {/* ==================================================
              PROTECTION MESSAGE
          ================================================== */}

          {isAdmin && (
            <div className="mt-1 border-t border-slate-100 px-3 py-2.5">
              <div className="flex gap-2">
                <ShieldCheck
                  size={14}
                  className="mt-0.5 shrink-0 text-violet-500"
                />

                <p className="text-[11px] leading-4 text-slate-400">
                  Administrator accounts are protected
                  from role changes, status changes,
                  and deletion.
                </p>
              </div>
            </div>
          )}

          {/* ==================================================
              CURRENT USER MESSAGE
          ================================================== */}

          {isCurrentUser && (
            <div className="mt-1 border-t border-slate-100 px-3 py-2.5">
              <div className="flex gap-2">
                <UserRoundIcon />

                <p className="text-[11px] leading-4 text-slate-400">
                  You cannot change your own role or
                  account status, or delete your own
                  account.
                </p>
              </div>
            </div>
          )}
        </div>,

        document.body
      )
    : null;

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <>
      <div className="relative inline-block text-left">
        {/* ==================================================
            TRIGGER
        ================================================== */}

        <button
          ref={triggerRef}
          type="button"
          onClick={toggleMenu}
          aria-label={`Actions for ${
            user.name || "user"
          }`}
          aria-haspopup="menu"
          aria-expanded={open}
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 ${
            open
              ? "bg-slate-100 text-slate-700"
              : ""
          }`}
        >
          <MoreHorizontal size={19} />
        </button>
      </div>

      {/* ==================================================
          PORTAL ACTION MENU
      ================================================== */}

      {actionMenu}
    </>
  );
};

// --------------------------------------------------
// SMALL INLINE ICON
// --------------------------------------------------

const UserRoundIcon = () => {
  return (
    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">
      i
    </div>
  );
};

export default AdminUserActions;