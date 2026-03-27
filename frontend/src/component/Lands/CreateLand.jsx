import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { FaSpinner } from "react-icons/fa";

function CreateLand() {
  const [landtype, setLandtype] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
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
  
  const navigate = useNavigate();

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
  <div className="relative flex justify-center items-start pt-[5rem] pb-16 min-h-screen bg-gradient-to-br from-[#e6f4f1] via-[#dff1ec] to-[#f4fbf9]">

    {/* ------------------ LOADER ------------------ */}
    {loading && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        <div className="bg-white/90 p-6 rounded-2xl shadow-2xl flex flex-col items-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-500 mb-3" />
          <div className="font-semibold text-gray-700 mb-2">Uploading Land...</div>

          <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="text-sm mt-2 text-gray-600">{progress}%</span>
        </div>
      </div>
    )}

    {/* ------------------ MAIN CARD ------------------ */}
    <div className="w-full max-w-3xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-10 border border-gray-100">

      <h2 className="text-3xl font-semibold text-center mb-10 text-gray-800 tracking-tight">
        Create New Land
      </h2>

      <form onSubmit={uploadData} className="space-y-10">

        {/* ---------------- LAND DETAILS ---------------- */}
        <div className="section-card animate-fadeUp [animation-delay:0.1s]">

          <div className="section-title">
            Land Details
            <div className="section-accent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <select value={landtype} onChange={(e) => setLandtype(e.target.value)} className="premium-input">
              <option value="" disabled>Select Land Type</option>
              <option value="industrial">Industrial</option>
              <option value="agricultural">Agricultural</option>
              <option value="residential">Residential</option>
            </select>

            <div className="input-wrapper">
              <input type="text" placeholder=" " value={city} onChange={(e) => setCity(e.target.value)} className="premium-input w-full" />
              <label className="floating-label">City</label>
            </div>

            <select value={state} onChange={(e) => setState(e.target.value)} className="premium-input">
              <option value="" disabled>Select State</option>
              {["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh",
              "Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
              "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand",
              "West Bengal","Delhi","Jammu and Kashmir","Ladakh","Puducherry","Andaman and Nicobar Islands","Chandigarh",
              "Dadra and Nagar Haveli and Daman and Diu","Lakshadweep"].map((st) => <option key={st}>{st}</option>)}
            </select>

            <div className="input-wrapper">
              <input type="text" placeholder=" " value={pincode} onChange={(e) => setPincode(e.target.value)} className="premium-input w-full" />
              <label className="floating-label">Pincode</label>
            </div>

            <div className="input-wrapper">
              <input type="number" placeholder=" " value={price} onChange={(e) => setPrice(e.target.value)} className="premium-input w-full" />
              <label className="floating-label">Price (₹)</label>
            </div>

            <div className="input-wrapper">
              <input type="number" placeholder=" " value={length} onChange={(e) => setLength(e.target.value)} className="premium-input w-full" />
              <label className="floating-label">Length (ft)</label>
            </div>

            <div className="input-wrapper">
              <input type="number" placeholder=" " value={breadth} onChange={(e) => setBreadth(e.target.value)} className="premium-input w-full" />
              <label className="floating-label">Breadth (ft)</label>
            </div>
          </div>

          <div className="input-wrapper">
            <input type="text" placeholder=" " value={description} onChange={(e) => setDescription(e.target.value)} className="premium-input w-full" />
            <label className="floating-label">Description</label>
          </div>
        </div>

        {/* ---------------- IMAGE ---------------- */}
        <div className="section-card animate-fadeUp [animation-delay:0.2s]">

          <div className="section-title">
            Main Land Image
            <div className="section-accent"></div>
          </div>

          <div className="premium-file flex flex-col items-center justify-center text-gray-500 hover:text-emerald-600">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="premium-file"
            />
            <p className="text-sm mt-2">Click to upload land image</p>
          </div>
        </div>

        {/* ---------------- DOCUMENTS ---------------- */}
        <div className="section-card animate-fadeUp [animation-delay:0.3s]">

          <div className="section-title">
            Documents
            <div className="section-accent"></div>
          </div>

          <div className="grid gap-4">
            {["Aadhaar","Pan","SaleDeed","LandRegistry","EncumbranceCertificate","Khata","PropertyTax","SurveyMap","Noc","OwnerPhoto"].map(doc => (
              <div key={doc} className="space-y-1">
                <label className="text-sm text-gray-600">
                  {doc.replace(/([A-Z])/g, " $1")}
                </label>
                <input type="file" name={doc} onChange={handleDocChange} className="premium-file" />
              </div>
            ))}

                <label className="text-sm text-gray-600">Land Photos</label>
            <input type="file" name="LandPhotos" multiple onChange={handleDocChange} className="premium-file" />
            
                <label className="text-sm text-gray-600">Bills</label>
            <input type="file" name="Bills" multiple onChange={handleDocChange} className="premium-file" />
          </div>
        </div>

        {/* ---------------- BUTTON ---------------- */}
        <button
          type="submit"
          disabled={loading}
          className="relative w-full py-3 rounded-xl text-white font-semibold text-lg 
          bg-gradient-to-r from-emerald-500 to-emerald-600 
          transition-all duration-300 
          hover:shadow-lg hover:-translate-y-[1px] 
          active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            {loading ? <FaSpinner className="animate-spin" /> : "Upload Land + Documents"}
          </span>

          <span className="absolute inset-0 opacity-0 hover:opacity-100 transition duration-500 bg-white/20"></span>
        </button>

      </form>
    </div>
  </div>
);
}

export default CreateLand;