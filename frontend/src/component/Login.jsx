import { set } from "mongoose";
import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { API } from "../../utils/API";
import { AuthContext } from "../../contexts/authContext";


const Login = () => {
  const {isAuthenticated,getUser} = useContext(AuthContext)
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const navigate = useNavigate()

  const getLogin = async(e)=>{
    e.preventDefault();
    try {
      const {data} = await API.post('/api/users/auth',{
        email,password
      })
      if(data){
        localStorage.setItem("token", data?.token)
        getUser();
        navigate('/')
      }
   } catch (error) {
      console.log(error)
    }
  }

 useEffect(()=>{
  if(isAuthenticated){
    navigate('/')
  }
 },[isAuthenticated])
  

  return (
    <section className="ml-[4rem] h-screen text-white bg-[#0e0e0e]">
      <div className="flex flex-wrap">
        <div className="ml-[9rem] mt-[3rem]">
          <h1 className="text-4xl text-green-600 text-right font-semibold mb-4">SIGN IN</h1>
          
          <form onSubmit={getLogin} className="w-[28rem] mt-[6rem]">
            <div className="block mt-[1rem] mb-[1rem]">
              <label htmlFor="email" className="ml-[2rem] cursor-pointer text-green-600 font-semibold text-xl">
                Email :
              </label>
              <input
                type="email"
                id="email"
                value={email}
                placeholder="enter your email"
                onChange={(e)=> setEmail(e.target.value) }
                className="ml-[5rem] text-green-600 mt-2 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 shadow-md shadow-slate-500 "
              />
            </div>
            <div className="block mt-[1rem] mb-[1rem]">
              <label htmlFor="password" className="ml-[2rem] cursor-pointer text-green-600 font-semibold text-xl">
                Password :
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="enter your password"
                className="ml-[3rem] text-green-600 mt-2 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 shadow-md shadow-slate-500 "
              />
            </div>

            <button 
                type="submit"
                className="w-36 bg-green-600 hover:bg-green-800 px-2 py-1 ml-[5rem] mt-[1rem] rounded-lg text-white">
                Sign In...
            </button>
          </form> 

          <div className=" mt-[4rem]">
            <p className="">
              New User ? {""}
              <Link to='/register' 
              className="text-green-600 hover:underline"> Register</Link>
            </p>
          </div>
        </div>

        <div className="flex items-center mt-[6rem]">
        <img
          src="https://cdni.iconscout.com/illustration/premium/thumb/customer-feedback-9175733-7525331.png"
          alt=""
          className="h-[24rem] w-[28rem] xl:block md:hidden sm:hidden rounded-lg"
        />
        </div>

      </div>
    </section>
  );
};

export default Login;
