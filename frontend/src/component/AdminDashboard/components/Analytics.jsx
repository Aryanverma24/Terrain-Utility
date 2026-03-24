import React, { useEffect, useState, useContext } from 'react';
import { API } from '../../../../utils/API';
import { AuthContext } from "../../../../contexts/authContext";
import { FaChartBar, FaChartPie, FaUsers, FaLandmark } from "react-icons/fa";
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, BarElement, LinearScale } from 'chart.js';
import AdminDashboardLayout from '../AdminDashoardLayout';

// Register chart components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, BarElement, LinearScale);

const Analytics = () => {
    const [users, setUsers] = useState([]);
    const [lands, setLands] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            
            // Fetch users
            const usersResponse = await API.get('/api/users');
            setUsers(usersResponse.data);
            
            // Fetch lands
            const landsResponse = await API.get('/api/lands/get-land', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            let allLands = Array.isArray(landsResponse.data.data) ? landsResponse.data.data : [];
            setLands(allLands);
        };
        
        fetchData();
    }, []);

    // Prepare data for charts
    const getUserStats = () => {
        const adminCount = users.filter(user => user.isAdmin).length;
        const regularCount = users.filter(user => !user.isAdmin).length;
        return [adminCount, regularCount];
    };

    const getLandStats = () => {
        const landTypes = {};
        lands.forEach(land => {
            const type = land.landtype || 'Unknown';
            landTypes[type] = (landTypes[type] || 0) + 1;
        });
        
        return Object.keys(landTypes).map(type => ({
            label: type,
            count: landTypes[type]
        }));
    };

    const getMonthlyData = () => {
        const monthlyData = [];
        for (let i = 0; i < 6; i++) {
            monthlyData.push({
                month: `Month ${i + 1}`,
                users: Math.floor(Math.random() * 50) + 100,
                lands: Math.floor(Math.random() * 30) + 50,
                revenue: Math.floor(Math.random() * 10000) + 5000
            });
        }
        return monthlyData;
    };

    const pieUserData = {
        labels: ['Admin Users', 'Regular Users'],
        datasets: [{
            data: getUserStats(),
            backgroundColor: ['#8b5cf6', '#10b981'],
            hoverOffset: 4,
        }]
    };

    const pieLandData = {
        labels: getLandStats().map(stat => stat.label),
        datasets: [{
            data: getLandStats().map(stat => stat.count),
            backgroundColor: ['#4caf50', '#f44336', '#ff9800', '#2196f3', '#ff5722'],
            hoverOffset: 4,
        }]
    };

    const barChartData = {
        labels: getMonthlyData().map(data => data.month),
        datasets: [
            {
                label: 'New Users',
                data: getMonthlyData().map(data => data.users),
                backgroundColor: '#8b5cf6',
                borderColor: '#8b5cf6',
                borderWidth: 1
            },
            {
                label: 'New Lands',
                data: getMonthlyData().map(data => data.lands),
                backgroundColor: '#4caf50',
                borderColor: '#4caf50',
                borderWidth: 1
            },
            {
                label: 'Revenue',
                data: getMonthlyData().map(data => data.revenue),
                backgroundColor: '#ff9800',
                borderColor: '#ff9800',
                borderWidth: 1
            }
        ]
    };

    return (
        <AdminDashboardLayout>
            <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center mb-8">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl mr-4">
                    <FaChartBar className="text-white text-2xl" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white">Analytics</h2>
                    <p className="text-gray-400 text-sm mt-1">Comprehensive insights and platform metrics</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300'>
                    <div className='text-center'>
                        <FaUsers className="text-3xl text-emerald-400 mb-3" />
                        <p className='text-2xl font-bold text-white'>{users.length}</p>
                        <p className='text-gray-400 text-sm mt-1'>Total Users</p>
                    </div>
                </div>
                
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300'>
                    <div className='text-center'>
                        <FaLandmark className="text-3xl text-emerald-400 mb-3" />
                        <p className='text-2xl font-bold text-white'>{lands.length}</p>
                        <p className='text-gray-400 text-sm mt-1'>Total Lands</p>
                    </div>
                </div>
                
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300'>
                    <div className='text-center'>
                        <div className="text-3xl text-purple-400 mb-3">📈</div>
                        <p className='text-2xl font-bold text-white'>{users.filter(u => u.isAdmin).length}</p>
                        <p className='text-gray-400 text-sm mt-1'>Admin Users</p>
                    </div>
                </div>
                
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300'>
                    <div className='text-center'>
                        <div className="text-3xl text-yellow-400 mb-3">⏠</div>
                        <p className='text-2xl font-bold text-white'>{lands.filter(land => land.status === 'pending').length}</p>
                        <p className='text-gray-400 text-sm mt-1'>Pending Lands</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* User Distribution Chart */}
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6'>
                    <h3 className='text-xl font-semibold text-white mb-6 text-center'>User Distribution</h3>
                    <div className='h-80'>
                        <Pie data={pieUserData} options={{
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        color: 'white',
                                        font: {
                                            size: 14
                                        }
                                    }
                                }
                            }
                        }} />
                    </div>
                </div>

                {/* Land Type Distribution Chart */}
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6'>
                    <h3 className='text-xl font-semibold text-white mb-6 text-center'>Land Type Distribution</h3>
                    <div className='h-80'>
                        <Pie data={pieLandData} options={{
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        color: 'white',
                                        font: {
                                            size: 14
                                        }
                                    }
                                }
                            }
                        }} />
                    </div>
                </div>
            </div>

            {/* Monthly Trends Chart */}
            <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 lg:col-span-2'>
                    <h3 className='text-xl font-semibold text-white mb-6 text-center'>Monthly Trends</h3>
                    <div className='h-80'>
                        <Bar data={barChartData} options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                    labels: {
                                        color: 'white',
                                        font: {
                                            size: 12
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                    },
                                    ticks: {
                                        color: 'white'
                                    }
                                },
                                x: {
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                    },
                                    ticks: {
                                        color: 'white'
                                    }
                                }
                            }
                        }} />
                    </div>
                </div>
            </div>
        </AdminDashboardLayout>
    );
};

export default Analytics;
