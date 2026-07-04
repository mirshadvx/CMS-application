import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
    const { isAuthenticated, role } = useSelector((state) => state.user);
    if (!isAuthenticated || !role.admin) {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
};

export default AdminProtectedRoute;
