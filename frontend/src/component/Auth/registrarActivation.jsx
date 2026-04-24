import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../../utils/API";

import {
FaLandmark,
FaIdCard,
FaEnvelope,
FaLock,
FaEye,
FaEyeSlash,
FaArrowLeft,
FaCheckCircle,
FaExclamationTriangle
} from "react-icons/fa";

const RegistrarActivate = () => {

const navigate = useNavigate();

const [formData,setFormData]=useState({
uniqueId:"",
officialEmail:"",
password:"",
confirmPassword:""
});

const [showPassword,setShowPassword]=useState(false);
const [showConfirm,setShowConfirm]=useState(false);
const [isLoading,setIsLoading]=useState(false);
const [errors,setErrors]=useState({});


const validateForm=()=>{

let newErrors={};

if(!formData.uniqueId.trim()){
newErrors.uniqueId="Registrar Unique ID required";
}

if(!formData.officialEmail.trim()){
newErrors.officialEmail="Official email required";
}
else if(
!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
formData.officialEmail
)
){
newErrors.officialEmail="Enter valid email";
}

if(!formData.password){
newErrors.password="Password required";
}
else if(formData.password.length<6){
newErrors.password="Minimum 6 characters";
}

if(
formData.confirmPassword!==formData.password
){
newErrors.confirmPassword=
"Passwords do not match";
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
toast.error("Please fix form errors");
return;
}

setIsLoading(true);

try{

const response = await API.post(
"/api/registrar/activate",
formData
);

toast.success(
response.data.message ||
"Registrar account activated"
);

navigate("/registrar-login");

}
catch(error){

console.error(error);

toast.error(
error.response?.data?.message ||
"Activation failed"
);

}
finally{
setIsLoading(false);
}

};



return(
<section className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-slate-50 flex items-center justify-center p-4">

<div className="w-full max-w-6xl">

<div className="flex flex-col lg:flex-row bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">

{/* LEFT PANEL */}
<div className="w-full lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-10 lg:p-12 flex flex-col justify-center relative overflow-hidden">

<div className="absolute inset-0 opacity-10">
<div
className="absolute inset-0"
style={{
backgroundImage:
`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/svg%3E")`
}}
></div>
</div>

<div className="relative z-10">

<div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white text-sm mb-6">
<FaLandmark className="mr-2"/>
Government Authorized Access
</div>

<h1 className="text-5xl font-bold text-white mb-4">
Registrar Portal
<span className="block text-2xl font-light mt-2 text-emerald-100">
First Time Account Activation
</span>
</h1>

<p className="text-emerald-100 text-lg mb-10">
Activate your pre-authorized registrar account to access appointments,
deed registration and mutation workflow.
</p>

<div className="space-y-5">

<div className="flex items-center text-white">
<div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4">
<FaCheckCircle/>
</div>
<div>
<h3 className="font-semibold">
Appointment Handling
</h3>
<p className="text-emerald-200 text-sm">
Manage registration bookings
</p>
</div>
</div>


<div className="flex items-center text-white">
<div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4">
<FaCheckCircle/>
</div>
<div>
<h3 className="font-semibold">
Mutation Draft Workflow
</h3>
<p className="text-emerald-200 text-sm">
Process ownership transfers
</p>
</div>
</div>


<div className="flex items-center text-white">
<div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4">
<FaCheckCircle/>
</div>
<div>
<h3 className="font-semibold">
Secure Government Access
</h3>
<p className="text-emerald-200 text-sm">
Authorized registrar-only portal
</p>
</div>
</div>

</div>

</div>
</div>



{/* RIGHT PANEL */}
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
Activate Registrar Account
</h2>

<p className="text-gray-600 mt-2">
Enter your assigned credentials to claim access
</p>

</div>



<form
onSubmit={handleSubmit}
className="space-y-5"
>

{/* UNIQUE ID */}
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



{/* EMAIL */}
<div>
<label className="block font-semibold text-gray-700 mb-2">
Official Government Email
</label>

<div className="relative">
<div className="absolute left-3 top-4 text-gray-400">
<FaEnvelope/>
</div>

<input
name="officialEmail"
value={formData.officialEmail}
onChange={handleChange}
placeholder="registrar@registry.gov.in"
className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
errors.officialEmail
?"border-red-400 bg-red-50"
:"border-gray-300"
}`}
disabled={isLoading}
/>
</div>

{errors.officialEmail &&
<p className="text-red-600 text-sm mt-2">
{errors.officialEmail}
</p>}
</div>



{/* PASSWORD */}
<div>
<label className="block font-semibold text-gray-700 mb-2">
Create Password
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
className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300"
disabled={isLoading}
/>

<button
type="button"
onClick={()=>setShowPassword(!showPassword)}
className="absolute right-4 top-4 text-gray-500"
>
{showPassword ? <FaEyeSlash/> : <FaEye/>}
</button>

</div>

{errors.password &&
<p className="text-red-600 text-sm mt-2">
{errors.password}
</p>}
</div>



{/* CONFIRM PASSWORD */}
<div>
<label className="block font-semibold text-gray-700 mb-2">
Confirm Password
</label>

<div className="relative">

<div className="absolute left-3 top-4 text-gray-400">
<FaLock/>
</div>

<input
type={showConfirm?"text":"password"}
name="confirmPassword"
value={formData.confirmPassword}
onChange={handleChange}
className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300"
disabled={isLoading}
/>

<button
type="button"
onClick={()=>setShowConfirm(!showConfirm)}
className="absolute right-4 top-4 text-gray-500"
>
{showConfirm ? <FaEyeSlash/> : <FaEye/>}
</button>

</div>

{errors.confirmPassword &&
<p className="text-red-600 text-sm mt-2">
{errors.confirmPassword}
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
Activating...
</>
:
<>
<FaLandmark/>
Activate Account
</>
}
</button>



<div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
<div className="flex items-start">
<FaExclamationTriangle className="text-yellow-600 mt-1 mr-3"/>
<div>
<p className="text-sm font-medium text-yellow-800">
Authorized Registrars Only
</p>

<p className="text-xs text-yellow-700">
Activation requires preloaded registrar identity in system records.
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

export default RegistrarActivate;