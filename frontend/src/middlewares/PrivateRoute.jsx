import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
    const sessionId = localStorage.getItem('sessionId');
    return sessionId ? <Outlet /> : <Navigate to="/login" replace />;
}
