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
import { Suspense, useEffect } from "react";
import BrStatement from "./Pages/BrStatement";
import BRDashboards from "./Pages/BRDashboards";
import FileNote from "./Pages/FileNote";
import FnDashboards from "./Pages/FnDashboards";
import { APP_VERSION } from "../config/ENV";
import ResetPwd from "./Pages/ResetPage";
import PendingDashboard from "./Pages/PendingDashboard";
import EquipmentMR from "./Pages/FleetRequest";
import FleetRequestRoute from "./Components/FleetRequestRoute";
import FRDashboards from "./Pages/FRDashboards";
import AdminRoute from "./Components/AdminRoute";
import NavigationPermissionRoute from "./Components/NavigationPermissionRoute";

const App = () => {
  const location = useLocation();
  const userInfo = useUserInfo();
  const isLoginPage = location.pathname === "/login";
  const isresetPage = location.pathname === "/resetpwd";
  const fnDashboardPermission =
    new URLSearchParams(location.search).get("view") === "projects-ioc"
      ? "canAccessProjects"
      : "canAccessPlant";
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
      className={`app-shell ${location.pathname !== "/login" && !isresetPage && "pl-12"} flex min-h-screen flex-col`}
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
                <AdminRoute>
                  <Particulars />
                </AdminRoute>
              }
            />

            <Route
              path="/receipts"
              element={
                <NavigationPermissionRoute
                  permission={["canAccessPlant", "canAccessHiringAsset"]}
                >
                  <Receipts />
                </NavigationPermissionRoute>
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
                <NavigationPermissionRoute
                  permission={["canAccessPlant", "canAccessHiringAsset"]}
                >
                  <Receipts />
                </NavigationPermissionRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <NavigationPermissionRoute
                  permission={["canAccessPlant", "canAccessHiringAsset"]}
                >
                  <Dashboard />
                </NavigationPermissionRoute>
              }
            />
            <Route path="/dashboardlg" element={<LogisticsDashboard />} />
            <Route
              path="/dashboardbr"
              element={
                <NavigationPermissionRoute
                  permission={["canAccessPlant", "canAccessBuyVsRent"]}
                >
                  <BRDashboards />
                </NavigationPermissionRoute>
              }
            />
            <Route
              path="/dashboardfn"
              element={
                <NavigationPermissionRoute permission={fnDashboardPermission}>
                  <FnDashboards />
                </NavigationPermissionRoute>
              }
            />
            <Route path="/pendingdashboard" element={<PendingDashboard />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/resetpwd" element={<ResetPwd />} />
            <Route
              path="/brstatement"
              element={
                <NavigationPermissionRoute
                  permission={["canAccessPlant", "canAccessBuyVsRent"]}
                >
                  <BrStatement />
                </NavigationPermissionRoute>
              }
            />
            <Route
              path="/fleetrequest"
              element={
                <NavigationPermissionRoute permission="canAccessProjects">
                  <FleetRequestRoute>
                    <EquipmentMR />
                  </FleetRequestRoute>
                </NavigationPermissionRoute>
              }
            />
            <Route
              path="/fleetrequest/:id"
              element={
                <NavigationPermissionRoute permission="canAccessProjects">
                  <FleetRequestRoute>
                    <EquipmentMR />
                  </FleetRequestRoute>
                </NavigationPermissionRoute>
              }
            />
            <Route
              path="/dashboardfr/"
              element={
                <NavigationPermissionRoute permission="canAccessProjects">
                  <FleetRequestRoute>
                    <FRDashboards />
                  </FleetRequestRoute>
                </NavigationPermissionRoute>
              }
            />

            <>
              <Route
                path="/filenote"
                element={
                  <NavigationPermissionRoute permission="canAccessPlant">
                    <FileNote />
                  </NavigationPermissionRoute>
                }
              />
              <Route
                path="/filenote/:fn_no"
                element={
                  <NavigationPermissionRoute permission="canAccessPlant">
                    <FileNote />
                  </NavigationPermissionRoute>
                }
              />
            </>
            <Route
              path="/brstatement/:cs_no"
              element={
                <NavigationPermissionRoute
                  permission={["canAccessPlant", "canAccessBuyVsRent"]}
                >
                  <BrStatement />
                </NavigationPermissionRoute>
              }
            />
          </Routes>
        </Suspense>
      </div>
      {!isLoginPage && !isresetPage && <Footer />}
    </div>
  );
};

export default App;
