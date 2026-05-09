import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  ShieldCheck,
  Clock3,
  User,
  FileText,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Landmark,
  Upload,
  RefreshCcw,
  Loader2,
} from "lucide-react";

import { API } from "../../../../utils/API";

export default function AuditTimeline({ landId }) {

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
const [refreshKey, setRefreshKey] = useState(0);
  /* =====================================
     FETCH AUDIT TRAIL
  ===================================== */

useEffect(() => {
  if (!landId) return;
  fetchAuditTrail();
}, [landId, refreshKey]);

  const fetchAuditTrail = async () => {

    try {

      setLoading(true);

const { data } = await API.get(
  `/api/lands/${landId}/audit-trail`,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("registrarToken")}`,
    },
  }
);

console.log("AUDIT RESPONSE:", data);

      setEvents(data.auditTrail || []);

    } catch (err) {

      console.log(err);

      setEvents([]);

    } finally {

      setLoading(false);

    }

  };

  /* =====================================
     ICON MAPPER
  ===================================== */

  const getIcon = (action = "") => {

    const text = action.toLowerCase();

    if (
      text.includes("upload") ||
      text.includes("document")
    ) {
      return <Upload size={18} />;
    }

    if (
      text.includes("verify") ||
      text.includes("approved")
    ) {
      return <CheckCircle2 size={18} />;
    }

    if (
      text.includes("lawyer")
    ) {
      return <Scale size={18} />;
    }

    if (
      text.includes("ownership") ||
      text.includes("registry") ||
      text.includes("mutation")
    ) {
      return <Landmark size={18} />;
    }

    if (
      text.includes("refresh") ||
      text.includes("reverification")
    ) {
      return <RefreshCcw size={18} />;
    }

    if (
      text.includes("reject")
    ) {
      return <AlertTriangle size={18} />;
    }

    return <FileText size={18} />;
  };

  /* =====================================
     COLOR MAPPER
  ===================================== */

  const getColor = (action = "") => {

    const text = action.toLowerCase();

    if (
      text.includes("approved") ||
      text.includes("verified") ||
      text.includes("completed")
    ) {
      return `
        bg-emerald-100
        text-emerald-700
        border-emerald-200
      `;
    }

    if (
      text.includes("reject")
    ) {
      return `
        bg-red-100
        text-red-700
        border-red-200
      `;
    }

    if (
      text.includes("refresh") ||
      text.includes("reverification")
    ) {
      return `
        bg-amber-100
        text-amber-700
        border-amber-200
      `;
    }

    return `
      bg-indigo-100
      text-indigo-700
      border-indigo-200
    `;
  };

  /* =====================================
     FORMAT DATE
  ===================================== */

  const formatDate = (date) => {

    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  };

  return (

    <div
      className="
        bg-white
        rounded-[32px]
        shadow-xl
        border
        border-slate-200
        overflow-hidden
      "
    >

      {/* HEADER */}
      <div
        className="
          px-8
          py-6
          border-b
          bg-gradient-to-r
          from-indigo-50
          via-white
          to-purple-50
        "
      >

        <div className="flex items-center gap-4">

          <div
            className="
              h-14
              w-14
              rounded-2xl
              bg-indigo-100
              flex
              items-center
              justify-center
              text-indigo-700
            "
          >
            <ShieldCheck size={26} />
          </div>

          <div>

            <h2
              className="
                text-2xl
                font-black
                text-slate-800
              "
            >
              Property Audit Trail
            </h2>

            <p className="text-slate-500 text-sm mt-1">
              Complete chronological history of all
              verification, registration and ownership
              actions
            </p>

          </div>

        </div>

      </div>

      {/* LOADING */}
      {loading ? (

        <div className="p-20 flex justify-center">

          <Loader2
            size={40}
            className="animate-spin text-indigo-600"
          />

        </div>

      ) : !events || events.length === 0 ? (

        /* EMPTY */

        <div className="p-14 text-center">

          <div
            className="
              mx-auto
              h-20
              w-20
              rounded-full
              bg-slate-100
              flex
              items-center
              justify-center
              text-slate-400
              mb-5
            "
          >
            <Clock3 size={34} />
          </div>

          <h3 className="text-xl font-bold text-slate-700">
            No Audit Logs Available
          </h3>

          <p className="text-slate-500 mt-2">
            This property currently has no recorded
            activity logs.
          </p>

        </div>

      ) : (

        /* TIMELINE */

        <div className="relative px-8 py-10">

          {/* LINE */}
          <div
            className="
              absolute
              left-[43px]
              top-10
              bottom-10
              w-[3px]
              bg-gradient-to-b
              from-indigo-200
              via-purple-200
              to-emerald-200
            "
          />

          <div className="space-y-8">

            {events.map((e, i) => (

              <div
                key={i}
                className="
                  relative
                  flex
                  gap-5
                  group
                "
              >

                {/* ICON */}
                <div
                  className={`
                    relative
                    z-10
                    h-10
                    w-10
                    rounded-2xl
                    border
                    flex
                    items-center
                    justify-center
                    shadow-sm
                    transition-all
                    duration-300
                    group-hover:scale-110

                    ${getColor(e.action)}
                  `}
                >
                  {getIcon(e.action)}
                </div>

                {/* CARD */}
                <div
                  className="
                    flex-1
                    rounded-3xl
                    border
                    border-slate-200
                    bg-slate-50/70
                    backdrop-blur-md
                    p-5
                    shadow-sm
                    hover:shadow-md
                    transition-all
                    duration-300
                  "
                >

                  {/* TOP */}
                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h3
                        className="
                          text-lg
                          font-bold
                          text-slate-800
                        "
                      >
                        {e.action || "Unknown Action"}
                      </h3>

                      {e.description && (
                        <p
                          className="
                            text-sm
                            text-slate-600
                            mt-2
                            leading-relaxed
                          "
                        >
                          {e.description}
                        </p>
                      )}

                    </div>

                    {/* STATUS */}
                    <div
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-bold
                        border
                        whitespace-nowrap

                        ${getColor(e.action)}
                      `}
                    >
                      Logged
                    </div>

                  </div>

                  {/* META */}
                  <div
                    className="
                      flex
                      flex-wrap
                      gap-5
                      mt-5
                      text-sm
                      text-slate-500
                    "
                  >

                    {/* USER */}
                    {(e.performerName || e.performedBy) && (
                      <div className="flex items-center gap-2">

                        <User size={15} />

                        <span>
                          {e.performerName || "System"}
                        </span>

                      </div>
                    )}

                    {/* ROLE */}
                    {e.performerRole && (
                      <div
                        className="
                          px-3
                          py-1
                          rounded-full
                          bg-slate-200
                          text-slate-700
                          text-xs
                          font-semibold
                        "
                      >
                        {e.performerRole}
                      </div>
                    )}

                    {/* TIME */}
                    {e.createdAt && (
                      <div className="flex items-center gap-2">

                        <Clock3 size={15} />

                        <span>
                          {formatDate(e.createdAt)}
                        </span>

                      </div>
                    )}

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  );

}