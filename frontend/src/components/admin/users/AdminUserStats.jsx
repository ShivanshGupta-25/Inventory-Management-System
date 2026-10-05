// import {
//   UsersRound,
//   ShieldCheck,
//   BriefcaseBusiness,
//   UserRound,
//   UserCheck,
//   UserX,
// } from "lucide-react";

// const statConfig = [
//   {
//     key: "totalUsers",
//     label: "Total Users",
//     icon: UsersRound,
//   },
//   {
//     key: "totalAdmins",
//     label: "Administrators",
//     icon: ShieldCheck,
//   },
//   {
//     key: "totalManagers",
//     label: "Managers",
//     icon: BriefcaseBusiness,
//   },
//   {
//     key: "totalStaff",
//     label: "Staff",
//     icon: UserRound,
//   },
//   {
//     key: "activeUsers",
//     label: "Active",
//     icon: UserCheck,
//   },
//   {
//     key: "disabledUsers",
//     label: "Disabled",
//     icon: UserX,
//   },
// ];

// const AdminUserStats = ({
//   stats,
//   loading = false,
// }) => {
//   return (
//     <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
//       {statConfig.map((item) => {
//         const Icon = item.icon;

//         return (
//           <div
//             key={item.key}
//             className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
//           >
//             <div className="flex items-center justify-between gap-3">
//               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
//                 <Icon size={19} />
//               </div>
//             </div>

//             <div className="mt-4">
//               {loading ? (
//                 <>
//                   <div className="h-7 w-16 animate-pulse rounded-lg bg-slate-200" />

//                   <div className="mt-2 h-4 w-20 animate-pulse rounded bg-slate-100" />
//                 </>
//               ) : (
//                 <>
//                   <p className="text-2xl font-bold tracking-tight text-slate-900">
//                     {stats?.[item.key] ?? 0}
//                   </p>

//                   <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
//                     {item.label}
//                   </p>
//                 </>
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default AdminUserStats;