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

import { useEffect, useRef, useState } from "react";

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
  // CLOSE ON OUTSIDE CLICK
  // --------------------------------------------------

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

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

  if (!user) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="relative inline-block text-left"
    >
      {/* ==================================================
          TRIGGER
      ================================================== */}

      <button
        type="button"
        onClick={toggleMenu}
        aria-label={`Actions for ${user.name || "user"}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        <MoreHorizontal size={19} />
      </button>

      {/* ==================================================
          MENU
      ================================================== */}

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl shadow-slate-200/60"
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
              className="text-slate-500"
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
              className="text-slate-500"
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
                className="text-violet-500"
              />
            ) : (
              <UserCog
                size={16}
                className="text-slate-500"
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
                className="text-emerald-600"
              />
            ) : (
              <UserX
                size={16}
                className="text-amber-600"
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
            <Trash2 size={16} />

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
        </div>
      )}
    </div>
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