import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { Route, RouterProvider, createRoutesFromElements } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';
import { createRef } from 'react';
import Login from './component/Auth/Login.jsx';
import Register from './component/Auth/Register.jsx';
import AdminLogin from './component/Auth/AdminLogin.jsx';
import RegistrarActivate from './component/Auth/registrarActivation.jsx';
import RegistrarLogin from './component/Auth/registrarLogin.jsx';
import AuthState from '../contexts/authContext.jsx';
import Home from './component/LandingPage/Home.jsx';
import CreateLand from './component/Lands/CreateLand.jsx';
import Lands from './component/Lands/Lands.jsx';
import AdminDashboard from './component/AdminDashboard/AdminDashboard.jsx';
import MyLand from './component/Lands/MyLands.jsx';
import SingleLand from './component/Lands/SingleLand.jsx';
import Profile from './component/Profile.jsx';
import DynamicHome from './component/LandingPage/DynamicHome.jsx';
// Admin Components
import UserManagement from './component/AdminDashboard/components/UserManagement.jsx';
import LandManagement from './component/AdminDashboard/components/LandManagement.jsx';
import Analytics from './component/AdminDashboard/components/Analytics.jsx';
import Reports from './component/AdminDashboard/components/Reports.jsx';
import Settings from './component/AdminDashboard/components/Settings.jsx';
import HelpSupport from './component/AdminDashboard/components/HelpSupport.jsx';
import Wishlist from './component/Wishlist.jsx';
import LawyerDashboard from './component/lawyerDashboard.jsx';
import NotificationPanelPage from './component/NotificationPanelPage';
import ChatList from './component/Chat/ChatList.jsx';
import Inbox from './component/Chat/BuyerInbox.jsx';
import OwnerInbox from './component/Chat/OwnerInbox.jsx';
import About from './component/AboutUs/About.jsx';
import OwnerDocuments from './component/Lands/ownerDocuments.jsx';
import LawyerDocuments from './component/lawyer/lawyerDocuments.jsx';
import InterestDashboard from './component/Lands/IntrestDashboard.jsx';
import CongratulationsPage from './component/Payment/CongratulationsPage.jsx';
import RegistrarDashboard from './component/RegistrarDashboard/registrarDashboard.jsx';
import TransactionWorkflow from './component/Lands/TransactionWorkFlow.jsx';
import Appointment from './component/RegistrarDashboard/Components/Appointment.jsx';
// import FaceSetup from './component/FaceSetup.jsx';
// import FaceAuthentication from './component/FaceAuthentication.jsx';

const inboxRef = createRef();

// Define the routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />

      {/* User Routes */}
      <Route path="/userProfile" element={<Profile />} />
      <Route index element={<DynamicHome />} />
      <Route path="/about" element={<About />} />
      <Route path="/uploads" element={<CreateLand />} />
      <Route path="/mylands" element={<MyLand />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/lands" element={<Lands />} />

      <Route path="/notifications" element={<NotificationPanelPage />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/registrar-activate" element={<RegistrarActivate />} />
      <Route path="/registrar-login" element={<RegistrarLogin />} />
      {/* Land Details Route */}
      <Route path="/land/:id" element={<SingleLand />} />

      {/* Chat Routes */}
      <Route path="/chat" element={<ChatList />} />
      {/* <Route path="/chat/:chatId" element={<ChatWindow />} /> */}
      <Route path="/inbox" element={<Inbox />}>
        {/* <Route path to open chat from single land to inbox*/}
        <Route path="/inbox" element={<Inbox ref={inboxRef} />}>
          <Route
            path="land/:id"
            element={
              <SingleLand
                onOpenChat={(chat) => inboxRef.current?.openChatInInbox(chat)}
              />
            }
          />
        </Route>
      </Route>

      <Route path="/land/:id/owner-documents" element={<OwnerDocuments />} />
      <Route path="/lawyer/documents/:id" element={<LawyerDocuments />} />
      {/* Face Authentication Routes */}
      {/* <Route path='/facial-auth' element={<FaceAuthentication />} /> */}
      {/* <Route path='/add-face' element={<FaceSetup />} /> */}

      {/* registrar routes */}
      <Route path="/registrar-dashboard" element={<RegistrarDashboard />} />
       {/* main operational appointment console */}
     <Route
 path="/registrar/appointments"
 element={<Appointment />}
/>

<Route
 path="/registrar/appointments/:appointmentId"
 element={<Appointment />}
/>

      {/* admin routes */}
      <Route path="/adminDashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/lands" element={<LandManagement />} />
      <Route path="/admin/analytics" element={<Analytics />} />
      <Route path="/admin/reports" element={<Reports />} />
      <Route path="/admin/settings" element={<Settings />} />
      <Route path="/admin/help" element={<HelpSupport />} />

      {/* buyer inbox Route */}
      <Route path="/inbox" element={<Inbox />} />

      {/* owner inbox Route */}
      <Route path="/owner-inbox" element={<OwnerInbox />} />
      {/* interset dadshboard Route */}
      <Route path="/interest-dashboard/:landId" element={<InterestDashboard />} />
      {/* Congratulations Page */}
      <Route path="/congratulations" element={<CongratulationsPage />} />
      {/* appoitment page basically called it tenasaction flow */}
      <Route path="/transaction-workflow/:landId" element={<TransactionWorkflow />}/>
    </Route>,
  ),
);

createRoot(document.getElementById('root')).render(
  <AuthState>
    <RouterProvider router={router} />
  </AuthState>,
);
