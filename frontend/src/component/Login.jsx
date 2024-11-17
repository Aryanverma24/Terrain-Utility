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
        console.log(localStorage);
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

  return (
    <section className="bg-[#0e0e0e] text-white">
      <div className= "pl-[4rem] pt-[4rem] h-screen pb-[2rem] bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-4xl text-green-600 font-semibold mb-6 text-center">
          SIGN IN
        </h1>

        <div className="flex justify-around">
          <div className="p-2">
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
          </div>
          
          <div>
          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/customer-feedback-9175733-7525331.png"
            alt=""
            className="h-[24rem] w-[28rem] rounded-lg hidden md:block"
          />
        </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
