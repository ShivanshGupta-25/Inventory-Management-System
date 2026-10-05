// import {
//   Plus,
//   RefreshCw,
//   UsersRound,
// } from "lucide-react";

// const AdminUsersHeader = ({
//   onRefresh,
//   refreshing = false,
// }) => {
//   return (
//     <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
//       <div className="flex items-start gap-4">
//         <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
//           <UsersRound size={22} />
//         </div>

//         <div>
//           <p className="text-sm font-medium text-slate-500">
//             Administration
//           </p>

//           <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
//             Users
//           </h1>

//           <p className="mt-1 max-w-2xl text-sm text-slate-500 sm:text-[15px]">
//             Manage platform users, roles, and account
//             access from one place.
//           </p>
//         </div>
//       </div>

//       <div className="flex items-center gap-2">
//         <button
//           type="button"
//           onClick={onRefresh}
//           disabled={refreshing}
//           className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           <RefreshCw
//             size={16}
//             className={
//               refreshing ? "animate-spin" : ""
//             }
//           />

//           <span className="hidden sm:inline">
//             Refresh
//           </span>
//         </button>

//         <button
//           type="button"
//           className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
//         >
//           <Plus size={17} />

//           Add User
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AdminUsersHeader;