import React, { useState } from "react";
import { API } from "../../../../utils/API";

export default function TransferApprovalPanel({
  appointment,
  mutation,
  onTransferComplete
}) {

  const [loading, setLoading] = useState(false);

  const isLocked = mutation?.isLocked;
console.log("TRANSFER PANEL MUTATION:", mutation);
  const handleApproveTransfer = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("registrarToken");

     const res = await API.patch(
  `/api/mutations/finalize-transfer/${appointment._id}`,
  {},
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

      if (res.data.success) {

        alert("Ownership Transfer Completed Successfully");

        // 🔥 parent state refresh
        if (onTransferComplete) {
          onTransferComplete(res.data);
        }
      }

    } catch (err) {

      console.error(err);

      alert(
        err?.response?.data?.message ||
        "Transfer finalization failed"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="
      bg-gradient-to-br
      from-emerald-50
      via-white
      to-green-50
      border border-green-200
      rounded-3xl
      p-8
      shadow-xl
    ">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-6">

        <div>

          <div className="flex items-center gap-3 mb-3">

            <div className="
              h-14 w-14
              rounded-2xl
              bg-emerald-100
              flex items-center justify-center
              text-2xl
            ">
              🏛
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Finalize Ownership Transfer
              </h2>

              <p className="text-sm text-slate-500">
                Permanent registry ownership execution
              </p>
            </div>

          </div>

          <p className="text-slate-600 leading-relaxed max-w-3xl">
            Once finalized, ownership records will be permanently updated
            in the land registry database and mutation workflow will be
            locked from further modification.
          </p>

        </div>

      </div>

      {/* STATUS GRID */}
      <div className="grid md:grid-cols-4 gap-4 mt-8">

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">
            Mutation Status
          </p>

          <p className="
            font-bold
            capitalize
            text-emerald-700
          ">
            {mutation?.mutationStatus || "pending"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">
            Current Owner
          </p>

          <p className="font-bold text-slate-800">
            {mutation?.seller?.username || "N/A"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">
            New Owner
          </p>

          <p className="font-bold text-slate-800">
            {mutation?.buyer?.username || "N/A"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">
            Registry Lock
          </p>

          <p className={`
            font-bold
            ${isLocked
              ? "text-emerald-700"
              : "text-amber-600"}
          `}>
            {isLocked ? "Locked" : "Pending"}
          </p>
        </div>

      </div>

      {/* SECURITY NOTICE */}
      <div className="
        mt-8
        p-6
        rounded-3xl
        bg-amber-50
        border border-amber-200
      ">

        <h3 className="font-bold text-amber-800 mb-3">
          Registry Finalization Actions
        </h3>

        <div className="grid md:grid-cols-2 gap-3 text-sm text-amber-700">

          <div>
            • Mutation document will be locked
          </div>

          <div>
            • Land ownership will transfer to buyer
          </div>

          <div>
            • Ownership history chain will update
          </div>

          <div>
            • Ownership count will increment
          </div>

          <div>
            • Registry status becomes transferred
          </div>

          <div>
            • Immutable audit trail preserved
          </div>

        </div>

      </div>

      {/* LOCKED STATE */}
      {isLocked && (

        <div className="
          mt-8
          bg-slate-900
          rounded-3xl
          p-6
          text-white
          border border-slate-700
        ">

          <div className="flex items-start gap-4">

            <div className="text-3xl">
              🔒
            </div>

            <div>

              <h3 className="font-bold text-lg">
                Transfer Already Finalized
              </h3>

              <p className="text-slate-300 mt-1 text-sm leading-relaxed">
                Mutation registry has been permanently locked and ownership
                records have already been transferred to the buyer.
              </p>

            </div>

          </div>

        </div>
      )}

      {/* ACTIONS */}
      {!isLocked && (
        <div className="flex flex-wrap gap-4 mt-8">

          <button
            disabled={
              loading ||
              mutation?.mutationStatus !== "approved"
            }
            onClick={handleApproveTransfer}
            className={`
              px-7 py-3 rounded-2xl text-white font-semibold
              transition-all duration-200
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] shadow-lg"
              }
            `}
          >
            {loading
              ? "Finalizing Transfer..."
              : "✅ Approve Transfer"}
          </button>

          <button
            className="
              px-7 py-3 rounded-2xl
              bg-red-500 hover:bg-red-600
              text-white font-semibold
              transition-all duration-200
              shadow-lg
            "
          >
            🚨 Flag Exception
          </button>

        </div>
      )}

    </div>
  );
}