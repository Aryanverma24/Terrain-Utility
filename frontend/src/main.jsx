import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Route, RouterProvider, createRoutesFromElements } from 'react-router';
import { createBrowserRouter } from "react-router-dom";
import Login from './component/Login.jsx';
import Register from './component/Register.jsx';
import AuthState from '../contexts/authContext.jsx';
import Home from './component/Home.jsx';
import CreateLand from './component/CreateLand.jsx';
import Lands from './component/LandsType.jsx';
import AdminDashboard from './component/AdminDashboard.jsx';
import MyLands from './component/MyLands.jsx';
import SingleLand from './component/SingleLand.jsx';
import Chat from './component/Chat.jsx';
import Messages from './component/Messages.jsx';
// import UserProfile from './component/UserProfile.jsx';

// Define the routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route index element={<Home />} />
      <Route path="/uploads" element={<CreateLand />} />
      <Route path="/mylands" element={<MyLands />} />
      <Route path="/lands" element={<Lands />} />
      <Route path='/adminDashboard' element={<AdminDashboard />} />
      {/* <Route path='/userProfile' element={<UserProfile /> } /> */}
      
      {/* Land Details Route */}
      <Route path="/land/:id" element={<SingleLand />} />
      
      {/* Chat Routes */}
      <Route path="/chat/:landId/:buyerId/:ownerName" element={<Chat />} />
      <Route path="/messages/land/:landId" element={<Messages />} /> {/* Route to handle the message page */}
        <Route path="/mylands" element={<MyLands />} />
      
      {/* Messages Routes */}
      <Route path="/land/:landId/messages" element={<Messages />} />
      <Route path="/messages/:chatId" element={<Messages />} />
     

    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <AuthState>
    <RouterProvider router={router} />
  </AuthState>
);
