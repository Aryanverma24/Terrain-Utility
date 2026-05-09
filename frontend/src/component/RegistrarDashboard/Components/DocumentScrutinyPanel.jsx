import React, { useEffect, useState } from "react";
import { getFileUrl } from "../../../../../backend/utils/getFileUrl";
import axios from "axios";
import { API } from "../../../../utils/API.js";
export default function DocumentScrutinyPanel({
  appointment,
  appointmentId,
  landDocs = [],
  buyerDocs = [],
  ownerDocs = [],
  loading = false,
  onStatusUpdate = () => {},
}) {
  const [showAdditional, setShowAdditional] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
const decisionStatus = appointment?.registrarDecision?.status;

useEffect(() => {
  console.log("APPOINTMENT:", appointment);
}, [appointment]);
  // FILTER CONFIG
  const LAND_PRIMARY = [
    "SaleDeed",
    "LandRegistry",
    "EncumbranceCertificate",
    "Khata",
    "PropertyTax",
  ];

  const LAND_ADDITIONAL = ["SurveyMap", "Noc"];

  const USER_DOCS = ["Aadhaar", "PAN", "ProfilePhoto"];

  const filterByTypes = (docs = [], allowed) =>
    docs.filter((doc) => allowed.includes(doc.type));

  const landPrimaryDocs = filterByTypes(landDocs, LAND_PRIMARY);
  const landAdditionalDocs = filterByTypes(landDocs, LAND_ADDITIONAL);
  const buyerFiltered = filterByTypes(buyerDocs, USER_DOCS);
  const ownerFiltered = filterByTypes(ownerDocs, USER_DOCS);

  // CARD RENDER (CSS SAME)
  const renderCards = (docs) => (
    <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300">
      {docs.map((doc, i) => {
        const fileUrl = getFileUrl(doc.file);

        return (
          <div
            key={doc?._id || i}
            className="
              min-w-[260px]
              bg-gradient-to-br from-white to-slate-50
              border border-slate-200
              rounded-2xl
              p-4
              shadow-sm
              hover:shadow-xl
              hover:-translate-y-1
              transition-all duration-200
              flex-shrink-0
            "
          >
            <div className="flex justify-between items-start mb-2">
              <p className="font-semibold text-slate-800 text-sm">
                {doc.type}
              </p>

              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  doc.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : doc.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {doc.status || "pending"}
              </span>
            </div>

            {fileUrl ? (
              <img
                src={fileUrl}
                alt="document"
                className={
                  doc.type === "ProfilePhoto"
                    ? "h-28 w-28 mx-auto rounded-full object-cover mb-3 border"
                    : "h-32 w-full object-cover rounded-lg mb-3 border"
                }
              />
            ) : (
              <div className="h-32 flex items-center justify-center bg-gray-100 rounded-lg mb-3 text-xs text-gray-500">
                No Preview
              </div>
            )}

            {/* CHANGED: Verify → View (CSS SAME STYLE FAMILY) */}
            <button
              onClick={() => setSelectedDoc(doc)}
              className="
                w-full py-2
                bg-indigo-600
                hover:bg-indigo-700
                text-white
                rounded-lg
                text-sm
                font-medium
                transition
              "
            >
              View
            </button>
          </div>
        );
      })}
    </div>
  );

  const renderSection = (title, docs) => (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">
          {title}
        </h3>
        <div className="h-px flex-1 bg-slate-200 ml-4" />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : docs.length === 0 ? (
        <p className="text-gray-500 text-sm">No documents</p>
      ) : (
        renderCards(docs)
      )}
    </div>
  );

  // FINAL SUBMIT
const handleSubmit = async (action) => {
  if (!appointmentId) {
    alert("Appointment ID missing");
    return;
  }

  if (action === "reject" && !note.trim()) {
    alert("Please provide a reason for rejection");
    return;
  }

  try {
    setSubmitting(true);

    const token = localStorage.getItem("registrarToken");

    const res = await API.patch(
      `/api/appointments/${appointmentId}/decision`,
      {
        status: action === "approve"
          ? "approved"
          : "rejected",
        note
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log("PATCH RESPONSE:", res.data);

    // ✅ IMPORTANT
    const updatedAppointment = res.data.appointment;

    if (updatedAppointment && onStatusUpdate) {
      onStatusUpdate(updatedAppointment);
    }

  } catch (err) {
    console.error(err);

    alert(
      err?.response?.data?.message ||
      "Something went wrong"
    );

  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">

      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800">
          Document Scrutiny
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Review and verify submitted documents
        </p>
      </div>

      {renderSection("Land Documents", landPrimaryDocs)}

      {landAdditionalDocs.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setShowAdditional(!showAdditional)}
            className="
              group flex items-center gap-2 px-4 py-2 text-sm font-medium
              border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition
            "
          >
            <span>
              {showAdditional
                ? "Hide Additional Documents"
                : "Show Additional Documents"}
            </span>
            <span
              className={`transition-transform duration-200 ${
                showAdditional ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>
        </div>
      )}

      {showAdditional &&
        renderSection("Additional Land Documents", landAdditionalDocs)}

      {renderSection("Buyer Documents", buyerFiltered)}
      {renderSection("Owner Documents", ownerFiltered)}

      {/* FINAL DECISION PANEL (styled to match existing UI) */}
     {/* FINAL DECISION PANEL */}
<div className="mt-10 border-t border-slate-200 pt-6">

  <h3 className="text-lg font-semibold text-slate-800 mb-3">
    Final Decision
  </h3>

  {/* CASE 1: Already decided */}
  {decisionStatus === "approved" && (
    <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 font-medium">
      This appointment has been approved by the registrar. No further actions are allowed.
    </div>
  )}

  {decisionStatus === "rejected" && (
    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium">
      This appointment has been rejected by the registrar. The verification process is closed.
    </div>
  )}

  {/* CASE 2: Still pending → show actions */}
  {(!decisionStatus || decisionStatus === "pending") && (
    <>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add remarks (required for rejection)"
        className="
          w-full border border-slate-300 rounded-lg p-3 text-sm mb-4
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        "
      />

      <div className="flex gap-4">
        <button
          onClick={() => handleSubmit("approve")}
          disabled={submitting}
          className="
            flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50
            text-white rounded-lg text-sm font-medium transition
          "
        >
          Approve
        </button>

        <button
          onClick={() => handleSubmit("reject")}
          disabled={submitting}
          className="
            flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50
            text-white rounded-lg text-sm font-medium transition
          "
        >
          Reject
        </button>
      </div>
    </>
  )}

</div>

      {/* PREVIEW MODAL (kept minimal, not breaking theme) */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-4 max-w-3xl w-full shadow-xl">

            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold text-slate-800">
                {selectedDoc.type}
              </p>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-sm text-gray-500 hover:text-black"
              >
                Close
              </button>
            </div>

            <img
              src={getFileUrl(selectedDoc.file)}
              alt="preview"
              className="w-full max-h-[70vh] object-contain rounded"
            />

          </div>
        </div>
      )}
    </div>
  );
}