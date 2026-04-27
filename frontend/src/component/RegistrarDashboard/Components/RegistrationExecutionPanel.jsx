import React from "react";

export default function RegistrationExecutionPanel({
stage,
updateStage
}){

const stages=[
"Identity Validation",
"Biometric Capture",
"Deed Execution",
"Stamp Registration",
"Registration Completed"
];

return(
<div className="bg-white rounded-3xl shadow-lg p-8">

<h2 className="text-xl font-bold mb-6">
Registration Execution
</h2>

<div className="space-y-4">

{stages.map((s,i)=>(
<div
key={s}
className={`
p-5 rounded-2xl border flex justify-between
${i<=stage
? "bg-green-50 border-green-200"
:"bg-slate-50"}
`}
>
<span>{s}</span>

{i===stage && (
<button
onClick={()=>updateStage(stage+1)}
className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
>
Complete Step
</button>
)}

</div>
))}

</div>

</div>
)

}