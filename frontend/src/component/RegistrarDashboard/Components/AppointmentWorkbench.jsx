import React, { useState, useEffect } from "react";

import PartyAttendancePanel from "./PartyAttendancePanel";
import DocumentScrutinyPanel from "./DocumentScrutinyPanel";
import RegistrationExecutionPanel from "./RegistrationExecutionPanel";
import MutationPanel from "./MutationPanel";
import TransferApprovalPanel from "./TransferApprovalPanel";
import AuditTimeline from "./AuditTimeline";

import { API } from "../../../../utils/API";

const tabs = [
  { id: "attendance", label: "Check-In" },
  { id: "scrutiny", label: "Document Review" },
  { id: "registration", label: "Registration" },
  { id: "mutation", label: "Mutation" },
  { id: "approval", label: "Final Approval" }
];

export default function AppointmentWorkbench({
  appointment,
  onStatusUpdate
}) {

  const [activeTab, setActiveTab] = useState("attendance");

  /* =========================================
     DOCUMENT STATES
  ========================================= */

  const [landDocs, setLandDocs] = useState([]);
  const [buyerDocs, setBuyerDocs] = useState([]);
  const [ownerDocs, setOwnerDocs] = useState([]);

  const [docLoading, setDocLoading] = useState(false);
const [refreshKey, setRefreshKey] = useState(0);
  /* =========================================
     LOCAL APPOINTMENT STATE
  ========================================= */

  const [appointmentData, setAppointmentData] =
    useState(appointment);

  /* =========================================
     MUTATION STATE
  ========================================= */

  const [mutation, setMutation] = useState(null);

  const [mutationLoading, setMutationLoading] =
    useState(false);

  /* =========================================
     ATTENDANCE STATE
  ========================================= */

  const [attendance, setAttendance] = useState(
    appointment?.attendance || "All Present"
  );

  /* =========================================
     SYNC APPOINTMENT
  ========================================= */

  useEffect(() => {

    setAppointmentData(appointment);

    setAttendance(
      appointment?.attendance || "All Present"
    );

  }, [appointment]);

  /* =========================================
     FETCH MUTATION
  ========================================= */

  const fetchMutation = async () => {

    try {

      setMutationLoading(true);

      const token =
        localStorage.getItem("registrarToken");

      const res = await API.get(
        `/api/mutations/by-appointment/${appointment?._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(
        "FETCHED MUTATION:",
        res.data
      );

      setMutation(
        res.data?.mutation || null
      );

    } catch (err) {

      console.log(
        "MUTATION FETCH ERROR:",
        err?.response || err
      );

      setMutation(null);

    } finally {

      setMutationLoading(false);

    }
  };

  /* =========================================
     FETCH MUTATION WHEN TAB OPENS
  ========================================= */

  useEffect(() => {

    if (
      (
        activeTab === "mutation" ||
        activeTab === "approval"
      ) &&
      appointment?._id
    ) {

      fetchMutation();

    }

  }, [activeTab, appointment]);

  /* =========================================
     FETCH DOCUMENTS
  ========================================= */

  const fetchDocuments = async () => {

    try {

      setDocLoading(true);

      const token =
        localStorage.getItem("registrarToken");

      if (!appointment?._id) {
        return;
      }

      const res = await API.get(
        `/api/registrar/appointment/${appointment._id}/documents`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(
        "DOCUMENT API RESPONSE:",
        res.data
      );

      setLandDocs(
        res.data.landDocs || []
      );

      setBuyerDocs(
        res.data.buyerDocs || []
      );

      setOwnerDocs(
        res.data.ownerDocs || []
      );

    } catch (err) {

      console.log(
        "DOC FETCH ERROR:",
        err?.response || err
      );

    } finally {

      setDocLoading(false);

    }
  };

  /* =========================================
     AUTO FETCH DOCS
  ========================================= */

  useEffect(() => {

    if (
      activeTab === "scrutiny" &&
      appointment?._id
    ) {

      fetchDocuments();

    }

  }, [activeTab, appointment]);

  /* =========================================
     AUTO TAB MAP
  ========================================= */

  const [initialMapped, setInitialMapped] =
    useState(false);

  useEffect(() => {

    if (initialMapped) return;

    const map = {
      appointment_booked: "attendance",
      parties_present: "scrutiny",
      documents_verified: "registration",
      registration_started: "mutation",
      mutation_pending: "mutation",
      transferred: "approval"
    };

    setActiveTab(
      map[
        appointment?.land?.transferStatus
      ] || "attendance"
    );

    setInitialMapped(true);

  }, [appointment, initialMapped]);

  /* =========================================
     PROGRESS MAP
  ========================================= */

  const progressMap = {
    appointment_booked: 20,
    parties_present: 35,
    documents_verified: 55,
    registration_started: 75,
    mutation_pending: 90,
    transferred: 100
  };

  const progress =
    progressMap[
      appointmentData?.land?.transferStatus
    ] || 10;

  /* =========================================
     UI
  ========================================= */

  return (

    <div className="space-y-8">

      {/* HEADER */}
      <div className="
        bg-white
        rounded-[32px]
        shadow-xl
        border
        p-8
      ">

        <div className="
          flex flex-wrap
          justify-between
          gap-8
        ">

          {/* LEFT */}
          <div>

            <p className="text-sm text-slate-500">
              Appointment Case
            </p>

            <h1 className="text-3xl font-bold mt-2">
              {appointmentData?.land?.landtype ||
                "Property Workbench"}
            </h1>

            <div className="
              mt-4
              flex gap-3
              flex-wrap
            ">

              <span className="
                px-4 py-2
                rounded-full
                bg-indigo-100
                text-indigo-700
              ">
                Case #
                {appointmentData?._id?.slice(-6)}
              </span>

              <span className="
                px-4 py-2
                rounded-full
                bg-emerald-100
                text-emerald-700
                capitalize
              ">
                {appointmentData?.status}
              </span>

              <span className="
                px-4 py-2
                rounded-full
                bg-amber-100
                text-amber-700
                capitalize
              ">
                {
                  appointmentData?.land
                    ?.transferStatus
                }
              </span>

            </div>

          </div>

          {/* RIGHT */}
          <div className="w-[340px]">

            <div className="
              flex justify-between mb-2
            ">

              <span className="
                text-sm font-medium
              ">
                Workflow Progress
              </span>

              <span className="font-semibold">
                {progress}%
              </span>

            </div>

            <div className="
              h-4 bg-slate-200
              rounded-full overflow-hidden
            ">

              <div
                style={{
                  width: `${progress}%`
                }}
                className="
                  h-full rounded-full
                  bg-gradient-to-r
                  from-blue-500
                  via-indigo-500
                  to-cyan-500
                "
              />

            </div>

            {/* INFO GRID */}
            <div className="
              mt-4
              grid grid-cols-2
              gap-4
            ">

              <div className="
                rounded-2xl
                p-4
                bg-slate-50
                border
              ">

                <p className="
                  text-xs text-gray-500
                ">
                  Buyer
                </p>

                <h4 className="
                  font-semibold mt-2
                ">
                  {
                    appointmentData?.buyer
                      ?.name || "N/A"
                  }
                </h4>

              </div>

              <div className="
                rounded-2xl
                p-4
                bg-slate-50
                border
              ">

                <p className="
                  text-xs text-gray-500
                ">
                  Attendance
                </p>

                <h4 className="
                  font-semibold mt-2
                ">
                  {attendance}
                </h4>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* TABS */}
      <div className="
        bg-white
        rounded-[32px]
        shadow-xl
        border
        overflow-hidden
      ">

        {/* TAB BAR */}
        <div className="
          flex gap-3
          overflow-x-auto
          px-4 py-3
        ">

          {tabs.map((tab) => (

            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id)
              }
              className={`
                whitespace-nowrap
                px-6 py-3
                rounded-full
                font-semibold
                transition

                ${
                  activeTab === tab.id
                    ? `
                      bg-indigo-600
                      text-white
                    `
                    : `
                      bg-slate-100
                      text-slate-700
                      hover:bg-slate-200
                    `
                }
              `}
            >
              {tab.label}
            </button>

          ))}

        </div>

        {/* PANEL */}
        <div className="p-8">

          {/* ATTENDANCE */}
          {activeTab === "attendance" && (

            <PartyAttendancePanel
              attendance={attendance}
              setAttendance={setAttendance}
              appointmentId={
                appointmentData?._id
              }
            />

          )}

          {/* SCRUTINY */}
          {activeTab === "scrutiny" && (

            <DocumentScrutinyPanel
              appointment={appointmentData}
              appointmentId={
                appointmentData?._id
              }
              landDocs={landDocs}
              buyerDocs={buyerDocs}
              ownerDocs={ownerDocs}
              loading={docLoading}

              onStatusUpdate={(
                updatedAppointment
              ) => {

                setAppointmentData(
                  updatedAppointment
                );

                onStatusUpdate &&
                  onStatusUpdate(
                    updatedAppointment
                  );

              }}
            />

          )}

          {/* REGISTRATION */}
          {activeTab === "registration" && (

            <RegistrationExecutionPanel
              appointment={appointmentData}
              appointmentId={
                appointmentData?._id
              }
              execution={
                appointmentData?.execution
              }
              registrarDecision={
                appointmentData?.registrarDecision
              }

              onStatusUpdate={(
                updatedAppointment
              ) => {

                setAppointmentData(
                  updatedAppointment
                );

                onStatusUpdate &&
                  onStatusUpdate(
                    updatedAppointment
                  );

              }}
            />

          )}

          {/* MUTATION */}
          {activeTab === "mutation" && (

            mutationLoading ? (

              <div className="
                bg-white
                rounded-3xl
                border
                p-16
                text-center
              ">
                Loading mutation...
              </div>

            ) : (

              <MutationPanel
                appointment={appointmentData}
                mutation={mutation}
              />

            )

          )}

          {/* FINAL APPROVAL */}
          {activeTab === "approval" && (

            mutationLoading ? (

              <div className="
                bg-white
                rounded-3xl
                border
                p-16
                text-center
              ">
                Loading transfer workflow...
              </div>

            ) : (

              <TransferApprovalPanel
                appointment={appointmentData}
                mutation={mutation}

                onTransferComplete={(
                  data
                ) => {

                  console.log(
                    "TRANSFER COMPLETE:",
                    data
                  );

                  // update appointment
                  setAppointmentData(
                    prev => ({
                      ...prev,
                      status: "completed",
                      land: {
                        ...prev.land,
                        transferStatus:
                          "transferred"
                      }
                    })
                  );

                  // update mutation
                  setMutation(
                    data?.mutation
                  );

                  // refresh parent
                  onStatusUpdate &&
                    onStatusUpdate();

                }}
              />

            )

          )}

        </div>

      </div>

      {/* AUDIT */}
      <AuditTimeline
  landId={
    appointmentData?.land?._id
  }
    refreshKey={refreshKey}
/>

    </div>

  );
}