import React, { useState, useContext } from 'react';
import { AuthContext } from "../../../../contexts/authContext";
import {
    FaCog,
    FaUser,
    FaBell,
    FaShieldAlt,
    FaDatabase,
    FaPalette,
    FaExclamationTriangle
} from "react-icons/fa";
import AdminDashboardLayout from '../AdminDashoardLayout';

const Settings = () => {
    const { user } = useContext(AuthContext);

    const [activeTab, setActiveTab] = useState('general');

    const [settings, setSettings] = useState({
        siteName: 'Bhu-Parichiye',
        siteDescription: 'Professional land management platform',
        adminEmail: 'admin@bhu-parichiye.com',
        maxUsers: 1000,
        allowRegistration: true,
        maintenanceMode: false,
        emailNotifications: true,
        pushNotifications: true,
        darkMode: false,
        language: 'en',
        timezone: 'UTC',
        sessionTimeout: 30,
        backupFrequency: 'daily',
        twoFactorAuth: true
    });

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSaveSettings = () => {
        console.log("Saved Settings:", settings);
        alert("Settings saved successfully!");
    };

    const tabs = [
        { id: 'general', label: 'General', icon: FaCog },
        { id: 'security', label: 'Security', icon: FaShieldAlt },
        { id: 'notifications', label: 'Notifications', icon: FaBell },
        { id: 'appearance', label: 'Appearance', icon: FaPalette },
        { id: 'users', label: 'Users', icon: FaUser },
        { id: 'system', label: 'System', icon: FaDatabase }
    ];

    // Reusable Toggle Component
    const Toggle = ({ value, onClick }) => (
        <button
            onClick={onClick}
            className={`w-12 h-6 rounded-full transition ${
                value ? "bg-emerald-500" : "bg-gray-400"
            }`}
        />
    );

    return (
        <AdminDashboardLayout>
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center">
                    <FaCog className="text-2xl text-white mr-3" />
                    <h2 className="text-3xl font-bold text-white">Settings</h2>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-4 py-2 rounded-lg transition ${
                                    activeTab === tab.id
                                        ? "bg-emerald-500 text-white"
                                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                                }`}
                            >
                                <Icon className="mr-2" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 space-y-6">

                    {/* GENERAL */}
                    {activeTab === "general" && (
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => handleSettingChange("siteName", e.target.value)}
                                placeholder="Site Name"
                                className="w-full p-3 rounded bg-white/10 text-white border border-white/20"
                            />

                            <textarea
                                value={settings.siteDescription}
                                onChange={(e) => handleSettingChange("siteDescription", e.target.value)}
                                placeholder="Site Description"
                                className="w-full p-3 rounded bg-white/10 text-white border border-white/20"
                            />

                            <input
                                type="email"
                                value={settings.adminEmail}
                                onChange={(e) => handleSettingChange("adminEmail", e.target.value)}
                                placeholder="Admin Email"
                                className="w-full p-3 rounded bg-white/10 text-white border border-white/20"
                            />
                        </div>
                    )}

                    {/* SECURITY */}
                    {activeTab === "security" && (
                        <div className="flex justify-between items-center">
                            <span className="text-white">Two-Factor Authentication</span>
                            <Toggle
                                value={settings.twoFactorAuth}
                                onClick={() =>
                                    handleSettingChange("twoFactorAuth", !settings.twoFactorAuth)
                                }
                            />
                        </div>
                    )}

                    {/* NOTIFICATIONS */}
                    {activeTab === "notifications" && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-white">Email Notifications</span>
                                <Toggle
                                    value={settings.emailNotifications}
                                    onClick={() =>
                                        handleSettingChange("emailNotifications", !settings.emailNotifications)
                                    }
                                />
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-white">Push Notifications</span>
                                <Toggle
                                    value={settings.pushNotifications}
                                    onClick={() =>
                                        handleSettingChange("pushNotifications", !settings.pushNotifications)
                                    }
                                />
                            </div>
                        </div>
                    )}

                    {/* APPEARANCE */}
                    {activeTab === "appearance" && (
                        <div className="space-y-4">
                            <select
                                value={settings.language}
                                onChange={(e) => handleSettingChange("language", e.target.value)}
                                className="w-full p-3 rounded bg-white/10 text-white border border-white/20"
                            >
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                            </select>

                            <select
                                value={settings.timezone}
                                onChange={(e) => handleSettingChange("timezone", e.target.value)}
                                className="w-full p-3 rounded bg-white/10 text-white border border-white/20"
                            >
                                <option value="UTC">UTC</option>
                                <option value="IST">India (IST)</option>
                            </select>
                        </div>
                    )}

                    {/* USERS */}
                    {activeTab === "users" && (
                        <div className="space-y-4">
                            <input
                                type="number"
                                value={settings.maxUsers}
                                onChange={(e) =>
                                    handleSettingChange("maxUsers", parseInt(e.target.value))
                                }
                                className="w-full p-3 rounded bg-white/10 text-white border border-white/20"
                            />

                            <div className="flex justify-between items-center">
                                <span className="text-white">Allow Registration</span>
                                <Toggle
                                    value={settings.allowRegistration}
                                    onClick={() =>
                                        handleSettingChange("allowRegistration", !settings.allowRegistration)
                                    }
                                />
                            </div>
                        </div>
                    )}

                    {/* SYSTEM */}
                    {activeTab === "system" && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-white">Maintenance Mode</span>
                                <Toggle
                                    value={settings.maintenanceMode}
                                    onClick={() =>
                                        handleSettingChange("maintenanceMode", !settings.maintenanceMode)
                                    }
                                />
                            </div>

                            <div className="bg-yellow-500/10 p-4 rounded text-yellow-300 flex items-center">
                                <FaExclamationTriangle className="mr-2" />
                                Maintenance mode restricts user access.
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSaveSettings}
                            className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:scale-105 transition"
                        >
                            Save Settings
                        </button>
                    </div>

                </div>
            </div>
        </AdminDashboardLayout>
    );
};

export default Settings;