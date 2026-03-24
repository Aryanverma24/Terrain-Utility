import React, { useEffect, useState, useContext } from 'react';
import { API } from '../../../../utils/API';
import { AuthContext } from "../../../../contexts/authContext";
import { MdDeleteForever } from "react-icons/md";
import { FaUsers, FaTrash, FaUserShield } from "react-icons/fa";
import { toast } from 'react-toastify';
import AdminDashboardLayout from '../AdminDashoardLayout';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const { user } = useContext(AuthContext);

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

    const handleDeleteUser = async (id, username) => {
        if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
            await deleteUser(id, username);
        }
    };

    return (
        <AdminDashboardLayout>
            <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center mb-8">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl mr-4">
                    <FaUsers className="text-white text-2xl" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white">User Management</h2>
                    <p className="text-gray-400 text-sm mt-1">Monitor and manage platform users</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300'>
                    <div className='text-center'>
                        <p className='text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>Total Users</p>
                        <p className='text-4xl font-bold text-white'>{users.length}</p>
                        <p className='text-emerald-400 text-sm mt-2'>Registered accounts</p>
                    </div>
                </div>
                
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300'>
                    <div className='text-center'>
                        <p className='text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>Admin Users</p>
                        <p className='text-4xl font-bold text-white'>{users.filter(u => u.isAdmin).length}</p>
                        <p className='text-emerald-400 text-sm mt-2'>System administrators</p>
                    </div>
                </div>
                
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300'>
                    <div className='text-center'>
                        <p className='text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>Regular Users</p>
                        <p className='text-4xl font-bold text-white'>{users.filter(u => !u.isAdmin).length}</p>
                        <p className='text-emerald-400 text-sm mt-2'>Standard accounts</p>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">User Accounts</h3>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-400">
                            Total: <span className="text-emerald-400 font-bold">{users.length}</span>
                        </span>
                        <span className="text-sm text-gray-400">
                            Admins: <span className="text-purple-400 font-bold">{users.filter(u => u.isAdmin).length}</span>
                        </span>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/20">
                                <th className="py-3 px-4 text-left text-emerald-400 font-semibold">User</th>
                                <th className="py-3 px-4 text-left text-emerald-400 font-semibold">Email</th>
                                <th className="py-3 px-4 text-left text-emerald-400 font-semibold">Contact</th>
                                <th className="py-3 px-4 text-left text-emerald-400 font-semibold text-center">Role</th>
                                <th className="py-3 px-4 text-center text-emerald-400 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map(user => (
                                <tr key={user._id} className="border-b border-white/10 hover:bg-white/10 transition-all duration-200">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center">
                                            <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${user.isAdmin ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-emerald-500 to-cyan-500'}`}>
                                                <span className="text-white text-sm font-bold">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-white font-medium">{user.username}</span>
                                                {user.isAdmin && (
                                                    <span className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-400/30">Admin</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-300 text-sm">{user.email}</td>
                                    <td className="py-3 px-4 text-gray-300 text-sm">{user.contactNumber || 'N/A'}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            user.isAdmin 
                                                ? 'bg-purple-500/20 text-purple-400 border border-purple-400/30' 
                                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                                        }`}>
                                            {user.isAdmin ? 'Administrator' : 'User'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        {!user?.isAdmin ? (
                                            <button 
                                                onClick={() => handleDeleteUser(user._id, user.username)} 
                                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-all duration-200 group hover:scale-105"
                                                title="Delete User"
                                            >
                                                <MdDeleteForever className="text-lg" />
                                            </button>
                                        ) : (
                                            <div className="ml-6 bg-purple-500/20 w-10 h-10 text-purple-400 p-2 rounded-lg flex items-center justify-center" title="Admin User">
                                                <FaUserShield />
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

export default UserManagement;
