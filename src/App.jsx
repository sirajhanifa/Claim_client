import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './layout/Layout';
import StaffManage from './pages/StaffManage';
import ClaimEntry from './pages/ClaimEntry';
import ClaimSubmission from './pages/ClaimSubmission';
import ClaimManage from './pages/ClaimManage';
import ClaimReport from './pages/ClaimReport';
import ProtectedRoute from './components/ProtectedRoute';
import UserControl from './pages/UserControl';
import PaymentProcess from './pages/PaymentProcess';
import Logout from './components/Logout';
import ClaimStatus from './pages/ClaimStatus';
import DataDeletion from './pages/DataDeletion';
import Guidelines from './pages/Guidelines';
import AcademicManage from './pages/AcademicManage';
import ChangePassword from './pages/ChangePassword';

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="layout/:username" element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }>
                    <Route path="dataDeletion" element={<DataDeletion />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="staffmanage" element={<StaffManage />} />
                    <Route path="claimstatus" element={<ClaimStatus />} />
                    <Route path="claimsubmission" element={<ClaimSubmission />} />
                    <Route path="guidelines" element={<Guidelines />} />
                    <Route path="claimentry" element={<ClaimEntry />} />
                    <Route path="claimmanage" element={<ClaimManage />} />
                    <Route path="claimreport" element={<ClaimReport />} />
                    <Route path="userControl" element={<UserControl />} />
                    <Route path="paymentprocessing" element={<PaymentProcess />} />
                    <Route path="academicManage" element={<AcademicManage />} />
                    <Route path="changePassword" element={<ChangePassword />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App;