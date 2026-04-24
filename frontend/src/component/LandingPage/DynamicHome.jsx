import { useContext } from 'react';
import { AuthContext } from '../../../contexts/authContext';
import Home from './Home';
import LawyerHome from '../lawyer/LawyerHome';

const DynamicHome = () => {
  const { user } = useContext(AuthContext);

  if (!user) return <Home />; // guest or not logged in

  if (user.role?.toLowerCase() === 'lawyer') return <LawyerHome />;

  // other roles fallback to normal Home
  return <Home />;
};

export default DynamicHome;
