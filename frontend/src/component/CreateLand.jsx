import { useState } from "react";
import axios from "axios";

function CreateLand() {
  const [landtype, setLandtype] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [image, setImage] = useState(null);

  const uploadData = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("landtype", landtype);
    formData.append("city", city);
    formData.append("state", state);
    formData.append("pincode", pincode);
    formData.append("image", image);
    // Log the formData for debugging


    const token = localStorage.getItem('token');  // Ensure token is set in localStorage before making the request

    if (!token) {
      alert("No token found. Please login.");
      return;
    }

    try {
      const result = await axios.post("http://localhost:5000/create-land", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem('token')}`,  // Ensure Bearer token is correctly passed
        },
      });
      console.log("Server response:", result.data);
    } catch (error) {
      console.error("Error uploading data:", error.response || error.message);
  if (error.response) {
    console.log('Response data:', error.response.data);
  }
    }
  };

  const onInputChange = (e) => {
    setImage(e.target.files[0]);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Create New Land</h2>
        <form onSubmit={uploadData} className="space-y-4">
          <div>
            <input
              type="text"
              value={landtype}
              onChange={(e) => setLandtype(e.target.value)}
              placeholder="Land Type"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Pincode"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={onInputChange}
              className="w-full py-2 px-4 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Upload
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateLand;