import axios from 'axios'
import { Link } from "react-router-dom"
import { useAuth } from "../context/authContext"
import { useEffect, useState } from 'react'
import ProfileMenu from './profileMenu'

export default function Navbar() {
    const { auth } = useAuth()
    const [dataSource, setDataSource] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (!(auth as any)?.accessToken) return;

        async function fetchDataSource() {
            try {
                const res = await axios.get('/api/user/shared/data-source', {
                    headers: { Authorization: `Bearer ${(auth as any).accessToken}` },
                    withCredentials: true
                });
                setDataSource(res.data.dataSource);
                setError('');
            } catch (err) {
                console.error('Failed to fetch data source:', err);
                setError('Failed to fetch data source');
            }
        }

        fetchDataSource();
    }, [auth]);

    return (
        <nav className="bg-gray-900 py-5 px-12 text-slate-200">
            <div className="mx-auto flex justify-between items-center">

                <div className="flex items-center gap-6 mr-8">
                    <Link to="/" className="text-xl font-bold text-white tracking-widest">
                        SFAT
                    </Link>

                    {(auth?.accessToken && error) ? (
                        <div className="flex items-center gap-1.5 text-sm font-medium text-red-500">
                            <span className="animate-pulse text-lg">•</span>
                            <span>{error}</span>
                        </div>
                    ) : (auth?.accessToken && dataSource) && (
                        <div className={`flex items-center gap-1.5 text-sm font-medium uppercase tracking-widest ${dataSource === 'live' ? 'text-emerald-400' : 'text-yellow-400'
                            }`}>
                            <span className="animate-pulse text-lg">•</span>
                            <span>data source: {dataSource}</span>
                        </div>
                    )}
                </div>

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
                                    <Link to="/operator/view-instructions" className="hover:text-white transition-colors hover:scale-105 transform duration-300">View Instructions</Link>
                                </>
                            )}

                            {auth.role === 'Supervisor' && (
                                <>
                                    <Link to="/supervisor" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Dashboard</Link>
                                    <Link to="/supervisor/view-anomalies" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Review Anomalies</Link>
                                    <Link to="/supervisor/send-instructions" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Send Instructions</Link>
                                    <Link to="/supervisor/view-advisories" className="hover:text-white transition-colors hover:scale-105 transform duration-300">View Advisories</Link>
                                    <Link to="/supervisor/view-operators" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Manage Operators</Link>
                                </>
                            )}

                            {auth.role === 'Analyst' && (
                                <>
                                    <Link to="/analyst" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Dashboard</Link>
                                    <Link to="/analyst/view-anomalies" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Review Anomalies</Link>
                                    <Link to="/analyst/view-live-data" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Live Data</Link>
                                    <Link to="/analyst/predict-anomalies" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Predict</Link>
                                    <Link to="/analyst/view-advisories" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Issued Advisories</Link>
                                    <Link to="/analyst/view-graphs" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Graphs</Link>
                                </>
                            )}

                            {auth.role === 'Admin' && (
                                <>
                                    <Link to="/admin" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Admin Panel</Link>
                                    <Link to="/admin/manage-users" className="hover:text-white transition-colors hover:scale-105 transform duration-300">Manage Users</Link>
                                </>
                            )}

                            <ProfileMenu />
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}