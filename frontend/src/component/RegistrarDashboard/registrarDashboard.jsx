
import React, { useEffect, useState } from 'react';
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
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
const [loading, setLoading] = useState(true);
//for the available slot 

const [slotDate, setSlotDate] = useState(null);
const [availableSlots, setAvailableSlots] = useState([]);

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

    setAppointments(res.data.appointments || []);
  } catch (err) {
    console.error("FETCH ERROR:", err);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  fetchAppointments();
}, []);
//to get the date and available slots
useEffect(() => {
  if (!slotDate) return;

  console.log("Fetching slots for:", slotDate);

  const fetchSlots = async () => {
    try {
      const token = localStorage.getItem("registrarToken");

      const res = await API.get(
        `/api/appointments/available-slots?date=${slotDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("SLOTS RESPONSE:", res.data);

      setAvailableSlots(res.data.availableSlots || []);
    } catch (err) {
      console.error("SLOT ERROR:", err);
    }
  };

  fetchSlots();
}, [slotDate]);
//to approve the slected appointment
const handleApprove = async (appointmentId) => {
  try {
    const token = localStorage.getItem("registrarToken");

    const { data } = await API.patch(
      `/api/appointments/approve/${appointmentId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("APPROVED:", data);

    toast.success("Appointment approved successfully");

    // refresh list
    fetchAppointments();

    // close modal
    setSelectedAppointment(null);

  } catch (error) {
    console.error("APPROVE ERROR:", error);
    toast.error("Failed to approve appointment");
  }
};
//to modify the appointment 
const handleModify = async (updatedAppointment) => {
  try {
    console.log("🔥 MODIFY CLICKED");
    console.log("📦 Appointment ID:", updatedAppointment._id);
    console.log("📦 Payload:", {
      date: updatedAppointment.date,
      timeSlot: updatedAppointment.timeSlot,
    });

    const token = localStorage.getItem("registrarToken");
    console.log("🔑 Token:", token);

    const url = `/api/appointments/update/${updatedAppointment._id}`;
    console.log("🌐 Request URL:", url);

    const { data } = await API.patch(
      url,
      {
        date: updatedAppointment.date,
        timeSlot: updatedAppointment.timeSlot,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ SUCCESS RESPONSE:", data);

    toast.success("Appointment updated & rescheduled");

    fetchAppointments();
    setSelectedAppointment(null);

  } catch (error) {
    console.log("❌ FULL ERROR OBJECT:", error);
    console.log("❌ RESPONSE:", error?.response);
    console.log("❌ STATUS:", error?.response?.status);
    console.log("❌ DATA:", error?.response?.data);

    toast.error(
      error?.response?.data?.message || "Failed to update appointment"
    );
  }
};
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
          value="7"
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
              Upcoming Appointments
            </h2>

            <table className="w-full text-sm">
              
               <thead>
  <tr className="text-gray-400 border-b border-white/10">
    <th className="py-3 text-left">Buyer</th>
    <th className="text-left">Property</th>
    <th className="text-left">Date</th>
    <th className="text-left">Time</th>
    <th className="text-right">Action</th>
  </tr>
</thead>
              

              <tbody>
  {loading ? (
    <tr>
      <td className="text-gray-400 py-4" colSpan="5">
        Loading appointments...
      </td>
    </tr>
  ) : appointments.length === 0 ? (
    <tr>
      <td className="text-gray-400 py-4" colSpan="5">
        No appointments found
      </td>
    </tr>
  ) : (
    appointments.map((a) => (
      <tr key={a._id} className="border-b border-white/5">

        {/* BUYER */}
        <td className="py-3 text-white">
          {a.buyer?.username || "Unknown"}
        </td>

        {/* LAND */}
        <td className="text-gray-300">
          {a.land?.title || a.land?._id}
        </td>

        {/* DATE */}
        <td className="text-gray-300">
          {new Date(a.date).toLocaleDateString("en-IN")}
        </td>

        {/* TIME */}
        <td className="text-emerald-400">
          {a.timeSlot}
        </td>

        {/* ACTION */}
        <td className="text-right pr-2">
          <button
 onClick={() => {
  setSelectedAppointment(a);
  setSlotDate(a.date?.slice(0, 10));
}}
  className="px-3 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
>
  View
</button>
            
        </td>

      </tr>
    ))
  )}
</tbody>
            </table>
          </div>

          {/* MUTATION QUEUE */}
          <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              Mutation Draft Queue
            </h2>

            <div className="space-y-4">
              <QueueItem land="Plot 244" buyer="Vikas" status="Awaiting Approval" />

              <QueueItem land="Plot 117" buyer="Rohit" status="Document Review" />

              <QueueItem land="Plot 322" buyer="Anjali" status="Ready For Mutation" />
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
      {selectedAppointment && (
<AppointmentModal
  appointment={selectedAppointment}
  onClose={() => setSelectedAppointment(null)}
  onApprove={handleApprove}
  onModify={handleModify}
  availableSlots={availableSlots}
/>
)}
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

const TIME_SLOTS = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-01:00",
  "02:00-03:00",
  "03:00-04:00",
  "04:00-05:00",
];

const AppointmentModal = ({
  appointment,
  onClose,
  onApprove,
  onModify,
  availableSlots = [],
}) => {
  const [editMode, setEditMode] = React.useState(false);

  const [form, setForm] = React.useState({
    date: "",
    timeSlot: "",
  });

  // sync on open/change
  React.useEffect(() => {
    if (appointment) {
      setForm({
        date: appointment.date?.slice(0, 10) || "",
        timeSlot: appointment.timeSlot || "",
      });
    }
  }, [appointment]);

  const handleSave = () => {
    if (!form.date || !form.timeSlot) {
      alert("Date & Time required");
      return;
    }

    onModify({
      ...appointment,
      date: form.date,
      timeSlot: form.timeSlot,
    });

    setEditMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">

      <div className="w-[720px] bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-3xl shadow-2xl text-white overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-emerald-400">
            Appointment Details
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 grid grid-cols-2 gap-4 text-sm">

          {/* BUYER */}
          <div className="bg-white/5 p-4 rounded-xl">
            <p className="text-gray-400">Buyer</p>
            <p className="text-white font-semibold">
              {appointment.buyer?.username}
            </p>
          </div>

          {/* LAND */}
          <div className="bg-white/5 p-4 rounded-xl">
            <p className="text-gray-400">Land</p>
            <p className="text-white font-semibold">
              {appointment.land?.title || appointment.land?._id}
            </p>
          </div>

          {/* DATE */}
          <div className="bg-white/5 p-4 rounded-xl col-span-2">
            <p className="text-gray-400 mb-2">Date</p>

            {editMode ? (
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                className="w-full bg-slate-700 p-2 rounded-lg text-white"
              />
            ) : (
              <p className="text-emerald-400">
                {new Date(appointment.date).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>

          {/* TIME SLOT */}
          <div className="bg-white/5 p-4 rounded-xl col-span-2">
            <p className="text-gray-400 mb-2">Time Slot</p>

            {editMode ? (
              <select
                value={form.timeSlot}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    timeSlot: e.target.value,
                  }))
                }
                className="w-full bg-slate-700 p-2 rounded-lg text-white"
              >
                <option value="">Select available slot</option>

                {availableSlots.length === 0 ? (
                  <option disabled>No slots available</option>
                ) : (
                  availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))
                )}
              </select>
            ) : (
              <p className="text-blue-400 font-medium">
                {appointment.timeSlot}
              </p>
            )}
          </div>

          {/* STATUS */}
          <div className="bg-white/5 p-4 rounded-xl col-span-2">
            <p className="text-gray-400">Status</p>
            <p className="text-yellow-400 font-semibold">
              {appointment.status}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="px-6 pb-6 flex justify-between">

          {/* LEFT */}
          <div className="flex gap-3">

            <button
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
            >
              {editMode ? "Cancel" : "Modify"}
            </button>

            {editMode && (
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-yellow-600 hover:bg-yellow-700 transition"
              >
                Save Changes
              </button>
            )}
          </div>

          {/* APPROVE */}
          <button
            disabled={editMode}
            onClick={() => onApprove(appointment._id)}
            className={`px-6 py-2 rounded-xl font-semibold transition
              ${
                editMode
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};
export default RegistrarDashboard;
