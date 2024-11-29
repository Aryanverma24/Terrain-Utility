import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';  // Import Link from react-router-dom

const LandsType = () => {
  const [landType, setLandType] = useState('');
  const [lands, setLands] = useState([]);
  const [error, setError] = useState(null);
  const [noLandsMessage, setNoLandsMessage] = useState('');

  const fetchLandsByType = async (landType) => {
    console.log('Fetching lands for land type:', landType);

    if (!landType) {
      setError('Land type is required');
      return;
    }

    const url = `http://localhost:5000/api/lands/type/${landType}`;
    console.log('Request URL:', url);  // Debugging line

    try {
      const response = await axios.get(url);
      console.log('Response data:', response.data);  // Log response

      if (response.data.length === 0) {
        setNoLandsMessage(`No lands available for "${landType}" type. Try another land type.`);
        setLands([]);  // Clear lands if no results
      } else {
        setLands(response.data);
        setNoLandsMessage(null); // Clear the message when lands are available
      }
      setError(null); // Clear any error if the request succeeds
    } catch (err) {
      console.error('Error fetching lands:', err);  // Log the error
      setError('Failed to fetch lands. Please try again.');
      setLands([]);
      setNoLandsMessage(null); // Clear message if there’s an error
    }
  };

  const handleLandTypeChange = (e) => {
    const selectedLandType = e.target.value;
    console.log('Land type selected:', selectedLandType);  // Debugging line
    setLandType(selectedLandType);
    fetchLandsByType(selectedLandType);  // Call fetch function with selected value
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 text-center mb-12 animate-pulse">
        Land Listings
      </h1>

      <div className="mb-6">
        <label htmlFor="landType" className="block text-2xl font-semibold text-gray-800 text-center mb-2">
          Select Land Type
        </label>
        <select
          id="landType"
          value={landType}
          onChange={handleLandTypeChange}
          className="p-4 w-full border-2 border-teal-500 rounded-lg text-lg focus:ring-2 focus:ring-teal-500 transition duration-300 ease-in-out shadow-md hover:shadow-xl"
        >
          <option value="">-- Select --</option>
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Agriculture">Agriculture</option>
          <option value="Industrial">Industrial</option>
        </select>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {noLandsMessage && <p className="text-orange-500 text-center mb-4">{noLandsMessage}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {lands.map((land) => (
          <Link to={`/land/${land._id}`} key={land._id} className="bg-white p-4 rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-300 ease-in-out">
            <img 
              src={land.image ? `http://localhost:5000/uploads/${land.image}` : '/default-image.jpg'}
              alt={`${land.city} - ${land.state}`}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-800">{land.city}, {land.state}</h3>
            <p className="text-sm text-gray-500">Type: {land.landtype}</p>
            <p className="text-sm text-gray-500">Pincode: {land.pincode}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LandsType;
