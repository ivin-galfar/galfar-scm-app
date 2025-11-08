import { Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import Home from "./Components/Home";
import Header from "./Components/Header";
import Receipts from "./Components/Receipts";
import ProtectedRoute from "./Components/ProtectedRoute";
import useUserInfo from "./CustomHooks/useUserInfo";
import Particulars from "./Pages/Particulars";
import FloatingNotification from "./Components/FloatingNotification";
import Dashboard from "./Pages/Dashboard";
import Footer from "./Components/Footer";
import Contact from "./Pages/Contact";
import LogisticsStatement from "./Pages/LogisticsStatement";
import LogisticsDashboard from "./Pages/LogisticsDashboard";
import { Suspense } from "react";

const App = () => {
  const location = useLocation();
  const userInfo = useUserInfo();

  const isLoginPage = location.pathname === "/login";

  return (
    <div
      className={`${location.pathname !== "/login" && "pl-12"} flex flex-col  min-h-screen`}
    >
      {!userInfo && (
        <FloatingNotification
          message={"Login to view statements"}
          duration={4000}
        />
      )}{" "}
      {!isLoginPage && <Header />}
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/particulars/:dept_id"
            element={
              <ProtectedRoute>
                <Particulars />
              </ProtectedRoute>
            }
          />

          <Route
            path="/receipts"
            element={
              <ProtectedRoute>
                <Receipts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lstatements"
            element={
              <ProtectedRoute>
                <LogisticsStatement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lstatements/:cs_no"
            element={
              <ProtectedRoute>
                <LogisticsStatement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receipts/:mrnumber"
            element={
              <ProtectedRoute>
                <Receipts />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboardlg" element={<LogisticsDashboard />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
      {!isLoginPage && <Footer />}
    </div>
  );
};

export default App;
