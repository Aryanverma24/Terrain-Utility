import { useContext, useEffect, useState } from "react";
import "./Navigation.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaHome, FaShopify, FaTimes } from "react-icons/fa";
import { PiIslandBold } from "react-icons/pi";
import { MdLandscape } from "react-icons/md";
import { IoStorefrontOutline } from "react-icons/io5";
import { API } from "../../utils/API";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const Navigation = () => {
  const [menubar,setMenubar] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const { isAuthenticated, getUser, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); // Access the current location (route)

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
    return location.pathname === path ? "text-gold" : "text-beige"; // Conditionally apply green or gray
  };

  return (
    // <div
    //   className="nav-container fixed top-0 w-full bg-slate-800 text-yellow-600 flex z-40"
    // >
    //   <div className="flex items-center">
    //     <div className="image-container w-full h-10 flex m-2 mt-[2rem]">
    //       <img
    //         src="https://www.shutterstock.com/image-vector/abstract-farm-land-food-crop-260nw-1746992270.jpg"
    //         alt="logo"
    //         className={`${sidebar ? "" : ""} rounded-full h-[40px]`}
    //       />
    //       <h2 className="texts font-semibold ml-2 mt-1 text-2xl">LandStrider</h2>
    //     </div>

    //     <div className="m-4 mt-[3rem] ">
    //       <Link to="/" className="flex items-center">
    //         <FaHome className={`mr-3 icons ${getIconColor("/")}`} />
    //         <span className={`texts ${getIconColor("/")}`}>Home</span>
    //       </Link>
    //     </div>

    //     <div className="m-4 mt-5">
    //       <Link to="/lands" className="flex items-center">
    //         <MdLandscape className={`mr-3 icons ${getIconColor("/lands")}`} />
    //         <span className={`texts ${getIconColor("/lands")}`}>Lands</span>
    //       </Link>
    //     </div>

    //     <div className="m-4 mt-5">
    //       <Link to="/wishlist" className="flex items-center">
    //         <IoStorefrontOutline className={`mr-3 icons ${getIconColor("/wishlist")}`} />
    //         <span className={`texts ${getIconColor("/wishlist")}`}>Wishlist</span>
    //       </Link>
    //     </div>

    //     <div className="m-4 mt-5">
    //       <Link to="/MyLands" className="flex items-center">
    //         <PiIslandBold className={`mr-3 icons ${getIconColor("/MyLands")}`} />
    //         <span className={`texts ${getIconColor("/MyLands")}`}>My Lands</span>
    //       </Link>
    //     </div>
    //   </div>

    //   <div className="relative top-20">
    //     <ul className="mt-[1rem]">

    //       {user?.username ? (
    //         <>
    //          <li className="mb-2 ml-[1rem]">
    //          <Link to='/userProfile' className="mr-2 font-semibold text-green-600">
    //            Profile
    //          </Link>
    //         </li>
    //         <li className="mb-5 ml-[1rem]">
    //           <button
    //             onClick={() => {
    //               logoutUser();
    //             }}
    //             className="font-semibold text-green-500"
    //           >
    //             Logout {user?.username}
    //           </button>
    //         </li>
    //         </>
    //       ) : (
    //         <>
    //           <li className="mb-2 ml-[1rem]">
    //             <Link to='/login' className="mr-2 font-semibold text-gold">
    //               Login
    //             </Link>
    //           </li>
    //           <li className="mb-2 ml-[1rem]">
    //             <Link to='/register' className="mr-2 font-semibold text-gold">
    //               Register
    //             </Link>
    //           </li>
    //         </>
    //       )}
    //     </ul>
    //   </div>
    // </div>

    <>
      {console.log(location.pathname)}
      {(location.pathname === '/login' || location.pathname === '/register' ) ? (
        <>  
        </>
      ) : (
      <>
      <div className="nav-container fixed z-10 min-w-full flex bg-slate-800 justify-between">
        <ul className="flex py-3 px-4 gap-[40px]">
          <li className="flex mr-[2rem]">
          <img
               src="https://www.shutterstock.com/image-vector/abstract-farm-land-food-crop-260nw-1746992270.jpg"
               alt="logo"
               className="rounded-full h-[40px]"
            />
          <h2 className="texts font-semibold ml-2 mt-1 text-2xl text-gold">LandStrider</h2>
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
              </Link>
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
                      <Link to='/login' className="font-semibold text-gold">
                      Login
                      </Link>
                      </li>
                      <li>
                      <Link to='/register' className="font-semibold text-gold">
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
            <Link to="/" className="hover:text-gold" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/lands" className="hover:text-gold" onClick={() => setMenuOpen(false)}>Lands</Link>
            <Link to="/wishlist" className="hover:text-gold" onClick={() => setMenuOpen(false)}>Wishlist</Link>
            <Link to="/MyLands" className="hover:text-gold" onClick={() => setMenuOpen(false)}>My Lands</Link>
            {user?.username ? (
              <>
                <Link to="/userProfile" className="hover:text-gold" onClick={() => setMenuOpen(false)}>Profile</Link>
                <button onClick={() => { logoutUser(); setMenuOpen(false); }} className="hover:text-gold">
                  Logout {user?.username}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gold hover:text-white" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="text-gold hover:text-white" onClick={() => setMenuOpen(false)}>Register</Link>
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
