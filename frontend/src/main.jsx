import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Route, RouterProvider, createRoutesFromElements } from 'react-router';
import { createBrowserRouter } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext.jsx"; // adjust path
import OwnerChat from './component/OwnerChat.jsx';
import BuyerChat from './component/BuyerChat.jsx';
import Login from './component/Login.jsx';
import Register from './component/Register.jsx';
import AuthState from '../contexts/AuthContext.jsx';
import Home from './component/Home.jsx';
import CreateLand from './component/CreateLand.jsx';
import Lands from './component/LandsType.jsx';
import AdminDashboard from './component/AdminDashboard.jsx';
import MyLands from './component/MyLands.jsx';
import SingleLand from './component/SingleLand.jsx';
import Profile from './component/Profile.jsx';
import Wishlist from './component/Wishlist.jsx';
import LawyerDashboard from './component/lawyerDashboard.jsx';
import NotificationPanelPage from "./component/NotificationPanelPage";
import OwnerChatList from './component/OwnerChatList.jsx';


// import FaceSetup from './component/FaceSetup.jsx';
// import FaceAuthentication from './component/FaceAuthentication.jsx';


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
      <Route index element={<Home />} />
      <Route path="/uploads" element={<CreateLand />} />
      <Route path="/mylands" element={<MyLands />} />
      <Route path='/wishlist' element={<Wishlist  />} />
      <Route path="/lands" element={<Lands />} />
      <Route path='/adminDashboard' element={<AdminDashboard />} />
      <Route path="/notifications" element={<NotificationPanelPage />} />

      {/* Land Details Route */}
      <Route path="/land/:id" element={<SingleLand />} />

       {/* Chat Routes */}
        <Route path="/chat/buyer/:landId/:ownerId" element={<BuyerChat />} />
         <Route path="/chat/owner/list" element={<OwnerChatList />} />
 <Route path="/chat/owner/:landId/:buyerId" element={<OwnerChat />} />
  

      {/* Face Authentication Routes */}
      {/* <Route path='/facial-auth' element={<FaceAuthentication />} /> */}
      {/* <Route path='/add-face' element={<FaceSetup />} /> */}
    </Route>
    
  )
);

createRoot(document.getElementById('root')).render(
  <AuthState>
    <RouterProvider router={router} />
  </AuthState>
);
