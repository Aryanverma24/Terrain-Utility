import { useContext, useEffect, useState } from 'react';
import { AuthContext } from "../../contexts/authContext";
import { API } from '../../utils/API';

const Profile = () => {

  const [userdata,setUserdata] = useState(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
  const [lands,setLands] = useState([])

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
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
                <h2 className='font-semibold text-xl px-4 py-5'>Details</h2>

                <div className="flex flex-wrap gap-10">    
                <div className="flex gap-5 px-20 mb-4">
                  <h3 className='text-lg '>Name  : </h3>
                  <h3 className='text-lg font-semibold'>{userdata.data.username.substring(0,1).toUpperCase() + userdata.data.username.substring(1)}</h3>
                </div>

                <div className="flex gap-5 px-20 mb-4 ">
                  <h3 className='text-lg '>Gender  : </h3>
                  <h3 className='text-lg font-semibold'>{userdata.data.gender}</h3>
                </div>

                <div className="flex gap-5 px-20 mb-4 ">
                  <h3 className='text-lg '>Age  : </h3>
                  <h3 className='text-lg font-semibold'>{userdata.data.age}</h3>
                </div>
                </div>
                <div className='flex flex-wrap gap-6'>
                <div className="flex gap-5 px-20 mb-4">
                  <h3 className='text-lg '>Email  : </h3>
                  <h3 className='text-lg font-semibold'>{userdata.data.email}</h3>
                </div>

                <div className="flex gap-5 px-20 mb-4">
                  <h3 className='text-lg '>State  : </h3>
                  <h3 className='text-lg font-semibold'>{userdata.data.state.substring(0,1).toUpperCase() +  userdata.data.state.substring(1)}</h3>
                </div>

                <div className="flex gap-5 px-20 mb-4">
                  <h3 className='text-lg '>City : </h3>
                  <h3 className='text-lg font-semibold'>{userdata.data.city.substring(0,1).toUpperCase() + userdata.data.city.substring(1)}</h3>
                </div>
                </div>

                <div className='flex flex-wrap gap-6'>
                <div className="flex gap-5 px-20 mb-4">
                  <h3 className='text-lg '>Contact  : </h3>
                  <h3 className='text-lg font-semibold'>{userdata.data.contactNumber}</h3>
                </div>

                <div className="flex gap-5 px-20 mb-4">
                  <h3 className='text-lg '>Is Admin  : </h3>
                  <h3 className='text-lg font-semibold'>{userdata.data.isAdmin ? "Admin" : "Not as Admin"}</h3>
                </div>
                <div className="flex gap-5 px-20 mb-4">
                  <h3 className='text-lg '>Total Lands  : </h3>
                  <h3 className='text-lg font-semibold'>{lands.length}</h3>
                </div>
                </div>
             </div>


     </div>
       }
      </>
  )
}

export default Profile