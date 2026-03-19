import { useContext, useEffect, useState } from "react";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaShopify, FaEnvelope, FaBars, FaTimes } from "react-icons/fa";
import { PiIslandBold } from "react-icons/pi";
import { MdLandscape } from "react-icons/md";
import { IoStorefrontOutline } from "react-icons/io5";
import { API } from "../../utils/API";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import NotificationPanel from "../component/NotificationPanel";
const Navigation = () => {
  const [menubar,setMenubar] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const { isAuthenticated, getUser, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); // Access the current location (route)
 const [unreadCount, setUnreadCount] = useState(0);
useEffect(() => {
  if (!user?._id) return;

  const fetchUnread = async () => {
    try {
      const { data } = await API.get(`/api/chat/unread/${user._id}`);

      // 🔥 SUM ALL CHAT COUNTS
      const total = Object.values(data).reduce(
        (acc, val) => acc + val,
        0
      );

      setUnreadCount(total);

    } catch (err) {
      console.error("Unread fetch error", err);
    }
  };

  fetchUnread();

  const interval = setInterval(fetchUnread, 3000); // optional realtime feel
  return () => clearInterval(interval);

}, [user]);
 
  // user is null initially
  const toggleDropdown = () => {
    setDropdown(!dropdown);
  };

  const toggleSidebar = () => {
    setSidebar(!sidebar);
  };

  const logoutUser = async (e) => {
    try {
      const { data } = await API.post('/api/users/logout');
      console.log(data);
      if (data) {
        logout();
        console.log("logout clicked!!");
        navigate('/login');
      }
    } catch (error) {
      toast.error('logout failed.try again')
      console.log(error);
    }
  };



  const getIconColor = (path) => {
    return location.pathname === path ? "text-[#C4A1A1]" : "text-[#C4A1A1]"; // Conditionally apply green or gray
  };

  return (


    <>
      {console.log(location.pathname)}
      {(location.pathname === '/login' || location.pathname === '/register' ) ? (
        <>  
        </>
      ) : (
      <>
      <div className="nav-container fixed z-10 min-w-full flex bg-[#235347] justify-between">
        <ul className="flex py-3 px-4 gap-[40px]">
          <li className="flex mr-[2rem]">
          <img
               src="https://www.shutterstock.com/image-vector/abstract-farm-land-food-crop-260nw-1746992270.jpg"
               alt="logo"
               className="rounded-full h-[40px]"
            />
          <h2 className="texts font-semibold ml-2 mt-1 text-2xl text-[#C4A1A1]">LandStrider</h2>
          </li>
        </ul>
      </div>
        <div className="nav-container fixed z-10 min-w-full flex bg-slate-800 justify-between ">
          <ul className="hidden md:flex py-3 px-4 gap-[40px]">
          <li className="text-xl">  
              <Link to="/" className="flex items-center py-2">
              <FaHome className={`mr-3 icons ${getIconColor("/")}`} />
              <span className={`texts ${getIconColor("/")}`}>Home</span>
              </Link>
          </li>
          <li className="text-xl">  
              <Link to="/lands" className="flex items-center py-2">
              <MdLandscape className={`mr-3 icons ${getIconColor("/lands")}`} />
              <span className={`texts ${getIconColor("/lands")}`}>Lands</span>
              </Link>
          </li>
          <li className="text-xl">  
              <Link to="/wishlist" className="flex items-center py-2">
              <IoStorefrontOutline className={`mr-3 icons ${getIconColor("/wishlist")}`} />
              <span className={`texts ${getIconColor("/wishlist")}`}>Wishlist</span>
              </Link>
          </li>
          <li className="text-xl">  
              <Link to="/MyLands" className="flex items-center py-2">
              <PiIslandBold className={`mr-3 icons ${getIconColor("/MyLands")}`} />
              <span className={`texts ${getIconColor("/MyLands")}`}>My Lands</span>
              </Link></li>
       <li className="flex items-center gap-6">

  {/* ✅ INBOX BUTTON */}
  <Link to="/inbox" className="relative flex items-center">
    <FaEnvelope className="text-xl text-[#C4A1A1]" />

    {/* 🔴 UNREAD BADGE */}
    {unreadCount > 0 && (
      <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-1.5 rounded-full">
        {unreadCount}
      </span>
    )}
  </Link>

  {/* 🔔 EXISTING NOTIFICATION */}
  {user && (
    <NotificationPanel
      currentUserId={user._id}
      role={user.role}
    />
  )}

</li>

          </ul>
          


          <ul className="text-white hidden md:flex gap-5 items-center justify-end mr-[2rem] text-xl">
              {user?.username ? (
                  <>
                    <li>
                    <Link to='/userProfile' className="font-semibold text-white hover:text-gold">
                        Profile
                    </Link>
                    </li>
                    <li>
                    <button
                      onClick={() => {
                      logoutUser();
                      }}
                    className="font-semibold text-white hover:text-gold"
                    >
                      Logout {user?.username}
                    </button>
                  </li>
                  </>
              ) : (
                  <>
                      <li>
                      <Link to='/login' className="font-semibold text-[#C4A1A1]">
                      Login
                      </Link>
                      </li>
                      <li>
                      <Link to='/register' className="font-semibold text-[#C4A1A1]">
                        Register
                      </Link>
                      </li>
                  </>
              )}
          </ul>
          <div className="md:hidden text-white fixed top-5 right-5">
            <button onClick={() => setMenubar(!menubar)}>
              {menubar ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
 
          {menubar && (
  <div className="absolute top-[70px] right-4 text-white bg-slate-900 p-4 rounded-lg shadow-lg w-60 z-50 flex flex-col gap-4 text-base md:hidden">
    
    <Link to="/" onClick={() => setMenubar(false)}>Home</Link>
    <Link to="/lands" onClick={() => setMenubar(false)}>Lands</Link>
    <Link to="/wishlist" onClick={() => setMenubar(false)}>Wishlist</Link>
    <Link to="/MyLands" onClick={() => setMenubar(false)}>My Lands</Link>

    {user?.username ? (
      <>
        <Link to="/userProfile" onClick={() => setMenubar(false)}>Profile</Link>
        <button onClick={() => { logoutUser(); setMenubar(false); }}>
          Logout {user?.username}
        </button>
      </>
    ) : (
      <>
        <Link to="/login" onClick={() => setMenubar(false)}>Login</Link>
        <Link to="/register" onClick={() => setMenubar(false)}>Register</Link>
      </>
    )}
    
  </div>
)}
    </div>
      </>
    ) }  
    </>
  );
};

export default Navigation;
