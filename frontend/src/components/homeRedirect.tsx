import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Landing from "../pages/public/landingPage";

export default function HomeRedirect() {
    const { auth, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!auth || !auth.accessToken) {
        return <Landing />;
    }

    switch (auth.role) {
        case "Admin":
            return <Navigate to="/admin" replace />;

        case "Operator":
            return <Navigate to="/operator" replace />;

        case "Supervisor":
            return <Navigate to="/supervisor" replace />;

        case "Analyst":
            return <Navigate to="/analyst" replace />;

        default:
            return <Landing />;
    }
}