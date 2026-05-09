import React, { useState } from "react";
import { API } from "../../../../utils/API";

export default function PartyAttendancePanel({
  attendance,
  setAttendance = () => {}, // ✅ safe fallback
  appointmentId
}) {
  const [loading, setLoading] = useState(false);
  const [savingItem, setSavingItem] = useState(null);

  const options = [
    "All Present",
    "Buyer Absent",
    "Seller Absent",
    "Witness Missing",
    "Adjournment Requested"
  ];

  const handleSelect = async (item) => {
    if (loading) return;
    if (attendance === item) return;

    setSavingItem(item);
    setLoading(true);

    try {
      const token = localStorage.getItem("registrarToken");

      await API.patch(
        `/api/appointments/${appointmentId}/attendance`,
        { attendance: item },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // ✅ update only after success
      setAttendance(item);

    } catch (err) {
      console.error(err);
      alert("Failed to update attendance");
    } finally {
      setLoading(false);
      setSavingItem(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">

      <h2 className="text-xl font-bold mb-2">
        Party Presence Verification
      </h2>

      {/* STATUS BANNER */}
      {attendance && (
        <div className="mb-5 p-3 rounded-xl bg-green-50 border border-green-200 text-sm font-medium">
          ✔ Current Attendance:{" "}
          <span className="font-semibold">{attendance}</span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">

        {options.map((item) => {
          const isSelected = attendance === item;
          const isSaving = savingItem === item;

          return (
            <button
              key={item}
              disabled={loading}
              onClick={() => handleSelect(item)}
              className={`
                p-5 rounded-2xl border font-medium transition relative
                ${
                  isSelected
                    ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                    : "border-slate-200 hover:border-indigo-300"
                }
                ${loading ? "opacity-60 cursor-not-allowed" : ""}
              `}
            >
              {item}

              {/* LOADING STATE */}
              {isSaving && (
                <div className="text-xs mt-2 text-indigo-600 font-semibold">
                  Saving...
                </div>
              )}

              {/* CONFIRMED STATE */}
              {isSelected && !loading && (
                <div className="text-xs mt-2 text-green-700 font-semibold">
                  ✔ Already Marked
                </div>
              )}
            </button>
          );
        })}

      </div>

      {/* SPECIAL CASE */}
      {attendance === "Adjournment Requested" && (
        <div className="mt-6 rounded-2xl bg-amber-50 p-5 border border-amber-200">
          ⚠ Case marked for adjournment — rescheduling workflow will be triggered.
        </div>
      )}

    </div>
  );
}