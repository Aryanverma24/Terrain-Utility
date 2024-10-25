import { AuthContext } from "../../contexts/authContext";
import { useContext, useEffect, useState } from "react";
import { API } from "../../utils/API";
import { Link } from "react-router-dom";

const Home = () => {
  const { user } = useContext(AuthContext);
  console.log(user, "user");

  const [lands, setLands] = useState([]);

  useEffect(() => {
    if (user?._id) {
      API.get(`/api/lands/owner/${user._id}`)
        .then((response) => {
          setLands(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [user]);

  return (
    <>
      <div className="bg-black text-white h-full">
        {user?.username ? (
          <>
            <div className="flex justify-between  mx-[2rem]">
              <div className="text-2xl text-center ml-[32rem]">
                <h2 className="pt-[3rem] font-semibold">
                  WELCOME{" "}
                  <span className="font-bold uppercase text-green-600">
                    {user?.username}
                  </span>
                </h2>
              </div>
              <div
                className="mt-[2.5rem] py-1 px-2 rounded-2xl font-bold text-xl bg-green-400
                  hover:bg-green-600 hover:text-orange-400"
              >
                <Link to="/uploads"> Upload Lands</Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-xl text-center">
              <h2 className="pt-[3rem] font-semibold">WELCOME</h2>
            </div>
          </>
        )}

        <ul className="flex justify-evenly ml-[5rem] mr-[1rem] flex-wrap">
          {lands.map((land) => (
            <div key={land.id} className="w-[20rem]">
              <div className="bg-blue-200 p-[0.5rem] m-5 rounded-xl">
                {land.landtype == "industrial" ? (
                  <>
                    <img
                      src="https://thumbs.dreamstime.com/b/leased-industrial-land-sign-advertises-acreages-lease-72963893.jpg?w=768"
                      alt="industrial"
                      className="rounded-xl"
                    />
                  </>
                ) : land.landtype == "residential" ? (
                  <>
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXegl3w1mUrzaDncOWIWe5YEGnI_HdWYIk7w&s"
                      alt="industrial"
                      className="rounded-xl"
                    />
                  </>
                ) : (
                  <></>
                )}
                <div className="text-black text-md mt-[0.5rem] px-[0.5rem]">
                  <h2>
                    LAND TYPE : <span>{land.landtype}</span>
                  </h2>
                  <p>OWNER :{land.ownerName}</p>
                  <p>CITY :{land.city}</p>
                  <p>STATE{land.state}</p>
                  <p>PINCODE : {land.pincode}</p>
                </div>
              </div>
            </div>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Home;
