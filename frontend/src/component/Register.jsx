import React, { useState ,useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API } from '../../utils/API'
import { AuthContext } from '../../contexts/authContext'
import { useContext } from 'react'

const Register = () => {

    const {isAuthenticated,registerUser} = useContext(AuthContext)
    const [username,setUsername] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [rePassword,setRePassword] = useState('');
    const [number,setNumber] = useState('');


    const navigate = useNavigate();
    const submitForm =  async (e)=> {
        e.preventDefault();
    
        const res = await fetch('http://localhost:5000/api/users/register',{
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({username,email,password,contactNumber:number})
        });
        const response = await res.json();
        if(response.status === 400 || !response){
            console.log('some error occured')
        }else{
            console.log('registration succesfully done!!')
            console.log(response)
            navigate('/login')
        }
    }
  return (
    <section className='flex flex-wrap bg-[#0e0e0e] ml-[4rem] text-white h-[100vh] pl-[10rem]'>
        <div className='mt-[3rem] mr-[3rem]'>
                <h1 className='text-4xl text-right font-semibold text-green-600'>REGISTER</h1>

            <form className='container w-[30rem]'  method='POST'
            >
                <div className='block my-[1rem] mb-2'>
                    <label htmlFor="name"
                        className='text-green-600 text-xl'>
                        Name : 
                    </label>
                    <input 
                        type="text"
                        id='name' required
                        name='username'
                        placeholder='enter your name'
                        value={username}
                        onChange={(e)=>setUsername(e.target.value)}
                        className='ml-[4rem] mt-2 px-2 py-1 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-green-600 text-green-600' 
                        autoComplete='new-name'/>
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
                         name='email'    
                        required
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        className='ml-[4rem] mt-2 px-2 py-1 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-green-600 text-green-600' 
                        autoComplete='new-email'/>
                </div>

                <div className='block my-[1rem] mb-2'>
                    <label htmlFor="password"
                        className='text-green-600 text-xl'>
                        Password : 
                    </label>
                    <input 
                        type="password"
                        id='password' required
                           name='password'
                         placeholder='enter password'
                         value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        className='ml-[2rem] mt-2 px-2 py-1 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-green-600 text-green-600'
                        autoComplete='new-password'/>
                </div>

                <div className='block my-[1rem] mb-2'>
                    <label htmlFor="againPassword"
                        className='text-green-600 text-xl'>
                        Password : 
                    </label>
                    <input 
                        type="password"
                        id='againPassword'
                           name='rePassword'
                        required
                         placeholder='enter password again'
                         value={rePassword}
                         onChange={(e)=>setRePassword(e.target.value)}
                        className='ml-[2rem] mt-2 px-2 py-1 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-green-600 text-green-600' 
                        autoComplete='new-repassword'/>
                </div>

                <div className='block my-[1rem] mb-2'>
                    <label htmlFor="contact"
                        className='text-green-600 text-xl'>
                        Contact : 
                    </label>
                    <input 
                        type="tel"
                        id='contact'
                        name='number'
                         placeholder='enter your number'
                         value={number}
                         onChange={(e)=>setNumber(e.target.value)}
                        className='ml-[2rem] mt-2 px-2 py-1 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-green-600 text-green-600' 
                        autoComplete='tel'
                        required
                        pattern="[0-9]*"
                        inputMode="numeric"
                        maxLength="10"/>
                </div>

                <button type='submit' onClick={submitForm}
                        className='px-2 py-1 rounded-lg mt-[2rem] ml-[5rem] w-[8rem] bg-green-600 hover:bg-green-800'>
                    Register
                </button>
            </form>
            <div className="ml-[1rem] mt-[1rem]">
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