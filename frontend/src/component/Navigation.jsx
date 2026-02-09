import { useContext, useEffect, useState } from "react";
import "./Navigation.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaShopify } from "react-icons/fa";
import { PiIslandBold } from "react-icons/pi";
import { MdLandscape } from "react-icons/md";
import { IoStorefrontOutline } from "react-icons/io5";
import { API } from "../../utils/API";
import { AuthContext } from "../../contexts/authContext";
import { toast } from "react-toastify";
import NotificationPanel from "../component/NotificationPanel";
const Navigation = () => {
  const [sidebar, setSidebar] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const { isAuthenticated, getUser, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); // Access the current location (route)
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
        <li className="flex items-center gap-4">
  {user && (
    <NotificationPanel
      currentUserId={user._id}
      role={user.role}
    />
  )}
</li>

          </ul>
          
          <ul className="text-white flex gap-5 items-center justify-end mr-[2rem] text-xl">
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
    </div>
      </>
    ) }  
    </>
  );
};

export default Navigation;
