import React from "react";

export default function AppointmentQueue({
todayAppointments,
upcomingAppointments,
selectedAppointment,
onSelectAppointment
}) {

const AppointmentCard = ({appt,urgent=false})=>(
<div
onClick={()=>onSelectAppointment(appt)}
className={`
cursor-pointer rounded-3xl p-6 border transition
hover:shadow-xl hover:-translate-y-1
${selectedAppointment?._id===appt._id
? "border-indigo-500 bg-indigo-50 shadow-lg"
: "border-slate-200 bg-white"}
`}
>
<div className="flex justify-between items-start">

<div>
<h3 className="font-bold text-lg">
{appt.partyA} vs {appt.partyB}
</h3>

<p className="text-sm text-slate-500 mt-1">
{appt.landId}
</p>
</div>

{urgent && (
<span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
Today
</span>
)}

</div>

<div className="grid grid-cols-3 gap-3 mt-5">

<div>
<p className="text-xs text-gray-400">
Time
</p>
<p className="font-semibold">
{appt.timeSlot}
</p>
</div>

<div>
<p className="text-xs text-gray-400">
Status
</p>
<p className="font-semibold text-indigo-600">
{appt.stage}
</p>
</div>

<div>
<p className="text-xs text-gray-400">
Docs
</p>
<p className="font-semibold">
{appt.docsPending} Pending
</p>
</div>

</div>

</div>
);

return(
<div className="space-y-8">

<div>
<h2 className="text-2xl font-bold mb-5">
Today's Appointments
</h2>

<div className="grid md:grid-cols-2 gap-5">
{todayAppointments.map(a=>(
<AppointmentCard
key={a._id}
appt={a}
urgent
/>
))}
</div>
</div>


<div>
<h2 className="text-xl font-bold mb-5">
Upcoming Queue
</h2>

<div className="grid md:grid-cols-2 gap-5">
{upcomingAppointments.map(a=>(
<AppointmentCard
key={a._id}
appt={a}
/>
))}
</div>

</div>

</div>
)

}