import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../utils/API";
import { AuthContext } from "../../contexts/authContext";
import { useContext } from "react";

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
    if (response.status === 400 || !response) {
      console.log("some error occured");
    } else {
      console.log("registration succesfully done!!");
      console.log(response);
      navigate("/login");
    }
  };
  //   return (
  //     <section className='flex flex-wrap bg-[#0e0e0e] ml-[4rem] text-white h-[100vh] pl-[10rem]'>
  //         <div className='mt-[3rem] mr-[3rem]'>
  //                 <h1 className='text-4xl text-right font-semibold text-green-600'>REGISTER</h1>

  //             <form className='container w-[30rem]'  method='POST'
  //             >
  //                 <div className='block my-[1rem] mb-2'>
  //                     <label htmlFor="name"
  //                         className='text-green-600 text-xl'>
  //                         Name :
  //                     </label>
  //                     <input
  //                         type="text"
  //                         id='name' required
  //                         name='username'
  //                         placeholder='enter your name'
  //                         value={username}
  //                         onChange={(e)=>setUsername(e.target.value)}
  //                         className='ml-[4rem] mt-2 px-2 py-1 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-green-600 text-green-600'
  //                         autoComplete='new-name'/>
  //                 </div>

  //                 <div className='block my-[1rem] mb-2'>
  //                     <label htmlFor="email"
  //                         className='text-green-600 text-xl'>
  //                         Email :
  //                     </label>
  //                     <input
  //                         type="email"
  //                         id='email'
  //                          placeholder='enter your email'
  //                          name='email'
  //                         required
  //                         value={email}
  //                         onChange={(e)=>setEmail(e.target.value)}
  //                         className='ml-[4rem] mt-2 px-2 py-1 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-green-600 text-green-600'
  //                         autoComplete='new-email'/>
  //                 </div>

  //                 <div className='block my-[1rem] mb-2'>
  //                     <label htmlFor="password"
  //                         className='text-green-600 text-xl'>
  //                         Password :
  //                     </label>
  //                     <input
  //                         type="password"
  //                         id='password' required
  //                            name='password'
  //                          placeholder='enter password'
  //                          value={password}
  //                         onChange={(e)=>setPassword(e.target.value)}
  //                         className='ml-[2rem] mt-2 px-2 py-1 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-green-600 text-green-600'
  //                         autoComplete='new-password'/>
  //                 </div>

  //                 <div className='block my-[1rem] mb-2'>
  //                     <label htmlFor="againPassword"
  //                         className='text-green-600 text-xl'>
  //                         Password :
  //                     </label>
  //                     <input
  //                         type="password"
  //                         id='againPassword'
  //                            name='rePassword'
  //                         required
  //                          placeholder='enter password again'
  //                          value={rePassword}
  //                          onChange={(e)=>setRePassword(e.target.value)}
  //                         className='ml-[2rem] mt-2 px-2 py-1 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-green-600 text-green-600'
  //                         autoComplete='new-repassword'/>
  //                 </div>

  //                 <div className='block my-[1rem] mb-2'>
  //                     <label htmlFor="contact"
  //                         className='text-green-600 text-xl'>
  //                         Contact :
  //                     </label>
  //                     <input
  //                         type="tel"
  //                         id='contact'
  //                         name='number'
  //                          placeholder='enter your number'
  //                          value={number}
  //                          onChange={(e)=>setNumber(e.target.value)}
  //                         className='ml-[2rem] mt-2 px-2 py-1 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-green-600 text-green-600'
  //                         autoComplete='tel'
  //                         required
  //                         pattern="[0-9]*"
  //                         inputMode="numeric"
  //                         maxLength="10"/>
  //                 </div>

  //                 <button type='submit' onClick={submitForm}
  //                         className='px-2 py-1 rounded-lg mt-[2rem] ml-[5rem] w-[8rem] bg-green-600 hover:bg-green-800'>
  //                     Register
  //                 </button>
  //             </form>
  //             <div className="ml-[1rem] mt-[1rem]">
  //             <p className="">
  //               already have an account ? {""}
  //               <Link to='/login'
  //               className="text-green-600 hover:underline"> Login</Link>
  //             </p>
  //           </div>

  //         </div>

  //         <div className="flex items-center">
  //         <img
  //           src="https://cdni.iconscout.com/illustration/premium/thumb/user-account-sign-up-4489360-3723267.png"
  //           alt=""
  //           className="h-[24rem] w-[28rem] xl:block md:hidden sm:hidden rounded-xl"
  //         />
  //         </div>
  //     </section>
  //   )
  // }

  return (
    <section className="flex flex-col md:flex-row bg-[#0e0e0e] text-white min-h-screen">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-4xl font-bold text-green-600 text-center mb-6">
            REGISTER
          </h1>
          <form className="space-y-4" onSubmit={submitForm}>
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
                className="w-full px-3 py-2 rounded-lg bg-gray-700 text-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 transition duration-200 ease-in-out"
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
                className="w-full px-3 py-2 rounded-lg bg-gray-700 text-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 transition duration-200 ease-in-out"
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
                className="w-full px-3 py-2 rounded-lg bg-gray-700 text-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 transition duration-200 ease-in-out"
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
                className="w-full px-3 py-2 rounded-lg bg-gray-700 text-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 transition duration-200 ease-in-out"
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
                className="w-full px-3 py-2 rounded-lg bg-gray-700 text-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 transition duration-200 ease-in-out"
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
      {/* <div className="flex-1 flex items-center justify-center">
        <img
          src="https://cdni.iconscout.com/illustration/premium/thumb/user-account-sign-up-4489360-3723267.png"
          alt="Registration Illustration"
          className="h-[24rem] w-[28rem] rounded-xl hidden md:block"
        />
      </div> */}
    </section>
  );
};

export default Register;
