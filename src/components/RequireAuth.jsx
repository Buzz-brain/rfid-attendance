import { Navigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';

const RequireAuth = ({ children }) => {
  const user = useStore(state => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export default RequireAuth;
