import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../utils/API";
import { AuthContext } from "../../contexts/authContext";

const Login = () => {
  const { isAuthenticated, getUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const getLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/api/users/auth", {
        email,
        password,
      });
      if (data) {
        localStorage.setItem("token", data?.token);
        getUser();
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);

  //   return (
  //     <section className="ml-[4rem] h-screen text-white bg-[#0e0e0e]">
  //       <div className="flex flex-wrap">
  //         <div className="ml-[9rem] mt-[3rem]">
  //           <h1 className="text-4xl text-green-600 text-right font-semibold mb-4">SIGN IN</h1>

  //           <form onSubmit={getLogin} className="w-[28rem] mt-[6rem]">
  //             <div className="block mt-[1rem] mb-[1rem]">
  //               <label htmlFor="email" className="ml-[2rem] cursor-pointer text-green-600 font-semibold text-xl">
  //                 Email :
  //               </label>
  //               <input
  //                 type="email"
  //                 id="email"
  //                 value={email}
  //                 placeholder="enter your email"
  //                 onChange={(e)=> setEmail(e.target.value) }
  //                 className="ml-[5rem] text-green-600 mt-2 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 shadow-md shadow-slate-500 "
  //               />
  //             </div>
  //             <div className="block mt-[1rem] mb-[1rem]">
  //               <label htmlFor="password" className="ml-[2rem] cursor-pointer text-green-600 font-semibold text-xl">
  //                 Password :
  //               </label>
  //               <input
  //                 type="password"
  //                 id="password"
  //                 value={password}
  //                 onChange={(e) => setPassword(e.target.value)}
  //                 placeholder="enter your password"
  //                 className="ml-[3rem] text-green-600 mt-2 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 shadow-md shadow-slate-500 "
  //               />
  //             </div>

  //             <button
  //                 type="submit"
  //                 className="w-36 bg-green-600 hover:bg-green-800 px-2 py-1 ml-[8rem] mt-[1rem] rounded-lg text-white">
  //                 Sign In...
  //             </button>
  //           </form>

  //           <div className="ml-[8rem] mt-[1rem]">
  //             <p className="">
  //               New User ? {""}
  //               <Link to='/register'
  //               className="text-green-600 hover:underline"> Register</Link>
  //             </p>
  //           </div>
  //         </div>

  //         <div className="flex items-center mt-[6rem]">
  //         <img
  //           src="https://cdni.iconscout.com/illustration/premium/thumb/customer-feedback-9175733-7525331.png"
  //           alt=""
  //           className="h-[24rem] w-[28rem] xl:block md:hidden sm:hidden rounded-lg"
  //         />
  //         </div>

  //       </div>
  //     </section>
  //   );
  // };
  return (
    <section className="flex items-center justify-center h-screen bg-[#0e0e0e] text-white">
      <div className="flex flex-col items-center w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-4xl text-green-600 font-semibold mb-6 text-center">
          SIGN IN
        </h1>

        <form onSubmit={getLogin} className="w-full space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-green-600 font-semibold text-xl mb-1"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 shadow-md"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-green-600 font-semibold text-xl mb-1"
            >
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-2 rounded-lg bg-gray-700 text-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 shadow-md"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-800 py-2 rounded-lg text-white font-semibold"
          >
            Sign In
          </button>
        </form>

        <div className="mt-4 text-center">
          <p>
            New User?{" "}
            <Link to="/register" className="text-green-600 hover:underline">
              Register
            </Link>
          </p>
        </div>

        <div className="mt-6">
          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/customer-feedback-9175733-7525331.png"
            alt=""
            className="h-[24rem] w-[28rem] rounded-lg hidden md:block"
          />
        </div>
      </div>
    </section>
  );
};

export default Login;
