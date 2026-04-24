import { FaFilter, FaTimes, FaSlidersH } from 'react-icons/fa';
import { useState } from 'react';

export const Filters = ({ filters, onFilterChange, loading }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const landTypes = [
    'Residential',
    'Commercial',
    'Agricultural',
    'Industrial',
    'Mixed Use',
    'Recreational',
    'Institutional',
  ];

  const cities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Pune',
    'Ahmedabad',
    'Jaipur',
    'Lucknow',
    'Surat',
    'Kanpur',
    'Nagpur',
    'Indore',
    'Thane',
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Latest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: 'area', label: 'Area: Small to Large' },
    { value: '-area', label: 'Area: Large to Small' },
    { value: 'city', label: 'City: A to Z' },
  ];

  const handleInputChange = (field, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      landType: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(
    (value) => value && value !== '',
  );

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg hover:border-emerald-400/30 transition-all duration-500 sticky top-24">
      {/* Filter Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaSlidersH className="text-emerald-400 mr-3" />
            <h3 className="text-lg font-bold text-emerald-400">Filters</h3>
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-400 text-xs">
                Active
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            {isExpanded ? <FaTimes /> : <FaFilter />}
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className={`${isExpanded ? 'block' : 'hidden lg:block'}`}>
        <div className="p-6 space-y-6">
          {/* Land Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-emerald-400 mb-3">
              Land Type
            </label>
            <select
              value={localFilters.landType}
              onChange={(e) => handleInputChange('landType', e.target.value)}
              className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300"
            >
              <option value="">All Types</option>
              {landTypes.map((type) => (
                <option key={type} value={type.toLowerCase()}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">City</label>
            <select
              value={localFilters.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city.toLowerCase()}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Price Range (₹)
            </label>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Min Price"
                value={localFilters.minPrice}
                onChange={(e) => handleInputChange('minPrice', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={localFilters.maxPrice}
                onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Area Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Area Range (Acres)
            </label>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Min Area"
                value={localFilters.minArea}
                onChange={(e) => handleInputChange('minArea', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
              />
              <input
                type="number"
                placeholder="Max Area"
                value={localFilters.maxArea}
                onChange={(e) => handleInputChange('maxArea', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Sort By
            </label>
            <select
              value={localFilters.sortBy}
              onChange={(e) => handleInputChange('sortBy', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={applyFilters}
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Applying...' : 'Apply Filters'}
            </button>

            <button
              onClick={clearFilters}
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
