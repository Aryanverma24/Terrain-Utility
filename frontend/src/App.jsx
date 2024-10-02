import {Outlet} from 'react-router-dom'
import {ToastContainer} from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import Navigation from './component/Navigation'
import { API } from '../utils/API'
import { useContext, useEffect } from 'react'
import Login from './component/Login'
import { AuthContext } from '../contexts/authContext'

function App() {

  const {getUser,user} = useContext(AuthContext)
  //axios tutorial

  // const getData = async ()=>{
  //   try {
  //     const {data} = await API.get('/api/lands')
  //     console.log(data);
      
  //   } catch (error) {
  //     console.log(error);
      
  //   }
  // }
  // useEffect(()=>{
  //   getData();
  // },[])

  useEffect(()=>{
    getUser();
  },[])

  
  
  return (
    <>
    <ToastContainer />
    <Navigation />
    <main className="bg-[#eeecec]">
       <Outlet />
    </main>
    </>
  )
}

export default App
