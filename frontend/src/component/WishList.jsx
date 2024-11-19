import React, { useContext,useEffect, useState } from "react";
import {API} from "../../utils/API.js"
import { AuthContext } from "../../contexts/authContext.jsx";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useContext(AuthContext);
  console.log('inside wishlist')
  console.log(user)

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await API.get(
          `/api/wishlist/${user._id}`
        );
        setWishlist(response.data.lands);
      } catch (error) {
        console.error(error);
        alert("Error fetching wishlist");
      }
    };

    fetchWishlist();
  }, [user]);

  return (
    <div className="flex justify-center text-green-500 text-3xl">
      <h1>Your Wishlist</h1>
      {wishlist.length > 0 ? (
        <ul>
          {wishlist.map((land) => (
            <li key={land._id}>
              {land.name} - {land.location} - ${land.price}
            </li>
          ))}
        </ul>
      ) : (
        <p>No lands in your wishlist</p>
      )}
    </div>
  );
};

export default Wishlist;
