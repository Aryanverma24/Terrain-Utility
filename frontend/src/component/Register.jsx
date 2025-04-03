import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../utils/API";
import { AuthContext } from "../../contexts/authContext";
import { useContext } from "react";
import { FaArrowLeft } from "react-icons/fa";

const Register = () => {
  const { isAuthenticated, registerUser } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [number, setNumber] = useState("");

  const navigate = useNavigate();
  
  const submitForm = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
        contactNumber: number,
      }),
    });
      
    const response = await res.json();
    if (!res.ok) {
      console.error(response.message || "Registration failed");
      return;
  }

    if (response.status === 400 || !response) {
      console.log("some error occured");
    } else {
      console.log("registration succesfully done!!");
      console.log(response);
      navigate("/login");
    }
  };

  return (
    <section className="flex flex-col md:flex-row bg-[#0e0e0e] text-white min-h-screen">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-4xl font-bold text-green-600 text-center mb-4">
            REGISTER
          </h1>
          <Link to={'/'}
          className="bg-gold flex gap-2 px-4 py-4 rounded-3xl absolute top-[2rem] right-[2rem]" 
        > <FaArrowLeft className="mt-1"/> <span>Go to Home</span>
        </Link>
          <form className="space-y-3" onSubmit={submitForm}>
            {/** Name Input */}
            <div>
              <label
                htmlFor="name"
                className="block text-green-600 text-lg mb-1"
              >
                Name:
              </label>
              <input
                type="text"
                id="name"
                required
                name="username"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-1 rounded-lg bg-gray-700 text-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 transition duration-200 ease-in-out"
                autoComplete="new-name"
              />
            </div>

            {/** Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-green-600 text-lg mb-1"
              >
                Email:
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1 rounded-lg bg-gray-700 text-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 transition duration-200 ease-in-out"
                autoComplete="new-email"
              />
            </div>

            {/** Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-green-600 text-lg mb-1"
              >
                Password:
              </label>
              <input
                type="password"
                id="password"
                required
                name="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-1 rounded-lg bg-gray-700 text-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 transition duration-200 ease-in-out"
                autoComplete="new-password"
              />
            </div>

            {/** Confirm Password Input */}
            <div>
              <label
                htmlFor="againPassword"
                className="block text-green-600 text-lg mb-1"
              >
                Confirm Password:
              </label>
              <input
                type="password"
                id="againPassword"
                name="rePassword"
                required
                placeholder="Enter password again"
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
                className="w-full px-3 py-1 rounded-lg bg-gray-700 text-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 transition duration-200 ease-in-out"
                autoComplete="new-repassword"
              />
            </div>

            {/** Contact Input */}
            <div>
              <label
                htmlFor="contact"
                className="block text-green-600 text-lg mb-1"
              >
                Contact:
              </label>
              <input
                type="tel"
                id="contact"
                name="number"
                placeholder="Enter your number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-3 py-1 rounded-lg bg-gray-700 text-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 transition duration-200 ease-in-out"
                autoComplete="tel"
                required
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength="10"
              />
            </div>

            {/** Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-800 py-2 rounded-lg text-white transition duration-200 ease-in-out"
            >
              Register
            </button>
          </form>

          {/** Link to Login */}
          <div className="mt-4 text-center">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="text-green-600 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Optional Image Section */}
      <div className="flex-1 flex items-center justify-center">
        <img
          src="https://cdni.iconscout.com/illustration/premium/thumb/user-account-sign-up-4489360-3723267.png"
          alt="Registration Illustration"
          className="h-[24rem] w-[28rem] rounded-xl hidden md:block"
        />
      </div>
    </section>
  );
};

export default Register;
