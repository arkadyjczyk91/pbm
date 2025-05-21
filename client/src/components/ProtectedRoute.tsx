import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;