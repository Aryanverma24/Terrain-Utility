import { useState } from "react";
import { locationData } from "../../data/indiancities"; // make sure this JSON has State, Location, Latitude, Longitude

export default function StateCitySelector({ onChange }) {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Unique states
  const states = [...new Set(locationData.map((c) => c.State))];

  // Cities for selected state
  const citiesForState = locationData.filter(
    (city) => city.State === selectedState
  );

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedCity(""); // reset city

    // Notify parent
    if (onChange) onChange({ state, city: "" });
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);

    // Notify parent
    if (onChange) onChange({ state: selectedState, city });
  };

  return (
    <div className="state-city-selector grid gap-3">
      <label>
        State:
        <select value={selectedState} onChange={handleStateChange}>
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </label>

      <label>
        City:
        <select
          value={selectedCity}
          onChange={handleCityChange}
          disabled={!selectedState}
        >
          <option value="">Select City</option>
          {citiesForState.map((city) => (
            <option key={city.Location} value={city.Location}>
              {city.Location}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}