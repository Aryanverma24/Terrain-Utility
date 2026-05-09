import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { API } from '../../../utils/API';
import { getFileUrl } from '../../../../backend/utils/getFileUrl';
import { toast } from 'react-toastify';

const OwnerDocuments = () => {
  const { id } = useParams();

  const [land, setLand] = useState(null);
  const [fullDocs, setFullDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [uploadingDocId, setUploadingDocId] = useState(null);

  const [updatedDocs, setUpdatedDocs] = useState([]);
  const [refreshingDocs, setRefreshingDocs] = useState(false);

  const token = localStorage.getItem('token');

  // FETCH LAND + DOCUMENTS
  const fetchLand = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: landData } = await API.get(`/api/lands/${id}`, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      });

      setLand(landData);

      const documentIds = landData.documents.map((doc) =>
        typeof doc === 'string'
          ? doc
          : doc._id,
      );

      const documentDocs = await Promise.all(
        documentIds.map(async (docId) => {
          const res = await API.get(
            `/api/documents/${docId}`,
            {
              headers: token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {},
            },
          );

          return res.data;
        }),
      );

      const flattenedDocs =
        documentDocs.flatMap((doc) =>
          doc.documents
            ? doc.documents.map((subDoc) => ({
                _id: subDoc._id,
                type: subDoc.type,
                file: subDoc.file,
                uploadedAt:
                  subDoc.uploadedAt,
                status:
                  subDoc.status ||
                  doc.status,
                parentDocumentId:
                  doc._id,
              }))
            : doc,
        );

      const uniqueDocs = Array.from(
        new Map(
          flattenedDocs.map((d) => [
            d._id,
            d,
          ]),
        ).values(),
      );

      setFullDocs(uniqueDocs);

    } catch (err) {

      console.error(err);

      setError(
        'Failed to load documents',
      );

    } finally {

      setLoading(false);

    }
  }, [id, token]);

  useEffect(() => {
    fetchLand();
  }, [fetchLand]);

  // REUPLOAD DOCUMENT
  const handleReuploadDocument = async (
    parentDocumentId,
    docId,
    file,
  ) => {

    if (!file) {
      return toast.error(
        'No file selected.',
      );
    }

    try {

      setUploadingDocId(docId);

      const formData = new FormData();

      formData.append('file', file);

      const res = await API.put(
        `/api/documents/${docId}/reupload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type':
              'multipart/form-data',
          },
        },
      );

      setFullDocs((prev) =>
        prev.map((doc) =>
          doc._id === docId
            ? {
                ...doc,
                file:
                  res.data.document.file,
                status:
                  res.data.document
                    .status,
              }
            : doc,
        ),
      );

      setUpdatedDocs((prev) => {

        if (prev.includes(docId)) {
          return prev;
        }

        return [...prev, docId];

      });

      toast.success(
        'Document uploaded successfully!',
      );

    } catch (err) {

      console.error(
        'Reupload error:',
        err?.response?.data ||
          err.message,
      );

      toast.error(
        err?.response?.data?.message ||
          'Failed to upload document',
      );

    } finally {

      setUploadingDocId(null);

    }
  };

  // REFRESH DOCUMENTS
  const handleRefreshDocuments =
    async () => {

      try {

        if (
          updatedDocs.length !==
          fullDocs.length
        ) {
          return toast.error(
            'Please upload updated versions of all documents before continuing.',
          );
        }

        setRefreshingDocs(true);

        const { data } = await API.put(
          `/api/lands/${id}/refresh-documents`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        toast.success(
          data.message ||
            'Documents refreshed successfully',
        );

        await fetchLand();

        setUpdatedDocs([]);

      } catch (err) {

        console.error(err);

        toast.error(
          err?.response?.data?.message ||
            'Failed to refresh documents',
        );

      } finally {

        setRefreshingDocs(false);

      }
    };

  // UI STATES
  if (loading) {
    return <p>Loading documents...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="pt-24 px-6 pb-10">

      {/* OWNER PANEL */}
      <div className="max-w-7xl mx-auto mb-10">

        <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-3xl shadow-md p-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>

              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, Owner
              </h2>

              <p className="text-gray-600 text-sm leading-relaxed max-w-xl">
                Here you can track the verification status
                of your uploaded land documents.
              </p>

              {land?.documentsRefreshRequired && (

  <div
    className="
      mt-6
      relative
      overflow-hidden
      rounded-3xl
      border-2
      border-amber-400
      bg-gradient-to-br
      from-amber-50
      via-orange-50
      to-red-50
      shadow-xl
      animate-pulse
    "
  >

    {/* TOP STRIP */}
    <div
      className="
        bg-gradient-to-r
        from-red-600
        via-orange-500
        to-amber-500
        text-white
        px-6
        py-3
        font-black
        text-sm
        tracking-wide
        uppercase
      "
    >
      ⚠ ACTION REQUIRED — FINALIZE DOCUMENT VERIFICATION
    </div>

    <div className="p-6">

      {/* MAIN WARNING */}
      <div className="flex items-start gap-4">

        <div
          className="
            h-14
            w-14
            rounded-2xl
            bg-red-100
            flex
            items-center
            justify-center
            text-3xl
            shrink-0
            border
            border-red-300
          "
        >
          🚨
        </div>

        <div>

          <h3
            className="
              text-2xl
              font-black
              text-red-700
              mb-2
            "
          >
            Updated Documents Must Be Finalized
          </h3>

          <p
            className="
              text-gray-700
              leading-relaxed
              text-sm
              md:text-base
            "
          >
            You have uploaded updated ownership documents for this property.
            <span className="font-bold text-red-600">
              {" "}Your land WILL NOT be sent to lawyers automatically{" "}
            </span>
            until you click the
            <span className="font-black text-amber-700">
              {" "}“Finalize Updated Documents”
            </span>
            button below.
          </p>

          <div
            className="
              mt-4
              bg-white/80
              border
              border-amber-300
              rounded-2xl
              p-4
            "
          >

            <h4 className="font-bold text-amber-800 mb-2">
              Important Instructions
            </h4>

            <ul className="space-y-2 text-sm text-gray-700">

              <li>
                ✅ Upload ALL updated ownership documents
              </li>

              <li>
                ✅ Wait until every document shows as updated
              </li>

              <li className="font-bold text-red-600">
                ⚠ FINAL STEP:
                Click “Finalize Updated Documents”
              </li>

              <li>
                ✅ Only after finalization will the land status become:
                <span className="font-bold text-emerald-700">
                  {" "}Pending Verification
                </span>
              </li>

              <li>
                ✅ Lawyers will then review your new ownership documents
              </li>

            </ul>

          </div>

        </div>

      </div>

      {/* PROGRESS */}
      <div className="mt-6">

        <div className="flex justify-between mb-2">

          <span className="text-sm font-bold text-gray-700">
            Upload Progress
          </span>

          <span className="text-sm font-black text-amber-700">
            {updatedDocs.length} / {fullDocs.length} Documents Updated
          </span>

        </div>

        <div
          className="
            h-4
            rounded-full
            bg-gray-200
            overflow-hidden
          "
        >
          <div
            className="
              h-full
              bg-gradient-to-r
              from-amber-500
              to-orange-600
              transition-all
              duration-500
            "
            style={{
              width: `${
                fullDocs.length
                  ? (updatedDocs.length / fullDocs.length) * 100
                  : 0
              }%`,
            }}
          />
        </div>

      </div>

      {/* FINALIZE BUTTON */}
      <button
        onClick={handleRefreshDocuments}
        disabled={
          refreshingDocs ||
          updatedDocs.length !== fullDocs.length
        }
        className={`
          mt-7
          w-full
          py-5
          rounded-2xl
          text-lg
          font-black
          transition-all
          duration-300
          shadow-2xl

          ${
            refreshingDocs ||
            updatedDocs.length !== fullDocs.length
              ? `
                bg-gray-300
                text-gray-600
                cursor-not-allowed
              `
              : `
                bg-gradient-to-r
                from-red-600
                via-orange-500
                to-amber-500
                hover:scale-[1.02]
                hover:shadow-[0_20px_50px_rgba(255,115,0,0.35)]
                text-white
                animate-bounce
              `
          }
        `}
      >

        {refreshingDocs
          ? "Finalizing Updated Documents..."
          : updatedDocs.length !== fullDocs.length
          ? `Upload Remaining Documents (${updatedDocs.length}/${fullDocs.length})`
          : `🚀 FINALIZE UPDATED DOCUMENTS & SEND TO LAWYER`}
      </button>

      {/* EXTRA NOTE */}
      <p
        className="
          text-center
          text-xs
          text-red-600
          font-semibold
          mt-4
        "
      >
        Your land cannot be relisted or verified until finalization is completed.
      </p>

    </div>

  </div>

)}

            </div>

            {/* STATUS */}
            <div className="bg-white border border-blue-200 rounded-2xl px-6 py-4 shadow-sm text-center min-w-[220px]">

              <p className="text-sm text-gray-500">
                Your Document Status
              </p>

              <p className="text-xl font-bold text-green-600">
                {
                  fullDocs.filter(
                    (d) =>
                      d.status ===
                      'approved',
                  ).length
                }{' '}
                Approved
              </p>

              <p className="text-sm font-semibold text-red-500">
                {
                  fullDocs.filter(
                    (d) =>
                      d.status ===
                      'rejected',
                  ).length
                }{' '}
                Rejected
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {fullDocs.length} Total Documents
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* DOCUMENTS */}
      <div className="mt-12 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-emerald-200 max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Uploaded Documents
          </h2>

          <span className="text-sm text-gray-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {
              fullDocs.filter(
                (d) =>
                  d.status ===
                  'approved',
              ).length
            }{' '}
            / {fullDocs.length} Approved
          </span>

        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {fullDocs.map((doc) => {

            const fileUrl =
              getFileUrl(doc.file);

            return (
              <div
                key={doc._id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >

                {/* PREVIEW */}
                <div className="aspect-video bg-gray-100">

                  {fileUrl ? (
                    <img
                      src={fileUrl}
                      alt={
                        doc.type ||
                        'Document'
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      No Preview Available
                    </div>
                  )}

                </div>

                {/* INFO */}
                <div className="p-4 space-y-3">

                  <h3 className="text-sm font-medium text-gray-800 text-center truncate">
                    {doc.type || 'Document'}
                  </h3>

                  {/* STATUS */}
                  <div className="flex justify-center">

                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        doc.status ===
                        'approved'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : doc.status ===
                              'rejected'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}
                    >
                      {doc.status}
                    </span>

                  </div>

                  {/* VIEW */}
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm transition"
                  >
                    View Document
                  </a>

                  {/* REUPLOAD */}
                  {(doc.status ===
                    'rejected' ||
                    land?.documentsRefreshRequired) && (
                    <div className="pt-2">

                      <label className="block w-full cursor-pointer">

                        <div className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 px-3 rounded-lg text-center transition flex items-center justify-center gap-2">

                          {uploadingDocId ===
                          doc._id ? (
                            <>
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
                          ) : land?.documentsRefreshRequired ? (
                            updatedDocs.includes(
                              doc._id,
                            )
                              ? 'Updated Successfully'
                              : 'Upload Updated Document'
                          ) : (
                            'Re-upload Document'
                          )}

                        </div>

                        <input
                          type="file"
                          className="hidden"
                          disabled={
                            uploadingDocId ===
                            doc._id
                          }
                          onChange={(e) =>
                            handleReuploadDocument(
                              doc.parentDocumentId ||
                                doc._id,
                              doc._id,
                              e.target
                                .files?.[0],
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
};

export default OwnerDocuments;