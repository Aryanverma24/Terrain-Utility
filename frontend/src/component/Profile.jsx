import { useEffect, useState,useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { API } from '../../utils/API';
import { useNavigate } from 'react-router';
import {toast} from 'react-toastify'
import { Link } from 'react-router-dom';
import { MdLocationOn ,MdCall ,MdEmail,MdCalendarMonth, MdLandscape, } from "react-icons/md";
import { TiUser } from "react-icons/ti";
import { CiEdit } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";
import { getFileUrl } from '../../../backend/utils/getFileUrl';
import axios from 'axios';
import Wishlist from './Wishlist';

const Profile = () => {

  const [userdata,setUserdata] = useState(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
  const [lands,setLands] = useState([])

  const {user} = useContext(AuthContext);

const token = user?.token;
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
  //userdocument states 
  const [showDocModal, setShowDocModal] = useState(false);
  //for uplaoding the documnets 
const [loadingDocsUpload, setLoadingDocsUpload] = useState(false);
const [docs, setDocs] = useState({
  Aadhaar: null,
  PAN: null,
  Passport: null,
  VoterID: null,
  DrivingLicense: null,
  AddressProof: null,
  ProfilePhoto: null,
});
//user document show states
const [showDocs, setShowDocs] = useState(false);
const [documents, setDocuments] = useState(null);
//for reuploading docs
const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState(null);
//reuplaod of document
const handleUserReupload = async (docId, file) => {
  if (!file) return toast.error("No file selected");

  try {
    setUploadingDocId(docId);

    const formData = new FormData();
    formData.append("file", file);
const res = await API.put(
  `/api/users/file/${docId}/reupload`,
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

    const updatedDoc = res.data.document;
console.log("UpdatedDoc:", updatedDoc);
console.log("Prev state:", documents);
    // ✅ UPDATE STATE INSTANTLY
   setDocuments((prev) => ({
  ...prev,
  documents: prev.documents.map((doc) =>
    doc._id === docId
      ? {
          ...doc,
          file: updatedDoc.file,
          status: updatedDoc.status,
        }
      : doc
  ),
}));

    toast.success("Document reuploaded successfully");

  } catch (err) {
    console.error(err);
    toast.error(err?.response?.data?.message || "Upload failed");
  } finally {
    setUploadingDocId(null);
  }
};
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

    //doucmnt upload functions
    const handleDocChange = (e) => {
  setDocs({
    ...docs,
    [e.target.name]: e.target.files[0],
  });
};

//to upload documents 
const handleDocUpload = async () => {
  if (!docs.Aadhaar || !docs.PAN || !docs.ProfilePhoto || !docs.AddressProof) {
    return toast.error("Please upload all mandatory documents");
  }

  try {
    setLoadingDocsUpload(true);

    const formData = new FormData();
    formData.append("Aadhaar", docs.Aadhaar);
    formData.append("PAN", docs.PAN);
    formData.append("ProfilePhoto", docs.ProfilePhoto);
    formData.append("AddressProof", docs.AddressProof);

    if (docs.optionalDocFile && docs.optionalDocType) {
      formData.append("optionalDocFile", docs.optionalDocFile);
      formData.append("optionalDocType", docs.optionalDocType);
    }

    await API.post("/api/users/upload-user-docs", formData);

    toast.success("Documents uploaded successfully!");
    setShowDocModal(false);
    // Reset docs after upload
    setDocs({
      Aadhaar: null,
      PAN: null,
      ProfilePhoto: null,
      AddressProof: null,
      optionalDocType: "",
      optionalDocFile: null,
    });
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || "Upload failed");
  } finally {
    setLoadingDocsUpload(false);
  }
};
//function to fetch uploaded document 
// const fetchDocuments = async () => {
//   try {
//     const token = localStorage.getItem("token"); // 🔥 use this if unsure

//     console.log("TOKEN:", token);

//     if (!token) {
//       alert("No token found. Please login again.");
//       return;
//     }

//     setLoadingDocs(true);

//     const res = await axios.get(
//       "http://localhost:5000/api/users/my-documents",
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     setDocuments(res.data);
//     setShowDocs(true);

//   } catch (err) {
//     console.log("ERROR:", err.response?.data || err.message);
//     alert("Unauthorized. Please login again.");
//   } finally {
//     setLoadingDocs(false);
//   }
// };
const fetchDocuments = async () => {
  try {
    const token = localStorage.getItem("token"); 

    if (!token) {
      alert("No token found. Please login again.");
      return;
    }

    setLoadingDocs(true);

    const res = await axios.get(
      "http://localhost:5000/api/users/my-documents",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setDocuments(res.data);
    setShowDocs(true);

  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);
    alert("Unauthorized. Please login again.");
  } finally {
    setLoadingDocs(false);
  }
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
<button
  onClick={() => setShowDocModal(true)}
  className="mt-4 px-3 py-2 bg-cardGreen text-darkWalnut rounded-xl font-semibold"
>
  Upload KYC Documents
</button>
                         
    {showDocModal && (
  <div className="bg-black bg-opacity-50 fixed inset-0 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-xl w-[30rem] max-h-[90vh] overflow-y-auto">

      <h2 className="text-xl font-bold mb-4 text-center">Upload KYC Documents</h2>

      {/* Aadhaar */}
      <label className="block mb-2">Aadhaar (Required)</label>
      <input type="file" name="Aadhaar" onChange={handleDocChange} className="mb-4" />

      {/* PAN */}
      <label className="block mb-2">PAN (Required)</label>
      <input type="file" name="PAN" onChange={handleDocChange} className="mb-4" />

      {/* Profile Photo */}
      <label className="block mb-2">Profile Photo (Required)</label>
      <input type="file" name="ProfilePhoto" onChange={handleDocChange} className="mb-4" />

      {/* Address Proof */}
      <label className="block mb-2">Address Proof (Required)</label>
      <input type="file" name="AddressProof" onChange={handleDocChange} className="mb-4" />

      {/* Optional Document */}
      <label className="block mb-2">Optional Document</label>
      <div className="flex gap-2 mb-4">
        <select
          name="optionalDocType"
          value={docs.optionalDocType || ""}
          onChange={(e) => setDocs(prev => ({ ...prev, optionalDocType: e.target.value }))}
          className="py-1 px-2 outline-2 outline-cardGreen rounded-md flex-1 text-black"
        >
          <option value="">Select Document</option>
          <option value="Passport">Passport</option>
          <option value="DrivingLicense">Driving License</option>
          <option value="VoterID">Voter ID</option>
        </select>
        <input
          type="file"
          name="optionalDocFile"
          onChange={(e) => setDocs(prev => ({ ...prev, optionalDocFile: e.target.files[0] }))}
          className="flex-1"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setShowDocModal(false)}
          className="px-4 py-2 bg-gray-400 rounded-lg"
          disabled={loadingDocsUpload}
        >
          Cancel
        </button>

        <button
          onClick={handleDocUpload}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
          disabled={loadingDocsUpload}
        >
          {loadingDocsUpload && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          )}
          {loadingDocsUpload ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  </div>
)}

<button
  onClick={fetchDocuments}
  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  📄 View Uploaded Documents
</button>
{showDocs && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div className="bg-white w-[90%] max-w-4xl p-6 rounded-2xl shadow-xl overflow-y-auto max-h-[85vh]">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Documents</h2>
        <button
          onClick={() => setShowDocs(false)}
          className="text-gray-500 hover:text-black text-lg"
        >
          ✖
        </button>
      </div>

      {/* Loading */}
      {loadingDocs ? (
        <p className="text-center">Loading...</p>
      ) : documents?.documents?.length > 0 ? (

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {documents.documents.map((doc, index) => (
            <div
  key={index}
  className="border rounded-xl p-4 shadow-sm hover:shadow-md transition"
>
  {/* Type */}
  <p className="font-semibold text-lg">{doc.type}</p>

  {/* Status */}
  <p
    className={`text-sm mt-1 font-medium ${
      doc.status === "approved"
        ? "text-green-600"
        : doc.status === "rejected"
        ? "text-red-600"
        : "text-yellow-600"
    }`}
  >
    Status: {doc.status}
  </p>

  {/* Image */}
  <img
    src={getFileUrl(doc.file)}
    alt={doc.type}
    onClick={() => window.open(getFileUrl(doc.file), "_blank")}
    className="mt-3 h-36 w-full object-cover rounded-lg cursor-pointer hover:opacity-80"
  />

  {/* Timestamp */}
  <p className="text-xs text-gray-500 mt-2">
    Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
  </p>

  {/* 🔥 REUPLOAD BUTTON */}
  {doc.status === "rejected" && (
    <div className="mt-3">
      <label className="block w-full cursor-pointer">

        <div className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 px-3 rounded-lg text-center flex items-center justify-center gap-2">

          {uploadingDocId === doc._id ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              </svg>
              Uploading...
            </>
          ) : (
            "Re-upload Document"
          )}

        </div>

        <input
          type="file"
          className="hidden"
          disabled={uploadingDocId === doc._id}
          onChange={(e) =>
            handleUserReupload(doc._id, e.target.files?.[0])
          }
        />

      </label>
    </div>
  )}
</div>
          ))}

        </div>

      ) : (
        <p className="text-center text-gray-500">
          No documents uploaded
        </p>
      )}

    </div>
  </div>
)}

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