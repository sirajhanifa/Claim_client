import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('authToken');
    const loggedInUser = localStorage.getItem('username');
    const { username } = useParams();
    if (!token) return <Navigate to="/" />;
    if (username && username !== loggedInUser) {
        return <Navigate to="/" />;
    }
    return children;
};

export default ProtectedRoute;
