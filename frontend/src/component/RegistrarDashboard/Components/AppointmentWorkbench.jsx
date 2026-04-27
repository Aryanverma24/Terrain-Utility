import React, { useState } from "react";

import PartyAttendancePanel from "./PartyAttendancePanel";
import DocumentScrutinyPanel from "./DocumentScrutinyPanel";
import RegistrationExecutionPanel from "./RegistrationExecutionPanel";
import MutationPanel from "./MutationPanel";
import TransferApprovalPanel from "./TransferApprovalPanel";
import AuditTimeline from "./AuditTimeline";

const tabs = [
 "attendance",
 "scrutiny",
 "registration",
 "mutation",
 "approval"
];

export default function AppointmentWorkbench({
 appointment,
 onStatusUpdate
}) {

const [activeTab,setActiveTab]=useState("attendance");

const progressMap={
 scheduled:20,
 parties_present:35,
 documents_verified:55,
 registration_started:75,
 mutation_pending:90,
 transferred:100
};

const progress=
progressMap[
appointment?.land?.transferStatus
] || 20;

return (
<div className="space-y-8">

{/* CASE HEADER */}
<div className="
bg-white rounded-[32px]
shadow-xl border p-8
">

<div className="flex flex-wrap justify-between gap-8">

<div>
<p className="text-sm text-slate-500">
Appointment Case
</p>

<h1 className="text-3xl font-bold mt-2">
Property Registration Workbench
</h1>

<div className="mt-4 flex gap-3 flex-wrap">
<span className="px-4 py-2 rounded-full bg-indigo-100 text-indigo-700">
Case #{appointment._id.slice(-6)}
</span>

<span className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-700">
{appointment.status}
</span>
</div>
</div>


<div className="w-[340px]">
<div className="flex justify-between mb-2">
<span className="text-sm font-medium">
Workflow Progress
</span>

<span className="font-semibold">
{progress}%
</span>
</div>

<div className="h-4 bg-slate-200 rounded-full overflow-hidden">
<div
style={{width:`${progress}%`}}
className="
h-full rounded-full
bg-gradient-to-r
from-blue-500
via-indigo-500
to-cyan-500"
/>
</div>

<div className="mt-4 grid grid-cols-2 gap-4">

<div className="rounded-2xl p-4 bg-slate-50 border">
<p className="text-xs text-gray-500">
Buyer & Seller
</p>

<h4 className="font-semibold mt-2">
Pending Check-In
</h4>
</div>

<div className="rounded-2xl p-4 bg-slate-50 border">
<p className="text-xs text-gray-500">
Mutation
</p>

<h4 className="font-semibold mt-2">
Queued
</h4>
</div>

</div>
</div>

</div>

</div>


{/* OPERATIONS TABS */}
<div className="
bg-white rounded-[32px]
shadow-xl border
overflow-hidden
">

<div className="flex border-b overflow-auto">

{tabs.map(tab=>(
<button
key={tab}
onClick={()=>setActiveTab(tab)}
className={`
px-8 py-5 font-semibold capitalize
transition
${
activeTab===tab
? "bg-indigo-600 text-white"
: "bg-white text-slate-600 hover:bg-slate-50"
}
`}
>
{tab}
</button>
))}

</div>


<div className="p-8">

{activeTab==="attendance" && (
<PartyAttendancePanel
appointment={appointment}
/>
)}

{activeTab==="scrutiny" && (
<DocumentScrutinyPanel
appointment={appointment}
/>
)}

{activeTab==="registration" && (
<RegistrationExecutionPanel
appointment={appointment}
onStatusUpdate={onStatusUpdate}
/>
)}

{activeTab==="mutation" && (
<MutationPanel
appointment={appointment}
onStatusUpdate={onStatusUpdate}
/>
)}

{activeTab==="approval" && (
<TransferApprovalPanel
appointment={appointment}
/>
)}

</div>

</div>


{/* AUDIT TRAIL */}
<AuditTimeline
appointmentId={appointment._id}
/>

</div>
)
}