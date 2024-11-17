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
    <div>
      <form onSubmit={uploadData}>
        <input
          type="text"
          value={landtype}
          onChange={(e) => setLandtype(e.target.value)}
          placeholder="Land Type"
        />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
        />
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="State"
        />
        <input
          type="text"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          placeholder="Pincode"
        />
        <input type="file" accept="image/*" onChange={onInputChange} />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default CreateLand;
