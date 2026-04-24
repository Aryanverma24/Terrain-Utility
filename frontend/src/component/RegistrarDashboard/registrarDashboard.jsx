import React from "react";

import RegistrarDashboardLayout
from "./RegistrarDashboardLayout";

import{
FaCalendarCheck,
FaFileSignature,
FaExchangeAlt,
FaClock,
FaArrowUp,
FaCheckCircle
}
from "react-icons/fa";

const RegistrarDashboard=()=>{

return(

<RegistrarDashboardLayout>

<div className="mb-10">

<h1 className="text-4xl font-bold text-white mb-2">
Registrar Dashboard
</h1>

<p className="text-gray-400">
Manage appointments, land transfer deeds and mutation workflow.
</p>

</div>



{/* TOP STATS */}

<div className="grid md:grid-cols-4 gap-6 mb-8">

<StatCard
title="Today's Appointments"
value="18"
growth="+4%"
icon={<FaCalendarCheck/>}
/>

<StatCard
title="Pending Deeds"
value="12"
growth="+8%"
icon={<FaFileSignature/>}
/>

<StatCard
title="Mutation Drafts"
value="7"
growth="+3%"
icon={<FaExchangeAlt/>}
/>

<StatCard
title="Completed Today"
value="21"
growth="+10%"
icon={<FaCheckCircle/>}
/>

</div>



<div className="grid lg:grid-cols-3 gap-6">


<div className="lg:col-span-2 space-y-6">


{/* APPOINTMENTS */}
<div className="bg-white/10 rounded-2xl p-6 border border-white/10">

<h2 className="text-xl text-white font-semibold mb-5">
Upcoming Appointments
</h2>

<table className="w-full text-sm">
<thead>
<tr className="text-gray-400 border-b border-white/10">
<th className="py-3 text-left">Buyer</th>
<th className="text-left">Property</th>
<th className="text-left">Time</th>
</tr>
</thead>

<tbody>

<tr className="border-b border-white/5">
<td className="py-3 text-white">
Rahul
</td>
<td className="text-gray-300">
Land #A201
</td>
<td className="text-emerald-400">
11:30 AM
</td>
</tr>

<tr className="border-b border-white/5">
<td className="py-3 text-white">
Amit
</td>
<td className="text-gray-300">
Land #A355
</td>
<td className="text-emerald-400">
2:00 PM
</td>
</tr>

<tr>
<td className="py-3 text-white">
Simran
</td>
<td className="text-gray-300">
Land #A470
</td>
<td className="text-emerald-400">
4:15 PM
</td>
</tr>

</tbody>
</table>

</div>



{/* MUTATION QUEUE */}
<div className="bg-white/10 rounded-2xl p-6 border border-white/10">

<h2 className="text-xl font-semibold text-white mb-4">
Mutation Draft Queue
</h2>

<div className="space-y-4">

<QueueItem
land="Plot 244"
buyer="Vikas"
status="Awaiting Approval"
/>

<QueueItem
land="Plot 117"
buyer="Rohit"
status="Document Review"
/>

<QueueItem
land="Plot 322"
buyer="Anjali"
status="Ready For Mutation"
/>

</div>

</div>


</div>



{/* RIGHT */}
<div className="space-y-6">


<div className="bg-white/10 rounded-2xl p-6 border border-white/10">

<h2 className="text-xl font-semibold text-white mb-4">
Quick Actions
</h2>

<ActionBtn label="Open Appointments"/>
<ActionBtn label="Approve Mutation"/>
<ActionBtn label="Verify Land Docs"/>
<ActionBtn label="Generate Transfer Draft"/>

</div>



<div className="bg-white/10 rounded-2xl p-6 border border-white/10">

<h2 className="text-xl font-semibold text-white mb-4">
Office Status
</h2>

<StatusItem
label="Registry Server"
status="Online"
/>

<StatusItem
label="Mutation Service"
status="Running"
/>

<StatusItem
label="Document Queue"
status="Healthy"
/>

</div>



<div className="bg-white/10 rounded-2xl p-6 border border-white/10">

<h2 className="text-xl font-semibold text-white mb-4">
Next Slot
</h2>

<div className="text-3xl text-emerald-400 font-bold">
10:30 AM
</div>

<p className="text-gray-400 mt-2">
Next citizen appointment
</p>

</div>


</div>

</div>

</RegistrarDashboardLayout>

);

};



const StatCard=({
title,
value,
icon,
growth
})=>(

<div className="bg-white/10 p-6 rounded-2xl border border-white/10 flex justify-between items-center">

<div>
<p className="text-gray-400 text-sm">
{title}
</p>

<h2 className="text-3xl text-white font-bold">
{value}
</h2>

<div className="flex items-center text-emerald-400 text-sm mt-2">
<FaArrowUp className="mr-1"/>
{growth}
</div>

</div>

<div className="text-3xl text-emerald-400">
{icon}
</div>

</div>

);



const QueueItem=({
land,
buyer,
status
})=>(

<div className="p-4 rounded-xl bg-white/5">

<h3 className="text-white font-semibold">
{land}
</h3>

<p className="text-gray-400 text-sm">
Buyer: {buyer}
</p>

<p className="text-emerald-400 text-sm mt-1">
{status}
</p>

</div>

);



const ActionBtn=({label})=>(

<button className="w-full mb-3 text-left px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
{label}
</button>

);



const StatusItem=({
label,
status
})=>(

<div className="flex justify-between mb-3">
<span className="text-gray-400">
{label}
</span>

<span className="text-emerald-400">
{status}
</span>
</div>

);

export default RegistrarDashboard;