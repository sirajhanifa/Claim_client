import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Layout from './layout/Layout';
import StaffManage from './pages/staff/StaffManage';
import ClaimEntry from './pages/Claim Entry/ClaimEntry';
import ClaimManage from './pages/ClaimManage/ClaimManage';
import ClaimReport from './pages/Claim Report/ClaimReport';
import ProtectedRoute from './components/ProtectedRoute';
import AddUser from './pages/Settings/AddUser';
import PaymentProcess from './pages/PaymentProcessing/PaymentProcess';
import Logout from './components/Logout';
import PaymentStatus from './pages/Payment Status/PaymentStatus';
import AdminYearDelete from './pages/Settings/AdminYearDelete';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login route */}
        <Route path="/" element={<Login />} />
        <Route path="/logout" element={<Logout />} />



        {/* Layout with nested routes */}
        <Route path="layout/:username" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="staffmanage" element={<StaffManage />} />
          <Route path="paymentstatus" element={<PaymentStatus />} />
          <Route path="claimentry" element={<ClaimEntry />} />
          <Route path="claimmanage" element={<ClaimManage />} />
          <Route path="claimreport" element={<ClaimReport />} />
          <Route path="settings/adduser" element={<AddUser />} />
          <Route path="settings/deleteclaim" element={<AdminYearDelete />} />
          <Route path="paymentprocessing" element={<PaymentProcess />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;
