import { useEffect, useState ,useContext } from 'react'
import { API } from '../../utils/API'
import {AuthContext} from '../../contexts/authContext';
import { toast } from 'react-toastify';
import WishlistLand from './WishlistLand';

const Wishlist = () => {

  const {user} = useContext(AuthContext)
  
  const [Wishlist,setWishlist]= useState([]);

  useEffect(()=>{
    if(user) {
      const fetchWishlist = async () => {
        try {
          const { data } =await API.get(`/api/wishlist/${user._id}`);
          setWishlist(data[0].lands)
          console.log(data[0].lands)
        } catch (error) {
          console.log(error)
          toast.success("lands are fetched")
        } 
      }
      fetchWishlist();
    }
  },[user])

  return (
        <>
             <div className='bg-black text-white h-screen'>
                <h1 className='text-4xl text-center pt-[2rem]'>Favorite <span className='text-green-500'>Lands</span></h1>
                <div className='mt-[3rem]'>
                    <div className="flex flex-wrap ml-4">
                      {Wishlist.length==0 && 
                      <>
                        <div className="flex  flex-1 justify-around mr-[4rem]">
                        <img className='w-[500px] mt-0 h-[320px] rounded-3xl' src="https://cdn.dribbble.com/userupload/23008727/file/original-561c59bfb6274bc4d22b66b0e73b47cc.gif"></img>
                        </div>
                      </>}
                      {Wishlist.map((landId) => (
                        <div key={landId}>
                            <WishlistLand landId={landId} />
                        </div>
                      ))}
                    </div>
                </div>
             </div>
        </>
  )
}

export default Wishlist