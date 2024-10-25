import { useContext, useEffect, useState } from "react";
import "./Navigation.css";
import { Link, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { API } from "../../utils/API";
import { AuthContext } from "../../contexts/authContext";

const Navigation = () => {
  const [sidebar, setSidebar] = useState(false);
  const [dropdown,setDropdown] = useState(false);
  const {isAuthenticated,getUser,logout,user} = useContext(AuthContext)
  const navigate = useNavigate()

  const toggleDropdown = () => {
    setDropdown(!dropdown);
  }

  const toggleSidebar= () => {
    setSidebar(!sidebar);
  }
  // const username= user?.username
  // console.log(username)

  const logoutUser =  async(e) => {
    try {
      const {data} = await API.post('/api/users/logout')
      console.log(data)
      if(data){
        logout()
        console.log("logout clicked!!")
        navigate('/login')
      }
    } catch (error) {
      console.log(error)
    }
  }


  return (
    <div
      className={` ${
        sidebar ? "hidden" : "flex"
      } nav-container lg:flex xl:flex justify- z-40 sm:hidden md:hidden bg-black text-blue-200 flex-wrap w-[9%] fixed hover:w-[15%] h-screen`}
    >
      <div className="flex flex-col">
        <div className="image-container w-full h-10 flex m-2 mt-[2rem] ">
          <img
            src="https://www.shutterstock.com/image-vector/abstract-farm-land-food-crop-260nw-1746992270.jpg"
            alt="logo"
            className={`${sidebar ? "" : ""} rounded-full h-[40px]`}
          />
          <h2 className="texts font-semibold ml-2 mt-1">Terrain Utility</h2>
          </div>

          
        <div className="m-4 mt-5 ">
            <Link to="/" className="flex items-center">
              <FaHome className="mr-3 icons" />
              <span className="texts">Home</span>
            </Link>
        </div>
          
        <div className="m-4 mt-5 ">
            <Link to="/lands" className="flex items-center">
              <FaHome className="mr-3 icons" />
              <span className="texts">Lands</span>
            </Link>
        </div>

        <div className="m-4 mt-5 ">
            <Link to="/wishlist" className="flex items-center">
              <FaHome className="mr-3 icons" />
              <span className="texts">Wishlist</span>
            </Link>
        </div>

        <div className="m-4 mt-5 ">
            <Link to="/" className="flex items-center">
              <FaHome className="mr-3 icons" />
              <span className="texts">Home</span>
            </Link>
        </div>
      </div>

        <div className="relative">
          <ul className="mt-[1rem]">
            {
              user?.username ? <li className="mb-2 ml-[1rem]">
              <button
              onClick={()=>{
                logoutUser()
              }}
              className="mr-2 font-semibold text-green-500">Logout {user?.username}</button>
            </li> :
            <>
            <li className="mb-2 ml-[1rem]">
              <Link to='/login'
              className="mr-2 font-semibold text-green-600">Login</Link>
            </li>
            <li className="mb-2 ml-[1rem]">
              <Link to='/register'
              className="mr-2 font-semibold text-green-600">Register</Link>
            </li>
            </>
            }
          </ul>
        </div>
    </div>
  );
};

export default Navigation;
