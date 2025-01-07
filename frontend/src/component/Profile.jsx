import { useEffect, useState } from 'react';
import { API } from '../../utils/API';
import {toast} from 'react-toastify'

const Profile = () => {

  const [userdata,setUserdata] = useState(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
  const [lands,setLands] = useState([])
  
  const [toggleInput , setToggleInput] = useState(false)
  
  const [username,setUsername] = useState('')
  const [email,setEmail] = useState('')
  const [gender,setGender] = useState('')
  const [age,setAge] = useState('')
  const [city,SetCity] = useState('')
  const [state,setState] = useState('')
  const [contactNumber,setContactNumber] = useState('')
  
  useEffect(() => {
    API.get("/api/users/profile")
    .then((response) => {
      setUserdata(response.data)
        setLoading(false);
      })
      .catch((error) => {
        setError(error.response?.data || error.message); 
        setLoading(false);
      });
  }, []);
  useEffect(() => {
    fetch("http://localhost:5000/get-land")
      .then((response) => response.json())
      .then((data) => {
        console.log("Land data received:", data); // Log the entire response
        setLands(Array.isArray(data.data) ? data.data : []); // Assuming response is wrapped in "data"
      })
      .catch((error) => console.error("Error fetching data:", error));
    }, []);

    const handleToggleInput = () => {
      setToggleInput(true);
      toast.success("Edit mode enabled");
      setUsername(userdata.data.username);
      setAge(userdata.data.age);
      setContactNumber(userdata.data.contactNumber);
      setEmail(userdata.data.email);
      setGender(userdata.data.gender);
      setState(userdata.data.state);
      SetCity(userdata.data.city);
    };
  
    const handleUpdate = async () => {
      const updatedData = {
        username,
        email,
        contactNumber,
        city,
        state,
        age,
        gender,
      };
  
      try {
        const response = await API.put("/api/users/profile", updatedData);
        toast.success("Profile updated successfully!");
        setUserdata({ data: response.data }); // Update the local state with the new data
        setToggleInput(false);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error updating profile");
      }
    };
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;


    console.log(userdata)
  
  return (
      <>
       {userdata?.data && 
         <div className='text-white  bg-[#1a1a1a] '>
         <div className='image-container'>
             <img src="https://www.green.earth/hubfs/What%20is%20sustainable%20land%20management%20-Pillar%20%20Combating%20Desertification_featured.png" alt="background-image" 
             className='bg-cover ml-[0.7rem] h-[18rem] w-[99%]'/>
         </div>

         <div className='absolute  ml-[15rem]'>
               <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRX-cskA2FbOzFi7ACNiGruheINgAXEqFL1TQ&s" alt="user image" 
               className='rounded-full z-10 absolute top-[-6rem] right-[13rem] '/>
             <div className='h-[12rem] w-[40rem]'>
                 <div className='flex flex-col items-center pt-[9rem] '>
                   <h2 className='font-semibold text-3xl uppercase'>{userdata.data.username}</h2>
                 </div>
             </div>
         </div>
         <div className=" relative mt-[12rem] ml-[6rem] bg-[#2f2f2f] mr-[4rem] mb-5 rounded-xl">
                <h2 className='font-semibold text-center text-green-500 text-2xl py-5'>Details</h2>

                <div className="flex flex-col px-4 py-2">
                <div className={` ${toggleInput ? "flex justify-evenly" : "flex flex-wrap gap-[14rem]"}`}>
                <div className="flex gap-5 px-4 mb-2">
                  <h3 className='text-lg '>Name </h3>
                  {toggleInput
                   
                  ?
                  <input 
                    type="text"
                    value={username}
                    onChange={(e)=>setUsername(e.target.value)}
                    className='px-2 py-1 rounded-lg bg-[#1c1c1c] text-white'  
                  /> 
                  :
                  <h3 className='text-lg font-semibold'>{userdata.data.username.substring(0,1).toUpperCase() + userdata.data.username.substring(1)}
                  </h3>
                  }
                </div>

                <div className="flex gap-5 px-4 mb-2">
                  
                  <h3 className='text-lg '>Gender </h3>
                  {toggleInput
                   
                   ?
                   <input 
                     type="text"
                     value={gender}
                     onChange={(e)=>setGender(e.target.value)}
                     className='px-2 py-1 rounded-lg bg-[#1c1c1c] text-white'  
                   /> 
                   :
                  <h3 className='text-lg font-semibold'>{userdata.data.gender}</h3>
                  }
                </div>

                <div className="flex gap-5 px-4 mb-2">
                  <h3 className='text-lg '>Age </h3>
                  {toggleInput
                   
                   ?
                   <input 
                     type="text"
                     value={age}
                     onChange={(e)=>setAge(e.target.value)}
                     className='px-2 py-1 rounded-lg bg-[#1c1c1c] text-white'  
                   /> 
                   :
                  <h3 className='text-lg font-semibold'>{userdata.data.age}</h3>
                  }
                </div>
                </div>
                <div className={` ${toggleInput ? "flex justify-evenly" : "flex flex-wrap gap-[13rem]"}`}>
                <div className="flex gap-5 px-4 mb-2">
                  <h3 className='text-lg '>Email  </h3>
                  {toggleInput
                   
                   ?
                   <input 
                     type="text"
                     value={email}
                     onChange={(e)=>setEmail(e.target.value)}
                     className='px-2 py-1 rounded-lg bg-[#1c1c1c] text-white'  
                   /> 
                   :
                  <h3 className='text-lg font-semibold'>{userdata.data.email}</h3>
                  }
                </div>

                <div className="flex gap-5 px-4 mb-2">
                  <h3 className='text-lg '>State </h3>
                  {toggleInput
                   
                   ?
                   <input 
                     type="text"
                     value={state}
                     onChange={(e)=>setState(e.target.value)}
                     className='px-2 py-1 rounded-lg bg-[#1c1c1c] text-white'  
                   /> 
                   :
                  <h3 className='text-lg font-semibold'>{userdata.data.state.substring(0,1).toUpperCase() +  userdata.data.state.substring(1)}</h3>
                  }
                </div>

                <div className="flex gap-5 px-3 mb-2">
                  <h3 className='text-lg '>City </h3>
                  {toggleInput
                   
                   ?
                   <input 
                     type="text"
                     value={city}
                     onChange={(e)=>SetCity(e.target.value)}
                     className='px-2 py-1 rounded-lg bg-[#1c1c1c] text-white'  
                   /> 
                   :
                  <h3 className='text-lg font-semibold'>{userdata.data.City.substring(0,1).toUpperCase() + userdata.data.City.substring(1)}</h3>
                    }
                </div>
                </div>

                <div className={` ${toggleInput ? "flex pl-3" : "flex flex-wrap gap-[8.40rem]"}`}>
                <div className="flex gap-5 px-4 mb-2">
                  <h3 className='text-lg '>Contact </h3>
                  {toggleInput
                   
                   ?
                   <input 
                     type="text"
                     value={contactNumber}
                     onChange={(e)=>setContactNumber(e.target.value)}
                     className='px-2 py-1 rounded-lg bg-[#1c1c1c] text-white'  
                   /> 
                   :
                  <h3 className='text-lg font-semibold'>{userdata.data.contactNumber}</h3>}
                </div>
                <div className={`flex gap-5 px-[3.35rem] mb-2 ${toggleInput ? "px-9 " : ""}}`}>
                  <h3 className='text-lg '>Total Lands </h3>
                  <h3 className='text-lg font-semibold'>{lands.length}</h3>
                </div>
                <div className={`flex gap-5  mb-2 ${toggleInput ? "pl-[10rem] " : "pl-[3.35rem]"}`}>
                  <h3 className='text-lg '>Is Admin </h3>
                  <h3 className='text-lg font-semibold'>{userdata.data.isAdmin ? "Admin" : "Not as Admin"}</h3>
                </div>
               
                </div>

                </div>
                {toggleInput ? (
                <div className="flex justify-center pb-3">
                <button className='px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-700'
                onClick={handleUpdate}>Update</button>
                </div>
                )
                 : 
                (
                <div className="flex justify-center pb-3">
                <button className='px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-700'
                onClick={handleToggleInput}>Edit User</button>
                </div>
                )}
             </div>


     </div>
       }
      </>
  )
}

export default Profile