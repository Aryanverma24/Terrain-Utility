import React from "react";

export default function DocumentScrutinyPanel({docs,onVerify}){

return(
<div className="bg-white rounded-3xl shadow-lg p-8">

<h2 className="text-xl font-bold mb-6">
Document Scrutiny
</h2>

<div className="space-y-4">

{docs.map(doc=>(
<div
key={doc.name}
className="border rounded-2xl p-5 flex justify-between items-center"
>

<div>
<h3 className="font-semibold">
{doc.name}
</h3>

<p className="text-sm text-gray-500">
{doc.status}
</p>
</div>

<button
onClick={()=>onVerify(doc)}
className="px-5 py-2 rounded-xl bg-indigo-600 text-white"
>
Verify
</button>

</div>
))}

</div>

</div>
)

}