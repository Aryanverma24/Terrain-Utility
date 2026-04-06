import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import MapPicker from "../GeoComponents/mapPicker";
import { stateCoordinates } from "../../../../backend/utils/stateCoordinates";
import { locationData } from "../../data/indiancities";
import StateCitySelector from "../GeoComponents/stateCitySelector";
import { 
  FaSpinner, 
  FaUpload, 
  FaFileAlt, 
  FaMapMarkerAlt, 
  FaRupeeSign, 
  FaRulerCombined,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaHome,
  FaImage,
  FaFolderOpen,
  FaBuilding,
  FaTree,
  FaCity,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaAward,
  FaChartLine
} from "react-icons/fa";

function CreateLand() {
  const [currentStep, setCurrentStep] = useState(1);
  const [landtype, setLandtype] = useState("");
const [state,setState]=useState("");
const [city,setCity]=useState("");
  const [pincode, setPincode] = useState("");
  const [image, setImage] = useState(null);
  const [owner, setOwner] = useState(null);
  const [price, setPrice] = useState("");
  const [length, setLength] = useState("");
  const [breadth, setBreadth] = useState("");
  const [description, setDescription] = useState("");
  const [documents, setDocuments] = useState({
    Aadhaar: null,
    Pan: null,
    SaleDeed: null,
    LandRegistry: null,
    EncumbranceCertificate: null,
    Khata: null,
    PropertyTax: null,
    SurveyMap: null,
    Noc: null,
    OwnerPhoto: null,
    Bills: [],
    LandPhotos: [],
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100%
  //geo based states 
const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
const [coordinates, setCoordinates] = useState(null);
  const navigate = useNavigate();
  // Form validation for each step
  const validateStep = (step) => {
    switch(step) {
      case 1:
        return landtype && city && state && pincode && price && length && breadth;
      case 2:
        return image;
      case 3:
        return true; // Documents are optional for validation
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  


  
 
//function to handle the cooridinate based on selected state

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No token found. Please login.");
      return;
    }
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    setOwner(decodedToken.userId);
  }, []);

  const handleDocChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 1) {
      setDocuments({ ...documents, [name]: Array.from(files) });
    } else {
      setDocuments({ ...documents, [name]: files[0] });
    }
  };

  const uploadData = async (e) => {
    e.preventDefault();
    toast.success("inside upload")
    if (!image) {
      toast.error("Please upload the main land image.");
      return;
    }

    setLoading(true);
    setProgress(0);

    const token = localStorage.getItem("token");

    try {
      // ------------------ UPLOAD LAND ------------------
      const formData = new FormData();
      formData.append("landtype", landtype);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("pincode", pincode);
      formData.append("image", image);
      formData.append("owner", owner);
      formData.append("price", price);
      formData.append("length", length);
      formData.append("breadth", breadth);
      formData.append("description", description);
      formData.append("latitude", coordinates.lat);
formData.append("longitude", coordinates.lng);
if (!coordinates) {
  toast.error("Please select land location on map.");
  setLoading(false);
  return;
}
      const landRes = await axios.post(
        "http://localhost:5000/create-land",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (event) => {
            const percent = Math.round((event.loaded * 50) / event.total); 
            // 50% for land image upload
            setProgress(percent);
          },
        }
      );

      const landId = landRes.data.land?._id;
      if (!landId) throw new Error("Failed to get Land ID");

      // ------------------ UPLOAD DOCUMENTS ------------------
      const docForm = new FormData();
      Object.keys(documents).forEach((key) => {
        const value = documents[key];
        if (!value) return;
        if (Array.isArray(value)) {
          value.forEach((file) => { if(file) docForm.append(key, file); });
        } else {
          docForm.append(key, value);
        }
      });

      await axios.post(
        `http://localhost:5000/api/lands/documents/upload/${landId}`,
        docForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (event) => {
            const percent = 50 + Math.round((event.loaded * 50) / event.total); 
            // Remaining 50% for documents upload
            setProgress(percent);
          },
        }
      );

      toast.success("Land + Documents uploaded successfully!");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Error uploading land or documents.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 overflow-hidden pt-12">
      {/* Enhanced Background with Multiple Layers */}
      <div className="absolute inset-0">
        {/* Primary Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M0 0h60v60H0z'/%3E%3Cpath d='M30 0v60M0 30h60' stroke='%23ffffff' stroke-width='0.5' fill-opacity='0.2'/%3E%3Ccircle cx='30' cy='30' r='20' fill='none' stroke='%23ffffff' stroke-width='0.3' fill-opacity='0.1'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-transparent to-cyan-900/30 animate-pulse"></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Premium Full Page Loader */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex flex-col items-center justify-center">
          <div className="relative mb-12">
            <div className="w-24 h-24 border-4 border-emerald-400/10 rounded-full"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 w-20 h-20 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Creating Your Premium Listing</h2>
            <p className="text-emerald-400">Please wait while we process your information...</p>
          </div>
          
          <div className="w-96 h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm mb-4">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 transition-all duration-500 shadow-lg"
              style={{ 
                width: `${progress}%`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite'
              }}
            />
          </div>
          <div className="text-emerald-400 font-bold text-xl">{progress}% Complete</div>
        </div>
      )}

      {/* Step 1: Land Details - Professional Full Screen */}
      {currentStep === 1 && (
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Professional Header */}
          <div className="text-center py-12 px-4">
            <div className="max-w-4xl mx-auto">
              {/* Step Indicator */}
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 rounded-full text-emerald-400 text-sm font-bold mb-8 backdrop-blur-sm shadow-lg">
                <FaHome className="w-5 h-5 mr-3" />
                <span className="mr-3">STEP 1 OF 3</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-emerald-400 rounded-full"></div>
                  <div className="w-8 h-1 bg-white/30 rounded-full"></div>
                  <div className="w-8 h-1 bg-white/30 rounded-full"></div>
                </div>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Property
                <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mt-3 bg-gradient-to-r animate-pulse">
                  Information
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Provide comprehensive details about your premium property to attract the right buyers
              </p>

              {/* Trust Badges */}
              <div className="flex justify-center gap-8 mt-8">
                <div className="flex items-center gap-2 text-emerald-400">
                  <FaShieldAlt className="w-5 h-5" />
                  <span className="text-sm font-medium">Secure</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <FaAward className="w-5 h-5" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <FaChartLine className="w-5 h-5" />
                  <span className="text-sm font-medium">Premium</span>
                </div>
              </div>
            </div>
          </div>
       

          {/* Enhanced Progress Section */}
          <div className="max-w-5xl mx-auto px-8 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <FaHome className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Property Details</h3>
                    <p className="text-gray-400 text-sm">Basic information about your land</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold text-2xl">33%</div>
                  <div className="text-gray-400 text-sm">Complete</div>
                </div>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700 shadow-lg" style={{ width: '33%' }} />
              </div>
            </div>
          </div>

          {/* Professional Form Content */}
          <div className="flex-1 max-w-5xl mx-auto px-8 pb-16">
            <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl p-10 md:p-14">
              {/* Form Sections with Icons */}
              <div className="space-y-8">
                {/* Property Type Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center mr-3">
                      {landtype === 'residential' && <FaHome className="w-5 h-5 text-emerald-400" />}
                      {landtype === 'industrial' && <FaBuilding className="w-5 h-5 text-emerald-400" />}
                      {landtype === 'agricultural' && <FaTree className="w-5 h-5 text-emerald-400" />}
                      {!landtype && <FaHome className="w-5 h-5 text-gray-400" />}
                    </div>
                    <h3 className="text-xl font-bold text-white">Property Type</h3>
                  </div>
                  <select 
                    value={landtype} 
                    onChange={(e) => setLandtype(e.target.value)} 
                    className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300 text-lg"
                  >
                    <option value="" disabled className="bg-slate-800">Select Property Type</option>
                    <option value="residential" className="bg-slate-800">🏠 Residential</option>
                    <option value="industrial" className="bg-slate-800">🏢 Industrial</option>
                    <option value="agricultural" className="bg-slate-800">🌳 Agricultural</option>
                  </select>
                </div>
{/* Location Section */}
<div className="bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20">
  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
    <span>📍</span> Select State & City
  </h3>

  <StateCitySelector
    onChange={({ state, city }) => {
      setState(state);
      setCity(city);

      // Find city coordinates from locationData
      const cityObj = locationData.find(
        (c) => c.State === state && c.Location === city
      );

      if (cityObj?.Latitude && cityObj?.Longitude) {
        setMapCenter({ lat: cityObj.Latitude, lng: cityObj.Longitude });
      } else if (state) {
        // fallback: rough center of India
        setMapCenter({ lat: 20.5937, lng: 78.9629 });
      }
    }}
  />
</div>

                {/* Property Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center mb-4">
                      <FaEnvelope className="w-5 h-5 text-emerald-400 mr-3" />
                      <h3 className="text-lg font-bold text-white">Pincode</h3>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Enter pincode" 
                      value={pincode} 
                      onChange={(e) => setPincode(e.target.value)} 
                      className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300 text-lg"
                    />
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center mb-4">
                      <FaRupeeSign className="w-5 h-5 text-emerald-400 mr-3" />
                      <h3 className="text-lg font-bold text-white">Price (₹)</h3>
                    </div>
                    <input 
                      type="number" 
                      placeholder="Enter price" 
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)} 
                      className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300 text-lg"
                    />
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center mb-4">
                      <FaRulerCombined className="w-5 h-5 text-emerald-400 mr-3" />
                      <h3 className="text-lg font-bold text-white">Dimensions</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="number" 
                        placeholder="Length" 
                        value={length} 
                        onChange={(e) => setLength(e.target.value)} 
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300"
                      />
                      <input 
                        type="number" 
                        placeholder="Breadth" 
                        value={breadth} 
                        onChange={(e) => setBreadth(e.target.value)} 
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Description Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center mb-4">
                    <FaFileAlt className="w-5 h-5 text-emerald-400 mr-3" />
                    <h3 className="text-lg font-bold text-white">Property Description</h3>
                  </div>
                  <textarea 
                    placeholder="Describe your property in detail to attract potential buyers..." 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    rows="5"
                    className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300 text-lg resize-none"
                  />
                </div>
                   {/* ---------------- MAP PICKER ---------------- */}
<div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-md border">
  <h3 className="text-xl font-semibold mb-4 text-gray-800">
    Select Land Location on Map
  </h3>

   <MapPicker center={mapCenter} setCoordinates={setCoordinates} />
  {coordinates && (
    <p>
      Selected: Lat {coordinates.lat}, Lng {coordinates.lng}
    </p>
  )}
</div>
              </div>
              

              {/* Professional Navigation */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
                <div className="text-gray-400 text-sm">
                  1 of 3 steps completed
                </div>
                <button
                  type="button"
                  onClick={nextStep}
                  className="group px-10 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 flex items-center gap-3 text-lg"
                >
                  Continue to Images
                  <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Main Image - Professional Full Screen */}
      {currentStep === 2 && (
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Professional Header */}
          <div className="text-center py-12 px-4">
            <div className="max-w-4xl mx-auto">
              {/* Step Indicator */}
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 rounded-full text-emerald-400 text-sm font-bold mb-8 backdrop-blur-sm shadow-lg">
                <FaImage className="w-5 h-5 mr-3" />
                <span className="mr-3">STEP 2 OF 3</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-emerald-400 rounded-full"></div>
                  <div className="w-8 h-1 bg-emerald-400 rounded-full"></div>
                  <div className="w-8 h-1 bg-white/30 rounded-full"></div>
                </div>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Property
                <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mt-3 bg-gradient-to-r animate-pulse">
                  Photography
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Upload high-quality images to showcase your property's best features
              </p>
            </div>
          </div>

          {/* Enhanced Progress Section */}
          <div className="max-w-5xl mx-auto px-8 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <FaImage className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Property Images</h3>
                    <p className="text-gray-400 text-sm">Visual representation of your property</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold text-2xl">66%</div>
                  <div className="text-gray-400 text-sm">Complete</div>
                </div>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700 shadow-lg" style={{ width: '66%' }} />
              </div>
            </div>
          </div>

          {/* Professional Upload Content */}
          <div className="flex-1 max-w-5xl mx-auto px-8 pb-16">
            <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl p-10 md:p-14">
              <div className="border-3 border-dashed border-emerald-400/20 rounded-3xl p-16 text-center hover:border-emerald-400/40 transition-all duration-500 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5">
                <div className="w-32 h-32 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <FaUpload className="w-16 h-16 text-emerald-400" />
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-4">Upload Property Images</h3>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  High-quality photos increase property visibility by 85%
                </p>
                
                <div className="flex flex-col items-center gap-4">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setImage(e.target.files[0])} 
                    className="hidden" 
                    id="mainImage"
                  />
                  <label htmlFor="mainImage" className="cursor-pointer px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 inline-flex items-center gap-3 text-lg">
                    <FaUpload />
                    Choose Main Image
                  </label>
                  <p className="text-gray-400 text-sm">or drag and drop your files here</p>
                </div>
                
                {image && (
                  <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl">
                    <div className="flex items-center justify-center gap-3">
                      <FaCheckCircle className="w-6 h-6 text-emerald-400" />
                      <span className="text-emerald-400 font-bold text-lg">Selected: {image.name}</span>
                    </div>
                  </div>
                )}

                {/* Image Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">📷</span>
                    </div>
                    <h4 className="text-white font-bold mb-1">High Resolution</h4>
                    <p className="text-gray-400 text-sm">Minimum 1920x1080px</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🏞️</span>
                    </div>
                    <h4 className="text-white font-bold mb-1">Clear Views</h4>
                    <p className="text-gray-400 text-sm">Show all property features</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">☀️</span>
                    </div>
                    <h4 className="text-white font-bold mb-1">Good Lighting</h4>
                    <p className="text-gray-400 text-sm">Natural light recommended</p>
                  </div>
                </div>
              </div>

              {/* Professional Navigation */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
                <button
                  type="button"
                  onClick={prevStep}
                  className="group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center gap-3 text-lg"
                >
                  <FaArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Back to Details
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="group px-10 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 flex items-center gap-3 text-lg"
                >
                  Continue to Documents
                  <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Documents - Professional Full Screen */}
      {currentStep === 3 && (
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Professional Header */}
          <div className="text-center py-12 px-4">
            <div className="max-w-4xl mx-auto">
              {/* Step Indicator */}
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 rounded-full text-emerald-400 text-sm font-bold mb-8 backdrop-blur-sm shadow-lg">
                <FaFolderOpen className="w-5 h-5 mr-3" />
                <span className="mr-3">STEP 3 OF 3</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-emerald-400 rounded-full"></div>
                  <div className="w-8 h-1 bg-emerald-400 rounded-full"></div>
                  <div className="w-8 h-1 bg-emerald-400 rounded-full"></div>
                </div>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Legal
                <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mt-3 bg-gradient-to-r animate-pulse">
                  Documentation
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Complete your property listing with necessary legal documents
              </p>
            </div>
          </div>

          {/* Enhanced Progress Section */}
          <div className="max-w-5xl mx-auto px-8 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <FaFolderOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Legal Documents</h3>
                    <p className="text-gray-400 text-sm">Required paperwork for property verification</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold text-2xl">100%</div>
                  <div className="text-gray-400 text-sm">Complete</div>
                </div>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700 shadow-lg" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Professional Documents Form */}
          <form onSubmit={uploadData} className="flex-1 max-w-5xl mx-auto px-8 pb-16">
            <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl p-10 md:p-14">
              {/* Essential Documents */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <FaShieldAlt className="w-6 h-6 text-emerald-400" />
                  Essential Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {["Aadhaar","Pan","SaleDeed","LandRegistry","EncumbranceCertificate","Khata","PropertyTax","SurveyMap","Noc","OwnerPhoto"].map(doc => (
                    <div key={doc} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-emerald-400/30 transition-all duration-300">
                      <label className="block text-emerald-400 font-bold mb-3 text-lg">
                        {doc.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                      </label>
                      <input 
                        type="file" 
                        name={doc} 
                        onChange={handleDocChange} 
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Additional Documents */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <FaFolderOpen className="w-6 h-6 text-emerald-400" />
                  Additional Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-emerald-400/30 transition-all duration-300">
                    <label className="block text-emerald-400 font-bold mb-3 text-lg">Additional Property Photos</label>
                    <input 
                      type="file" 
                      name="LandPhotos" 
                      multiple 
                      onChange={handleDocChange} 
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 transition-all duration-300"
                    />
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-emerald-400/30 transition-all duration-300">
                    <label className="block text-emerald-400 font-bold mb-3 text-lg">Utility Bills</label>
                    <input 
                      type="file" 
                      name="Bills" 
                      multiple 
                      onChange={handleDocChange} 
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Navigation */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
                <button
                  type="button"
                  onClick={prevStep}
                  className="group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center gap-3 text-lg"
                >
                  <FaArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Back to Images
                </button>
                <button
                  type="submit"
                  className="group px-12 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 flex items-center gap-3 text-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" /> 
                      Creating Listing...
                    </>
                  ) : (
                    <>
                      <FaAward />
                      Create Premium Listing
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default CreateLand;
