import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";

// Layout components
import Navbar from "./components/NavBar";
import Footer from "./sections/Footer";
import ProtectedRoute, { AdminRoute } from "./auth/components/ProtectedRoute";
import SidebarWrapper from "./components/SidebarWrapper";
import ErrorBoundary from "./components/ErrorBoundary";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./auth/context/AuthContext";
import { ToastProvider } from "./components/NotificationToast";

// Homepage sections
import Hero from "./sections/Hero";
import PremiumServices from "./sections/PremiumServices";
import FAQ from "./sections/FAQ";
import Opportunity from "./sections/Opportunity";
import Testimonials from "./sections/Testimonials";
import HowItWorks from "./sections/HowItWorks";

// Authentication & onboarding pages
import Login from "./auth/pages/Login";
import Signup from "./auth/pages/Signup";
import UnifiedOnboarding from "./sections/UnifiedOnboarding";
import UnifiedDashboard from "./sections/UnifiedDashboard";
// Import placeholders for components that will be implemented later
import VerifyEmail from "./auth/pages/VerifyEmail";
import Profile from "./sections/Profile";
import AdminDashboard from "./sections/AdminDashboard";
import AdminScholarshipsList from "./components/AdminScholarshipsList";
import AdminScholarshipForm from "./components/AdminScholarshipForm";
import AdminJobsList from "./components/AdminJobsList";
import AdminJobForm from "./components/AdminJobForm";
import UsersList from "./components/UsersList";
import ScholarshipDetails from "./sections/ScholarshipDetails";
import ComingSoon from "./components/ComingSoon";
import NotFound from "./components/NotFound";

// Homepage component
const Homepage = () => (
  <>
    <Hero />
    <HowItWorks />
    <Testimonials />
    <PremiumServices />
    <FAQ />
    <Opportunity />
  </>
);

// Layout component for main site pages
const MainLayout = () => {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <Router>
                <Routes>
                {/* Public routes - No authentication required */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/* Routes with main layout - Public */}
                <Route element={<MainLayout />}>
                  <Route index element={<Homepage />} />
                </Route>

                {/* Protected routes - Require authentication */}
                <Route element={<ProtectedRoute />}>
                  {/* Unified onboarding route */}
                  <Route path="/onboarding" element={<UnifiedOnboarding />} />

                  {/* Dashboard routes - Require authentication */}
                  <Route element={<SidebarWrapper />}>
                    <Route path="/dashboard" element={<UnifiedDashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/dashboard/scholarships/:id" element={<ScholarshipDetails />} />
                    <Route path="/dashboard/*" element={<ComingSoon />} />
                  </Route>
                </Route>

                {/* Admin routes - Require admin role */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/scholarships" element={<AdminScholarshipsList />} />
                  <Route path="/admin/scholarships/new" element={<AdminScholarshipForm />} />
                  <Route path="/admin/scholarships/edit/:id" element={<AdminScholarshipForm />} />
                  <Route path="/admin/jobs" element={<AdminJobsList />} />
                  <Route path="/admin/jobs/new" element={<AdminJobForm />} />
                  <Route path="/admin/jobs/edit/:id" element={<AdminJobForm />} />
                  <Route path="/users-list" element={<UsersList />} />
                </Route>

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}export default App;
