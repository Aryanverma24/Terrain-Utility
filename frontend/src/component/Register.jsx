import React from 'react'
import { Link } from 'react-router-dom'

const Register = () => {
  return (
    <section className='flex flex-wrap bg-[#0e0e0e] ml-[4rem] text-white h-[100vh] pl-[10rem]'>
        <div className='mt-[3rem] mr-[3rem]'>
                <h1 className='text-4xl text-right font-semibold text-green-600'>REGISTER</h1>

            <form className='container w-[30rem]'>
                <div className='block my-[1rem] mb-2'>
                    <label htmlFor="name"
                        className='text-green-600 text-xl'>
                        Name : 
                    </label>
                    <input 
                        type="text"
                        id='name'
                        placeholder='enter your name'
                        className='ml-[4rem] mt-2 px-2 py-1 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-green-600 text-green-600' />
                </div>

                <div className='block my-[1rem] mb-2'>
                    <label htmlFor="email"
                        className='text-green-600 text-xl'>
                        Email : 
                    </label>
                    <input 
                        type="email"
                        id='email'
                         placeholder='enter your email'
                        className='ml-[4rem] mt-2 px-2 py-1 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-green-600 text-green-600' />
                </div>

                <div className='block my-[1rem] mb-2'>
                    <label htmlFor="password"
                        className='text-green-600 text-xl'>
                        Password : 
                    </label>
                    <input 
                        type="password"
                        id='password'
                         placeholder='enter password'
                        className='ml-[2rem] mt-2 px-2 py-1 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-green-600 text-green-600'/>
                </div>

                <div className='block my-[1rem] mb-2'>
                    <label htmlFor="againPassword"
                        className='text-green-600 text-xl'>
                        Password : 
                    </label>
                    <input 
                        type="password"
                        id='againPassword'
                         placeholder='enter password again'
                        className='ml-[2rem] mt-2 px-2 py-1 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-green-600 text-green-600' />
                </div>

                <button type='submit'
                        className='px-2 py-1 rounded-lg mt-[2rem] ml-[5rem] w-[8rem] bg-green-600 hover:bg-green-800'>
                    Register
                </button>
            </form>
            <div className=" mt-[4rem]">
            <p className="">
              already have an account ? {""}
              <Link to='/login' 
              className="text-green-600 hover:underline"> Login</Link>
            </p>
          </div>

        </div>

        <div className="flex items-center">
        <img
          src="https://cdni.iconscout.com/illustration/premium/thumb/user-account-sign-up-4489360-3723267.png"
          alt=""
          className="h-[24rem] w-[28rem] xl:block md:hidden sm:hidden rounded-xl"
        />
        </div>
    </section>
  )
}

export default Register