import React,{useState} from "react";
import RegistrarSidebar from "./RegistrarSidebar";

const RegistrarDashboardLayout=({children})=>{

const [sidebarOpen,setSidebarOpen]=useState(true);

return(
<div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-950">

<RegistrarSidebar
sidebarOpen={sidebarOpen}
setSidebarOpen={setSidebarOpen}
/>

<div
className={`flex-1 transition-all duration-300 ${
sidebarOpen
? "ml-64"
: "ml-20"
}`}
>
<div className="p-6">
{children}
</div>
</div>

</div>
);

};

export default RegistrarDashboardLayout;