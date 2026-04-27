import React from "react";

export default function PartyAttendancePanel({
attendance,
setAttendance
}){

const options=[
"All Present",
"Buyer Absent",
"Seller Absent",
"Witness Missing",
"Adjournment Requested"
];

return(
<div className="bg-white rounded-3xl shadow-lg p-8">

<h2 className="text-xl font-bold mb-6">
Party Presence Verification
</h2>

<div className="grid md:grid-cols-3 gap-4">

{options.map(item=>(
<button
key={item}
onClick={()=>setAttendance(item)}
className={`
p-5 rounded-2xl border font-medium transition
${attendance===item
?"border-indigo-500 bg-indigo-50"
:"border-slate-200"}
`}
>
{item}
</button>
))}

</div>

{attendance==="Adjournment Requested" && (
<div className="mt-6 rounded-2xl bg-amber-50 p-5 border border-amber-200">
Reason, new date scheduling and case hold action required.
</div>
)}

</div>
)

}