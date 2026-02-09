import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/authContext";
import { FaArrowLeft } from "react-icons/fa";

const Register = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [number, setNumber] = useState("");
  const [role, setRole] = useState("buyerSeller");

  const navigate = useNavigate();

  const submitForm = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, contactNumber: number, role }),
    });

    const response = await res.json();
    if (!res.ok) return console.error(response.message || "Registration failed");

    if (response.status === 400 || !response) console.log("some error occurred");
    else navigate("/login");
  };

  return (
    <section className="bg-[#daf1de] min-h-screen flex items-center justify-center p-6">
      <div className="flex flex-col md:flex-row w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden">

        {/* FORM CONTAINER */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#1b3a31] to-[#235347] p-10 flex flex-col justify-center rounded-l-3xl">
          <h1 className="text-4xl md:text-5xl text-[#fff5f5] font-extrabold mb-12 text-center tracking-wide">
            REGISTER
          </h1>

          <form onSubmit={submitForm} className="w-full space-y-6">

            {/* Name & Contact */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-lg md:text-xl font-semibold text-[#fff5f5] mb-1">Name:</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#2c5c4b] text-[#fff5f5] placeholder-[#d1e8d0] focus:outline-none focus:ring-2 focus:ring-[#ffd1c1] shadow-lg"
                />
              </div>
              <div className="flex-1">
                <label className="block text-lg md:text-xl font-semibold text-[#fff5f5] mb-1">Contact:</label>
                <input
                  type="tel"
                  required
                  placeholder="Enter your number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#2c5c4b] text-[#fff5f5] placeholder-[#d1e8d0] focus:outline-none focus:ring-2 focus:ring-[#ffd1c1] shadow-lg"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength="10"
                />
              </div>
            </div>

            {/* Email & Role */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-lg md:text-xl font-semibold text-[#fff5f5] mb-1">Email:</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#2c5c4b] text-[#fff5f5] placeholder-[#d1e8d0] focus:outline-none focus:ring-2 focus:ring-[#ffd1c1] shadow-lg"
                />
              </div>
              <div className="flex-1">
                <label className="block text-lg md:text-xl font-semibold text-[#fff5f5] mb-1">Select Role:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#2c5c4b] text-[#fff5f5] placeholder-[#d1e8d0] focus:outline-none focus:ring-2 focus:ring-[#ffd1c1] shadow-lg"
                >
                  <option value="buyerSeller">Buyer / Seller</option>
                  <option value="lawyer">Lawyer</option>
                </select>
              </div>
            </div>

            {/* Passwords */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-lg md:text-xl font-semibold text-[#fff5f5] mb-1">Password:</label>
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#2c5c4b] text-[#fff5f5] placeholder-[#d1e8d0] focus:outline-none focus:ring-2 focus:ring-[#ffd1c1] shadow-lg"
                />
              </div>
              <div className="flex-1">
                <label className="block text-lg md:text-xl font-semibold text-[#fff5f5] mb-1">Confirm Password:</label>
                <input
                  type="password"
                  required
                  placeholder="Enter password again"
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#2c5c4b] text-[#fff5f5] placeholder-[#d1e8d0] focus:outline-none focus:ring-2 focus:ring-[#ffd1c1] shadow-lg"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#4caf50] to-[#2e7d32] py-3 rounded-xl text-[#fff5f5] font-bold text-lg transition-all shadow-lg hover:scale-105 hover:shadow-2xl"
            >
              Register
            </button>
          </form>

          <div className="mt-6 text-center text-[#fff5f5]">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="underline hover:text-[#ffd1c1]">
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* IMAGE CONTAINER */}
        <div className="w-full md:w-1/2 flex justify-center items-center bg-gradient-to-br from-[#dab0aa] to-[#e0b7ad] p-6 relative rounded-r-3xl">
          
          {/* Go to Home Button on Image */}
          <Link
            to="/"
            className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4caf50] to-[#2e7d32] rounded-3xl hover:scale-105 transition-all shadow-md text-white font-semibold"
          >
            <FaArrowLeft /> <span>Go to Home</span>
          </Link>

          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/user-account-sign-up-4489360-3723267.png"
            alt="Registration Illustration"
            className="h-[28rem] w-[30rem] rounded-2xl object-cover shadow-2xl"
          />
        </div>

      </div>
    </section>
  );
};

export default Register;
