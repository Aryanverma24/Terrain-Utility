import React, { useEffect, useState, useContext } from 'react';
import { API } from '../../../../utils/API';
import { AuthContext } from '../../../../contexts/authContext';
import {
  FaClipboardList,
  FaFileAlt,
  FaDownload,
  FaExclamationTriangle,
  FaCheckCircle,
} from 'react-icons/fa';
import AdminDashboardLayout from '../AdminDashoardLayout';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [lands, setLands] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch lands
        const landsResponse = await API.get('/api/lands/get-land', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allLands = Array.isArray(landsResponse.data.data)
          ? landsResponse.data.data
          : [];

        setLands(allLands);

        // Sample Reports
        const sampleReports = [
          {
            id: 1,
            title: 'User Registration Report',
            type: 'User Management',
            date: new Date().toISOString().split('T')[0],
            status: 'completed',
            description: 'Monthly user registration statistics',
            data: {
              totalUsers: 150,
              newUsers: 25,
              activeUsers: 120,
              conversionRate: '16.7%',
            },
          },
          {
            id: 2,
            title: 'Land Listing Report',
            type: 'Land Management',
            date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
            status: 'completed',
            description: 'Weekly land listing statistics',
            data: {
              totalListings: allLands.length,
              pendingApproval: allLands.filter((l) => l.status === 'pending').length,
              approvedListings: allLands.filter((l) => l.status === 'approved').length,
              averagePrice: allLands.length
                ? (
                    allLands.reduce((sum, l) => sum + (l.price || 0), 0) / allLands.length
                  ).toFixed(2)
                : 0,
            },
          },
          {
            id: 3,
            title: 'System Activity Log',
            type: 'System',
            date: new Date().toISOString().split('T')[0],
            status: 'completed',
            description: 'System activity summary',
            data: {
              logins: 342,
              failedAttempts: 12,
              newRegistrations: 25,
              passwordChanges: 8,
            },
          },
          {
            id: 4,
            title: 'Revenue Report',
            type: 'Financial',
            date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
            status: 'completed',
            description: 'Monthly revenue report',
            data: {
              totalRevenue: '$125,430',
              landSales: 45,
              avgTransaction: '$2,787',
              growthRate: '12.3%',
            },
          },
          {
            id: 5,
            title: 'Security Audit',
            type: 'Security',
            date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
            status: 'in_progress',
            description: 'Security audit report',
            data: {
              vulnerabilities: 2,
              criticalIssues: 0,
              complianceScore: '94%',
            },
          },
        ];

        setReports(sampleReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  const handleDownloadReport = (reportId, reportTitle) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    const blob = new Blob([JSON.stringify(report.data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle.replace(/\s+/g, '_')}.json`;
    link.click();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-400" />;
      case 'in_progress':
        return <FaExclamationTriangle className="text-yellow-400" />;
      case 'failed':
        return <FaExclamationTriangle className="text-red-400" />;
      default:
        return <FaFileAlt className="text-gray-400" />;
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl mr-4">
            <FaClipboardList className="text-white text-2xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Reports</h2>
            <p className="text-gray-400 text-sm mt-1">System reports and analytics</p>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition"
            >
              {/* Top */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                {getStatusIcon(report.status)}
              </div>

              <p className="text-gray-400 text-sm mb-3">{report.description}</p>

              {/* Actions */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleDownloadReport(report.id, report.title)}
                  className="flex items-center px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
              </div>

              {/* Report Data Preview */}
              <div className="mt-4 p-4 bg-white/5 rounded-lg">
                <h4 className="text-sm text-gray-300 mb-3">Key Metrics</h4>

                <div className="grid grid-cols-2 gap-4">
                  {report.data && Object.entries(report.data).length > 0 ? (
                    Object.entries(report.data).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <p className="text-xs text-gray-400 uppercase">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </p>
                        <p className="text-white font-bold">{value ?? 'N/A'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 col-span-2 text-center">
                      No data available
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Reports"
            value={reports.length}
            icon={<FaClipboardList />}
          />
          <StatCard
            title="Completed"
            value={reports.filter((r) => r.status === 'completed').length}
            icon={<FaCheckCircle />}
          />
          <StatCard
            title="In Progress"
            value={reports.filter((r) => r.status === 'in_progress').length}
            icon={<FaExclamationTriangle />}
          />
          <StatCard
            title="Financial"
            value={reports.filter((r) => r.type === 'Financial').length}
            icon={'📊'}
          />
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

// Small reusable card
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white/10 p-6 rounded-2xl text-center">
    <div className="text-3xl mb-2">{icon}</div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-gray-400 text-sm">{title}</p>
  </div>
);

export default Reports;
