import React from 'react';
import {
  FaLandmark,
  FaCalendarCheck,
  FaFileSignature,
  FaExchangeAlt,
  FaClipboardCheck,
  FaBars,
} from 'react-icons/fa';

const RegistrarSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <div
      className={`fixed left-0 top-0 h-full bg-slate-950 border-r border-white/10 transition-all duration-300 z-50 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="p-5 flex items-center justify-between border-b border-white/10">
        {sidebarOpen && (
          <h2 className="text-white font-bold text-xl">Registrar Portal</h2>
        )}

        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-emerald-400">
          <FaBars />
        </button>
      </div>

      <nav className="p-4 space-y-3">
        <NavItem icon={<FaLandmark />} label="Dashboard" open={sidebarOpen} />
        <NavItem icon={<FaCalendarCheck />} label="Appointments" open={sidebarOpen} />
        <NavItem icon={<FaFileSignature />} label="Deed Execution" open={sidebarOpen} />
        <NavItem icon={<FaExchangeAlt />} label="Mutations" open={sidebarOpen} />
        <NavItem
          icon={<FaClipboardCheck />}
          label="Verification Queue"
          open={sidebarOpen}
        />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, open }) => (
  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition">
    <span className="text-emerald-400">{icon}</span>

    {open && label}
  </button>
);

export default RegistrarSidebar;
