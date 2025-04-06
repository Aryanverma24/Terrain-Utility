import { useEffect, useState,useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { API } from '../../utils/API';
import { useNavigate } from 'react-router';
import {toast} from 'react-toastify'
import Lands from './Lands';
import { Link } from 'react-router-dom';
import { MdLocationOn ,MdCall ,MdEmail,MdCalendarMonth, MdLandscape, } from "react-icons/md";
import { TiUser } from "react-icons/ti";

const Profile = () => {

  const [userdata,setUserdata] = useState(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
  const [lands,setLands] = useState([])

  const {user} = useContext(AuthContext);

  const navigate = useNavigate();

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


  // useEffect(() => {
  //   if(user?._id){
  //   fetch(`http://localhost:5000/owner/${user._id}`)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log("Land data received:", data); // Log the entire response
  //       setLands(Array.isArray(data.data) ? data.data : []); // Assuming response is wrapped in "data"
  //     })
  //     .catch((error) => console.error("Error fetching data:", error));
  //   }
  // }, []);

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const res = await API.get(`/api/lands/owner/${user?._id}`);
        console.log("Response from backend:", res.data); // 👈 Check this
        setLands(res.data.data); // Assuming your response structure is { data: [...] }
      } catch (error) {
        console.error("Error fetching lands", error);
      }
    };
  
    fetchLands();
  }, [user]);
  
    console.log(lands)

    
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
      navigate("/userProfile")
    };
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;


    console.log(userdata)
  
  return (
      <>
       {/* {userdata?.data && 
         <div className='text-white  bg-[#1a1a1a] mb-0 pb-[4rem]'>
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
         <div className=" relative mt-[14rem] ml-[6rem] bg-[#2f2f2f] mr-[4rem] mb-5 rounded-xl">
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

                <Link to='/add-face' className='flex justify-center bg-green-700 '>Face Upload</Link>
     </div>
       } */}
       <div className='pt-[5rem] px-4 text-black bg-lightTan h-auto min-h-screen'>
          <div className="flex gap-5">
                  <div className='bg-sandBrown mb-5 w-1/4 h-[28rem] rounded-xl'>
                      <div className="flex flex-col items-center">
                        <div className='px-1 py-1 w-[12rem] h-[12rem] flex justify-center items-center mt-[1rem] object-cover bg-richBrown
                        rounded-full'>
                          <img src="https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=600" alt="profile-image" 
                          className='rounded-full w-[11rem] h-[11rem]'/>
                        </div>
                        <div className='m-2 text-richBrown'>
                          <h2 className='text-3xl py-2 font-bold'>{userdata.data.username}</h2>
                          <h3 className='text-xl font-semibold'>Bio</h3>
                        </div>
                      </div>
                  </div>

        
                  <div className='bg-sandBrown mb-5 w-1/3  rounded-xl'>
                      <h2 className="text-center pt-4 text-2xl font-semibold text-darkWalnut">
                          PERSONAL DETAILS
                      </h2>
                      <div className="flex flex-col gap-3 pt-5 text-lg px-6 text-richBrown font-semibold">
                          <div className='flex'>
                              <MdLocationOn className='mt-1 mr-2'/>
                              <h2 className='mr-2'>Address :</h2>
                              {userdata.data.city ? userdata.data.city[0].toUpperCase() + userdata.data.city.substring(1) : "Unknown"  } 
                               {userdata.data.state!=="unknown" &&  userdata.data?.state[0].toUpperCase() + userdata?.data.state.substring(1) }
                          </div>

                          <div className='flex'>
                              <MdEmail className='mt-2 mr-2'/>
                              <h2 className='mr-2'>Email :</h2>
                              {userdata?.data.email}
                          </div>

                     
                           <div className='flex'>
                              <MdCall className='mt-2 mr-2'/>
                              <h2 className='mr-2'>Contact :</h2>
                              {userdata?.data.contactNumber}
                          </div>

                          <div className='flex'>
                              <MdCalendarMonth className='mt-[0.38rem] mr-2'/>
                              <h2 className='mr-2'>Age :</h2>
                              {userdata?.data.age}
                          </div>    

                          <div className='flex'>
                              <TiUser className='mt-2 mr-2'/>
                              <h2 className='mr-2'>Gender :</h2>
                              {userdata?.data.gender}
                          </div>
                          <div className='flex'>
                              <MdLandscape className='mt-2 mr-2'/>
                              <h2 className='mr-2'>Total Lands :</h2>
                              {lands?.length}
                          </div>
                          
                      </div>
                  </div>

                  <div className='bg-sandBrown mb-5 w-1/3  rounded-xl'>
                      <h2 className="text-center pt-4 text-2xl font-semibold text-darkWalnut">
                          PERSONAL DETAILS
                      </h2>
                      <div className="flex flex-col gap-3 pt-5 text-lg px-6 text-richBrown font-semibold">
                      <div className='flex'>
                              <MdLocationOn className='mt-1 mr-2'/>
                              <h2 className='mr-2'>Address :</h2>
                              {userdata.data.city ? userdata.data.city[0].toUpperCase() + userdata.data.city.substring(1) : "Unknown"  } 
                               {userdata.data.state!=="unknown" &&  userdata.data?.state[0].toUpperCase() + userdata?.data.state.substring(1) }
                          </div>


                          <div className='flex'>
                              <MdEmail className='mt-2 mr-2'/>
                              <h2 className='mr-2'>Email :</h2>
                              {userdata?.data.email}
                          </div>

                     
                           <div className='flex'>
                              <MdCall className='mt-2 mr-2'/>
                              <h2 className='mr-2'>Contact :</h2>
                              {userdata?.data.contactNumber}
                          </div>

                          <div className='flex'>
                              <MdCalendarMonth className='mt-[0.38rem] mr-2'/>
                              <h2 className='mr-2'>Age :</h2>
                              {userdata?.data.age}
                          </div>    

                          <div className='flex'>
                              <TiUser className='mt-2 mr-2'/>
                              <h2 className='mr-2'>Gender :</h2>
                              {userdata?.data.gender}
                          </div>
                          <div className='flex'>
                              <MdLandscape className='mt-2 mr-2'/>
                              <h2 className='mr-2'>Total Lands :</h2>
                              {lands?.length}
                          </div>
                          
                      </div>
                  </div>
          </div>
       </div>
      </>
  )
}

export default Profile