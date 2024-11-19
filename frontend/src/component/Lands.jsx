import React, { useEffect, useState } from 'react'
import { FaHome } from "react-icons/fa";
import { API } from '../../utils/API';
import AuthState from '../../contexts/authContext';
// import { useContext } from 'react';

const Lands = () => {
  // const { user } = useContext(AuthState)
  const [landtype,setLandtype] = useState('');
  const [lands,setLands] = useState([]);
  
  useEffect(()=>{
    API.get(`/api/lands/${landtype}`)
    .then(response => {
      console.log(lands)
      setLands(response.data)
    }).catch(error=>{
      console.log(error)
    })
  },[landtype])

  return (
    <div className=' bg-black text-white pt-[3rem]'>
        <h2 className='text-center text-3xl'>Lands</h2>
       
        <div className="flex justify-center p-6">
             <FaHome className="mr-3 icons" />   
             <select name="landtype"  id="landtype"
                className='text-green-600 border-none outline-none focus:ring-2 px-2 mx-1 rounded-xl'>
                <option value="Residental" onChange={e =>setLandtype(e.target.value)}>Residental</option>
                <option value="Industrial" onChange={e =>setLandtype(e.target.value)}>Industrial</option>
                <option value="Agriculture" onChange={e=>setLandtype(e.target.value)}>Agriculture</option>
                <option value="Farm" onChange={e=>setLandtype(e.target.value)}>Farm</option>                
             </select>
        </div>
       {lands.map(land=>(
          <div key={land}>
            {land.landtype}
          </div>
       ))}
    </div>
  )
}

export default Lands