import {Outlet} from 'react-router-dom'
import {ToastContainer} from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'

function App() {
  
  return (
    <>
    <ToastContainer />
    <main className="py-3 bg-[#eeecec]">
    <h2 className='text-black'>hello</h2>
       <Outlet />
    </main>
    </>
  )
}

export default App
