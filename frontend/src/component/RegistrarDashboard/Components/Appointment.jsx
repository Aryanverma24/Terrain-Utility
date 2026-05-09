import React, { useState, useEffect} from "react";
import { useRef } from "react";
import AppointmentQueue from "./AppointmentQueue";
import MutationQueue from "./MutationQueue";
import AppointmentWorkbench from "./AppointmentWorkbench";

import { API } from "../../../../utils/API";

import { useLocation } from "react-router-dom";

export default function Appointment() {

  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [mutationQueue, setMutationQueue] = useState([]);

  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [loading, setLoading] = useState(true);
  //edit date slots states
const [editMode, setEditMode] = useState(false);
const [newDate, setNewDate] = useState("");
const [newSlot, setNewSlot] = useState("");
const [saving, setSaving] = useState(false);
const [availableSlots, setAvailableSlots] = useState([]);
const [loadingSlots, setLoadingSlots] = useState(false);
  const location = useLocation();
  const workbenchRef = useRef(null);

  /* =====================================================
     FETCH APPOINTMENTS
  ===================================================== */

  const fetchAppointments = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("registrarToken");

      const res = await API.get(
        "/api/appointments/registrar",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("TODAY:", res.data.today);
      console.log("UPCOMING:", res.data.upcoming);
      console.log("MUTATION:", res.data.mutationQueue);

      setTodayAppointments(
        res.data.today || []
      );

      setUpcomingAppointments(
        res.data.upcoming || []
      );

      setMutationQueue(
        res.data.mutationQueue || []
      );

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  
  /* =====================================================
     OPEN FROM DASHBOARD NAVIGATION
  ===================================================== */

  useEffect(() => {

    if (location.state?.appointment) {

      setSelectedAppointment(
        location.state.appointment
      );

    }

  }, [location]);

  /* =====================================================
     LOCAL STORAGE FALLBACK
  ===================================================== */

  useEffect(() => {

    const stored =
      localStorage.getItem("selectedAppointment");

    if (stored) {

      try {

        setSelectedAppointment(
          JSON.parse(stored)
        );

        localStorage.removeItem(
          "selectedAppointment"
        );

      } catch (e) {

        console.log(
          "Invalid stored appointment"
        );

      }

    }

  }, []);
//function to update timming 
  const updateTiming = async () => {
  try {
    setSaving(true);

    const token = localStorage.getItem("registrarToken");

    const res = await API.patch(
      `/api/appointments/${selectedAppointment._id}/update`,
      {
        date: newDate,
        timeSlot: newSlot,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setSelectedAppointment(res.data.appointment);

    await fetchAppointments(); // refresh queues

    setEditMode(false);

  } catch (err) {
    console.log(err);
  } finally {
    setSaving(false);
  }
};
//to get availvale slots time
const fetchSlots = async (date) => {
  try {
    setLoadingSlots(true);

    const token = localStorage.getItem("registrarToken");

    const res = await API.get(
      `/api/appointments/available-slots?date=${date}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setAvailableSlots(res.data.availableSlots || []);

  } catch (err) {
    console.log(err);
  } finally {
    setLoadingSlots(false);
  }
};
//toAUTO FILL WHEN CASE SELECTED
  useEffect(() => {
  if (selectedAppointment) {
    setNewDate(selectedAppointment.date?.split("T")[0] || "");
    setNewSlot(selectedAppointment.timeSlot || "");
  }
}, [selectedAppointment]);

useEffect(() => {
  if (newDate) {
    fetchSlots(newDate);
  }
}, [newDate]);
/* =====================================================
   AUTO SCROLL TO WORKBENCH
===================================================== */

useEffect(() => {

  if (selectedAppointment && workbenchRef.current) {

    setTimeout(() => {

      workbenchRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    }, 150);

  }

}, [selectedAppointment]);
  return (

    <div className="
      min-h-screen
      bg-gradient-to-br
      from-slate-50
      via-indigo-50
      to-blue-50
      p-8
    ">

      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="
          rounded-[36px]
          bg-gradient-to-r
          from-indigo-700
          via-blue-700
          to-cyan-600
          text-white
          p-10
          shadow-2xl
        ">

          <h1 className="text-4xl font-bold">
            Registrar Appointment Operations
          </h1>

          <p className="mt-4 text-indigo-100 max-w-3xl">
            Manage attendance, registration execution,
            document scrutiny, mutation initiation
            and ownership transfer workflow.
          </p>

          {/* STATS */}
          <div className="grid md:grid-cols-4 gap-5 mt-8">

            {[
              [todayAppointments.length, "Today Queue"],
              [upcomingAppointments.length, "Upcoming"],
              [mutationQueue.length, "Mutation Pending"],
              ["Live", "Registry Sync"],
            ].map((card, i) => (

              <div
                key={i}
                className="
                  bg-white/10
                  rounded-3xl
                  p-6
                  backdrop-blur-xl
                "
              >

                <p className="text-sm opacity-80">
                  {card[1]}
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {card[0]}
                </h2>

              </div>

            ))}

          </div>

        </div>

        {/* APPOINTMENT QUEUE */}
        <AppointmentQueue
          todayAppointments={todayAppointments}
          upcomingAppointments={upcomingAppointments}
          selectedAppointment={selectedAppointment}
          onSelectAppointment={setSelectedAppointment}
           workbenchRef={workbenchRef}
        />

        {/* MUTATION QUEUE */}
       <MutationQueue
  mutationQueue={mutationQueue}
  selectedAppointment={selectedAppointment}
  onSelectAppointment={setSelectedAppointment}
  workbenchRef={workbenchRef}
/>
         {/* MODIFICATION MODAL FOR SLOTS BOOKING */}
{selectedAppointment && (
  <div className="bg-white rounded-[28px] shadow-lg p-6 border">

    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold">
        Appointment Timing Control
      </h2>

      {!editMode ? (
        <button
          onClick={() => setEditMode(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
        >
          Edit Timing
        </button>
      ) : (
        <button
          onClick={() => setEditMode(false)}
          className="bg-gray-400 text-white px-4 py-2 rounded-xl"
        >
          Cancel
        </button>
      )}
    </div>

    {!editMode ? (
      <div className="mt-4 text-gray-700 space-y-2">
        <p><b>Date:</b> {selectedAppointment.date?.split("T")[0]}</p>
        <p><b>Slot:</b> {selectedAppointment.timeSlot}</p>
      </div>
    ) : (
      <div className="mt-4 grid md:grid-cols-3 gap-4">

        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="border p-3 rounded-xl"
        />

       <select
  value={newSlot}
  onChange={(e) => setNewSlot(e.target.value)}
  className="border p-3 rounded-xl w-full"
>

  <option value="">
    {loadingSlots ? "Loading slots..." : "Select Time Slot"}
  </option>

  {availableSlots.map((slot, index) => (
    <option
      key={index}
      value={slot}
    >
      {slot}
    </option>
  ))}

</select>
        <button
          onClick={updateTiming}
          disabled={saving}
          className="bg-green-600 text-white px-4 py-3 rounded-xl"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>
    )}

  </div>
)}
        {/* ACTIVE WORKBENCH */}
        {selectedAppointment ? (

  <div ref={workbenchRef}>
    <AppointmentWorkbench
      appointment={selectedAppointment}
      onStatusUpdate={fetchAppointments}
    />
  </div>

) : (

          <div className="
            bg-white
            rounded-[32px]
            shadow-xl
            border
            p-20
            text-center
          ">

            <h2 className="text-3xl font-bold text-slate-700">
              Select a case to open workbench
            </h2>

            <p className="mt-4 text-slate-500">
              Appointment and mutation queues
              appear above. Select any case
              to begin processing.
            </p>

          </div>

        )}

      </div>

    </div>

  );
}