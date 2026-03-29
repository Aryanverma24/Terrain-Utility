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
    <div className="relative flex justify-center items-start pt-[4rem] pb-10 min-h-screen bg-mintGreen">
      {/* ------------------ FULL PAGE LOADER ------------------ */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center">
          <FaSpinner className="animate-spin text-5xl text-white mb-4" />
          <div className="text-white font-semibold text-lg mb-2">Uploading Land...</div>
          <div className="w-64 h-4 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-white mt-2">{progress}%</div>
        </div>
      )}

      <div className="bg-cardGreen p-10 rounded-2xl shadow-xl w-full max-w-3xl opacity-90">
        <h2 className="text-3xl font-bold text-center mb-8 drop-shadow-md text-white">
          Create New Land
        </h2>

        <form onSubmit={uploadData} className="space-y-8">
          {/* ---------------- LAND DETAILS ---------------- */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-md border">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Land Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select value={landtype} onChange={(e) => setLandtype(e.target.value)} className="px-4 py-2 border rounded-lg">
                <option value="" disabled>Select Land Type</option>
                <option value="industrial">Industrial</option>
                <option value="agricultural">Agricultural</option>
                <option value="residential">Residential</option>
              </select>
              <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="px-4 py-2 border rounded-lg" />
              <select value={state} onChange={(e) => setState(e.target.value)} className="px-4 py-2 border rounded-lg">
                <option value="" disabled>Select State</option>
                {["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh",
                  "Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
                  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand",
                  "West Bengal","Delhi","Jammu and Kashmir","Ladakh","Puducherry","Andaman and Nicobar Islands","Chandigarh",
                  "Dadra and Nagar Haveli and Daman and Diu","Lakshadweep"].map((st) => <option key={st}>{st}</option>)}
              </select>
              <input type="text" placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} className="px-4 py-2 border rounded-lg" />
              <input type="number" placeholder="Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} className="px-4 py-2 border rounded-lg" />
              <input type="number" placeholder="Length (ft)" value={length} onChange={(e) => setLength(e.target.value)} className="px-4 py-2 border rounded-lg" />
              <input type="number" placeholder="Breadth (ft)" value={breadth} onChange={(e) => setBreadth(e.target.value)} className="px-4 py-2 border rounded-lg" />
            </div>
            <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-4 px-4 py-2 border rounded-lg" />
          </div>

          {/* ---------------- MAIN IMAGE ---------------- */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-md border">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Main Land Image</h3>
            <label className="font-medium">Upload Main Land Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="w-full p-3 border rounded-lg bg-white cursor-pointer" />
          </div>

          {/* ---------------- DOCUMENTS ---------------- */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-md border">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Upload Required Documents</h3>
            <div className="grid grid-cols-1 gap-4">
              {["Aadhaar","Pan","SaleDeed","LandRegistry","EncumbranceCertificate","Khata","PropertyTax","SurveyMap","Noc","OwnerPhoto"].map(doc => (
                <div key={doc}>
                  <label>{doc.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}</label>
                  <input type="file" name={doc} onChange={handleDocChange} className="p-2 border rounded-lg" />
                </div>
              ))}
              <label>Upload Additional Land Photos (Multiple Allowed)</label>
              <input type="file" name="LandPhotos" multiple onChange={handleDocChange} className="p-2 border rounded-lg" />
              <label>Upload Utility Bills (Electricity / Water) – Multiple Allowed</label>
              <input type="file" name="Bills" multiple onChange={handleDocChange} className="p-2 border rounded-lg" />
            </div>
          </div>

          {/* ---------------- SUBMIT BUTTON ---------------- */}
          <button
            type="submit"
            className="w-full py-3 bg-gold text-white text-lg font-semibold rounded-lg hover:bg-[#d19e30] flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" /> Uploading...
              </>
            ) : (
              "Upload Land + Documents"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateLand;
