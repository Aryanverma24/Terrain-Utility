import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaEnvelope, FaUser, FaSignOutAlt, FaInfoCircle } from 'react-icons/fa';
import { PiIslandBold } from 'react-icons/pi';
import { MdLandscape } from 'react-icons/md';
import { IoStorefrontOutline } from 'react-icons/io5';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { API } from '../../utils/API';
import { AuthContext } from '../../contexts/authContext';
import { toast } from 'react-toastify';
import NotificationPanel from '../component/NotificationPanel';

const Navigation = () => {
  const [menubar, setMenubar] = useState(false);
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?._id) return;

    const fetchUnread = async () => {
      try {
        const { data } = await API.get(`/api/chat/unread/${user._id}`);
        const total = Object.values(data).reduce((acc, val) => acc + val, 0);
        setUnreadCount(total);
      } catch (err) {
        console.error('Unread fetch error', err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 3000);
    return () => clearInterval(interval);
  }, [user]);

const logoutUser = async () => {
  try {
    await API.post('/api/users/logout');

    logout();

    localStorage.removeItem("registrarToken"); // ADD THIS

    navigate('/login');
  } catch (error) {
    toast.error('Logout failed');
  }
};

  const getLinkClass = (path) => {
    const baseClass =
      'relative px-4 py-2 rounded-xl transition-all duration-300 flex items-center group';
    const activeClass =
      location.pathname === path
        ? 'bg-emerald-500/20 text-emerald-400'
        : 'hover:bg-white/10 text-gray-300 hover:text-white';
    return `${baseClass} ${activeClass}`;
  };

  const isLawyer = user?.role === 'lawyer';

  return (
    <>
      {location.pathname === '/login' || location.pathname === '/register' ? null : (
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-gradient-to-r from-slate-900/90 via-emerald-900/90 to-slate-900/90 border-b border-white/10 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <img
                  src="https://www.shutterstock.com/image-vector/abstract-farm-land-food-crop-260nw-1746992270.jpg"
                  alt="logo"
                  className="relative rounded-full h-10 w-10 object-cover border-2 border-emerald-400/50"
                />
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Bhu-Parichiye
                  </h1>
                  <span className="text-xs text-gray-400 tracking-wider">
                    PREMIUM PROPERTIES
                  </span>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-2">
                <Link to="/" className={getLinkClass('/')}>
                  <FaHome className="mr-3 text-lg transition-transform group-hover:scale-110" />
                  <span className="font-medium">Home</span>
                </Link>

                {!isLawyer && (
                  <>
                    <Link to="/lands" className={getLinkClass('/lands')}>
                      <MdLandscape className="mr-3 text-lg transition-transform group-hover:scale-110" />
                      <span className="font-medium">Lands</span>
                    </Link>

                    <Link to="/wishlist" className={getLinkClass('/wishlist')}>
                      <IoStorefrontOutline className="mr-3 text-lg transition-transform group-hover:scale-110" />
                      <span className="font-medium">Wishlist</span>
                    </Link>
                  </>
                )}

                <Link to="/MyLands" className={getLinkClass('/MyLands')}>
                  <PiIslandBold className="mr-3 text-lg transition-transform group-hover:scale-110" />
                  <span className="font-medium">My Lands</span>
                </Link>

                <Link to="/about" className={getLinkClass('/about')}>
                  <FaInfoCircle className="mr-3 text-lg transition-transform group-hover:scale-110" />
                  <span className="font-medium">About Us</span>
                </Link>
              </div>

              {/* Right Section */}
              <div className="hidden lg:flex items-center space-x-4">
                {user && (
                  <>
                    <Link
                      to="/inbox"
                      className="relative p-2 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                    >
                      <FaEnvelope className="text-xl text-gray-300 group-hover:text-emerald-400 transition-colors" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </Link>

                    <NotificationPanel currentUserId={user._id} role={user.role} />
                  </>
                )}

                {user?._id ? (
                  <div className="flex items-center space-x-3 pl-4 border-l border-white/20">
                   <Link
  to="/userProfile"
  onClick={() => {
    console.log("PROFILE CLICKED");
  }}

                      className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 transition-all duration-300 group"
                    >
                      <FaUser className="text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="font-medium text-emerald-400">Profile</span>
                    </Link>

                    <button
                      onClick={logoutUser}
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 group"
                    >
                      <FaSignOutAlt className="text-red-400 group-hover:scale-110 transition-transform" />
                      <span className="font-medium text-red-400">Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      to="/login"
                      className="px-6 py-2 rounded-xl border border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/10 transition-all duration-300 font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 font-medium shadow-lg hover:shadow-emerald-500/25"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setMenubar(!menubar)}
                  className="p-2 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
                >
                  {menubar ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {menubar && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
              <div className="px-4 py-6 space-y-2">
                <Link
                  to="/"
                  onClick={() => setMenubar(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white"
                >
                  <FaHome className="text-lg" />
                  <span className="font-medium">Home</span>
                </Link>

                {!isLawyer && (
                  <>
                    <Link
                      to="/lands"
                      onClick={() => setMenubar(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white"
                    >
                      <MdLandscape className="text-lg" />
                      <span className="font-medium">Lands</span>
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setMenubar(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white"
                    >
                      <IoStorefrontOutline className="text-lg" />
                      <span className="font-medium">Wishlist</span>
                    </Link>
                  </>
                )}

                <Link
                  to="/MyLands"
                  onClick={() => setMenubar(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white"
                >
                  <PiIslandBold className="text-lg" />
                  <span className="font-medium">My Lands</span>
                </Link>

                <Link
                  to="/about"
                  onClick={() => setMenubar(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white"
                >
                  <FaInfoCircle className="text-lg" />
                  <span className="font-medium">About Us</span>
                </Link>

                <div className="border-t border-white/10 pt-4 mt-4">
                  {user?.username ? (
                    <div className="space-y-2">
                     <Link
  to="/userProfile"
  onClick={() => {
    console.log("PROFILE CLICKED");
  }}


                        className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-medium"
                      >
                        <FaUser className="text-lg" />
                        <span>Profile</span>
                      </Link>

                      <button
                        onClick={() => {
                          logoutUser();
                          setMenubar(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-red-500/20 text-red-400 font-medium"
                      >
                        <FaSignOutAlt className="text-lg" />
                        <span>Logout {user?.username}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setMenubar(false)}
                        className="block w-full px-4 py-3 rounded-xl border border-emerald-400/50 text-emerald-400 text-center font-medium"
                      >
                        Login
                      </Link>

                      <Link
                        to="/register"
                        onClick={() => setMenubar(false)}
                        className="block w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-center font-medium"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      )}
    </>
  );
};

export default Navigation;
