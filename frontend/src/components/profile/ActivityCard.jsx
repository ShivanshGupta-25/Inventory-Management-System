import {
  CheckCircle2,
  Clock3,
  LogIn,
  ShieldCheck,
} from "lucide-react";

/* -----------------------------
   Default Account Activities
------------------------------ */
const defaultActivities = [
  {
    id: "signin",
    title: "Successful sign in",
    description: "Your account is currently authenticated.",
    icon: LogIn,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "status",
    title: "Account active",
    description: "No account restrictions detected.",
    icon: CheckCircle2,
    iconClass: "bg-slate-100 text-slate-600",
  },
  {
    id: "security",
    title: "Security enabled",
    description: "Authentication protection is enabled.",
    icon: ShieldCheck,
    iconClass: "bg-slate-100 text-slate-600",
  },
];

/* -----------------------------
   Activity Card
------------------------------ */
const ActivityCard = ({
  activities = defaultActivities,
  title = "Account Activity",
  description = "Recent account events.",
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-5">
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      {/* Activity List */}
      {activities.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {activities.map((activity) => {
            const Icon = activity.icon || Clock3;

            return (
              <div
                key={activity.id}
                className="flex gap-3 p-5"
              >
                {/* Activity Icon */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    activity.iconClass ||
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon size={15} />
                </div>

                {/* Activity Details */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {activity.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {activity.description}
                  </p>

                  {activity.timestamp && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      {activity.timestamp}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center text-sm text-slate-400">
          No recent activity available.
        </div>
      )}
    </section>
  );
};

export default ActivityCard;