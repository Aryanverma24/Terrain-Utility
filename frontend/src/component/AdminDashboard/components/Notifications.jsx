import React, { useEffect, useState, useContext } from 'react';
import { API } from '../../../../utils/API';
import { AuthContext } from "../../../../contexts/authContext";
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaUser, FaLandmark } from "react-icons/fa";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            
            // Generate sample notifications data
            const sampleNotifications = [
                {
                    id: 1,
                    type: "success",
                    title: "New User Registration",
                    message: "John Doe has successfully registered on the platform",
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    read: false,
                    action: "View Profile"
                },
                {
                    id: 2,
                    type: "info",
                    title: "Land Listing Approved",
                    message: "Your land 'Commercial Property in Downtown' has been approved and is now live",
                    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    read: false,
                    action: "View Listing"
                },
                {
                    id: 3,
                    type: "warning",
                    title: "Payment Failed",
                    message: "Payment processing failed for land #1234. Please update payment information.",
                    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                    read: false,
                    action: "Update Payment"
                },
                {
                    id: 4,
                    type: "error",
                    title: "System Maintenance",
                    message: "Scheduled system maintenance on March 25, 2024 from 2:00 AM to 4:00 AM EST",
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    read: false,
                    action: "View Schedule"
                },
                {
                    id: 5,
                    type: "success",
                    title: "Land Sold",
                    message: "Congratulations! Your land 'Residential Plot' has been sold to buyer Sarah Wilson",
                    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    read: false,
                    action: "View Transaction"
                },
                {
                    id: 6,
                    type: "info",
                    title: "New Admin User",
                    message: "Admin privileges have been granted to Michael Johnson (mjohnson@admin.com)",
                    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                    read: false,
                    action: "Manage User"
                },
                {
                    id: 7,
                    type: "warning",
                    title: "Security Alert",
                    message: "Multiple failed login attempts detected for user admin@example.com from IP address 192.168.1.100",
                    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                    read: false,
                    action: "Review Security"
                },
                {
                    id: 8,
                    type: "info",
                    title: "Platform Update",
                    message: "New features have been added to the admin dashboard including advanced analytics and reporting tools",
                    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                    read: false,
                    action: "Explore Features"
                }
            ];
            
            setNotifications(sampleNotifications);
        };
        
        fetchNotifications();
    }, []);

    const markAsRead = (id) => {
        setNotifications(notifications.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
        ));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(notif => notif.id !== id));
    };

    const handleNotificationAction = (id, action) => {
        const notification = notifications.find(n => n.id === id);
        if (notification) {
            // In a real app, this would handle the specific action
            console.log(`Handling action: ${action} for notification: ${notification.title}`);
            markAsRead(id);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="text-emerald-400" />;
            case 'info':
                return <FaInfoCircle className="text-blue-400" />;
            case 'warning':
                return <FaExclamationTriangle className="text-yellow-400" />;
            case 'error':
                return <FaExclamationTriangle className="text-red-400" />;
            default:
                return <FaBell className="text-gray-400" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'success':
                return 'bg-emerald-500/20 border-emerald-400';
            case 'info':
                return 'bg-blue-500/20 border-blue-400';
            case 'warning':
                return 'bg-yellow-500/20 border-yellow-400';
            case 'error':
                return 'bg-red-500/20 border-red-400';
            default:
                return 'bg-gray-500/20 border-gray-400';
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const notifTime = new Date(timestamp);
        const diffMs = now - notifTime;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            return `${diffDays}d ago`;
        } else if (diffHours > 0) {
            return `${diffHours}h ago`;
        } else {
            return `${diffMins}m ago`;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center mb-8">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl mr-4">
                    <FaBell className="text-white text-2xl" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white">Notifications</h2>
                    <p className="text-gray-400 text-sm mt-1">System alerts and updates</p>
                </div>
            </div>

            {/* Notification Stats */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 text-center hover:bg-white/15 transition-all duration-300'>
                    <FaBell className="text-3xl text-blue-400 mb-3" />
                    <p className='text-2xl font-bold text-white'>{notifications.length}</p>
                    <p className='text-gray-400 text-sm mt-1'>Total Notifications</p>
                </div>
                
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 text-center hover:bg-white/15 transition-all duration-300'>
                    <FaCheckCircle className="text-3xl text-emerald-400 mb-3" />
                    <p className='text-2xl font-bold text-white'>{notifications.filter(n => n.type === 'success').length}</p>
                    <p className='text-gray-400 text-sm mt-1'>Success</p>
                </div>
                
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 text-center hover:bg-white/15 transition-all duration-300'>
                    <FaInfoCircle className="text-3xl text-blue-400 mb-3" />
                    <p className='text-2xl font-bold text-white'>{notifications.filter(n => n.type === 'info').length}</p>
                    <p className='text-gray-400 text-sm mt-1'>Information</p>
                </div>
                
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 text-center hover:bg-white/15 transition-all duration-300'>
                    <FaExclamationTriangle className="text-3xl text-yellow-400 mb-3" />
                    <p className='text-2xl font-bold text-white'>{notifications.filter(n => n.type === 'warning').length}</p>
                    <p className='text-gray-400 text-sm mt-1'>Warnings</p>
                </div>
                
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 text-center hover:bg-white/15 transition-all duration-300'>
                    <FaExclamationTriangle className="text-3xl text-red-400 mb-3" />
                    <p className='text-2xl font-bold text-white'>{notifications.filter(n => n.type === 'error').length}</p>
                    <p className='text-gray-400 text-sm mt-1'>Errors</p>
                </div>
            </div>

            {/* Notifications List */}
            <div className='bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6'>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Recent Notifications</h3>
                    <div className="flex space-x-4">
                        <button className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-all duration-200">
                            Mark All as Read
                        </button>
                        <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200">
                            Clear All
                        </button>
                    </div>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {notifications?.map(notification => (
                        <div 
                            key={notification.id}
                            className={`p-4 rounded-lg border transition-all duration-200 ${
                                notification.read 
                                    ? 'bg-white/5 border-white/20 opacity-60' 
                                    : 'bg-white/10 border-white/20 hover:bg-white/15'
                            } ${getTypeColor(notification.type)}`}
                        >
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mr-3">
                                    {getTypeIcon(notification.type)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-white text-sm">{notification.title}</h4>
                                        <span className="text-xs text-gray-400">{formatTimeAgo(notification.timestamp)}</span>
                                    </div>
                                    
                                    <p className="text-gray-300 text-sm leading-relaxed">{notification.message}</p>
                                    
                                    <div className="flex items-center space-x-2 mt-3">
                                        <button
                                            onClick={() => handleNotificationAction(notification.id, notification.action)}
                                            className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded text-sm transition-all duration-200"
                                        >
                                            {notification.action}
                                        </button>
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded text-sm transition-all duration-200"
                                        >
                                            Mark as Read
                                        </button>
                                        <button
                                            onClick={() => deleteNotification(notification.id)}
                                            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-all duration-200"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
