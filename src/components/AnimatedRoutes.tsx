import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";
import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";
import Index from "@/pages/Index";
import ProductDetail from "@/pages/ProductDetail";
import MapPage from "@/pages/MapPage";
import AffiliatePage from "@/pages/AffiliatePage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderConfirmation from "@/pages/OrderConfirmation";
import DriverDashboard from "@/pages/DriverDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import MemberDashboard from "@/pages/MemberDashboard";
import FarmerDashboard from "@/pages/FarmerDashboard";
import AuthPage from "@/pages/AuthPage";
import KYCPage from "@/pages/KYCPage";
import NotFound from "@/pages/NotFound";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Index />
            </PageTransition>
          }
        />
        <Route
          path="/product/:id"
          element={
            <PageTransition>
              <ProductDetail />
            </PageTransition>
          }
        />
        <Route
          path="/map"
          element={
            <PageTransition>
              <MapPage />
            </PageTransition>
          }
        />
        <Route
          path="/affiliate"
          element={
            <PageTransition>
              <AffiliatePage />
            </PageTransition>
          }
        />
        <Route
          path="/checkout"
          element={
            <PageTransition>
              <CheckoutPage />
            </PageTransition>
          }
        />
        <Route
          path="/order-confirmation"
          element={
            <PageTransition>
              <OrderConfirmation />
            </PageTransition>
          }
        />
        <Route
          path="/driver"
          element={
            <RoleProtectedRoute allowedRoles={['driver']}>
              <PageTransition>
                <DriverDashboard />
              </PageTransition>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <PageTransition>
                <AdminDashboard />
              </PageTransition>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/member"
          element={
            <ProtectedRoute>
              <PageTransition>
                <MemberDashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer"
          element={
            <RoleProtectedRoute allowedRoles={['farmer']}>
              <PageTransition>
                <FarmerDashboard />
              </PageTransition>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <PageTransition>
              <AuthPage />
            </PageTransition>
          }
        />
        <Route
          path="/kyc"
          element={
            <PageTransition>
              <KYCPage />
            </PageTransition>
          }
        />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
