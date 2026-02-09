import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaStar } from "react-icons/fa";

const LandsType = () => {
  const [landType, setLandType] = useState('');
  const [lands, setLands] = useState([]);
  const [error, setError] = useState(null);
  const [noLandsMessage, setNoLandsMessage] = useState('');

  // Additional Filters
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');

  const [filtered, setFiltered] = useState([]);

  const fetchLandsByType = async (landType) => {
    console.log('Fetching lands for land type:', landType);

    if (!landType) {
      setError('Land type is required');
      return;
    }

    const url = `http://localhost:5000/api/lands/type/${landType}`;
    console.log('Request URL:', url);

    try {
      const response = await axios.get(url);
      console.log('Response data:', response.data);

      if (response.data.length === 0) {
        setNoLandsMessage(`No lands available for "${landType}" type. Try another land type.`);
        setLands([]);
        setFiltered([]);
      } else {
        setLands(response.data);
        setFiltered(response.data);
        setNoLandsMessage(null);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching lands:', err);
      setError('Failed to fetch lands. Please try again.');
      setLands([]);
      setFiltered([]);
      setNoLandsMessage(null);
    }
  };

  const handleLandTypeChange = (e) => {
    const selectedLandType = e.target.value;
    console.log('Land type selected:', selectedLandType);
    setLandType(selectedLandType);
    fetchLandsByType(selectedLandType);
  };

  // ⭐ Average Rating Calculator
  const getAvgRating = (reviews = []) => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    return total / reviews.length;
  };

  // ⭐ Apply Filters
  useEffect(() => {
    let temp = lands;

    if (city.trim() !== '') {
      temp = temp.filter((l) => l.city?.toLowerCase().includes(city.toLowerCase()));
    }

    if (state.trim() !== '') {
      temp = temp.filter((l) => l.state?.toLowerCase().includes(state.toLowerCase()));
    }

    if (maxPrice !== '') {
      temp = temp.filter((l) => Number(l.price) <= Number(maxPrice));
    }

    if (minRating !== '') {
      temp = temp.filter((l) => getAvgRating(l.reviews) >= Number(minRating));
    }

    setFiltered(temp);
  }, [city, state, maxPrice, minRating, lands]);

  return (
    <div className="container mx-auto p-8 mt-[3rem] bg-mintGreen min-h-screen">
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 text-center mb-12 animate-pulse">
        Land Listings
      </h1>

      {/* LAND TYPE SELECT */}
      <div className="mb-6">
        <label htmlFor="landType" className="block text-2xl font-semibold text-gray-800 text-center mb-2">
          Select Land Type
        </label>
        <select
          id="landType"
          value={landType}
          onChange={handleLandTypeChange}
          className="p-4 w-full border-2 border-teal-500 rounded-lg text-lg focus:ring-2 focus:ring-teal-500 transition shadow-md hover:shadow-xl mb-3"
        >
          <option value="">-- Select --</option>
          <option value="Residential">Residential</option>
          <option value="Agricultural">Agriculture</option>
          <option value="Industrial">Industrial</option>
        </select>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {noLandsMessage && <p className="text-orange-500 text-center mb-4">{noLandsMessage}</p>}

      {/* FILTER SECTION */}
      <div className="bg-white p-6 rounded-xl shadow-xl mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="p-3 rounded-lg border border-gray-300"
          />

          <input
            type="text"
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="p-3 rounded-lg border border-gray-300"
          />

          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="p-3 rounded-lg border border-gray-300"
          />

          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="p-3 rounded-lg border border-gray-300"
          >
            <option value="">Min Rating</option>
            <option value="1">1 ⭐</option>
            <option value="2">2 ⭐</option>
            <option value="3">3 ⭐</option>
            <option value="4">4 ⭐</option>
            <option value="5">5 ⭐</option>
          </select>
        </div>
      </div>

      {/* LAND CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {filtered.map((land) => {
          const avgRating = getAvgRating(land.reviews);

          return (
            <Link
              to={`/land/${land._id}`}
              key={land._id}
              className="bg-cardGreen p-4 rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-300"
            >
              <img
                src={land.image ? `http://localhost:5000/uploads/${land.image}` : '/default-image.jpg'}
                alt={`${land.city} - ${land.state}`}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />

              <h3 className="text-xl font-semibold text-black">
                {land.city}, {land.state}
              </h3>

              <p className="text-md text-black">Type: {land.landtype[0].toUpperCase() + land.landtype.substring(1)}</p>

              <p className="text-md text-black">Pincode: {land.pincode}</p>

              <p className="text-md text-black font-semibold mt-2">Price: ₹{land.price}</p>

              <p className="text-md text-black">Dimensions: {land.dimensions || "N/A"}</p>

              <div className="flex items-center mt-2">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <FaStar key={i} className={i < avgRating ? "text-yellow-400" : "text-gray-300"} />
                  ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default LandsType;
