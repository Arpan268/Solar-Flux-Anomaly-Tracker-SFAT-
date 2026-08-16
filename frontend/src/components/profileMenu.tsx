import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/authContext.tsx';

export default function ProfileMenu() {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    let rolePath = auth?.role ? auth.role.toLowerCase() : '';
    if(auth?.role == 'Company Admin') {
        rolePath = 'company-admin';
    }
    const profileRoute = `/${rolePath}/view-profile`;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-slate-300 cursor-pointer hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
                aria-label="User Menu"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                    <div className="px-4 py-2 border-b border-gray-800 mb-1">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Signed in as</p>
                        <p className="text-sm text-slate-200 font-bold truncate">{auth?.role}</p>
                    </div>

                    <Link
                        to={profileRoute}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        View Profile
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors text-left"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>

                </div>
            )}
        </div>
    );
}