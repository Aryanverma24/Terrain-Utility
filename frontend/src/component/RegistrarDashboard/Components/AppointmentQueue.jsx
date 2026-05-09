import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function AppointmentQueue({
  todayAppointments,
  upcomingAppointments,
  selectedAppointment,
  onSelectAppointment,
}) {

  const AppointmentCard = ({ appt, urgent = false }) => {

    const [expanded, setExpanded] = useState(false);

    return (
      <div
        className={`
          snap-start
          min-w-[340px]
          flex-shrink-0
          rounded-3xl
          p-6
          border
          transition-all
          duration-300
          hover:scale-[1.02]
          hover:shadow-xl

          ${
            selectedAppointment?._id === appt._id
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-200 bg-white"
          }
        `}
      >

        {/* HEADER */}
        <div className="flex justify-between items-start">

          <div>
            <h3 className="font-bold text-lg text-slate-800">
              {appt.buyer?.name ||
                appt.buyer?.username ||
                "Unknown Buyer"}
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              {appt.land?.landtype || "Property Not Available"}
            </p>
          </div>

          <div className="flex items-center gap-2">

            {urgent && (
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                Today
              </span>
            )}

            {/* DROPDOWN BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="
                h-10 w-10
                rounded-xl
                bg-slate-100
                hover:bg-slate-200
                flex items-center justify-center
                transition
              "
            >
              {expanded ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>

          </div>

        </div>

        {/* COLLAPSED CONTENT */}
        <div className="grid grid-cols-2 gap-3 mt-5">

          <div>
            <p className="text-xs text-gray-400">
              Time
            </p>

            <p className="font-semibold text-slate-700">
              {appt.timeSlot || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Date
            </p>

            <p className="font-semibold text-slate-700">
              {appt.date
                ? new Date(appt.date).toLocaleDateString("en-IN")
                : "-"}
            </p>
          </div>

        </div>

        {/* EXPANDED SECTION */}
        {expanded && (

          <div className="mt-6">

            <div className="
              rounded-2xl
              border border-slate-200
              bg-slate-50
              p-5
              space-y-4
            ">

              <div className="flex justify-between">
                <span className="text-sm text-slate-500">
                  Appointment Status
                </span>

                <span className="font-semibold text-indigo-600 capitalize">
                  {appt.status || "confirmed"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-slate-500">
                  Property Type
                </span>

                <span className="font-semibold text-slate-700 capitalize">
                  {appt.land?.landtype || "Land"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-slate-500">
                  City
                </span>

                <span className="font-semibold text-slate-700">
                  {appt.land?.city || "N/A"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-slate-500">
                  State
                </span>

                <span className="font-semibold text-slate-700">
                  {appt.land?.state || "N/A"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-slate-500">
                  Seller
                </span>

                <span className="font-semibold text-slate-700">
                  {appt.seller?.name ||
                    appt.seller?.username ||
                    "N/A"}
                </span>
              </div>

            </div>

            {/* OPEN BUTTON */}
            <button
              onClick={() => {
                onSelectAppointment(appt);

                setTimeout(() => {
                  const workbench =
                    document.getElementById("appointment-workbench");

                  if (workbench) {
                    workbench.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }, 100);
              }}
              className="
                mt-5
                w-full
                py-4
                rounded-2xl
                bg-gradient-to-r
                from-indigo-600
                to-blue-600
                hover:from-indigo-700
                hover:to-blue-700
                text-white
                font-bold
                shadow-lg
                transition-all
              "
            >
              Open Appointment Workbench
            </button>

          </div>

        )}

      </div>
    );
  };

  const Section = ({ title, data, urgent }) => (
    <div className="space-y-4">

      <h2 className="text-2xl font-bold text-slate-800">
        {title}
      </h2>

      {data?.length === 0 ? (

        <p className="text-slate-500">
          No appointments
        </p>

      ) : (

        <div
          className="
            flex
            gap-5
            overflow-x-auto
            pb-4
            snap-x
            scroll-smooth
            scrollbar-thin
            scrollbar-thumb-slate-300
          "
        >

          {data.map((a) => (
            <AppointmentCard
              key={a._id}
              appt={a}
              urgent={urgent}
            />
          ))}

        </div>

      )}

    </div>
  );

  return (
    <div className="space-y-12">

      <Section
        title="Today's Appointments"
        data={todayAppointments}
        urgent
      />

      <Section
        title="Upcoming Appointments"
        data={upcomingAppointments}
      />

    </div>
  );
}