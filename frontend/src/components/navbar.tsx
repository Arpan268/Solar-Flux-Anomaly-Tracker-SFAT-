import axios from 'axios'
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/authContext"

export default function Navbar() {
    const { auth, setAuth } = useAuth()
    const navigate = useNavigate()

    async function handleLogout() {
        try {
            await axios.post('/api/auth/logout', {}, { withCredentials: true });
            setAuth(null);
            navigate('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    }

    return (
        <nav className="bg-gray-900 py-5 px-6 text-slate-200">
            <div className="container mx-auto flex justify-between items-center">

                <Link to="/" className="text-xl font-bold text-white tracking-widest">
                    SFAT
                </Link>

                <div className="flex items-center gap-10 mr-5">

                    {!auth?.accessToken ? (
                        <>
                            <Link to="/login" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Login</Link>
                            <Link to="/register" className=" hover:text-white transition-colors hover:scale-105 transform duration-300">Register</Link>
                            <Link to="/about-us" className="hover:text-white transition-colors hover:scale-105 transform duration-300">About</Link>
                        </>
                    ) : (

                        <>
                            {auth.role === 'Operator' && (
                                <>
                                    <Link to="/operator" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Dashboard</Link>
                                    <Link to="/operator/view-anomalies" className="hover:text-white transition-colors hover:scale-105 transform duration-300">My Logs</Link>
                                    <Link to="/operator/log-anomalies" className="hover:text-white transition-colors hover:scale-105 transform duration-300">View Instructions</Link>
                                </>
                            )}

                            {auth.role === 'Supervisor' && (
                                <>
                                    <Link to="/supervisor" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Dashboard</Link>
                                    <Link to="/supervisor/view-anomalies" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Review Anomalies</Link>
                                    <Link to="/supervisor/send-instructions" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Send Instructions</Link>
                                    <Link to="/supervisor/view-operators" className="hover:text-white transition-colors hover:scale-105 transform duration-300">View Operators</Link>
                                </>
                            )}

                            {auth.role === 'Analyst' && (
                                <>
                                    <Link to="/analyst" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Dashboard</Link>
                                    <Link to="/analyst/view-anomalies" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Review Anomalies</Link>
                                    <Link to="/analyst/view-live-data" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Live Data</Link>
                                    <Link to="/analyst/view-graphs" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Graphs</Link>
                                </>
                            )}

                            {auth.role === 'Admin' && (
                                <Link to="/admin" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Admin Panel</Link>
                            )}

                            <button
                                onClick={handleLogout}
                                className="bg-red-600/80 px-4 py-1 rounded text-white hover:bg-red-600 transition-colors ml-4"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}