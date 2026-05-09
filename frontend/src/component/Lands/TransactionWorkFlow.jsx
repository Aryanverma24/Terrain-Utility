import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate,useParams } from "react-router-dom";
import { API } from "../../../utils/API";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const steps = [
 
 "Legal Process",   
 "Token Paid",
  "Registrar Appointment",
 "Registration",
 "Mutation",
 "Ownership Transfer"
];

const TransactionWorkflow = () => {

 const navigate = useNavigate();
 const { landId } = useParams();
const [land, setLand] = useState(null);

const transferStatus = land?.transferStatus?.trim();

console.log("status =", transferStatus);
const stageMap = {
 token_paid: 1,
 legal_process: 0,
 appointment_booked: 3,
 registration_started: 4,
 mutation_pending: 4,
 transferred: 5
};

const currentStep =
  transferStatus in stageMap
    ? stageMap[transferStatus]
    : 0;

console.log("step =", currentStep);
// registrat assignmentstates 

const [showModal, setShowModal] = useState(false);
const [selectedDate, setSelectedDate] = useState("");
//appointment states
const [appointment, setAppointment] = useState(null);
const [loadingAppointment, setLoadingAppointment] = useState(true);

//to handle registrar assignment
const [selectedRegistrar, setSelectedRegistrar] = useState(null);
const handleBookAppointment = async () => {
  try {
    const token = localStorage.getItem("token");

    console.log("📤 Sending request...");

    const response = await API.post(
      "/api/registrar/assign",
      { landId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("📥 RESPONSE:", response.data);

    if (response.data.success) {
     setSelectedRegistrar(response.data.registrar);
      setShowModal(true);
    } else {
      console.log("❌ API ERROR:", response.data);
    }

  } catch (err) {
    console.error("🔥 FRONTEND ERROR:", err.response?.data || err.message);
  }
};
//handle appointment
const handleConfirmAppointment = async () => {
  try {
    const token = localStorage.getItem("token");

    console.log("📤 Creating appointment...");

    const response = await API.post(
      "/api/appointments/create",
      {
        landId,
        date: selectedDate,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("📥 APPOINTMENT RESPONSE:", response.data);

   if (response.data.success) {

  setShowModal(false);

  // ✅ FETCH POPULATED APPOINTMENT
  const refreshed = await API.get(
    `/api/appointments/land/${landId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (
    refreshed.data?.success &&
    refreshed.data?.appointment
  ) {
    setAppointment(
      refreshed.data.appointment
    );
  }

  toast.success(
    `Slot booked: ${response.data.appointment.timeSlot}`,
    {
      position: "top-right",
    }
  );
}

    else {
      toast.error(response.data.msg || "Booking failed");
    }

  } catch (err) {
    console.error("🔥 APPOINTMENT ERROR:", err.response?.data || err.message);

    toast.error(
      err.response?.data?.msg || "Server error while booking"
    );
  }
};
//to fetch teh appoinmnt detials 
useEffect(() => {
  const fetchAppointment = async () => {
    try {
      setLoadingAppointment(true); // ✅ move INSIDE async

      const token = localStorage.getItem("token");
      if (!token || !landId) return;

    

      const res = await API.get(
        `/api/appointments/land/${landId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      

      if (res.data?.success && res.data?.appointment) {
        setAppointment(res.data.appointment);
        console.log("✅ Appointment loaded (LOCKED UI)");
      } else {
        setAppointment(null); // important fallback
      }

    } catch (err) {
      console.error("❌ FETCH ERROR:", err.response?.data || err.message);
    } finally {
      setLoadingAppointment(false); // ✅ ALWAYS correct place
    }
  };

  fetchAppointment();
}, [landId]);


useEffect(() => {
 const fetchLand = async () => {
   try {
     const token = localStorage.getItem("token");

     const res = await API.get(
       `/api/lands/${landId}`,
       {
         headers:{
           Authorization:`Bearer ${token}`
         }
       }
     );

     console.log("📦 LAND:", res.data);

     setLand(res.data.land || res.data);

   } catch(err){
     console.error(
       "Land fetch error:",
       err.response?.data || err.message
     );
   }
 };

 if(landId){
   fetchLand();
 }

},[landId]);
 return (
<div className="min-h-screen pt-24 pb-16 px-6 bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">

<div className="max-w-6xl mx-auto space-y-8">
{/* HERO */}
<div className="
rounded-[34px]
overflow-hidden
shadow-2xl
bg-gradient-to-r
from-slate-900
via-indigo-900
to-cyan-800
text-white
">

<div className="px-10 py-8 md:flex justify-between items-center gap-10">

{/* LEFT */}
<div className="flex-1">

<p className="uppercase text-[11px] tracking-[0.3em] text-cyan-200 font-semibold">
Secure Property Deal Room
</p>

<h1 className="text-4xl font-bold mt-3 leading-tight">
Property Transfer In Progress
</h1>

<p className="mt-3 text-indigo-100 max-w-2xl leading-relaxed text-sm">
Track legal coordination, registrar scheduling and
ownership transfer in one secured workflow.
</p>


{/* compact pills */}
<div className="flex flex-wrap gap-3 mt-5">

{[
land?.paymentStatus==="partial"
? "Escrow Protected"
: "Payment Released",

land?.assignedLawyer
? "Lawyer Verified"
: "Lawyer Pending",

appointment
? "Appointment Booked"
: "Slot Pending"

].map((item,i)=>(
<span
key={i}
className="
px-4 py-2
rounded-full
bg-white/10
backdrop-blur-md
border border-white/10
text-sm
"
>
{item}
</span>
))}

</div>

</div>



{/* RIGHT STATUS PANEL */}
<div className="
min-w-[430px]
rounded-[28px]
bg-white/10
backdrop-blur-xl
border border-white/15
px-6 py-5
shadow-xl
">

{/* top row */}
<div className="flex justify-between items-center">

<div>
<p className="text-[11px] uppercase tracking-widest text-cyan-200">
Live Transaction Status
</p>

<h2 className="text-2xl font-bold mt-2">
{steps[currentStep]}
</h2>
</div>

<div className="
px-4 py-2
rounded-full
bg-emerald-400/20
text-emerald-300
font-semibold text-sm
">
{Math.round(((currentStep+1)/steps.length)*100)}%
</div>

</div>


{/* thin progress */}
<div className="mt-5 h-2 rounded-full bg-white/10 overflow-hidden">
<div
style={{
width:`${((currentStep+1)/steps.length)*100}%`
}}
className="
h-2 rounded-full
bg-gradient-to-r
from-emerald-300
to-teal-300
transition-all duration-700
"
/>
</div>



{/* horizontal metrics */}
<div className="grid grid-cols-3 gap-4 mt-5">

<div className="
rounded-2xl
bg-indigo-500/15
border border-indigo-300/10
p-4
">
<p className="text-[11px] text-indigo-200 uppercase">
Stage
</p>
<div className="text-xl font-bold mt-1">
{currentStep+1}/{steps.length}
</div>
</div>


<div className="
rounded-2xl
bg-cyan-500/10
border border-cyan-300/10
p-4
">
<p className="text-[11px] text-cyan-200 uppercase">
Slot
</p>

<div className="text-sm font-semibold mt-2 truncate">
{appointment?.timeSlot || "Pending"}
</div>
</div>


<div className="
rounded-2xl
bg-green-500/10
border border-green-300/10
p-4
">
<p className="text-[11px] text-green-200 uppercase">
Health
</p>

<div className="text-sm font-semibold mt-2">
On Track
</div>
</div>

</div>

</div>

</div>
</div>


{/* QUICK METRICS */}
<div className="grid md:grid-cols-4 gap-6">

{[
{
icon:"💰",
value:`₹${(
(land?.price || 0) *
((land?.tokenConfig?.percentage || 5)/100)
).toLocaleString()}`,
label:"Token Deposited",
bg:"from-emerald-500 to-green-600",
ring:"ring-emerald-100"
},

{
icon:"📈",
value:`${currentStep + 1}/${steps.length}`,
label:"Stages Completed",
bg:"from-indigo-500 to-blue-600",
ring:"ring-indigo-100"
},

{
icon:"🛡️",
value:
land?.paymentStatus==="partial"
? "Escrow Active"
: "Released",
label:"Escrow Status",
bg:"from-amber-500 to-orange-500",
ring:"ring-amber-100"
},

{
icon:"📅",
value:
appointment
? `${new Date(
appointment.date
).toLocaleDateString()}`
: "Pending",
label:"Registrar Slot",
bg:"from-cyan-500 to-sky-600",
ring:"ring-cyan-100"
}

].map((card,i)=>(

<div
key={i}
className={`
relative overflow-hidden
rounded-[28px]
bg-white
shadow-lg
hover:shadow-2xl
transition-all
duration-300
hover:-translate-y-1
p-6
ring-1 ${card.ring}
`}
>

{/* gradient glow */}
<div className={`
absolute inset-x-0 top-0 h-2
bg-gradient-to-r ${card.bg}
`} />

<div className="flex items-start justify-between">

<div>
<p className="text-sm font-medium text-gray-500 mb-3">
{card.label}
</p>

<h3 className="text-3xl font-bold text-slate-800">
{card.value}
</h3>
</div>

<div className={`
w-14 h-14 rounded-2xl
bg-gradient-to-r ${card.bg}
flex items-center justify-center
text-2xl shadow-md
text-white
`}>
{card.icon}
</div>

</div>

<div className="mt-6 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
<div
className={`
h-full rounded-full bg-gradient-to-r ${card.bg}
${i===1 ? "w-2/3" : "w-full"}
`}
></div>
</div>

</div>

))}

</div>

{/* TIMELINE */}


<div className="bg-white rounded-[30px] shadow-xl border border-slate-200 p-8">

<div className="flex items-center justify-between mb-8">
<h2 className="text-2xl font-bold text-slate-800">
Transfer Timeline
</h2>

<span className="px-5 py-2 rounded-full bg-indigo-50 text-indigo-700 font-medium">
Stage {currentStep + 1} of {steps.length}
</span>
</div>


<div className="space-y-4">

{steps.map((step,index)=>(

<div key={index} className="relative">

{/* connector line */}
{index !== steps.length-1 && (
<div
className={`
absolute left-6 top-14 w-[2px] h-14
${index < currentStep
? "bg-green-500"
: "bg-gray-200"}
`}
/>
)}


<div
className={`
rounded-3xl border p-5 transition
${
index < currentStep
? "bg-green-50 border-green-200"
: index===currentStep
? "bg-indigo-50 border-indigo-300 shadow-md"
: "bg-slate-50 border-slate-200"
}
`}
>

<div className="flex justify-between items-center">

<div className="flex items-center gap-5">

{/* step circle */}
<div
className={`
w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm
${
index < currentStep
? "bg-green-600 text-white"
: index===currentStep
? "bg-indigo-600 text-white"
: "bg-gray-300 text-gray-600"
}
`}
>
{index < currentStep ? "✓" : index+1}
</div>


<div>
<h3 className="font-semibold text-lg text-slate-800">
{step}
</h3>

<p className="text-sm mt-1
text-gray-500">
{
index < currentStep
? "Completed milestone"
: index===currentStep
? "Current active stage"
: "Pending stage"
}
</p>
</div>

</div>



{/* status badge */}
<div>
{index < currentStep && (
<span className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
Completed
</span>
)}

{index===currentStep && (
<span className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-medium">
Active
</span>
)}

{index > currentStep && (
<span className="px-4 py-2 rounded-full bg-gray-100 text-gray-500 text-sm">
Pending
</span>
)}
</div>

</div>


{/* special registrar completed note */}
{step==="Registrar Appointment" && index < currentStep && (
<div className="mt-4 ml-16 text-sm text-green-700 bg-green-100 rounded-xl px-4 py-3">
✓ Appointment booked and registrar slot confirmed.
</div>
)}


{/* registration active note */}
{step==="Registration" && index===currentStep && (
<div className="mt-4 ml-16 text-sm text-indigo-700 bg-indigo-100 rounded-xl px-4 py-3">
Documents now move into registration execution with registrar.
</div>
)}

</div>
</div>

))}
</div>

</div>


{/* MAIN GRID */}
<div className="grid lg:grid-cols-3 gap-6">

{/* Appointment */}
{/* Appointment */}
<div className="lg:col-span-2 bg-white rounded-[30px] shadow-xl border border-slate-200 p-8">

{/* HEADER */}
<div className="flex justify-between items-center mb-6">
  <div>
    <h2 className="text-3xl font-bold text-slate-800">
      Registrar Appointment
    </h2>

    <p className="text-slate-500 mt-1">
      Appointment schedule and registrar coordination
    </p>
  </div>

  <span className="px-5 py-2 rounded-full bg-emerald-50 text-emerald-700 font-medium">
   {appointment?.status === "confirmed" && (
  <span className="inline-block mt-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-medium">
    ACtive
  </span>
)}

{appointment?.status === "completed" && (
  <span className="inline-block mt-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium">
    Completed
  </span>
)}

{appointment?.status === "rejected" && (
  <span className="inline-block mt-2 px-4 py-2 rounded-full bg-red-100 text-red-700 font-medium">
    Rejected
  </span>
)}
  </span>
</div>


{!appointment ? (

<div className="rounded-3xl bg-gradient-to-r from-indigo-50 to-blue-50 p-8 border border-indigo-100 flex items-center justify-between">

<div>
<h3 className="text-xl font-semibold text-slate-800 mb-2">
Ready to schedule appointment
</h3>

<p className="text-slate-500">
Book your registrar visit.
</p>
</div>

<button
onClick={handleBookAppointment}
className="px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg"
>
📅 Book Appointment
</button>

</div>

) : (

<div className="space-y-5">


{/* Compact Reschedule Ribbon */}
{appointment.rescheduledBy==="registrar" && (
<div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 flex items-center justify-between">

<div>
<div className="font-semibold text-amber-800">
🔄 Rescheduled by Registrar
</div>

<div className="text-sm text-amber-700 mt-1">
Old:
<span className="line-through ml-2">
{new Date(
appointment.previousDate
).toLocaleDateString()}
{" • "}
{appointment.previousTimeSlot}
</span>
</div>
</div>


<div className="text-right">
<div className="text-xs uppercase font-semibold text-green-700">
Updated Slot
</div>

<div className="text-xl font-bold text-green-700">
{new Date(
appointment.date
).toLocaleDateString()}
</div>

<div className="font-semibold text-blue-700">
{appointment.timeSlot}
</div>
</div>

</div>
)}



{/* Main Wide Layout */}
<div className="grid lg:grid-cols-3 gap-5">


{/* Appointment Summary */}
<div className="lg:col-span-1 rounded-3xl bg-gradient-to-br from-slate-50 to-white border p-6">

<h3 className="font-bold text-lg text-slate-800 mb-5">
Appointment Summary
</h3>

<div className="space-y-5">

<div>
<p className="text-sm text-gray-400">
Date
</p>

<p className="text-2xl font-bold text-slate-800">
{new Date(
appointment.date
).toLocaleDateString()}
</p>
</div>

<div>
<p className="text-sm text-gray-400">
Time Slot
</p>

<p className="text-2xl font-bold text-blue-700">
{appointment.timeSlot}
</p>
</div>

<div>
<p className="text-sm text-gray-400">
Status
</p>

<span className="inline-block mt-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-medium">
{appointment?.status === "confirmed" && (
  <span className="inline-block mt-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-medium">
    Confirmed
  </span>
)}

{appointment?.status === "completed" && (
  <span className="inline-block mt-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium">
    Completed
  </span>
)}

{appointment?.status === "rejected" && (
  <span className="inline-block mt-2 px-4 py-2 rounded-full bg-red-100 text-red-700 font-medium">
    Rejected
  </span>
)}
</span>
</div>

</div>

</div>



{/* Registrar Info */}
<div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-slate-50 to-white border p-6">

<h3 className="font-bold text-lg text-slate-800 mb-5">
Registrar Office Details
</h3>

<div className="grid md:grid-cols-2 gap-4">

<div className="bg-white rounded-2xl border p-4">
<p className="text-xs text-gray-400 mb-1">
Registrar
</p>
<p className="font-semibold">
{appointment?.registrar?.registrarName}
</p>
</div>

<div className="bg-white rounded-2xl border p-4">
<p className="text-xs text-gray-400 mb-1">
District
</p>
<p className="font-semibold">
{appointment?.registrar?.district}
</p>
</div>

<div className="bg-white rounded-2xl border p-4">
<p className="text-xs text-gray-400 mb-1">
Office
</p>
<p className="font-semibold">
{appointment?.registrar?.officeName}
</p>
</div>

<div className="bg-white rounded-2xl border p-4">
<p className="text-xs text-gray-400 mb-1">
Address
</p>
<p className="font-semibold">
{appointment?.registrar?.officeAddress}
</p>
</div>

</div>

</div>

</div>


<div className="text-center text-sm text-slate-500">
Appointment remains locked unless modified by registrar.
</div>

</div>

)}

</div>
{showModal && selectedRegistrar && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-3xl p-8 w-[500px] space-y-4">

      <h2 className="text-xl font-bold">
        Assigned Registrar
      </h2>

      <p><b>Name:</b> {selectedRegistrar.registrarName}</p>
      <p><b>Office:</b> {selectedRegistrar.officeName}</p>
      <p><b>District:</b> {selectedRegistrar.district}</p>
      <p><b>Address:</b> {selectedRegistrar.officeAddress}</p>

      {/* DATE SELECT */}
      <input
        type="date"
        className="w-full border p-2 rounded-lg mt-3"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      <button
        onClick={handleConfirmAppointment}
        disabled={!selectedDate}
        className="w-full bg-green-600 text-white py-3 rounded-xl mt-4 disabled:opacity-50"
      >
        Confirm Appointment
      </button>

    </div>

  </div>
)}

{/* Activity Feed */}
<div className="bg-white rounded-3xl shadow-xl p-8">
<h2 className="text-xl font-bold mb-6">
Recent Activity
</h2>

<div className="space-y-5">

{[
"Token payment received",
"Lawyer consultation active",
"Legal process initiated"
].map((item,i)=>(
<div
key={i}
className="flex gap-3 items-start"
>
<div className="w-3 h-3 rounded-full bg-green-500 mt-2"></div>

<div>
<p className="font-medium">
{item}
</p>

<p className="text-xs text-gray-500">
Updated recently
</p>
</div>

</div>
))}

</div>
</div>

</div>


{/* DOCUMENT HUB */}
<div className="bg-white rounded-3xl shadow-xl p-8">
<h2 className="text-2xl font-bold mb-6">
Document Hub
</h2>

<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

{[
"Sale Agreement",
"Registration Deed",
"Mutation Forms",
"Lawyer Verification"
].map((doc,i)=>(
<div
key={i}
className="p-6 rounded-2xl border hover:shadow-xl hover:-translate-y-1 transition cursor-pointer"
>
<div className="text-3xl mb-4">
📄
</div>

<h4 className="font-semibold">
{doc}
</h4>

<p className="text-sm text-gray-500 mt-2">
Pending review
</p>
</div>
))}

</div>
</div>


{/* FINAL PAYMENT LOCK */}
<div className="rounded-3xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-yellow-200 p-8 shadow-lg">
<div className="md:flex justify-between items-center">

<div>
<h2 className="text-2xl font-bold text-gray-800">
Escrow Final Payment
</h2>

<p className="mt-3 text-gray-600">
Remaining payment unlocks automatically after mutation stage.
</p>
</div>

<button
disabled
className="mt-5 md:mt-0 bg-gray-300 px-7 py-4 rounded-2xl font-semibold cursor-not-allowed"
>
Locked Until Mutation
</button>

</div>
</div>


<button
onClick={()=>navigate(-1)}
className="text-indigo-700 font-semibold hover:underline"
>
← Back to Interest Dashboard
</button>


</div>
</div>
)
}

export default TransactionWorkflow;