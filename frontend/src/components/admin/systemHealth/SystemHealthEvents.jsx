import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Info,
} from "lucide-react";

const eventIcons = {
  success: CheckCircle2,
  warning: AlertCircle,
  error: AlertCircle,
  info: Info,
};

const eventClasses = {
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  error: "bg-red-50 text-red-600",
  info: "bg-sky-50 text-sky-600",
};

const SystemHealthEvents = ({
  events = [],
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Recent System Events
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Recent events related to system availability.
          </p>
        </div>

        <Activity
          size={17}
          className="text-slate-300"
        />
      </div>

      {events.length === 0 ? (
        <div className="p-8 text-center">
          <Activity
            size={22}
            className="mx-auto text-slate-300"
          />

          <p className="mt-3 text-sm font-medium text-slate-600">
            No recent system events
          </p>

          <p className="mt-1 text-xs text-slate-400">
            System events will appear here when monitoring
            is available.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {events.map((event) => {
            const Icon =
              eventIcons[event.type] ||
              Info;

            return (
              <div
                key={event.id}
                className="flex items-start gap-3 px-5 py-4 sm:px-6"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    eventClasses[event.type] ||
                    eventClasses.info
                  }`}
                >
                  <Icon size={14} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800">
                    {event.title}
                  </p>

                  {event.description && (
                    <p className="mt-1 text-[10px] leading-4 text-slate-400">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-1 text-[9px] text-slate-400">
                    <Clock3 size={10} />
                    {event.time || "Unknown"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SystemHealthEvents;