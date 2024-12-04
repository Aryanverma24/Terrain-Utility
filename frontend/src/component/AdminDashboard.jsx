import React, { useEffect, useState, useContext } from 'react';
import { API } from '../../utils/API';
import { AuthContext } from "../../contexts/authContext";
import { MdDeleteForever, MdAdminPanelSettings } from "react-icons/md";
import { toast } from 'react-toastify';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

// Register chart components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const { user } = useContext(AuthContext);

    const [lands,setLands] = useState([]);
    const [landTypesCount, setLandTypesCount] = useState({});
    
    useEffect(()=>{
        fetchLands()
    },[])

    const fetchLands = async() => {
        try {
            const response =await API.get('/api/lands')
            setLands(response.data)
            updateLandTypesCount(response.data)
        } catch (error) {
            toast.error("land details in not fetch")
        }
    }

    console.log(lands)

    const updateLandTypesCount = (lands) => {
        const count = lands.reduce((acc, land) => {
            console.log("Land Type:", land.landtype);
          const landType = land.landtype || 'Unknown'; 
          acc[landType] = (acc[landType] || 0) + 1;
          return acc;
        }, {});
        
        // Update the state with the land type count
        setLandTypesCount(count);
      };
      

      
      useEffect(() => {
          const fetchUsers = async () => {
              const response = await API.get('/api/users');
              setUsers(response.data);
            };
            
            fetchUsers();
        }, []);
        
        const deleteUser = async (id, username) => {
            await API.delete(`/api/users/${id}`);
            setUsers(users.filter(user => user._id !== id));
            toast.success(`${username} is removed successfully`);
        };
        
        const toastMsg = async (username) => {
            toast.error(`${username} is Admin. You can't remove the admin!!`);
        };

        
        const toastMsgforLand = async () => {
            toast.error('Land cannot be deleted!!');
        };
        
        // Prepare data for Pie chart
        const getAdminCount = () => {
            const adminCount = users.filter(user => user.isAdmin).length;
            const nonAdminCount = users.length - adminCount;
            return [adminCount, nonAdminCount];
        };
        const pieLandData = {
            labels: Object.keys(landTypesCount),  // Land types (Residential, Commercial, etc.)
            datasets: [{
              data: Object.values(landTypesCount),  // Count of each land type
              backgroundColor: ['#ff6384', '#36a2eb', '#4caf50', '#ffce56'],  // Customize the colors
              hoverOffset: 4
            }]
          };
          
          // Delete a land
          const deleteLand = async (id) => {
            try {
              await API.delete(`/api/lands/${id}`);
              setLands(lands.filter(land => land._id !== id));
              toast.success(`Land has been deleted successfully.`);
            } catch (error) {
              toast.error(`Error deleting in land.`);
            }
          };
        

    const pieData = {
        labels: ['Admin Users', 'Non-Admin Users'],
        datasets: [
            {
                data: getAdminCount(),
                backgroundColor: ['#4caf50', '#f44336'],
                hoverOffset: 4,
            },
        ],
    };

    return (
        <div className='min-h-screen bg-black p-6'>
            <div className='ml-[3.6rem] mr-3'>
                <h1 className='text-3xl font-bold text-center text-green-400 mb-6'>Admin Dashboard</h1>
                
                <div className='bg-slate-700 rounded-[2rem]'>
                <h2 className="pt-5 m-0 text-xl text-center font-semibold text-gray-300 mb-4">User Role Distribution</h2>
                <div className="m-5 mt-0  pb-[2rem] flex space-x-8 mb-6">
                    {/* Pie Chart Section */}
                    <div className="flex-1">
                        <div className="w-[250px] h-[250px] mx-auto">
                            <Pie data={pieData} />
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="flex-3 overflow-x-auto bg-gray-800 shadow-md rounded-lg w-full">
                        <table className='min-w-full'>
                            <thead className='bg-gray-700'>
                                <tr>
                                    <th className='py-3 px-4 text-left text-green-300 font-semibold'>Username</th>
                                    <th className='py-3 px-4 text-left text-green-300 font-semibold'>Email</th>
                                    <th className='py-3 px-4 text-left text-green-300 font-semibold'>Contact Number</th>
                                    <th className='py-3 px-4 text-left text-green-300 font-semibold'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users?.map(user => (
                                    <tr key={user._id} className='border-b border-gray-600 hover:bg-gray-700'>
                                        <td className='py-3 px-4 text-gray-300'>{user.username}</td>
                                        <td className='py-3 px-4 text-gray-300'>{user.email}</td>
                                        <td className='py-3 px-4 text-gray-300'>{user.contactNumber}</td>
                                        <td className='py-3 px-4'>
                                            {!user?.isAdmin ? (
                                                <button 
                                                    onClick={() => deleteUser(user._id, user.username)} 
                                                    className='bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition duration-200'
                                                >
                                                    <MdDeleteForever />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => toastMsg(user.username)}
                                                    className='bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 transition duration-200'
                                                >
                                                    <MdAdminPanelSettings />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                </div>

                <div className='bg-slate-700 rounded-[2rem]'>
                <h2 className="pt-5 m-0 text-xl text-center font-semibold text-gray-300 mb-4">Land Type Distribution</h2>
                <div className="m-5 mt-0  pb-[2rem] flex space-x-8 mb-6">
                    {/* Pie Chart Section */}
                    <div className="flex-1">
                        <div className="w-[250px] h-[250px] mx-auto">
                            <Pie data={pieLandData} />
                        </div>
                    </div>

                                     {/* Table Section */}
                    <div className="flex-3 overflow-x-auto bg-gray-800 shadow-md rounded-lg w-full">
                        <table className='min-w-full'>
                            <thead className='bg-gray-700'>
                                <tr>
                                    <th className='py-3 px-4 text-left text-green-300 font-semibold'>LandType</th>
                                    <th className='py-3 px-4 text-left text-green-300 font-semibold'>Owner</th>
                                    <th className='py-3 px-4 text-left text-green-300 font-semibold'>State</th>
                                    <th className='py-3 px-4 text-left text-green-300 font-semibold'>City</th>
                                    <th className='py-3 px-4 text-left text-green-300 font-semibold'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lands?.map(land => (
                                    <tr key={land._id} className='border-b border-gray-600 hover:bg-gray-700'>
                                        <td className='py-3 px-4 text-gray-300'>{land.landtype}</td>
                                        <td className='py-3 px-4 text-gray-300'>{land.ownerName}</td>
                                        <td className='py-3 px-4 text-gray-300'>{land.state}</td>
                                        <td className='py-3 px-4 text-gray-300'>{land.city}</td>
                                        <td className='py-3 px-4'>
                                            {land.ownerName !== user.username ? (
                                                <button 
                                                    onClick={() => deleteLand(land._id)} 
                                                    className='bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition duration-200'
                                                >
                                                    <MdDeleteForever />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => toastMsgforLand()}
                                                    className='bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 transition duration-200'
                                                >
                                                    <MdAdminPanelSettings />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                        </div>
                        </div> 
                   </div>
        </div>
    );
};

export default AdminDashboard;
