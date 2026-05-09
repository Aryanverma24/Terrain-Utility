import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import { API } from "../../../../utils/API";

export default function MutationPanel({ mutation }) {
  const [open, setOpen] = useState(false);
  const [localMutation, setLocalMutation] = useState(mutation || null);
  const docRef = useRef();

  // keep in sync when parent updates
  useEffect(() => {
    setLocalMutation(mutation);
  }, [mutation]);

  if (!localMutation) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-xl font-bold mb-2">Mutation Module</h2>
        <p className="text-gray-500">
          Mutation is being generated or not available yet.
        </p>
      </div>
    );
  }

  const hash = btoa(
    `${localMutation._id}${localMutation.mutationNumber}${localMutation.createdAt}`
  );

  const handleDownloadPDF = async () => {
    const canvas = await html2canvas(docRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${localMutation.mutationNumber}.pdf`);
  };

  const handleSign = async () => {
    try {
      const token = localStorage.getItem("registrarToken");

      const res = await API.patch(
        `/api/mutations/sign/${localMutation._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        alert("Mutation Signed Successfully");

        setLocalMutation((prev) => ({
          ...prev,
          mutationStatus: "approved",
          digitalSignature: {
            hash: res.data.hash || "SIGNED_HASH",
          },
        }));
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Signing failed");
    }
  };

  const isSigned = !!localMutation?.digitalSignature?.hash;

  return (
    <>
      {/* SUMMARY */}
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-xl font-bold mb-5">
          Mutation Registry Record
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50">
            <p className="text-sm text-gray-500">Mutation No</p>
            <p className="font-semibold">
              {localMutation?.mutationNumber}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50">
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-semibold capitalize">
              {localMutation?.mutationStatus}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50">
            <p className="text-sm text-gray-500">Land</p>
            <p className="font-semibold">
              {localMutation?.land?.city || "N/A"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="mt-6 px-6 py-3 rounded-2xl bg-indigo-600 text-white"
        >
          Open Registry Document
        </button>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-white w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">

            {/* ACTION BAR */}
           <div className="flex justify-between items-center p-5 border-b relative z-20 bg-white">
              <h2 className="text-xl font-bold">
                📜 Legal Registry Document
              </h2>

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Download PDF
                </button>

                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Close
                </button>

                {/* SIGN BUTTON */}
                <button
                  disabled={isSigned}
                  onClick={handleSign}
                  className={`px-5 py-2 rounded-xl text-white ${
                    isSigned ? "bg-gray-400" : "bg-green-600"
                  }`}
                >
                  {isSigned ? "✔ Signed" : "🔐 Sign Mutation"}
                </button>
              </div>
            </div>

            {/* DOCUMENT */}
            <div
              ref={docRef}
              className="relative p-10 bg-white text-black"
            >
              {/* WATERMARK */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 text-6xl font-bold rotate-[-25deg]">
                GOVT OF LAND REGISTRY
              </div>

              {/* HEADER */}
              <div className="text-center border-b pb-5 mb-6">
                <h1 className="text-2xl font-bold">
                  Government Land Mutation Certificate
                </h1>
                <p className="text-sm">
                  Official Registered Document
                </p>
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="font-semibold">Mutation Number</p>
                  <p>{localMutation?.mutationNumber}</p>
                </div>

                <div>
                  <p className="font-semibold">Status</p>
                  <p>{localMutation?.mutationStatus}</p>
                </div>

                <div>
                  <p className="font-semibold">Seller</p>
                  <p>{localMutation?.seller?.username}</p>
                </div>

                <div>
                  <p className="font-semibold">Buyer</p>
                  <p>{localMutation?.buyer?.username}</p>
                </div>

                <div>
                  <p className="font-semibold">Registrar</p>
                  <p>
                    {localMutation?.registrar?.registrarName ||
                      "Registrar"}
                  </p>
                </div>

                <div>
                  <p className="font-semibold">Land Location</p>
                  <p>{localMutation?.land?.city}</p>
                </div>

                <div className="col-span-2 mt-4">
                  <p className="font-semibold">Mutation Draft</p>
                  <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-4 rounded-xl">
                    {localMutation?.mutationDraft}
                  </pre>
                </div>

                {isSigned && (
                  <div className="mt-4 p-3 bg-green-50 border rounded-xl text-sm col-span-2">
                    <p>✔ Digitally Signed</p>
                    <p className="text-xs break-all">
                      Hash: {localMutation.digitalSignature.hash}
                    </p>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="mt-10 flex justify-between items-center border-t pt-5">
                <div>
                  <p className="text-xs text-gray-500">
                    Immutable Hash (Audit Trail)
                  </p>
                  <p className="text-xs font-mono">{hash}</p>
                </div>

                <div className="text-center">
                  <QRCodeCanvas
                    value={`https://your-system.com/mutation/${localMutation._id}`}
                    size={80}
                  />
                  <p className="text-xs mt-1">Verify Document</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}