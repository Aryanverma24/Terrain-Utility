import { useEffect, useState } from "react";
import axios from "axios";

const MyLands = () => {
  const [lands, setLands] = useState([]);
  const ownerId = "671b8e8..."; // Example owner ID

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:5000/api/lands/owner/${ownerId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        setLands(response.data);
      } catch (error) {
        console.error("Error fetching lands:", error);
        if (error.response) {
          // Log more details about the error
          console.log("Error response:", error.response);
        }
      }
    };

    fetchLands();
  }, [ownerId]);

  return (
    <div>
      <h1>My Lands</h1>
      <ul>
        {lands.map((land) => (
          <li key={land._id}>{land.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default MyLands;
