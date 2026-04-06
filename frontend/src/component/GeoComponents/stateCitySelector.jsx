import { FaCity, FaMapMarkerAlt } from "react-icons/fa";
import { useState } from "react";
import { locationData } from "../../data/indiancities";

export default function StateCitySelector({ onChange }) {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const states = [...new Set(locationData.map((c) => c.State))];
  const citiesForState = locationData.filter((c) => c.State === selectedState);

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedCity(""); // reset city
    if (onChange) onChange({ state, city: "" });
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    if (onChange) onChange({ state: selectedState, city });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-3">
      
     {/* State Selector */}
<div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
  <div className="flex items-center mb-4">
    <FaMapMarkerAlt className="w-5 h-5 text-emerald-400 mr-3" />
    <h3 className="text-lg font-bold text-white">State</h3>
  </div>
  <select
    value={selectedState}
    onChange={handleStateChange}
    className="w-full px-5 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300 text-lg"
  >
    <option value="" disabled className="bg-slate-800">Select State</option>
    {states.map((st) => (
      <option key={st} value={st} className="bg-slate-800">{st}</option>
    ))}
  </select>
</div>

{/* City Selector */}
<div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
  <div className="flex items-center mb-4">
    <FaCity className="w-5 h-5 text-emerald-400 mr-3" />
    <h3 className="text-lg font-bold text-white">City</h3>
  </div>
  <select
    value={selectedCity}
    onChange={handleCityChange}
    disabled={!selectedState}
 className="w-full px-5 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300 text-lg"
  >
    <option value="" className="bg-slate-800">Select City</option>
    {citiesForState.map((city) => (
      <option key={city.Location} value={city.Location} className="bg-slate-800">
        {city.Location}
      </option>
    ))}
  </select>
</div>

    </div>
  );
}