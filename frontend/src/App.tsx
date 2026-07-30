import { useState, useEffect } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/navbar';
import PublicRoute from './components/publicRoute';
import PrivateRoute from './components/privateRoute';
import HomeRedirect from "./components/homeRedirect";
import ViewProfile from './components/viewProfile';

import Register from './pages/public/register';
import Login from './pages/public/login';
import AboutUs from './pages/public/aboutUs';

import { AnomalyProvider } from './context/anomalyProvider';
import OperatorDashboard from './pages/operator/operatorDashboard';
import OperatorViewAnomalies from './pages/operator/viewAnomalies';
import OperatorLogAnomalies from './pages/operator/logAnomalies';
import UpdateAnomaly from './pages/operator/updateAnomalies';
import OperatorInstructions from './pages/operator/viewInstructions';

import SupervisorDashboard from './pages/supervisor/supervisorDashboard';
import SupervisorViewAnomalies from './pages/supervisor/viewAnomalies';
import SupervisorSendInstructions from './pages/supervisor/sendInstructions';
import SupervisorViewOperators from './pages/supervisor/viewOperators';

import AnalystDashboard from './pages/analyst/analystDashboard';
import AnalystViewAnomalies from './pages/analyst/viewAnomalies';
import AnalystViewLiveData from './pages/analyst/viewLiveData';
import AnalystViewGraphs from './pages/analyst/viewGraphs';
import MicroAnalysis from './pages/analyst/microAnalysis';
import MacroAnalysis from './pages/analyst/macroAnalysis';

import AdminDashboard from './pages/admin/adminDashboard';
import ManageUsers from './pages/admin/manageUsers';
import UpdateProfile from './components/updateProfile';

export default function App() {
  const [isServerAwake, setIsServerAwake] = useState(false);

  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        await fetch('/api/health');
        setIsServerAwake(true);
      } catch (error) {
        setTimeout(wakeUpServer, 3000);
      }
    };
    wakeUpServer();
  }, []);

  if (!isServerAwake) {
    return (
      <div className='min-h-screen bg-linear-to-b from-zinc-950 via-slate-900 to-gray-900 flex flex-col items-center justify-center text-white font-sans'>
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-500 mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Connecting to Secure Server...</h2>
        <p className="text-gray-400">Waking up the data pipeline. Please allow up to 45 seconds.</p>
      </div>
    );
  }

  return (
    <main className='min-h-screen bg-linear-to-b from-zinc-950 via-slate-900 to-gray-900'>
      <Navbar />
      <Routes>

        <Route
          path="/"
          element={<HomeRedirect />}
        />

        {/* Public Routes */}
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/about-us" element={
          <PublicRoute>
            <AboutUs />
          </PublicRoute>
        } />

        {/* Operator Routes */}
        <Route element={
          <AnomalyProvider>
            <Outlet />
          </AnomalyProvider>
        }>
          <Route path="/operator" element={
            <PrivateRoute allowedRoles={['Operator']}>
              <OperatorDashboard />
            </PrivateRoute>
          } />
          <Route path="/operator/view-anomalies" element={
            <PrivateRoute allowedRoles={['Operator']}>
              <OperatorViewAnomalies />
            </PrivateRoute>
          } />
          <Route path="/operator/log-anomaly" element={
            <PrivateRoute allowedRoles={['Operator']}>
              <OperatorLogAnomalies />
            </PrivateRoute>
          } />
          <Route path="/operator/update-anomaly/:id" element={
            <PrivateRoute allowedRoles={['Operator']}>
              <UpdateAnomaly />
            </PrivateRoute>
          } />
          <Route path="/operator/view-instructions" element={
            <PrivateRoute allowedRoles={['Operator']}>
              <OperatorInstructions />
            </PrivateRoute>
          } />
          <Route path="/operator/view-profile" element={
            <PrivateRoute allowedRoles={['Operator']}>
              <ViewProfile />
            </PrivateRoute>
          } />
          <Route path="/operator/profile/update/:userId" element={
            <PrivateRoute allowedRoles={['Operator']}>
              <UpdateProfile />
            </PrivateRoute>
          } />
        </Route>

        {/* Supervisor Routes */}
        <Route path="/supervisor" element={
          <PrivateRoute allowedRoles={['Supervisor']}>
            <SupervisorDashboard />
          </PrivateRoute>
        } />
        <Route path="/supervisor/view-anomalies" element={
          <PrivateRoute allowedRoles={['Supervisor']}>
            <SupervisorViewAnomalies />
          </PrivateRoute>
        } />
        <Route path="/supervisor/send-instructions" element={
          <PrivateRoute allowedRoles={['Supervisor']}>
            <SupervisorSendInstructions />
          </PrivateRoute>
        } />
        <Route path="/supervisor/view-operators" element={
          <PrivateRoute allowedRoles={['Supervisor']}>
            <SupervisorViewOperators />
          </PrivateRoute>
        } />
        <Route path="/supervisor/view-profile" element={
          <PrivateRoute allowedRoles={['Supervisor']}>
            <ViewProfile />
          </PrivateRoute>
        } />
        <Route path="/supervisor/profile/update/:userId" element={
          <PrivateRoute allowedRoles={['Supervisor']}>
            <UpdateProfile />
          </PrivateRoute>
        } />

        {/* Analyst Routes */}
        <Route path="/analyst" element={
          <PrivateRoute allowedRoles={['Analyst']}>
            <AnalystDashboard />
          </PrivateRoute>
        } />
        <Route path="/analyst/view-anomalies" element={
          <PrivateRoute allowedRoles={['Analyst']}>
            <AnalystViewAnomalies />
          </PrivateRoute>
        } />
        <Route path="/analyst/view-live-data" element={
          <PrivateRoute allowedRoles={['Analyst']}>
            <AnalystViewLiveData />
          </PrivateRoute>
        } />
        <Route path="/analyst/view-graphs" element={
          <PrivateRoute allowedRoles={['Analyst']}>
            <AnalystViewGraphs />
          </PrivateRoute>
        } />
        <Route path="/analyst/view-profile" element={
          <PrivateRoute allowedRoles={['Analyst']}>
            <ViewProfile />
          </PrivateRoute>
        } />
        <Route path="/analyst/profile/update/:userId" element={
          <PrivateRoute allowedRoles={['Analyst']}>
            <UpdateProfile />
          </PrivateRoute>
        } />
        <Route path="/analyst/micro-analysis/:id" element={
          <PrivateRoute allowedRoles={['Analyst']}>
            <MicroAnalysis />
          </PrivateRoute>
        } />
        <Route path="/analyst/macro-analysis" element={
          <PrivateRoute allowedRoles={['Analyst']}>
            <MacroAnalysis />
          </PrivateRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/manage-users" element={
          <PrivateRoute allowedRoles={['Admin']}>
            <ManageUsers />
          </PrivateRoute>
        } />
        <Route path="/admin/view-profile" element={
          <PrivateRoute allowedRoles={['Admin']}>
            <ViewProfile />
          </PrivateRoute>
        } />
        <Route path="/admin/profile/update/:userId" element={
          <PrivateRoute allowedRoles={['Admin']}>
            <UpdateProfile />
          </PrivateRoute>
        } />

      </Routes>
    </main>
  );
}