import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ROLES from '../utils/Roles';

/**
 * Router component that checks the user's role and redirects to the appropriate patients page
 */
const PatientsRouter: React.FC = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    // Redirect based on user role
    if (userRole === ROLES.NURSE) {
      navigate('/patients/nurse');
    } else if (userRole === ROLES.FIRE || userRole === ROLES.POLICE) {
      navigate('/patients/first-responder');
    } else {
      // For unauthorized roles or default case, redirect to home
      navigate('/');
    }
  }, [userRole, navigate]);

  // This component will not render anything, it just handles redirection
  return null;
};

export default PatientsRouter; 
