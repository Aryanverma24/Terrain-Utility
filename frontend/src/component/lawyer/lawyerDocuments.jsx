import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../../../utils/API";
import { getFileUrl } from "../../../../backend/utils/getFileUrl";
import { toast } from "react-toastify";
import { AuthContext } from "../../../contexts/AuthContext";
import { useContext } from "react";
const LawyerDocuments = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fullDocs, setFullDocs] = useState([]);
  const [land, setLand] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
const { user } = useContext(AuthContext);
 const currentUserId = user?._id;
const role = user?.role;
  const token = localStorage.getItem("token");
//geo baseed states 
// GEO STATES (REPLACE ALL OLD GEO STATES)
const [lawyerLat, setLawyerLat] = useState("");
const [lawyerLng, setLawyerLng] = useState("");

const [geoLoading, setGeoLoading] = useState(false);

// preview (before save)
const [showGeoResult, setShowGeoResult] = useState(false);
const [calculatedDistance, setCalculatedDistance] = useState(null);
const [autoStatus, setAutoStatus] = useState("");
const [finalStatus, setFinalStatus] = useState("");
//lawyer self declaration state
const [lawyerAgreed, setLawyerAgreed] = useState(false);
const [lawyerDeclarationError, setLawyerDeclarationError] = useState(false);
// final saved result
const [geoResult, setGeoResult] = useState(null);
const [geoNote, setGeoNote] = useState("");
//to check the existing status 
const isAlreadyVerified =
  land?.geoVerification &&
  land.geoVerification.status !== "pending";

//--------the self decaralartion segemnt----------
const isDeclarationDone =
  land?.geoVerification?.lawyerDeclaration?.accepted === true;
const handleLawyerAgree = () => {
  setLawyerAgreed(!lawyerAgreed);

  if (lawyerDeclarationError) {
    setLawyerDeclarationError(false);
  }
};
const handleLawyerDeclarationSubmit = async () => {
  if (!lawyerAgreed) {
    setLawyerDeclarationError(true);

    document.getElementById("lawyerDeclarationBox")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    // remove glow after 2 sec
    setTimeout(() => setLawyerDeclarationError(false), 2000);

    return;
  }

  try {
    await API.put(
      `/api/lands/lawyer-declaration/${id}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    toast.success("Declaration submitted ✅");

    // 🔥 REDIRECT BACK TO SINGLE LAND
    navigate(`/land/${id}`);

  } catch (err) {
    console.error(err);
    toast.error("Failed to save declaration");
  }
};
  //--------the cooridnates verification segement----------
//for the first time 
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const handlePreVerify = () => {
  if (!lawyerLat || !lawyerLng) {
    return toast.error("Enter coordinates first");
  }

  const [ownerLng, ownerLat] = land.location.coordinates;

  const dist = calculateDistance(
    ownerLat,
    ownerLng,
    Number(lawyerLat),
    Number(lawyerLng)
  );

  const status = dist < 0.1 ? "matched" : "mismatched";

  setCalculatedDistance(dist);
  setAutoStatus(status);
  setShowGeoResult(true);
};
//geo handle function 
const handleFinalSubmit = async () => {
  try {
    setGeoLoading(true);

    const res = await API.put(
      `/api/lands/geo-verify/${id}`,
      {
        lat: Number(lawyerLat),
        lng: Number(lawyerLng),
        note: geoNote,
        statusOverride: finalStatus,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setGeoResult(res.data.geoVerification);

    toast.success("Verification saved successfully!");

    // optional reset
    setShowGeoResult(false);

  } catch (err) {
    console.error(err);
    toast.error("Failed to save verification");
  } finally {
    setGeoLoading(false);
  }
};
//------documents verficiation section----------
//showcasing each document to lawyer
  const updateDocStatus = async (docId, status) => {
    if (!token) return toast.error("Login required.");

    try {
      const endpoint = `/api/documents/file/${docId}/${status}`;
      const res = await API.put(endpoint, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const updatedDoc = res.data.doc;
      const notification = res.data.notification;

      setFullDocs(prev =>
        prev.map(doc =>
          doc._id === docId ? { ...doc, status } : doc
        )
      );

      if (status === "approved") {
        toast.success("Document approved successfully!");
      } else if (status === "rejected") {
        toast.error("Document rejected.");
      }

      if (notification) {
        setNotifications(prev => [notification, ...prev]);
      }

      console.log(`${status} success for`, docId, updatedDoc, notification);
    } catch (err) {
      console.error(
        "updateDocStatus err:",
        err?.response?.data || err.message || err
      );
      toast.error("Failed to update document status.");
    }
  };

  // FETCH LOGIC
  const fetchLand = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: landData } = await API.get(`/api/lands/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setLand(landData); 
console.log("LAWYER DOC LAND:", landData);
console.log("ASSIGNED LAWYER:", landData.assignedLawyer);
console.log("CURRENT USER:", currentUserId);
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
//function to map each required documents to be uploaded
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
  }, [fetchLand]); 

  // ================= UI =================
return (
  <div className="pt-24 px-6 pb-10">

    {/* ENHANCED WELCOME PANEL */}
    <div className="max-w-7xl mx-auto mb-10">
      <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-200 rounded-3xl shadow-md p-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          {/* LEFT CONTENT */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              👋 Welcome, Lawyer
            </h2>

            <p className="text-gray-600 text-sm leading-relaxed max-w-xl">
              You are responsible for verifying land documents submitted by the owner.
              Carefully review each file before approving or rejecting.
            </p>

            <div className="mt-4 space-y-1 text-sm text-gray-700">
              <p>• View each document before taking action</p>
              <p>• Approve or reject every document</p>
              <p>• Once all are reviewed, return to previous page for final land approval</p>
            </div>
          </div>

          {/* RIGHT STATUS BOX */}
          <div className="bg-white border border-emerald-200 rounded-2xl px-6 py-4 shadow-sm text-center min-w-[200px]">
            <p className="text-sm text-gray-500">Progress</p>
            <p className="text-2xl font-bold text-emerald-600">
              {fullDocs.filter(d => d.status === "approved").length} / {fullDocs.length}
            </p>
            <p className="text-xs text-gray-500">Documents Approved</p>
          </div>

        </div>
      </div>
    </div>

    {/*  DOCUMENT SECTION  */}
    <div className="mt-12 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-emerald-200 max-w-7xl mx-auto">

      {/*   HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Uploaded Documents
        </h2>

        <span className="text-sm text-gray-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          {fullDocs.filter(d => d.status === "approved").length} / {fullDocs.length} Approved
        </span>
      </div>

      {/*  ORIGINAL GRID  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {fullDocs.map((doc) => {
          const fileUrl = getFileUrl(doc.file);

          return (
            <div
              key={doc._id}
              className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
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
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No Preview</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-center mb-2 truncate">
                  {doc.type || "Document"}
                </h3>

                {/* Status */}
                <div className="flex justify-center mb-3">
                  {doc.status === "approved" && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Approved
                    </span>
                  )}
                  {doc.status === "rejected" && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Rejected
                    </span>
                  )}
                  {doc.status === "pending" && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Pending
                    </span>
                  )}
                </div>

                {/* View */}
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg"
                >
                  View Document
                </a>

                {/* ACTION BUTTONS */}
                {role === "lawyer" &&
                  land?.assignedLawyer &&
                  String(land.assignedLawyer?._id || land.assignedLawyer) === String(currentUserId) && (

                  <div className="mt-3 flex gap-2">

                    <button
                      onClick={() => updateDocStatus(doc._id, "approved")}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:bg-gray-400"
                      disabled={doc.status !== "pending"}
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => updateDocStatus(doc._id, "rejected")}
                      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:bg-gray-400"
                      disabled={doc.status !== "pending"}
                    >
                      Reject
                    </button>

                  </div>
                )}
              </div>
            </div>
          );
        })}

      </div>

     {/* ================= GEO VERIFICATION ================= */}
<div className="max-w-7xl mx-auto mt-16 bg-white p-8 rounded-3xl shadow-xl border border-blue-200">

  <h2 className="text-3xl font-bold text-gray-900 mb-6">
    📍 Geo-Based Verification
  </h2>

  {/* OWNER COORDINATES */}
  {land?.location?.coordinates && (
    <div className="mb-6">
      <p className="text-sm text-gray-600">Owner Coordinates</p>
      <p className="font-semibold text-gray-900">
        Lat: {land.location.coordinates[1]} | Lng: {land.location.coordinates[0]}
      </p>
    </div>
  )}

  {/* MAP */}
  {land?.location?.coordinates && (
    <div className="h-[300px] rounded-xl overflow-hidden border mb-6">
      <iframe
        title="map"
        width="100%"
        height="100%"
        loading="lazy"
        src={`https://maps.google.com/maps?q=${land.location.coordinates[1]},${land.location.coordinates[0]}&z=15&output=embed`}
      />
    </div>
  )}

  {/* INPUT */}
  <div className="grid md:grid-cols-2 gap-4 mb-4">
   <input
  type="number"
  placeholder="Enter Latitude"
  value={lawyerLat}
  onChange={(e) => setLawyerLat(e.target.value)}
  disabled={isAlreadyVerified}
  className="border p-3 rounded-lg disabled:bg-gray-100"
/>

<input
  type="number"
  placeholder="Enter Longitude"
  value={lawyerLng}
  onChange={(e) => setLawyerLng(e.target.value)}
  disabled={isAlreadyVerified}
  className="border p-3 rounded-lg disabled:bg-gray-100"
/>
  </div>

  {/* VERIFY BUTTON */}
  <button
  onClick={handlePreVerify}
  disabled={isAlreadyVerified}
  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
>
  {isAlreadyVerified ? "Already Verified" : "Verify Coordinates"}
</button>

  {/* RESULT DIV (INLINE) */}
  {showGeoResult && (
    <div className="mt-8 p-6 rounded-2xl border border-blue-200 bg-blue-50">

      <h3 className="text-xl font-bold mb-4">Verification Result</h3>

      <p>
        <strong>Distance:</strong> {calculatedDistance.toFixed(3)} km
      </p>

      <p>
        <strong>System Suggestion:</strong>{" "}
        <span className={`font-semibold ${autoStatus === "matched" ? "text-green-600" : "text-red-600"}`}>
          {autoStatus}
        </span>
      </p>

      {/* OVERRIDE */}
      <div className="mt-4">
        <label className="text-sm text-gray-600">Final Decision</label>
        <select
          value={finalStatus}
          onChange={(e) => setFinalStatus(e.target.value)}
          className="w-full border p-2 rounded-lg mt-1"
        >
          <option value="">Use system result</option>
          <option value="matched">Matched</option>
          <option value="mismatched">Mismatched</option>
        </select>
      </div>

      {/* NOTE */}
      <textarea
        placeholder="Write note for buyers..."
        value={geoNote}
        onChange={(e) => setGeoNote(e.target.value)}
        className="w-full border p-3 rounded-lg mt-4"
      />

      {/* SAVE */}
      <button
        onClick={handleFinalSubmit}
        disabled={geoLoading}
        className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
      >
        {geoLoading ? "Saving..." : "Save Verification"}
      </button>
    </div>
  )}

  {/* FINAL SAVED RESULT */}
  {geoResult && (
    <div className="mt-6 p-4 rounded-xl border bg-gray-50">
      <p><strong>Status:</strong> {geoResult.status}</p>
      <p><strong>Distance:</strong> {geoResult.distance?.toFixed(3)} km</p>
      <p><strong>Note:</strong> {geoResult.note || "No note"}</p>
    </div>
  )}

{/* ================= FINAL VERIFIED VIEW (AFTER RELOAD) ================= */}
{isAlreadyVerified && land?.geoVerification && (
  <div className="mt-6 p-6 rounded-2xl border bg-green-50">

    <h3 className="text-xl font-bold mb-3 text-green-700">
      ✅ Verification Completed
    </h3>

    <p>
      <strong>Status:</strong>{" "}
      <span className={`font-semibold ${
        land.geoVerification.status === "matched"
          ? "text-green-600"
          : "text-red-600"
      }`}>
        {land.geoVerification.status}
      </span>
    </p>

    <p>
      <strong>Distance:</strong>{" "}
      {land.geoVerification.distance?.toFixed(3)} km
    </p>
<p>
  <strong>Owner Coordinates:</strong>{" "}
  Lat: {land.location?.coordinates?.[1]} | 
  Lng: {land.location?.coordinates?.[0]}
</p>
    <p>
      <strong>Lawyer Coordinates:</strong>{" "}
      Lat: {land.geoVerification.lawyerCoordinates?.[1]} | 
      Lng: {land.geoVerification.lawyerCoordinates?.[0]}
    </p>

    <p>
      <strong>Note:</strong>{" "}
      {land.geoVerification.note || "No note provided"}
    </p>

    <p className="text-sm text-gray-500 mt-2">
      Verified at: {new Date(land.geoVerification.verifiedAt).toLocaleString()}
    </p>

  </div>
)}

{/* ================= LAWYER DECLARATION ================= */}
{/* ================= LAWYER DECLARATION ================= */}

{!isDeclarationDone ? (
  // ===================== FORM =====================
  <div
    id="lawyerDeclarationBox"
    className={`mt-12 p-6 rounded-2xl border transition-all duration-300
    ${
      lawyerDeclarationError
        ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse"
        : "border-gray-200 bg-white"
    }`}
  >
    <h3 className="text-xl font-bold text-gray-900 mb-4">
      Lawyer Declaration & Responsibility
    </h3>

    <div className="text-gray-600 text-sm space-y-3 leading-relaxed">
      <p>
        I hereby confirm that I have carefully reviewed all submitted property documents
        and verified their authenticity to the best of my knowledge.
      </p>

      <p>
        I have also verified the geographical location of the property and ensured
        that it matches the provided coordinates.
      </p>

      <p>
        I understand that approving incorrect or fraudulent documents may lead to
        legal consequences and professional liability.
      </p>

      <p className="text-red-500 font-semibold">
        ⚠️ I take full responsibility for my verification decision.
      </p>
    </div>

    {/* CHECKBOX */}
    <div className="flex items-center mt-5 gap-3">
      <input
        type="checkbox"
        checked={lawyerAgreed}
        onChange={handleLawyerAgree}
        className="w-5 h-5 accent-emerald-500"
      />
      <label className="text-gray-800 text-sm">
        I agree and accept responsibility for this verification
      </label>
    </div>

    {/* SUBMIT */}
    <button
      onClick={handleLawyerDeclarationSubmit}
      className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg"
    >
      Save Declaration & Return
    </button>
  </div>

) : (
  // ===================== SUCCESS BLOCK =====================
  <div className="mt-12 p-6 rounded-2xl border border-green-200 bg-green-50">
    <h3 className="text-xl font-bold text-green-700 mb-3">
      ✅ Declaration Completed
    </h3>

    <p className="text-gray-700">
      You have already submitted your declaration.
    </p>

    <p className="text-sm text-gray-600 mt-2">
      Submitted at:{" "}
      {new Date(
        land.geoVerification.lawyerDeclaration.acceptedAt
      ).toLocaleString()}
    </p>
  </div>
)}

</div>
    </div>
  </div>
);
};

export default LawyerDocuments;