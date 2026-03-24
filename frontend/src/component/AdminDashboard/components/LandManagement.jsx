import React, { useEffect, useState, useContext } from 'react';
import { API } from '../../../../utils/API';
import { AuthContext } from "../../../../contexts/authContext";
import { MdDeleteForever, MdLandscape } from "react-icons/md";
import { FaLandmark, FaTrash } from "react-icons/fa";
import { toast } from 'react-toastify';
import AdminDashboardLayout from '../AdminDashoardLayout';

const LandManagement = () => {
    const [lands, setLands] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchLands = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            
            const response = await API.get('/api/lands/get-land', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            let allLands = Array.isArray(response.data.data) ? response.data.data : [];
            setLands(allLands);
        };
        
        fetchLands();
    }, []);

    const deleteLand = async (id) => {
        try {
            await API.delete(`/api/lands/${id}`);
            setLands(lands.filter(land => land._id !== id));
            toast.success(`Land has been deleted successfully.`);
        } catch (error) {
            toast.error(`Error deleting land.`);
        }
    };

    const handleDeleteLand = async (id, landName) => {
        if (window.confirm(`Are you sure you want to delete land "${landName}"?`)) {
            await deleteLand(id);
        }
    };

    return (
        <AdminDashboardLayout>
            <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center mb-8">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl mr-4">
                    <FaLandmark className="text-white text-2xl" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white">Land Management</h2>
                    <p className="text-gray-400 text-sm mt-1">Oversee property listings and approvals</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300'>
                    <div className='text-center'>
                        <p className='text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>Total Lands</p>
                        <p className='text-4xl font-bold text-white'>{lands.length}</p>
                        <p className='text-emerald-400 text-sm mt-2'>Registered properties</p>
                    </div>
                </div>
                
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300'>
                    <div className='text-center'>
                        <p className='text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>Approved</p>
                        <p className='text-4xl font-bold text-white'>{lands.filter(land => land.status === 'approved').length}</p>
                        <p className='text-emerald-400 text-sm mt-2'>Active listings</p>
                    </div>
                </div>
                
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300'>
                    <div className='text-center'>
                        <p className='text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>Pending</p>
                        <p className='text-4xl font-bold text-white'>{lands.filter(land => land.status === 'pending').length}</p>
                        <p className='text-emerald-400 text-sm mt-2'>Awaiting review</p>
                    </div>
                </div>
            </div>

            {/* Lands Table */}
            <div className='bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6'>
                <h3 className='text-xl font-semibold text-white mb-6'>All Properties</h3>
                <div className='overflow-x-auto'>
                    <table className='w-full'>
                        <thead>
                            <tr className='border-b border-white/20'>
                                <th className='py-3 px-4 text-left text-emerald-400 font-semibold'>Property</th>
                                <th className='py-3 px-4 text-left text-emerald-400 font-semibold'>Owner</th>
                                <th className='py-3 px-4 text-left text-emerald-400 font-semibold'>Location</th>
                                <th className='py-3 px-4 text-left text-emerald-400 font-semibold'>Status</th>
                                <th className='py-3 px-4 text-left text-emerald-400 font-semibold'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lands?.map(land => (
                                <tr key={land._id} className='border-b border-white/10 hover:bg-white/10 transition-all duration-200'>
                                    <td className='py-3 px-4 text-white'>
                                        <div>
                                            <p className='font-medium text-white mb-1'>{land.title || 'Untitled Property'}</p>
                                            <span className='bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 px-2 py-1 rounded-lg text-sm font-medium border border-emerald-400/30'>
                                                {land.landtype || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className='py-3 px-4 text-gray-300 text-sm'>{land.ownerName || 'N/A'}</td>
                                    <td className='py-3 px-4 text-gray-300 text-sm'>{land.city}, {land.state}</td>
                                    <td className='py-3 px-4 text-white'>
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                            land.status === 'approved' 
                                                ? 'bg-emerald-500/20 text-emerald-400' 
                                                : land.status === 'pending'
                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                : 'bg-gray-500/20 text-gray-400'
                                        }`}>
                                            {land.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className='py-3 px-4'>
                                        {land.ownerName !== user.username ? (
                                            <button 
                                                onClick={() => handleDeleteLand(land._id, land.title || 'Untitled Property')} 
                                                className='bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-all duration-200 group hover:scale-105'
                                                title="Delete Land"
                                            >
                                                <FaTrash className='group-hover:scale-110 transition-transform' />
                                            </button>
                                        ) : (
                                            <div className='bg-yellow-500/20 text-yellow-400 p-2 rounded-lg' title="Your Land">
                                                <MdLandscape />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </AdminDashboardLayout>
    );
};

export default LandManagement;
