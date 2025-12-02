// // // src/middleware/ProtectedRoute.tsx
// import React, { useContext } from "react";
// import { Navigate } from "react-router-dom";
// import { AuthContext } from "../src/Context/AuthContext";

// interface ProtectedRouteProps {
//   children: JSX.Element;
//   allowedRoles?: string[]; // (optional, if you add roles later)
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
//   const { isLoggedIn } = useContext(AuthContext);

//   // If not logged in, redirect to doctor login
//   if (!isLoggedIn) {
//     return <Navigate to="/doctor/login" replace />;
//   }

//   // If logged in, render the protected content
//   return children;
// };

// export default ProtectedRoute;
