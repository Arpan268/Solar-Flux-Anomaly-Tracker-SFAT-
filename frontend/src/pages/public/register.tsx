import { useState } from 'react';
import RegisterUser from '../../components/registerUser';
import RegisterCompany from '../../components/registerCompany';

export default function Register() {
    const [tab, setTab] = useState<'user' | 'company'>('user');

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-md mx-auto mb-4 flex rounded-lg bg-gray-800 p-1 border border-gray-700">
                <button
                    type="button"
                    onClick={() => setTab('user')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${tab === 'user'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    Individual User
                </button>
                <button
                    type="button"
                    onClick={() => setTab('company')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${tab === 'company'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    Register Company
                </button>
            </div>

            {tab === 'user' ? <RegisterUser /> : <RegisterCompany />}
        </div>
    );
}