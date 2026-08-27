import { Route, Routes, useLocation, Navigate } from "react-router-dom";
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
import { Suspense, useEffect } from "react";
import BrStatement from "./Pages/BrStatement";
import BRDashboards from "./Pages/BRDashboards";
import FileNote from "./Pages/FileNote";
import { is_fnote } from "./Helpers/dept_helper";
import FnDashboards from "./Pages/FnDashboards";
import { APP_VERSION } from "../config/ENV";
import ResetPwd from "./Pages/ResetPage";

const App = () => {
  const location = useLocation();
  const userInfo = useUserInfo();
  const isLoginPage = location.pathname === "/login";
  const isresetPage = location.pathname === "/resetpwd";
  useEffect(() => {
    const storedAppVersion = localStorage.getItem("app_version");

    if (storedAppVersion !== APP_VERSION) {
      localStorage.removeItem("userInfo");
      localStorage.setItem("app_version", APP_VERSION);
      window.location.replace("/login");
    }
  }, []);
  return (
    <div
      className={`${location.pathname !== "/login" && !isresetPage && "pl-12"} flex min-h-screen flex-col`}
    >
      {!userInfo && !isresetPage && (
        <FloatingNotification
          message={"Login to view statements"}
          duration={4000}
        />
      )}{" "}
      {!isLoginPage && !isresetPage && <Header />}
      <div className="flex min-h-0 flex-1 flex-col">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-dashed border-blue-500"></div>
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
            <Route path="/dashboardbr" element={<BRDashboards />} />
            <Route path="/dashboardfn" element={<FnDashboards />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/resetpwd" element={<ResetPwd />} />
            <Route path="/brstatement" element={<BrStatement />} />

            <>
              <Route
                path="/filenote"
                element={
                  <ProtectedRoute>
                    <FileNote />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/filenote/:fn_no"
                element={
                  <ProtectedRoute>
                    <FileNote />
                  </ProtectedRoute>
                }
              />
            </>
            <Route path="/brstatement/:cs_no" element={<BrStatement />} />
          </Routes>
        </Suspense>
      </div>
      {!isLoginPage && !isresetPage && <Footer />}
    </div>
  );
};

export default App;
