import React from "react";

export default function MutationPanel(){

return(
<div className="bg-white rounded-3xl shadow-lg p-8">

<h2 className="text-xl font-bold mb-5">
Mutation Initiation
</h2>

<div className="grid md:grid-cols-3 gap-4">

<div className="p-5 rounded-2xl bg-slate-50">
Revenue Records Update
</div>

<div className="p-5 rounded-2xl bg-slate-50">
Ownership Mutation Form
</div>

<div className="p-5 rounded-2xl bg-slate-50">
Forward to Revenue Dept
</div>

</div>

<button className="mt-6 px-6 py-3 rounded-2xl bg-green-600 text-white">
Initiate Mutation
</button>

</div>
)

}