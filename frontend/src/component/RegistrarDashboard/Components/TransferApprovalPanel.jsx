import React from "react";

export default function TransferApprovalPanel(){

return(
<div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 rounded-3xl p-8">

<h2 className="text-2xl font-bold mb-4">
Finalize Ownership Transfer
</h2>

<p className="text-slate-600">
After mutation acknowledgement, complete transfer.
</p>

<div className="flex gap-4 mt-6">

<button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl">
Approve Transfer
</button>

<button className="px-6 py-3 bg-red-500 text-white rounded-2xl">
Flag Exception
</button>

</div>

</div>
)

}