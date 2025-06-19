import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import LoginPage from '../pages/Auth/Login';
import RegisterPage from '../pages/Auth/Register';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import PurchasePage from '../pages/Purchase/PurchasePage';
import TransferPage from '../pages/Transfer/TransferPage';
import AssignmentPage from '../pages/Assignment/AssignmentPage';
import ExpenditurePage from '../pages/Expenditure/ExpenditurePage';

const AppRouter = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="*" element={<div>404 - Page Not Found</div>} />

    {/* Protected Layout Route */}
    <Route
      path="/"
      element={
        <ProtectedRoute allowedRoles={['admin', 'commander', 'logistics']}>
          <MainLayout />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="purchase" element={<PurchasePage />} />
      <Route path="transfer" element={<TransferPage />} />
      <Route path="assignment" element={<AssignmentPage />} />
      <Route path="expenditure" element={<ExpenditurePage />} />
    </Route>
  </Routes>
);

export default AppRouter;
