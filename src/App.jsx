import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './layout/Layout';
import StaffManage from './pages/StaffManage';
import ClaimEntry from './pages/ClaimEntry';
import ClaimManage from './pages/ClaimManage';
import ClaimReport from './pages/ClaimReport';
import ProtectedRoute from './components/ProtectedRoute';
import UserControl from './pages/UserControl';
import PaymentProcess from './pages/PaymentProcess';
import Logout from './components/Logout';
import PaymentStatus from './pages/PaymentStatus';
import DataDeletion from './pages/DataDeletion';
import Guidelines from './pages/Guidelines';

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
                    <Route path="paymentstatus" element={<PaymentStatus />} />
                    <Route path="guidelines" element={<Guidelines />} />
                    <Route path="claimentry" element={<ClaimEntry />} />
                    <Route path="claimmanage" element={<ClaimManage />} />
                    <Route path="claimreport" element={<ClaimReport />} />
                    <Route path="userControl" element={<UserControl />} />
                    <Route path="paymentprocessing" element={<PaymentProcess />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App;