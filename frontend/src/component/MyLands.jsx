import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const MyLands = () => {
  const [lands, setLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState(null); // State to store the selected land for modification
  const [formData, setFormData] = useState({
    landtype: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/lands/owner/671b8e8...", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLands(response.data);
      } catch (error) {
        console.error("Error fetching lands:", error);
      }
    };

    fetchLands();
  }, []);

  const handleModifyClick = (land) => {
    setSelectedLand(land);
    setFormData({
      landtype: land.landtype,
      city: land.city,
      state: land.state,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/lands/${selectedLand._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Land details updated:", response.data);
      // Optionally refresh the list of lands or update state
      setLands((prevLands) =>
        prevLands.map((land) =>
          land._id === selectedLand._id ? { ...land, ...formData } : land
        )
      );
      setSelectedLand(null); // Close the form
    } catch (error) {
      console.error("Error updating land details:", error);
    }
  };

    const toastmsg =() => {
      toast.success("Land details updated successfully!!")
    }
  return (
    <div className="max-w-screen-lg mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">My Lands</h1>
      {lands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {lands.map((land) => (
            <div key={land._id} className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold mb-2 capitalize">Type: {land.landtype}</h3>
              <p className="text-gray-600">City: {land.city}</p>
              <p className="text-gray-600">State: {land.state}</p>
              {land.image && (
                <div className="mt-4">
                  <img
                    src={`http://localhost:5000/uploads/${land.image}`}
                    alt={land.landtype}
                    className="rounded-lg w-full h-40 object-cover"
                  />
                </div>
              )}
              <button
                onClick={() => handleModifyClick(land)}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Modify Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <p className="text-center text-gray-600 mb-6 text-xl font-semibold">
          No Lands Available
        </p>
        <img
          src="https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://fdczvxmwwjwpwbeeqcth.supabase.co/storage/v1/object/public/images/ea8599c8-a934-4179-9c82-94af93335418/c1481265-aff7-44c8-89c5-073d6bcc909f.png"
          alt="No lands available"
          className="w-full max-w-5xl h-auto rounded-lg shadow-lg border border-gray-300 hover:shadow-2xl transition-shadow duration-300 ease-in-out mt-4 mb-10"
        />
      </div>
      

      
      )}

      {selectedLand && (
        <div className="mt-8 p-4 border rounded-lg shadow-lg bg-gray-100">
          <h2 className="text-2xl font-semibold mb-4">Modify Land Details</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Land Type:</label>
              <input
                type="text"
                name="landtype"
                value={formData.landtype}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">City:</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">State:</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              type="submit"
              onClick={toastmsg}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setSelectedLand(null)}
              className="ml-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyLands;
