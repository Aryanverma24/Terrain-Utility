import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../../../utils/API";
import { getFileUrl } from "../../../../backend/utils/getFileUrl";
import { toast } from "react-toastify";
const OwnerDocuments = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [land, setLand] = useState(null);
  const [fullDocs, setFullDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
const [uploadingDocId, setUploadingDocId] = useState(null);
  const token = localStorage.getItem("token");

  // ✅ FETCH LAND + DOCUMENTS (your refactored logic)
  const fetchLand = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: landData } = await API.get(`/api/lands/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setLand(landData);

      const documentIds = landData.documents.map(doc =>
        typeof doc === "string" ? doc : doc._id
      );

      const documentDocs = await Promise.all(
        documentIds.map(async docId => {
          const res = await API.get(`/api/documents/${docId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          return res.data;
        })
      );

      const flattenedDocs = documentDocs.flatMap(doc =>
        doc.documents
          ? doc.documents.map(subDoc => ({
              _id: subDoc._id,
              type: subDoc.type,
              file: subDoc.file,
              uploadedAt: subDoc.uploadedAt,
              status: subDoc.status || doc.status,
              parentDocumentId: doc._id,
            }))
          : doc
      );

      const uniqueDocs = Array.from(
        new Map(flattenedDocs.map(d => [d._id, d])).values()
      );

      setFullDocs(uniqueDocs);

    } catch (err) {
      console.error(err);
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchLand();
  }, [id]);

  //  REUPLOAD FUNCTION
const handleReuploadDocument = async (parentDocumentId, docId, file) => {
  if (!file) return toast.error("No file selected.");

  try {
    setUploadingDocId(docId); // 🔥 START SPINNER

    const formData = new FormData();
    formData.append("file", file);

    const res = await API.put(
      `/api/documents/${docId}/reupload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Update the state locally
    setFullDocs(prev =>
      prev.map(doc =>
        doc._id === docId
          ? { ...doc, file: res.data.document.file, status: res.data.document.status }
          : doc
      )
    );

    toast.success("Document reuploaded successfully!");
  } catch (err) {
    console.error("Reupload error:", err?.response?.data || err.message);
    toast.error(err?.response?.data?.message || "Failed to reupload document");
  } finally {
    setUploadingDocId(null); // 🔥 STOP SPINNER
  }
};


  // ================= UI =================

  if (loading) return <p>Loading documents...</p>;
  if (error) return <p>{error}</p>;

  
   return (
  <div className="pt-24 px-6 pb-10">

    {/*  OWNER INFO PANEL */}
    <div className="max-w-7xl mx-auto mb-10">
      <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-3xl shadow-md p-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          {/* LEFT */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              👋 Welcome, Owner
            </h2>

            <p className="text-gray-600 text-sm leading-relaxed max-w-xl">
              Here you can track the verification status of your uploaded land documents.
              The assigned lawyer will review each document before approving your land.
            </p>

            {/* STATUS GUIDE */}
            <div className="mt-4 space-y-1 text-sm text-gray-700">
              <p>• 🟢 <span className="font-medium">Approved</span> → Document is verified successfully</p>
              <p>• 🟡 <span className="font-medium">Pending</span> → Under review by lawyer</p>
              <p>• 🔴 <span className="font-medium">Rejected</span> → Needs correction and re-upload</p>
              <p>• If rejected, upload a corrected file using the reupload option below</p>
            </div>
          </div>

          {/* RIGHT STATUS SUMMARY */}
          <div className="bg-white border border-blue-200 rounded-2xl px-6 py-4 shadow-sm text-center min-w-[220px]">
            <p className="text-sm text-gray-500">Your Document Status</p>

            <p className="text-xl font-bold text-green-600">
              {fullDocs.filter(d => d.status === "approved").length} Approved
            </p>

            <p className="text-sm font-semibold text-red-500">
              {fullDocs.filter(d => d.status === "rejected").length} Rejected
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {fullDocs.length} Total Documents
            </p>
          </div>

        </div>
      </div>
    </div>

   
    {/*  DOCUMENT SECTION */}
<div className="mt-12 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-emerald-200 max-w-7xl mx-auto">

  {/*  HEADER */}
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
      Uploaded Documents
    </h2>

    <span className="text-sm text-gray-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
      {fullDocs.filter(d => d.status === "approved").length} / {fullDocs.length} Approved
    </span>
  </div>

  {/* GRID */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

    {fullDocs.map((doc) => {
      const fileUrl = getFileUrl(doc.file);

      return (
        <div
          key={doc._id}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
        >
          {/* Preview */}
          <div className="aspect-video bg-gray-100">
            {fileUrl ? (
              <img
                src={fileUrl}
                alt={doc.type || "Document"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No Preview Available
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4 space-y-3">

            {/* Title */}
            <h3 className="text-sm font-medium text-gray-800 text-center truncate">
              {doc.type || "Document"}
            </h3>

            {/* Status */}
            <div className="flex justify-center">
              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${
                  doc.status === "approved"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : doc.status === "rejected"
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                }`}
              >
                {doc.status}
              </span>
            </div>

            {/* View */}
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm transition"
            >
              View Document
            </a>

            {/*  REUPLOAD (OWNER ONLY) */}
           {doc.status === "rejected" && (
  <div className="pt-2">
    <label className="block w-full cursor-pointer">
      
      <div className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 px-3 rounded-lg text-center transition flex items-center justify-center gap-2">

        {uploadingDocId === doc._id ? (
          <>
            {/* 🔄 Spinner */}
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Uploading...
          </>
        ) : (
          "Re-upload Document"
        )}

      </div>

      <input
        type="file"
        className="hidden"
        disabled={uploadingDocId === doc._id}
        onChange={(e) =>
          handleReuploadDocument(
            doc.parentDocumentId || doc._id,
            doc._id,
            e.target.files?.[0]
          )
        }
      />

    </label>
  </div>
)}

          </div>
        </div>
      );
    })}

  </div>
</div>
  </div>
);
}

export default OwnerDocuments;