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
  //user declaration
const [userDeclarationAccepted, setUserDeclarationAccepted] = useState(false);
const [userDeclarationError, setUserDeclarationError] = useState(false);
const [hasUploadedDocs, setHasUploadedDocs] = useState(false);
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
  
  useEffect(() => {
  const fetchUserDocsStatus = async () => {
    try {
      const res = await API.get("/api/users/my-documents");

      if (res.data) {
        setDocuments(res.data);

        if (res.data.documents?.length > 0) {
          setHasUploadedDocs(true);
        }

        if (res.data.userDeclaration?.accepted) {
          setUserDeclarationAccepted(true);
        }
      }
    } catch (err) {
      console.log("No documents yet");
    }
  };

  fetchUserDocsStatus();
}, []);
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
  if (!userDeclarationAccepted) {
    setUserDeclarationError(true);
    return toast.error("Please accept declaration before uploading");
  }

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

    // 🔥 ADD DECLARATION FLAG
    formData.append("userDeclarationAccepted", true);

    await API.post("/api/users/upload-user-docs", formData);

    toast.success("Documents uploaded successfully!");

    setHasUploadedDocs(true); // 🔥 lock upload
    setShowDocModal(false);

  } catch (error) {
    toast.error(error.response?.data?.message || "Upload failed");
  } finally {
    setLoadingDocsUpload(false);
  }
};
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
{/* UPLOAD BUTTON */}
<button
  onClick={() => setShowDocModal(true)}
  disabled={hasUploadedDocs}
  className="mt-4 px-3 py-2 bg-cardGreen text-darkWalnut rounded-xl font-semibold disabled:bg-gray-400"
>
  Upload KYC Documents
</button>

 {showDocModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-4">
    
    <div className="w-full max-w-2xl bg-mintGreen border border-sand500 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-8 relative">

      {/* CLOSE BUTTON */}
      <button
        onClick={() => setShowDocModal(false)}
        className="absolute top-4 right-4 text-richBrown/60 hover:text-darkWalnut text-xl"
      >
        ✖
      </button>

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-darkWalnut">
          Upload KYC Documents
        </h2>
        <p className="text-sm text-richBrown/70 mt-1">
          Submit your identity documents for verification
        </p>
      </div>

      {/* DOCUMENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {[
          { label: "Aadhaar", name: "Aadhaar", required: true },
          { label: "PAN", name: "PAN", required: true },
          { label: "Profile Photo", name: "ProfilePhoto", required: true },
          { label: "Address Proof", name: "AddressProof", required: true },
        ].map((doc) => (
          <div
            key={doc.name}
            className="border border-sand500 bg-lightTan rounded-xl p-4 hover:shadow-lg hover:shadow-sand500/30 transition"
          >
            <label className="block text-sm font-semibold text-darkWalnut mb-2">
              {doc.label} {doc.required && <span className="text-red-500">*</span>}
            </label>

            <input
              type="file"
              name={doc.name}
              onChange={handleDocChange}
              className="w-full text-sm border border-sand500 rounded-lg p-2 file:bg-cardGreen file:text-darkWalnut file:px-3 file:py-1 file:rounded-md file:border-none cursor-pointer"
            />

            {docs[doc.name] && (
              <p className="text-xs text-green-600 mt-2">
                ✅ {docs[doc.name].name}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* OPTIONAL DOC */}
      <div className="mt-6 border border-dashed border-sand500 rounded-xl p-4 bg-lightTan">
        <label className="block text-sm font-semibold text-darkWalnut mb-2">
          Optional Document
        </label>

        <div className="flex gap-3">
          <select
            value={docs.optionalDocType || ""}
            onChange={(e) =>
              setDocs((prev) => ({
                ...prev,
                optionalDocType: e.target.value,
              }))
            }
            className="flex-1 border border-sand500 rounded-lg px-3 py-2 text-sm bg-mintGreen text-darkWalnut"
          >
            <option value="">Select Document</option>
            <option value="Passport">Passport</option>
            <option value="DrivingLicense">Driving License</option>
            <option value="VoterID">Voter ID</option>
          </select>

          <input
            type="file"
            onChange={(e) =>
              setDocs((prev) => ({
                ...prev,
                optionalDocFile: e.target.files[0],
              }))
            }
            className="flex-1 text-sm border border-sand500 rounded-lg p-2 file:bg-richBrown file:text-white file:px-3 file:py-1 file:rounded-md file:border-none"
          />
        </div>
      </div>

      {/* DECLARATION SECTION */}
      <div
        className={`mt-6 p-5 rounded-2xl border transition ${
          userDeclarationError
            ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse"
            : "border-sand500 bg-lightTan"
        }`}
      >
        <p className="text-sm text-darkWalnut leading-relaxed">
          I confirm that all submitted documents are authentic and belong to me.
          I understand that submitting false documents may result in legal action.
        </p>

        <div className="flex items-center mt-4 gap-2">
          <input
            type="checkbox"
            checked={userDeclarationAccepted}
            onChange={(e) => {
              setUserDeclarationAccepted(e.target.checked);
              setUserDeclarationError(false);
            }}
            disabled={hasUploadedDocs}
            className="w-5 h-5 accent-cardGreen"
          />
          <label className="text-sm font-medium text-darkWalnut">
            I agree and accept responsibility
          </label>
        </div>

        {hasUploadedDocs && (
          <p className="text-green-600 text-sm mt-2">
            ✅ Declaration already submitted
          </p>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-between mt-8">

        <button
          onClick={() => setShowDocModal(false)}
          className="px-5 py-2 rounded-lg bg-sand500 text-white hover:bg-richBrown transition"
        >
          Cancel
        </button>

        <button
          onClick={handleDocUpload}
          disabled={hasUploadedDocs || loadingDocsUpload}
          className="bg-cardGreen hover:bg-richBrown text-darkWalnut px-6 py-3 rounded-xl font-semibold shadow-lg disabled:opacity-50 flex items-center gap-2 transition"
        >
          {loadingDocsUpload ? "Uploading..." : "Upload Documents"}
        </button>

      </div>

    </div>
  </div>
)}

{/* VIEW BUTTON */}
<button
  onClick={fetchDocuments}
  disabled={!hasUploadedDocs}
  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
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