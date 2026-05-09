
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { API } from '../../../utils/API';
import RegistrarDashboardLayout from './RegistrarDashboardLayout';
import { toast } from "react-toastify";
import {
  FaCalendarCheck,
  FaFileSignature,
  FaExchangeAlt,
  FaClock,
  FaArrowUp,
  FaCheckCircle,
} from 'react-icons/fa';

const RegistrarDashboard = () => {
    //states for appoinment 
   const [todayAppointments, setTodayAppointments] = useState([]);
const [upcomingAppointments, setUpcomingAppointments] = useState([]);
const [loading, setLoading] = useState(true);
const navigate = useNavigate();
//states for mutation
const [pendingMutations, setPendingMutations] = useState([]);
const [mutationLoading, setMutationLoading] = useState(true);
//-
//to get appoinment data 
const fetchAppointments = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem("registrarToken");

    const res = await API.get("/api/appointments/registrar", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("TODAY:", res.data.today);
    console.log("UPCOMING:", res.data.upcoming);
    console.log("ALL:", res.data.all);

    setTodayAppointments(res.data.today || []);
    setUpcomingAppointments(res.data.upcoming || []);

  } catch (err) {
    console.error("FETCH ERROR:", err);
  } finally {
    setLoading(false);
  }
};

//to fetch mutations
const fetchMutations = async () => {
  try {
    setMutationLoading(true);

    const token = localStorage.getItem("registrarToken");

    const res = await API.get(
      "/api/mutations/registrar/pending",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("FULL MUTATION RESPONSE:", res.data);

    // IMPORTANT FIX
  const mutations = res.data.mutations;

    console.log("FINAL ARRAY:", mutations);

    setPendingMutations(
      Array.isArray(mutations)
        ? mutations
        : []
    );

  } catch (err) {
    console.error("MUTATION FETCH ERROR:", err);

    toast.error("Failed to fetch mutations");

    setPendingMutations([]);

  } finally {
    setMutationLoading(false);
  }
};

useEffect(() => {
  fetchAppointments();
  fetchMutations();
}, []);
  return (
    <RegistrarDashboardLayout>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Registrar Dashboard</h1>

        <p className="text-gray-400">
          Manage appointments, land transfer deeds and mutation workflow.
        </p>
      </div>

      {/* TOP STATS */}

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Appointments"
          value="18"
          growth="+4%"
          icon={<FaCalendarCheck />}
        />

        <StatCard
          title="Pending Deeds"
          value="12"
          growth="+8%"
          icon={<FaFileSignature />}
        />

       <StatCard
  title="Mutation Drafts"
  value={pendingMutations.length}
  growth="+3%"
  icon={<FaExchangeAlt />}
/>

        <StatCard
          title="Completed Today"
          value="21"
          growth="+10%"
          icon={<FaCheckCircle />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* APPOINTMENTS */}
<div className="bg-white/10 rounded-2xl p-6 border border-white/10">

  <h2 className="text-xl text-white font-semibold mb-5">
    Today's Appointments
  </h2>

  <table className="w-full text-sm mb-6">
    <thead>
      <tr className="text-gray-400 border-b border-white/10">
        <th className="py-3 text-left">Buyer</th>
        <th className="text-left">Property</th>
        <th className="text-left">Date</th>
        <th className="text-left">Time</th>
      </tr>
    </thead>

    <tbody>
      {loading ? (
        <tr>
          <td colSpan="4" className="text-gray-400 py-4">
            Loading appointments...
          </td>
        </tr>
      ) : todayAppointments.length === 0 ? (
        <tr>
          <td colSpan="4" className="text-gray-400 py-4">
            No today's appointments
          </td>
        </tr>
      ) : (
        todayAppointments.slice(0, 3).map((a) => (
          <tr key={a._id} className="border-b border-white/5">
            <td className="py-3 text-white">
              {a.buyer?.name || "Unknown"}
            </td>

            <td className="text-gray-300">
             {a.land?.landtype|| "N/A"}
            </td>

            <td className="text-gray-300">
              {new Date(a.date).toLocaleDateString("en-IN")}
            </td>

            <td className="text-emerald-400">
              {a.timeSlot}
            </td><td>
            <button
  onClick={() => {
    navigate("/registrar/appointments", {
      state: { appointment: a }
    });
  }}
  className="px-3 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
>
  Open
</button></td>
          </tr>
        ))
      )}
    </tbody>
  </table>

  {/* UPCOMING */}
  <h2 className="text-xl text-white font-semibold mb-5">
    Upcoming Appointments
  </h2>

  <table className="w-full text-sm">
    <thead>
      <tr className="text-gray-400 border-b border-white/10">
        <th className="py-3 text-left">Buyer</th>
        <th className="text-left">Property</th>
        <th className="text-left">Date</th>
        <th className="text-left">Time</th>
      </tr>
    </thead>

    <tbody>
      {loading ? (
        <tr>
          <td colSpan="4" className="text-gray-400 py-4">
            Loading appointments...
          </td>
        </tr>
      ) : upcomingAppointments.length === 0 ? (
        <tr>
          <td colSpan="4" className="text-gray-400 py-4">
            No upcoming appointments
          </td>
        </tr>
      ) : (
        upcomingAppointments.slice(0, 3).map((a) => (
          <tr key={a._id} className="border-b border-white/5">
            <td className="py-3 text-white">
              {a.buyer?.name || "Unknown"}
            </td>

            <td className="text-gray-300">
                {a.land?.landtype|| "N/A"}
            </td>

            <td className="text-gray-300">
              {new Date(a.date).toLocaleDateString("en-IN")}
            </td>

            <td className="text-emerald-400">
              {a.timeSlot}
            </td><td>
            <button
  onClick={() => {
    navigate("/registrar/appointments", {
      state: { appointment: a }
    });
  }}
  className="px-3 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
>
  Open
</button></td>
          </tr>
        ))
      )}
    </tbody>
  </table>

  {/* VIEW MORE BUTTON */}
  <div className="mt-5 flex justify-end">
    <button
      onClick={() => window.location.href = "/registrar/appointments"}
      className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
    >
      View All Appointments
    </button>
  </div>

</div>

          {/* MUTATION QUEUE */}
          {/* MUTATION QUEUE */}
<div className="bg-white/10 rounded-2xl p-6 border border-white/10">

  <h2 className="text-xl font-semibold text-white mb-5">
    Mutation Draft Queue
  </h2>
<div className="text-white mb-3">
  Mutation Count: {pendingMutations.length}
</div>
  <table className="w-full text-sm">
    <thead>
      <tr className="text-gray-400 border-b border-white/10">
        <th className="py-3 text-left">Buyer</th>
        <th className="text-left">Land</th>
        <th className="text-left">Status</th>
        <th className="text-left">Action</th>
      </tr>
    </thead>

    <tbody>
  {mutationLoading ? (
    <tr>
      <td colSpan="5" className="py-4 text-gray-400">
        Loading mutations...
      </td>
    </tr>
  ) : pendingMutations.length === 0 ? (
    <tr>
      <td colSpan="5" className="py-4 text-gray-400">
        No pending mutations
      </td>
    </tr>
  ) : (
    pendingMutations.slice(0, 5).map((m) => (

      <tr
        key={m._id}
        className="border-b border-white/5 hover:bg-white/5 transition"
      >

        {/* BUYER */}
        <td className="py-4 text-white font-medium">
          {m.buyer?.username || "Unknown"}
        </td>

        {/* LAND */}
        <td className="text-gray-300">
          <div>
            <p>
              {m.land?.landtype || "Land"}
            </p>

            <p className="text-xs text-gray-500">
              {m.land?.city}, {m.land?.state}
            </p>
          </div>
        </td>

        {/* MUTATION NUMBER */}
        <td className="text-cyan-400 text-xs font-mono">
          {m.mutationNumber}
        </td>

        {/* STATUS */}
        <td>
          <span
            className={`
              px-3 py-1 rounded-full text-xs font-semibold
              ${
                m.mutationStatus === "approved"
                  ? "bg-green-500/20 text-green-400"
                  : m.mutationStatus === "rejected"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-amber-500/20 text-amber-400"
              }
            `}
          >
            {m.mutationStatus}
          </span>
        </td>

        {/* ACTION */}
        <td>
          <button
            onClick={() => {
              navigate("/registrar/appointments", {
                state: {
                  mutation: m
                }
              });
            }}
            className="
              px-4 py-2
              text-xs
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              text-white
              transition
            "
          >
            Open
          </button>
        </td>

      </tr>
    ))
  )}
</tbody>
  </table>

  <div className="mt-5 flex justify-end">
    <button
      onClick={() => navigate("/registrar/appointments")}
      className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
    >
      View All Mutations
    </button>
  </div>

</div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>

            <ActionBtn label="Open Appointments" />
            <ActionBtn label="Approve Mutation" />
            <ActionBtn label="Verify Land Docs" />
            <ActionBtn label="Generate Transfer Draft" />
          </div>

          <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Office Status</h2>

            <StatusItem label="Registry Server" status="Online" />

            <StatusItem label="Mutation Service" status="Running" />

            <StatusItem label="Document Queue" status="Healthy" />
          </div>

          <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Next Slot</h2>

            <div className="text-3xl text-emerald-400 font-bold">10:30 AM</div>

            <p className="text-gray-400 mt-2">Next citizen appointment</p>
          </div>
        </div>
      </div>
    
    </RegistrarDashboardLayout>
  );
};

const StatCard = ({ title, value, icon, growth }) => (
  <div className="bg-white/10 p-6 rounded-2xl border border-white/10 flex justify-between items-center">
    <div>
      <p className="text-gray-400 text-sm">{title}</p>

      <h2 className="text-3xl text-white font-bold">{value}</h2>

      <div className="flex items-center text-emerald-400 text-sm mt-2">
        <FaArrowUp className="mr-1" />
        {growth}
      </div>
    </div>

    <div className="text-3xl text-emerald-400">{icon}</div>
  </div>
);

const QueueItem = ({ land, buyer, status }) => (
  <div className="p-4 rounded-xl bg-white/5">
    <h3 className="text-white font-semibold">{land}</h3>

    <p className="text-gray-400 text-sm">Buyer: {buyer}</p>

    <p className="text-emerald-400 text-sm mt-1">{status}</p>
  </div>
);

const ActionBtn = ({ label }) => (
  <button className="w-full mb-3 text-left px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
    {label}
  </button>
);

const StatusItem = ({ label, status }) => (
  <div className="flex justify-between mb-3">
    <span className="text-gray-400">{label}</span>

    <span className="text-emerald-400">{status}</span>
  </div>
);



export default RegistrarDashboard;
