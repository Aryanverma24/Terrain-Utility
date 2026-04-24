import { useState, useEffect } from 'react';
import { HeroSection } from './HeroSection';
import { Filters } from './Filters';
import { LandGrid } from './LandGrid';
import { Pagination } from './Pagination';
import { TrendingLands } from './TrendingLands';
import { FeaturedLands } from './FeaturedLands';
import { Stats } from './Stats';
import { toast } from 'react-toastify';
import { API } from '../../../utils/API';

const Lands = () => {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLands: 0,
    limit: 12,
  });
  const [filters, setFilters] = useState({
    landType: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [trendingLands, setTrendingLands] = useState([]);
  const [featuredLands, setFeaturedLands] = useState([]);
  const [stats, setStats] = useState({
    totalLands: 0,
    avgPrice: 0,
    cities: 0,
    landTypes: 0,
  });

  // Fetch all lands and apply client-side filtering/pagination
  const fetchLands = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/lands/get-land');

      let allLands = Array.isArray(response.data.data) ? response.data.data : [];
      console.log('All lands fetched:', allLands);

      // Filter for approved lands only
      const approvedLands = allLands.filter((land) => land.status === 'approved');
      setAllLandsData(approvedLands);

      // Apply initial filtering and pagination
      applyFiltersAndPagination(approvedLands);
    } catch (error) {
      console.error('Error fetching lands:', error);
      toast.error('Failed to fetch lands. Please try again.');
      setLands([]);
    } finally {
      setLoading(false);
    }
  };

  // Store all lands for filtering
  const [allLandsData, setAllLandsData] = useState([]);

  // Apply filters and pagination
  const applyFiltersAndPagination = (landsToFilter = allLandsData) => {
    let filtered = [...landsToFilter];

    // Apply filters
    if (filters.landType) {
      filtered = filtered.filter(
        (land) => land.landtype?.toLowerCase() === filters.landType.toLowerCase(),
      );
    }

    if (filters.city) {
      filtered = filtered.filter((land) =>
        land.city?.toLowerCase().includes(filters.city.toLowerCase()),
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(
        (land) => Number(land.price) >= Number(filters.minPrice),
      );
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(
        (land) => Number(land.price) <= Number(filters.maxPrice),
      );
    }

    if (filters.minArea) {
      filtered = filtered.filter((land) => Number(land.area) >= Number(filters.minArea));
    }

    if (filters.maxArea) {
      filtered = filtered.filter((land) => Number(land.area) <= Number(filters.maxArea));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case 'price':
          aValue = Number(a.price) || 0;
          bValue = Number(b.price) || 0;
          break;
        case 'area':
          aValue = Number(a.area) || 0;
          bValue = Number(b.area) || 0;
          break;
        case 'city':
          aValue = a.city?.toLowerCase() || '';
          bValue = b.city?.toLowerCase() || '';
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
      }

      if (filters.sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    // Calculate pagination
    const totalLands = filtered.length;
    const totalPages = Math.ceil(totalLands / pagination.limit);
    const startIndex = (pagination.currentPage - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedLands = filtered.slice(startIndex, endIndex);

    setLands(paginatedLands);
    setPagination((prev) => ({
      ...prev,
      totalPages,
      totalLands,
    }));

    // Set trending and featured lands (mock implementation)
    setTrendingLands(filtered.slice(0, 8));
    setFeaturedLands(filtered.slice(0, 6));

    // Calculate stats
    const uniqueCities = [...new Set(filtered.map((land) => land.city).filter(Boolean))];
    const uniqueTypes = [
      ...new Set(filtered.map((land) => land.landtype).filter(Boolean)),
    ];
    const avgPrice =
      filtered.length > 0
        ? filtered.reduce((sum, land) => sum + (Number(land.price) || 0), 0) /
          filtered.length
        : 0;

    setStats({
      totalLands: filtered.length,
      avgPrice,
      cities: uniqueCities.length,
      landTypes: uniqueTypes.length,
    });
  };

  // Fetch trending lands (mock - using filtered data)
  const fetchTrendingLands = async () => {
    // This will be handled by applyFiltersAndPagination
  };

  // Fetch featured lands (mock - using filtered data)
  const fetchFeaturedLands = async () => {
    // This will be handled by applyFiltersAndPagination
  };

  // Fetch stats (mock - using filtered data)
  const fetchStats = async () => {
    // This will be handled by applyFiltersAndPagination
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    applyFiltersAndPagination();
  };

  // Initial data fetch
  useEffect(() => {
    fetchLands();
  }, []);

  // Apply filters when filters or page changes
  useEffect(() => {
    if (allLandsData.length > 0) {
      applyFiltersAndPagination();
    }
  }, [filters, pagination.currentPage, allLandsData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50">
      <HeroSection />
      <Stats stats={stats} />

      {/* Featured and Trending Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-12">
          <div className="lg:col-span-2">
            <TrendingLands lands={trendingLands} loading={loading} />
          </div>
          <div className="lg:col-span-1">
            <FeaturedLands lands={featuredLands} loading={loading} />
          </div>
        </div>
      </div>

      {/* Filters and Main Land Grid */}
      <div className="bg-white/50 backdrop-blur-sm py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Filters
                filters={filters}
                onFilterChange={handleFilterChange}
                loading={loading}
              />
            </div>

            {/* Land Grid */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  All Properties
                  <span className="text-gray-600 font-normal ml-2">
                    ({pagination.totalLands} properties found)
                  </span>
                </h2>
              </div>

              <LandGrid
                lands={lands}
                loading={loading}
                currentPage={pagination.currentPage}
              />

              {/* Pagination */}
              {!loading && lands.length > 0 && (
                <div className="mt-8">
                  <Pagination pagination={pagination} onPageChange={handlePageChange} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lands;
