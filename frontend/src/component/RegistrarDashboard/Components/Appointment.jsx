import React,{useState,useEffect} from "react";
import AppointmentQueue from "./AppointmentQueue";
import AppointmentWorkbench from "./AppointmentWorkbench";
import { API } from "../../../../utils/API";

export default function Appointment(){

const [todayAppointments,setTodayAppointments]=useState([]);
const [upcomingAppointments,setUpcomingAppointments]=useState([]);

const [selectedAppointment,setSelectedAppointment]=useState(null);

const [loading,setLoading]=useState(true);


useEffect(()=>{

fetchAppointments();

},[]);


const fetchAppointments=async()=>{

try{

const token=localStorage.getItem("token");

const res=await API.get(
"/api/registrar/appointments",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setTodayAppointments(
res.data.today || []
);

setUpcomingAppointments(
res.data.upcoming || []
);

}
catch(err){
console.log(err);
}
finally{
setLoading(false);
}

};



return(
<div className="
min-h-screen
bg-gradient-to-br
from-slate-50
via-indigo-50
to-blue-50
p-8
">

<div className="max-w-7xl mx-auto space-y-8">

{/* DASH HEADER */}
<div className="
rounded-[36px]
bg-gradient-to-r
from-indigo-700
via-blue-700
to-cyan-600
text-white p-10 shadow-2xl
">

<h1 className="text-4xl font-bold">
Registrar Appointment Operations
</h1>

<p className="mt-4 text-indigo-100 max-w-3xl">
Manage attendance, deed execution,
document scrutiny, mutation initiation
and final ownership transfer approvals.
</p>

<div className="grid md:grid-cols-4 gap-5 mt-8">

{[
[todayAppointments.length,"Today Queue"],
[upcomingAppointments.length,"Upcoming"],
["3","Mutation Pending"],
["Live","Registry Sync"]
].map((card,i)=>(
<div
key={i}
className="
bg-white/10
rounded-3xl
p-6
backdrop-blur-xl
"
>
<p className="text-sm opacity-80">
{card[1]}
</p>

<h2 className="text-3xl font-bold mt-2">
{card[0]}
</h2>
</div>
))}

</div>

</div>



{/* APPOINTMENT QUEUES */}
<AppointmentQueue
todayAppointments={todayAppointments}
upcomingAppointments={upcomingAppointments}
selectedAppointment={selectedAppointment}
onSelectAppointment={setSelectedAppointment}
/>



{/* ACTIVE CASE */}
{selectedAppointment && (
<AppointmentWorkbench
appointment={selectedAppointment}
onStatusUpdate={fetchAppointments}
/>
)}

{!selectedAppointment && (
<div className="
bg-white
rounded-[32px]
shadow-xl
border
p-20
text-center
">
<h2 className="text-3xl font-bold text-slate-700">
Select an appointment to open workbench
</h2>

<p className="mt-4 text-slate-500">
Today's queue appears above.
Choose a case to begin execution.
</p>
</div>
)}

</div>

</div>
)
}