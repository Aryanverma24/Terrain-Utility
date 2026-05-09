import React, { useState } from "react";

export default function MutationQueue({
  mutationQueue = [],
  selectedAppointment,
  onSelectAppointment,
  workbenchRef,
}) {

  const [expandedCard, setExpandedCard] = useState(null);

  // ONLY SHOW ACTIVE / UNLOCKED MUTATIONS
  const visibleMutations = mutationQueue.filter(
    (m) => !m?.isLocked
  );

  const handleOpenWorkbench = (appt) => {

    onSelectAppointment(appt);

    setTimeout(() => {

      workbenchRef?.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    }, 200);
  };

  return (

    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h2 className="text-3xl font-bold text-slate-800">
            Mutation Processing Queue
          </h2>

          <p className="text-slate-500 mt-2">
            Registry-approved cases awaiting mutation finalization and ownership transfer.
          </p>
        </div>

        <div
          className="
            flex items-center gap-3
            px-5 py-3
            rounded-2xl
            bg-gradient-to-r
            from-amber-100
            to-orange-100
            border border-amber-200
            shadow-sm
          "
        >
          <div className="h-3 w-3 rounded-full bg-amber-500 animate-pulse" />

          <span className="font-semibold text-amber-700">
            {visibleMutations.length} Active Mutation Cases
          </span>
        </div>

      </div>

      {/* EMPTY */}
      {visibleMutations.length === 0 ? (

        <div
          className="
            bg-white
            rounded-[32px]
            border border-slate-200
            shadow-lg
            p-14
            text-center
          "
        >

          <div
            className="
              h-24 w-24 mx-auto
              rounded-full
              bg-emerald-100
              flex items-center justify-center
              text-5xl
            "
          >
            ✅
          </div>

          <h3 className="text-2xl font-bold text-slate-700 mt-6">
            No Active Mutation Cases
          </h3>

          <p className="text-slate-500 mt-3 max-w-xl mx-auto leading-relaxed">
            All mutation workflows have either been completed,
            finalized, or ownership transfers have already been locked
            into the registry system.
          </p>

        </div>

      ) : (

        <div
          className="
            flex gap-6
            overflow-x-auto
            pb-4
            snap-x
            scroll-smooth
          "
        >

          {visibleMutations.map((appt) => {

            const isSelected =
              selectedAppointment?._id === appt._id;

            const mutation = appt;

            const isExpanded =
              expandedCard === appt._id;

            return (

              <div
                key={appt._id}
                className={`
                  min-w-[420px]
                  max-w-[420px]
                  rounded-[32px]
                  border
                  bg-white
                  p-7
                  shadow-lg
                  transition-all
                  duration-300
                  flex-shrink-0
                  hover:-translate-y-1
                  hover:shadow-2xl

                  ${
                    isSelected
                      ? `
                        border-amber-500
                        ring-4
                        ring-amber-100
                        bg-gradient-to-br
                        from-amber-50
                        to-orange-50
                      `
                      : "border-slate-200"
                  }
                `}
              >

                {/* TOP */}
                <div className="flex justify-between items-start gap-4">

                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      {mutation?.buyer?.username ||
                        mutation?.buyer?.name ||
                        "Buyer"}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      Mutation & Ownership Transfer Workflow
                    </p>
                  </div>

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        px-4 py-2
                        rounded-2xl
                        bg-amber-100
                        text-amber-700
                        text-xs
                        font-bold
                        whitespace-nowrap
                      "
                    >
                      Mutation Active
                    </div>

                    {/* DROPDOWN BUTTON */}
                    <button
                      onClick={() =>
                        setExpandedCard(
                          isExpanded ? null : appt._id
                        )
                      }
                      className="
                        h-10
                        w-10
                        rounded-xl
                        bg-slate-100
                        hover:bg-slate-200
                        transition
                        flex items-center justify-center
                        text-lg
                      "
                    >
                      {isExpanded ? "▲" : "▼"}
                    </button>

                  </div>

                </div>

                {/* ALWAYS VISIBLE SHORT CARD */}
                <div
                  className="
                    mt-6
                    rounded-3xl
                    bg-gradient-to-br
                    from-slate-50
                    to-slate-100
                    border border-slate-200
                    p-5
                  "
                >

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Property Type
                      </p>

                      <h4 className="font-bold text-lg text-slate-800 mt-1 capitalize">
                        {appt?.land?.landtype || "Land"}
                      </h4>
                    </div>

                    <div
                      className="
                        h-14 w-14
                        rounded-2xl
                        bg-indigo-100
                        flex items-center justify-center
                        text-2xl
                      "
                    >
                      🏡
                    </div>

                  </div>

                  <div className="mt-5 flex justify-between">

                    <div>
                      <p className="text-xs text-slate-500">
                        Mutation Status
                      </p>

                      <p className="font-bold text-amber-600 capitalize mt-1">
                        {mutation?.mutationStatus || "Pending"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        Current Owner
                      </p>

                      <p className="font-bold text-slate-800 mt-1">
                        {mutation?.seller?.username ||
                          mutation?.seller?.name ||
                          "Seller"}
                      </p>
                    </div>

                  </div>

                </div>

                {/* EXPANDED CONTENT */}
                {isExpanded && (

                  <>

                    {/* INFO GRID */}
                    <div className="grid grid-cols-2 gap-4 mt-6">

                      <div
                        className="
                          rounded-2xl
                          border border-slate-200
                          bg-slate-50
                          p-4
                        "
                      >
                        <p className="text-xs text-slate-500">
                          Appointment Date
                        </p>

                        <h4 className="font-bold text-slate-800 mt-2">
                          {appt?.date
                            ? new Date(appt.date)
                                .toLocaleDateString("en-IN")
                            : "-"}
                        </h4>
                      </div>

                      <div
                        className="
                          rounded-2xl
                          border border-slate-200
                          bg-slate-50
                          p-4
                        "
                      >
                        <p className="text-xs text-slate-500">
                          Attendance
                        </p>

                        <h4
                          className={`
                            font-bold mt-2 text-sm
                            ${
                              appt?.attendance === "All Present"
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }
                          `}
                        >
                          {appt?.attendance || "Pending"}
                        </h4>
                      </div>

                    </div>

                    {/* OWNERSHIP FLOW */}
                    <div
                      className="
                        mt-6
                        rounded-2xl
                        bg-indigo-50
                        border border-indigo-100
                        p-5
                      "
                    >

                      <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide">
                        Ownership Flow
                      </p>

                      <div className="flex items-center justify-between mt-4">

                        <div>
                          <p className="text-xs text-slate-500">
                            Current Owner
                          </p>

                          <p className="font-bold text-slate-800">
                            {mutation?.seller?.username ||
                              mutation?.seller?.name ||
                              "Seller"}
                          </p>
                        </div>

                        <div className="text-2xl">
                          ➜
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-500">
                            New Owner
                          </p>

                          <p className="font-bold text-emerald-700">
                            {mutation?.buyer?.username ||
                              mutation?.buyer?.name ||
                              "Buyer"}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* EXTRA DETAILS */}
                    <div
                      className="
                        mt-6
                        rounded-2xl
                        border border-slate-200
                        bg-slate-50
                        p-5
                        space-y-3
                      "
                    >

                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm">
                          Transfer Status
                        </span>

                        <span className="font-semibold text-amber-600 capitalize">
                          {appt?.land?.transferStatus || "Pending"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm">
                          Mutation Locked
                        </span>

                        <span
                          className={`
                            font-semibold
                            ${
                              mutation?.isLocked
                                ? "text-emerald-600"
                                : "text-red-500"
                            }
                          `}
                        >
                          {mutation?.isLocked ? "Yes" : "No"}
                        </span>
                      </div>

                    </div>

                  </>

                )}

                {/* ACTION */}
                <button
                  onClick={() =>
                    handleOpenWorkbench(appt)
                  }
                  className="
                    mt-7
                    w-full
                    py-4
                    rounded-2xl
                    bg-gradient-to-r
                    from-amber-500
                    to-orange-500
                    hover:from-amber-600
                    hover:to-orange-600
                    text-white
                    font-bold
                    shadow-lg
                    transition-all
                  "
                >
                  Open Mutation Workbench
                </button>

              </div>

            );

          })}

        </div>

      )}

    </div>

  );
}