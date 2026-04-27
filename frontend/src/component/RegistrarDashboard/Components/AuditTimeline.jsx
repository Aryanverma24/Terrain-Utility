import React from "react";

export default function AuditTimeline({events}){

return(
<div className="bg-white rounded-3xl shadow-lg p-8">

<h2 className="text-xl font-bold mb-6">
Case Audit Trail
</h2>

<div className="space-y-5">
{events.map((e,i)=>(
<div key={i} className="flex gap-4">
<div className="w-3 h-3 rounded-full bg-indigo-600 mt-2"/>
<div>
<p className="font-medium">
{e.action}
</p>
<p className="text-sm text-gray-500">
{e.time}
</p>
</div>
</div>
))}
</div>

</div>
)

}