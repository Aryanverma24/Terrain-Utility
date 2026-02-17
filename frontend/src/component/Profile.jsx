import { useEffect, useState,useContext } from 'react';
import { AuthContext } from '../../contexts/authContext';
import { API } from '../../utils/API';
import { useNavigate } from 'react-router';
import {toast} from 'react-toastify'
import { Link } from 'react-router-dom';
import { MdLocationOn ,MdCall ,MdEmail,MdCalendarMonth, MdLandscape, } from "react-icons/md";
import { TiUser } from "react-icons/ti";
import { CiEdit } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";
import Wishlist from './Wishlist';

const Profile = () => {

  const [userdata,setUserdata] = useState(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
  const [lands,setLands] = useState([])

  const {user} = useContext(AuthContext);

  const navigate = useNavigate();

  const [toggleEdit , setToggleEdit] = useState(false)
  
  const [username,setUsername] = useState('')
  const [email,setEmail] = useState('')
  const [gender,setGender] = useState('')
  const [age,setAge] = useState('')
  const [city,SetCity] = useState('')
  const [state,setState] = useState('')
  const [contactNumber,setContactNumber] = useState('')
  const [bio,setBio]  = useState("")

  const [wishlist,setWishlist] = useState([]);
   
  
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
    if (!user?._id) return;
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

    
    const handleToggleEdit = () => {
      setUsername(userdata.data.username || "");
      setEmail(userdata.data.email || "");
      setGender(userdata.data.gender || "");
      setAge(userdata.data.age || "");
      SetCity(userdata.data.city || "");
      setState(userdata.data.state || "");
      setContactNumber(userdata.data.contactNumber || "");
      setBio(userdata.data.bio || "");
      setToggleEdit(true);
    };

    const cancelEditMode = () => {
      setToggleEdit(false)
    }
    
    const handleUpdate = async () => {
      console.log(gender)
      console.log(city)
      const updatedData = {
        username : username,
        email : email,
        contactNumber :contactNumber,
        city : city,
        state : state,
        age : age,
        gender : gender,
        bio : bio
      };
    
      console.log(updatedData);
    
      try {
        const response = await API.put("/api/users/profile", updatedData);
        toast.success("Profile updated successfully!");
        console.log(response);
        setUserdata({ data: response.data }); // Update the local state with the new data
        setToggleEdit(false);
        console.log("after update ", userdata)
        navigate("/userProfile"); // Moved inside the try block
      } catch (error) {
        toast.error(error.response?.data?.message || "Error updating profile");
      }
      navigate("/userProfile")
    };

    //saved land count
    
      useEffect(()=>{
        if(user) {
          const fetchWishlist = async () => {
            try {
              const { data } =await API.get(`/api/wishlist/${user._id}`);
              setWishlist(data[0].lands)
              console.log(data[0].lands)
            } catch (error) {
              console.log(error)
              toast.success("lands are fetched")
            } 
          }
          fetchWishlist();
        }
      },[user])

    
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;



  
  return (
      <>
      {userdata && 
       <div className='pt-[5rem] px-4 text-black bg-lightTan h-auto min-h-screen'>
          <div className="flex gap-5">
                  <div className='bg-sandBrown mb-5 w-1/4 h-[28rem] rounded-xl'>
                      <div className="flex flex-col items-center">
                        <div className='px-1 py-1 w-[12rem] h-[12rem] flex justify-center items-center mt-[1rem] object-cover bg-richBrown
                        rounded-full'>
                          <img src="https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=600" alt="profile-image" 
                          className='rounded-full w-[11rem] h-[11rem]'/>
                        </div>
                          <button onClick={handleToggleEdit}>
                        <CiEdit className='text-2xl mt-[1.8rem] ml-[7rem] absolute' />
                        </button> 
                        <div className='m-2 text-richBrown'>
                          <h2 className='text-3xl text-center py-2 font-bold'>{userdata.data.username}</h2>
                          <h3 className='px-2 py-1 text-md line-clamp-4'>{userdata.data.bio}</h3>
                        </div>

                         
                       

                      </div>
                        {/* <div className="flex justify-center items-center">
                          <Link to='/add-face'> 
                        <button className='px-2 py-1 rounded-2xl mt-[1rem] text-center bg-richBrown text-mintGreen font-semibold'>
                          Add Face
                        </button>
                          </Link>
                          </div> */}
                  </div>

        
                  <div className='bg-sandBrown mb-5 w-1/3  rounded-xl'>

                        <div className="flex ml-[3rem] pl-[3rem] w-full h-10">
                          <h2 className="text-center mr-[4rem] pt-6 text-2xl font-semibold text-darkWalnut">
                          PERSONAL DETAILS
                      </h2>
                        <button onClick={handleToggleEdit}>
                        <CiEdit className='text-2xl mt-[2rem] mr-4' />
                        </button>  
                        </div>
                      
                        
                      
                      <div className="flex flex-col gap-5 pt-5 mt-[1rem] text-lg px-6 text-richBrown font-semibold">
                          <div className='flex'>
                              <MdLocationOn className='mt-1 mr-2'/>
                              <h2 className='mr-2'>Address :</h2>

                              {userdata.data.City!=="unknown" &&  userdata?.data.City[0].toUpperCase() + userdata?.data.City.substring(1) + " , "} 
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
                          <div className='flex'>
                              <MdLandscape className='mt-2 mr-2'/>
                              <h2 className='mr-2'>Saved Lands :</h2>
                              {wishlist?.length}
                          </div>
                          
                      </div>
                  </div>

                  <div className='bg-sandBrown mb-5 w-[38%] rounded-xl'>
                      <h2 className="text-center pt-4 text-2xl font-semibold text-darkWalnut">
                          {userdata && userdata.data.username}'s Lands
                      </h2>
                      <div className="flex flex-col gap-4 pt-5 text-lg px-4 text-richBrown font-semibold">
                          {lands && lands.map(
                            (land) => (
                              <>
                             <Link to={`/land/${land._id}`}
                             className='min-h-[10rem]'>
                             <div className='bg-sand500 rounded-lg px-2 py-1'>
                                {land.image && (
                               <div className=" flex items-center">
                                 <img
                                src={`http://localhost:5000/uploads/${land.image}`}
                                 alt={land.landtype || "land"}
                                className="rounded-lg pt-3 w-[32%] object-cover mb-4"
                            />  
                                <div className="container ml-3 text-white text-md font-normal">
                                  <h3>Land Type : {land.landtype[0].toUpperCase() + land.landtype.substring(1)}</h3>
                                  <h3>City : {land.city[0].toUpperCase() + land.city.substring(1)}</h3>
                                  <h3>Owner : {land.ownerName[0].toUpperCase() + land.ownerName.substring(1)}</h3>

                                </div>
                               </div>
                          )}
                                </div>
                             </Link>
                              </>
                            )
                          )
                          }
                      </div>
                      <Link to="/mylands"
                      className='flex justify-center'>
                      <button className='px-4 py-2 bg-sand500 rounded-xl text-white mb-5 hover:bg-richBrown'>
                        My Lands</button></Link>
                  </div>
          </div>
       </div>
       }
       {toggleEdit && 
          <div className='bg-black absolute bg-opacity-50 w-full top-[2rem] min-h-screen'>
            <h2 className='text-5xl font-extrabold text-white'></h2>

            <div className="flex flex-col ml-[30%] px-4 pb-4 justify-center mt-[3rem] bg-mintGreen w-[30rem] rounded-xl md:scale-[85%] md:mt-[0.5rem]">
                  
                   <div className="relative">
                   <h2 className='text-xl pt-[1rem] text-center mb-[1rem] font-semibold text-darkWalnut'>Edit Profile</h2>
                    <button className='text-2xl absolute top-4 right-1'
                    onClick={cancelEditMode}>
                    <RxCross2 />
                    </button>
                   </div>
                    <input 
                        type="text"
                        value={username}
                        placeholder="enter username"
                        onChange={(e) => setUsername(e.target.value) }
                        className='py-1 mb-4 px-2 outline-2 outline-cardGreen rounded-md'
                     />
                    <input 
                        type="email"
                        value={email}
                        placeholder="enter email"
                        onChange={(e) => setEmail(e.target.value) }
                        className='py-1 mb-4 px-2 outline-2 outline-cardGreen rounded-md'
                     />
                     <input 
                        type="text"
                        value={city}
                        placeholder="enter city"
                        onChange={(e) => SetCity(e.target.value) }
                        className='py-1 mb-4 px-2 outline-2 outline-cardGreen rounded-md'
                     />
                       <input 
                        type="text"
                        value={state}
                        placeholder="enter state"
                        onChange={(e) => setState(e.target.value) }
                        className='py-1 mb-4 px-2 outline-2 outline-cardGreen rounded-md'
                     />
                     <input 
                        type="text"
                        value={contactNumber}
                        placeholder="enter contact number"
                        onChange={(e) => setContactNumber(e.target.value) }
                        className='py-1 mb-4 px-2 outline-2 outline-cardGreen rounded-md'
                        />
                     <input 
                     type="number"
                     value={age}
                     placeholder="enter Age"
                        onChange={(e) => setAge(e.target.value) }
                        className='py-1 mb-4 px-2 outline-2 outline-cardGreen rounded-md'
                     />
                   <select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      className='py-1 mb-4 px-2 outline-2 outline-cardGreen rounded-md text-black'
                    >
                    <option value="" disabled>Select Your Gender</option>
                    <option value="male" className='text-darkWalnut font-bold'>Male</option>
                    <option value="female" className='text-darkWalnut font-bold'>Female</option>
                  </select>

                     <textarea className='px-2 py-1 col-auto rounded-lg mb-4 outline-cardGreen outline-2 text-black' 
                     placeholder='write bio...' 
                     value={bio}
                     onChange={(e)=>setBio(e.target.value)}>

                     </textarea>
                     <div className="flex justify-center items-center">  
                     <button className='text-xl bg-cardGreen text-darkWalnut font-semibold py-1 px-2 rounded-2xl w-3/6 '
                     onClick={handleUpdate}>
                      Update Profile
                     </button>
                     </div>
            </div>
          </div>
          }
      </>
  )
}

export default Profile