import { AuthContext } from '../../../contexts/AuthContext';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { API } from '../../../utils/API';
import BackToTop from '../BackToTop';

import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Testimonials from './Testimonials';
import FeaturedProperties from './FeaturedProperties';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [lands, setLands] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [filteredLands, setFilteredLands] = useState([]);
  const [cityFilter, setCityFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const navigate = useNavigate();

  // Fetch land data from backend
  useEffect(() => {
    if (!user) return; // wait until user is loaded

    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchLands = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/lands/get-land', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const allLands = Array.isArray(data.data) ? data.data : [];

        if (user.role?.toLowerCase() === 'lawyer') {
          console.log('User role:', user.role);
          // Lawyers see ALL lands
          setLands(allLands);
          setFilteredLands(allLands);
        } else {
          // Others see only approved lands
          const approved = allLands.filter((l) => l.status === 'approved');
          setLands(approved);
          setFilteredLands(approved);
        }
      } catch (error) {
        console.error('Error fetching lands:', error);
        toast.error('Failed to fetch lands.');
      }
    };

    fetchLands();
  }, [user]);

  useEffect(() => {
    if (user) {
      API.get(`/api/wishlist/${user._id}`)
        .then((response) => {
          setWishlist(response.data[0]?.lands || []);
        })
        .catch((error) => {
          console.log('error while fetching wishlist', error);
          toast.error('something went wrong while fetching wishlist');
        });
    }
  }, [user]);

  useEffect(() => {
    let result = lands;
    if (cityFilter)
      result = result.filter(
        (l) => l.city && l.city.toLowerCase().includes(cityFilter.toLowerCase()),
      );
    if (maxPrice) result = result.filter((l) => Number(l.price) <= Number(maxPrice));
    setFilteredLands(result);
  }, [cityFilter, maxPrice, lands]);

  const calculateAverageRating = (reviews) =>
    reviews?.length ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return (
      <div className="flex space-x-1">
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <FaStar key={`full-${i}`} className="text-yellow-500 w-5 h-5" />
          ))}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <FaStar key={`empty-${i}`} className="text-gray-300 w-5 h-5" />
          ))}
      </div>
    );
  };

  const handleWishlist = async (land) => {
    if (!user?._id) {
      toast.error('Please log in first.');
      navigate('/login');
      return;
    }
    const isInWishlist = wishlist.includes(land._id);
    try {
      if (isInWishlist) {
        await API.delete(`/api/wishlist/${user._id}/${land._id}`);
        setWishlist(wishlist.filter((id) => id !== land._id));
        toast.success('Land removed from wishlist!');
      } else {
        await API.post(`/api/wishlist/${user._id}/${land._id}`);
        setWishlist([...wishlist, land._id]);
        toast.success('Land added to wishlist!');
      }
    } catch (error) {
      console.log('Error while updating the wishlist:', error);
      toast.error('Something went wrong while updating the wishlist.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Admin/Upload Buttons */}
      <div className="fixed top-20 right-4 z-40 flex flex-col gap-2">
        {user?.isAdmin && (
          <Link
            to="/adminDashboard"
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-medium"
          >
            Dashboard
          </Link>
        )}
        {user && !user.isAdmin && (
          <Link
            to="/uploads"
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-medium"
          >
            Upload Lands
          </Link>
        )}
      </div>

      {/* Landing Page Components */}
      <Hero />
      <Features />
      <FeaturedProperties />
      <HowItWorks />
      <Testimonials />
      {/* <CTA /> */}

      <BackToTop />
    </div>
  );
};

export default Home;
