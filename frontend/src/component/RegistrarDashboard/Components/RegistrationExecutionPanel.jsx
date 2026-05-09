import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useRef } from "react";
import { useEffect } from "react";
export const API = axios.create({
  baseURL: "http://localhost:5000/api", 
});

export default function RegistrationExecutionPanel({
    appointment, 
  appointmentId,
  execution = {},
  registrarDecision,
  onStatusUpdate 
}) {

  const stages = [
    "Identity Validation",
    "Biometric Capture",
    "Deed Execution",
    "Stamp Registration",
    "Registration Completed"
  ];

  // derive stage from backend
  const getStage = () => {

  if (!execution?.identity?.verified) return 0;

  if (!execution?.biometric?.verified) return 1;

  if (!execution?.deed?.verified) return 2;

  if (!execution?.stamp?.verified) return 3;

  if (appointment?.status !== "completed") return 4;

  return 5;
};

  const stage = getStage();

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState({});


const decisionStatus = registrarDecision?.status;
const isBlocked = decisionStatus !== "approved";

//vamera states
const [stream, setStream] = useState(null);
const [cameraOn, setCameraOn] = useState(false);
const [preview, setPreview] = useState({});
const videoRef = React.useRef(null);
const canvasRef = React.useRef(null);

const startCamera = async () => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });

    setStream(mediaStream);   // ✅ store it
    setCameraOn(true);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    }, 0);

  } catch (err) {
    console.error("Camera error:", err);
  }
};

const capturePhoto = (type) => {
  const video = videoRef.current;
  const canvas = canvasRef.current;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  const image = canvas.toDataURL("image/jpeg");

  setPreview((prev) => ({
    ...prev,
    [type]: image
  }));
};
//to stop camera
const stopCamera = () => {
  stream?.getTracks().forEach((track) => track.stop());
};
  // =============================
  // ACTION HANDLERS
  // =============================
const handleIdentity = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem("registrarToken");

    console.log("🚀 CLICKED VERIFY");
    console.log("📌 Appointment ID:", appointmentId);
    console.log("🔑 Token:", token);

    const res = await API.patch(
      `/appointments/${appointmentId}/identity`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ API RESPONSE:", res.data);

    toast.success("Identity verified ✅");

    onStatusUpdate && onStatusUpdate(res.data.appointment);

  } catch (err) {
    console.error("❌ FRONTEND ERROR:", err.response || err);
    toast.error(err?.response?.data?.message);
  } finally {
    setLoading(false);
  }
};
const base64ToBlob = (base64) => {
  if (!base64) return null;

  const parts = base64.split(",");
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";

  const byteString = atob(parts[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  return new Blob([uint8Array], { type: mime });
};
const handleBiometric = async () => {
  try {
    setLoading(true);

    const form = new FormData();

    // ✅ attach filename (VERY IMPORTANT)
    form.append(
      "buyerPhoto",
      base64ToBlob(preview.buyerPhoto),
      "buyer.jpg"
    );

    form.append(
      "sellerPhoto",
      base64ToBlob(preview.sellerPhoto),
      "seller.jpg"
    );

    if (preview.groupPhoto) {
      form.append(
        "groupPhoto",
        base64ToBlob(preview.groupPhoto),
        "group.jpg"
      );
    }

    const token = localStorage.getItem("registrarToken");

    const res = await API.patch(
      `/appointments/${appointmentId}/biometric`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ REMOVE THIS LINE (axios sets automatically)
          // "Content-Type": "multipart/form-data"
        }
      }
    );

    toast.success("Biometric captured ✅");

    // ✅ update UI live
    onStatusUpdate && onStatusUpdate(res.data.appointment);

  } catch (err) {
    console.error(err);
    toast.error(err?.response?.data?.message || "Upload failed");
  } finally {
    setLoading(false);
  }
};
//handle deed 
const handleDeed = async () => {
  try {
    const form = new FormData();
    form.append("file", files.deed);

    const token = localStorage.getItem("registrarToken");

    setLoading(true);

    const res = await API.patch(
      `/appointments/${appointmentId}/deed`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("Deed uploaded ✅");

    // ✅ UPDATE UI WITHOUT RELOAD
    onStatusUpdate && onStatusUpdate(res.data.appointment);

  } catch (err) {
    console.error(err);
    toast.error(err?.response?.data?.message || "Upload failed");
  } finally {
    setLoading(false);
  }
};
const handleStamp = async () => {
  try {
    setLoading(true);

    const form = new FormData();

    form.append("registryDoc", files.registryDoc);
    form.append("stampProof", files.stampProof);

    const token = localStorage.getItem("registrarToken");

    const res = await API.patch(
      `/appointments/${appointmentId}/stamp`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("Stamp documents uploaded ✅");

    // ✅ LIVE UI UPDATE (NO RELOAD)
    onStatusUpdate && onStatusUpdate(res.data.appointment);

  } catch (err) {
    console.error(err);
    toast.error(err?.response?.data?.message || "Upload failed");
  } finally {
    setLoading(false);
  }
};

const handleComplete = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem("registrarToken");

    const res = await API.patch(
      `/appointments/${appointmentId}/complete`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("Registration Completed 🎉");

    // 🔥 THIS is the real fix
    onStatusUpdate && onStatusUpdate(res.data.appointment);

  } catch (err) {
    console.error(err);
    toast.error(err?.response?.data?.message || "Failed");
  } finally {
    setLoading(false);
  }
};
const isCompleted =
  execution?.identity?.verified &&
  execution?.biometric?.verified &&
  execution?.deed?.verified &&
  execution?.stamp?.verified &&
  appointment?.status === "completed";

  // =============================
  // RENDER ACTION PER STEP
  // =============================

  const renderAction = (i) => {
    if (isBlocked) {
      return (
        <span className="text-sm text-red-500">
          Approval required
        </span>
      );
    }

    if (loading) {
      return <span className="text-sm">Processing...</span>;
    }

    switch (i) {
      case 0:
        return (
          <button
            onClick={handleIdentity}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
          >
            Verify Identity
          </button>
        );

case 1:
  return (
    <div className="space-y-6">

      {/* CAMERA INIT */}
      {!cameraOn ? (
        <div className="flex flex-col items-center justify-center gap-4 py-10 bg-indigo-50/40 border border-indigo-200 rounded-2xl">

          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
            📷
          </div>

          <p className="text-gray-700 font-medium">
            Start Biometric Capture System
          </p>

          <p className="text-xs text-gray-500 text-center max-w-sm">
            Activate camera to capture buyer, seller, and group verification photos
          </p>

          <button
            onClick={startCamera}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md transition active:scale-95"
          >
            Start Camera
          </button>

        </div>
      ) : (
        <>
          {/* CAMERA FEED */}
          <div className="bg-black rounded-2xl overflow-hidden shadow-lg border">

            <video
              ref={videoRef}
              autoPlay
              className="w-full h-[320px] object-cover"
            />

          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* CAPTURE ACTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            <button
              onClick={() => capturePhoto("buyerPhoto")}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition shadow"
            >
              📸 Capture Buyer
            </button>

            <button
              onClick={() => capturePhoto("sellerPhoto")}
              className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl transition shadow"
            >
              📸 Capture Seller
            </button>

            <button
              onClick={() => capturePhoto("groupPhoto")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition shadow"
            >
              👥 Capture Group
            </button>

          </div>
        </>
      )}

      {/* PREVIEW SECTION */}
      {Object.keys(preview).length > 0 && (
        <div className="bg-white border rounded-2xl p-4 shadow-sm">

          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Captured Photos Preview
          </h3>

          <div className="flex gap-4 flex-wrap">

            {Object.entries(preview).map(([key, img]) => (
              <div key={key} className="text-center">

                <img
                  src={img}
                  alt={key}
                  className="w-28 h-28 object-cover rounded-xl border shadow-sm"
                />

                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {key.replace("Photo", "")}
                </p>

              </div>
            ))}

          </div>

        </div>
      )}

      {/* FINAL SUBMIT */}
      {preview.buyerPhoto && preview.sellerPhoto && (
        <div className="pt-2">

          <button
            onClick={handleBiometric}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-md transition active:scale-95"
          >
            Upload Biometric Verification
          </button>

        </div>
      )}

    </div>
  );
case 2:
  return (
    <div className="flex flex-col gap-4">

      {/* UPLOAD BOX */}
      <label className="cursor-pointer group">

        <div className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 transition rounded-2xl p-6 bg-indigo-50/40 hover:bg-indigo-50">

          <div className="flex flex-col items-center justify-center text-center gap-2">

            {/* ICON */}
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center group-hover:scale-105 transition">
              📄
            </div>

            <p className="text-sm font-semibold text-gray-700">
              Upload Sale Deed Document
            </p>

            <p className="text-xs text-gray-500">
              PDF, JPG, PNG supported
            </p>

            <p className="text-xs text-indigo-600 font-medium mt-1">
              Click or drop file here
            </p>

          </div>

          <input
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={(e) =>
              setFiles({ ...files, deed: e.target.files[0] })
            }
          />

        </div>
      </label>

      {/* FILE SELECTED CARD */}
      {files.deed && (
        <div className="flex items-center justify-between bg-white border border-green-200 shadow-sm rounded-xl px-4 py-3">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
              ✅
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800">
                {files.deed.name}
              </p>
              <p className="text-xs text-gray-500">
                Ready for upload
              </p>
            </div>

          </div>

          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
            Selected
          </span>

        </div>
      )}

      {/* UPLOAD BUTTON */}
      <button
        onClick={handleDeed}
        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold px-5 py-3 rounded-xl shadow-md transition active:scale-[0.98]"
      >
        Upload Deed Document
      </button>

    </div>
  );
     case 3:
  return (
    <div className="flex flex-col gap-5">

      {/* REGISTRY DOCUMENT */}
      <div className="bg-indigo-50/40 border border-indigo-200 rounded-2xl p-4">

        <label className="text-sm font-semibold text-gray-700">
          Registry Document
        </label>

        <label className="mt-2 cursor-pointer block">

          <div className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 transition rounded-xl p-5 text-center bg-white">

            <p className="text-sm text-gray-600">
              Click to upload Registry Document
            </p>

            <p className="text-xs text-gray-400 mt-1">
              PDF / Image supported
            </p>

          </div>

          <input
            type="file"
            className="hidden"
            onChange={(e) =>
              setFiles({ ...files, registryDoc: e.target.files[0] })
            }
          />

        </label>

        {files.registryDoc && (
          <p className="mt-2 text-xs text-green-600 font-medium">
            ✔ {files.registryDoc.name}
          </p>
        )}

      </div>

      {/* STAMP DUTY PROOF */}
      <div className="bg-indigo-50/40 border border-indigo-200 rounded-2xl p-4">

        <label className="text-sm font-semibold text-gray-700">
          Stamp Duty Proof
        </label>

        <label className="mt-2 cursor-pointer block">

          <div className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 transition rounded-xl p-5 text-center bg-white">

            <p className="text-sm text-gray-600">
              Click to upload Stamp Duty Proof
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Receipt / PDF / Image
            </p>

          </div>

          <input
            type="file"
            className="hidden"
            onChange={(e) =>
              setFiles({ ...files, stampProof: e.target.files[0] })
            }
          />

        </label>

        {files.stampProof && (
          <p className="mt-2 text-xs text-green-600 font-medium">
            ✔ {files.stampProof.name}
          </p>
        )}

      </div>

      {/* UPLOAD BUTTON */}
      <button
        onClick={handleStamp}
        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold px-5 py-3 rounded-xl shadow-md transition active:scale-[0.98]"
      >
        Upload Stamp Documents
      </button>

    </div>
  );

  case 4:
  return isCompleted ? (

    // ✅ SHOW SUMMARY AFTER COMPLETION
    <div className="bg-green-50 border border-green-200 p-4 rounded-xl space-y-3">

      <h3 className="text-green-700 font-semibold">
        ✅ Registration Completed
      </h3>

      <div className="text-sm text-gray-700 space-y-1">
        <p>✔ Identity Verified</p>
        <p>✔ Biometric Captured</p>
        <p>✔ Deed Uploaded</p>
        <p>✔ Stamp Duty Verified</p>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        Completed on: {new Date().toLocaleString()}
      </div>

    </div>

  ) : (

    // 🟡 SHOW BUTTON IF NOT DONE
    <button
      onClick={handleComplete}
      className="bg-green-600 text-white px-4 py-2 rounded-xl"
    >
      Complete Registration
    </button>

  );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">

      <h2 className="text-xl font-bold mb-6">
        Registration Execution
      </h2>

      <div className="space-y-4">

        {stages.map((s, i) => (
          <div
            key={s}
            className={`
              p-5 rounded-2xl border flex justify-between items-center
              ${
                i < stage
                  ? "bg-green-50 border-green-200"
                  : i === stage
                  ? "bg-indigo-50 border-indigo-200"
                  : "bg-slate-50"
              }
            `}
          >
            <span>{s}</span>

            {i === stage && renderAction(i)}

            {i < stage && (
              <span className="text-green-600 text-sm">
                Completed
              </span>
            )}
          </div>
        ))}

      </div>

    </div>
  );
}