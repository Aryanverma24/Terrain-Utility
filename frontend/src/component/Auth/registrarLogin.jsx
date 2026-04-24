import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../../utils/API";

import {
FaLandmark,
FaIdCard,
FaLock,
FaEye,
FaEyeSlash,
FaArrowLeft,
FaShieldAlt,
FaExclamationTriangle
} from "react-icons/fa";


const RegistrarLogin = () => {

const navigate = useNavigate();

const [formData,setFormData]=useState({
uniqueId:"",
password:""
});

const [errors,setErrors]=useState({});
const [showPassword,setShowPassword]=useState(false);
const [isLoading,setIsLoading]=useState(false);



const validateForm=()=>{

let newErrors={};

if(!formData.uniqueId.trim()){
newErrors.uniqueId="Registrar ID required";
}

if(!formData.password){
newErrors.password="Password required";
}

setErrors(newErrors);

return Object.keys(newErrors).length===0;

};



const handleChange=(e)=>{

const {name,value}=e.target;

setFormData(prev=>({
...prev,
[name]:value
}));

if(errors[name]){
setErrors(prev=>({
...prev,
[name]:""
}));
}

};



const handleSubmit=async(e)=>{

e.preventDefault();

if(!validateForm()){
toast.error("Fix form errors");
return;
}

setIsLoading(true);

try{

const response=await API.post(
"/api/registrar/login",
{
uniqueId:formData.uniqueId,
password:formData.password
}
);


localStorage.setItem(
"registrarToken",
response.data.token
);

localStorage.setItem(
"registrar",
JSON.stringify(
response.data.registrar
)
);

localStorage.setItem(
"role",
"registrar"
);

toast.success(
"Registrar login successful"
);

navigate(
"/registrar-dashboard"
);

}
catch(error){

console.error(error);

if(error.response?.status===401){
toast.error("Invalid credentials");
}
else if(error.response?.status===403){
toast.error("Activate account first");
}
else{
toast.error(
error.response?.data?.message ||
"Login failed"
);
}

}
finally{
setIsLoading(false);
}

};



return(

<section className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-slate-50 flex items-center justify-center p-4">

<div className="w-full max-w-6xl">

<div className="flex flex-col lg:flex-row bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">


{/* LEFT SIDE */}
<div className="w-full lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-10 lg:p-12 flex flex-col justify-center relative overflow-hidden">

<div className="absolute inset-0 opacity-10">
<div
className="absolute inset-0"
style={{
backgroundImage:
`url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/svg%3E")`
}}
></div>
</div>

<div className="relative z-10">

<div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white text-sm mb-6">
<FaLandmark className="mr-2"/>
Official Registrar Access
</div>

<h1 className="text-5xl font-bold text-white mb-4">
Registrar Portal
<span className="block text-2xl font-light mt-2 text-emerald-100">
Secure Registry Login
</span>
</h1>

<p className="text-emerald-100 text-lg mb-10">
Access appointment scheduling, deed registration
and mutation approval workflow.
</p>


<div className="space-y-5">

<div className="flex items-center text-white">
<div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4">
<FaShieldAlt/>
</div>
<div>
<h3 className="font-semibold">
Appointment Management
</h3>
<p className="text-emerald-200 text-sm">
Handle scheduled registrations
</p>
</div>
</div>



<div className="flex items-center text-white">
<div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4">
<FaShieldAlt/>
</div>
<div>
<h3 className="font-semibold">
Transfer Authorization
</h3>
<p className="text-emerald-200 text-sm">
Approve ownership transfers
</p>
</div>
</div>



<div className="flex items-center text-white">
<div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4">
<FaShieldAlt/>
</div>
<div>
<h3 className="font-semibold">
Mutation Workflow
</h3>
<p className="text-emerald-200 text-sm">
Generate mutation drafts
</p>
</div>
</div>

</div>

</div>

</div>



{/* RIGHT SIDE */}
<div className="w-full lg:w-1/2 p-8 lg:p-12">

<div className="text-center mb-8">

<button
onClick={()=>navigate("/login")}
className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 mb-6 hover:bg-emerald-200"
>
<FaArrowLeft className="mr-2"/>
Back
</button>


<h2 className="text-3xl font-bold text-gray-900">
Registrar Sign In
</h2>

<p className="text-gray-600 mt-2">
Login with your assigned registrar credentials
</p>

</div>



<form
onSubmit={handleSubmit}
className="space-y-6"
>


{/* REG ID */}
<div>

<label className="block font-semibold text-gray-700 mb-2">
Registrar Unique ID
</label>

<div className="relative">

<div className="absolute left-3 top-4 text-gray-400">
<FaIdCard/>
</div>

<input
name="uniqueId"
value={formData.uniqueId}
onChange={handleChange}
placeholder="REG-UK-HRD-002"
className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
errors.uniqueId
?"border-red-400 bg-red-50"
:"border-gray-300"
}`}
disabled={isLoading}
/>

</div>

{errors.uniqueId &&
<p className="text-red-600 text-sm mt-2">
{errors.uniqueId}
</p>}

</div>



{/* PASSWORD */}
<div>

<label className="block font-semibold text-gray-700 mb-2">
Password
</label>

<div className="relative">

<div className="absolute left-3 top-4 text-gray-400">
<FaLock/>
</div>

<input
type={showPassword?"text":"password"}
name="password"
value={formData.password}
onChange={handleChange}
className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
errors.password
?"border-red-400 bg-red-50"
:"border-gray-300"
}`}
disabled={isLoading}
/>

<button
type="button"
onClick={()=>setShowPassword(!showPassword)}
className="absolute right-4 top-4 text-gray-500"
>
{showPassword
?<FaEyeSlash/>
:<FaEye/>
}
</button>

</div>

{errors.password &&
<p className="text-red-600 text-sm mt-2">
{errors.password}
</p>}

</div>



<button
type="submit"
disabled={isLoading}
className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:scale-[1.01] transition disabled:opacity-50 flex items-center justify-center gap-2"
>
{
isLoading ?
<>
<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
Signing In...
</>
:
<>
<FaLandmark/>
Access Registrar Dashboard
</>
}
</button>



<div className="text-center">
<button
type="button"
onClick={()=>navigate("/registrar-activate")}
className="text-emerald-700 font-medium hover:underline"
>
First time here? Activate Account
</button>
</div>



<div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
<div className="flex items-start">
<FaExclamationTriangle className="text-yellow-600 mt-1 mr-3"/>
<div>
<p className="text-sm font-medium text-yellow-800">
Restricted Government Access
</p>

<p className="text-xs text-yellow-700">
Unauthorized access attempts may be monitored and reported.
</p>
</div>
</div>
</div>


</form>

</div>

</div>

</div>

</section>

);

};

export default RegistrarLogin;