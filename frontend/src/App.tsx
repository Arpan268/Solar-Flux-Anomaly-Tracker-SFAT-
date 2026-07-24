import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import PublicRoute from './components/publicRoute';
import PrivateRoute from './components/privateRoute';
import HomeRedirect from "./components/homeRedirect";

import Landing from './pages/public/landingPage';
import Register from './pages/public/register';
import Login from './pages/public/login';
import AboutUs from './pages/public/aboutUs';

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

import AdminDashboard from './pages/admin/adminDashboard';
import ManageUsers from './pages/admin/manageUsers';


export default function App() {
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

      </Routes>
    </main>
  );
}