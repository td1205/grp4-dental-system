import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ROLES } from './constants/roles';

// Import đầy đủ các trang cũ của hệ thống
import { StaffManagementPage } from './pages/StaffManagementPage/StaffManagementPage';
import { AddStaffPage } from './pages/AddStaffPage';
import { EditStaffPage } from './pages/EditStaffPage';
import { CustomerManagementPage } from './pages/CustomerManagement/CustomerManagementPage';
import { ServiceCategoryPage } from './pages/ServiceCategory/ServiceCategoryPage';
import { ServicePricePage } from './pages/ServicePricePage/ServicePricePage';
import { ScheduleLeavesPage } from './pages/ScheduleLeaves/ScheduleLeavesPage';
import { ScheduleShiftsPage } from './pages/ScheduleShifts/ScheduleShiftsPage';
import { SalaryConfigPage } from './pages/SalaryConfig/SalaryConfigPage';
import { SalaryPayslipsPage } from './pages/SalaryPayslips/SalaryPayslipsPage';
import { RevenueStatisticsPage } from './pages/RevenueStats/RevenueStatisticsPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage/DoctorDashboardPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { FirstTimePasswordPage } from './pages/Auth/FirstTimePasswordPage';
import { DashboardLayout } from './components/layout/DashboardLayout/DashboardLayout';
import { MedicalRecordPage } from './pages/MedicalRecordPage/MedicalRecordPage';
import { PatientHistory } from './pages/PatientHistory/PatientHistory.jsx';
import { IncomeReportPage } from './components/doctor/IncomeReportPage.jsx';

// Import các trang Lễ tân mới thêm vào
import ReceptionPage from './pages/reception/ReceptionPage';
import AppointmentPage from './pages/appointment/AppointmentPage';
import BillingPage from './pages/billing/BillingPage';
import PersonalSchedulePage from './pages/schedule/PersonalSchedulePage';
import RevenueCustomerPage from './pages/customers/CustomerPage';

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) return <Navigate to="/login" replace />;

  try {
    const user = JSON.parse(userStr);
    if (user.status === 'pending') return <Navigate to="/first-time-password" replace />;

    const userRole = (user.role || user.position || '').toLowerCase();
    
    if (allowedRoles) {
      const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
      if (!normalizedAllowedRoles.includes(userRole)) {
        if (userRole === ROLES.ADMIN.toLowerCase()) return <Navigate to="/admin/dashboard" replace />;
        if (userRole === ROLES.DOCTOR.toLowerCase()) return <Navigate to="/doctor/dashboard" replace />;
        if (userRole === ROLES.RECEPTIONIST.toLowerCase()) return <Navigate to="/receptionist/dashboard" replace />;
        return <Navigate to="/login" replace />;
      }
    }
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activate" element={<FirstTimePasswordPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<Navigate to="/staff" replace />} />
          <Route path="/receptionist/dashboard" element={<Navigate to="/reception" replace />} />

          {/* Phân hệ Lễ tân mới */}
          <Route path="/reception" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.RECEPTIONIST]}><ReceptionPage /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR]}><AppointmentPage /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.RECEPTIONIST]}><BillingPage /></ProtectedRoute>} />
          <Route path="/personal-schedule" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR]}><PersonalSchedulePage /></ProtectedRoute>} />

          {/* CÁC TRANG BÁC SĨ & Y TẾ */}
          <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR]}><DoctorDashboardPage /></ProtectedRoute>} />
          <Route path="/doctor/medical-record/:id" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR]}><MedicalRecordPage /></ProtectedRoute>} />
          <Route path="/doctor/income" element={<ProtectedRoute allowedRoles={[ROLES.DOCTOR, ROLES.ADMIN]}><IncomeReportPage /></ProtectedRoute>} />
          <Route path="/doctor/history" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR]}><PatientHistory /></ProtectedRoute>} />

          {/* CÁC TRANG QUẢN LÝ */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><StaffManagementPage /></ProtectedRoute>} />
          <Route path="/staff/new" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AddStaffPage /></ProtectedRoute>} />
          <Route path="/staff/:id/edit" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><EditStaffPage /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.RECEPTIONIST]}><CustomerManagementPage /></ProtectedRoute>} />
          <Route path="/services/categories" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><ServiceCategoryPage /></ProtectedRoute>} />
          <Route path="/services/prices" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><ServicePricePage /></ProtectedRoute>} />
          <Route path="/schedule/leaves" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]}><ScheduleLeavesPage /></ProtectedRoute>} />
          <Route path="/schedule/shifts" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]}><ScheduleShiftsPage /></ProtectedRoute>} />
          <Route path="/salary/config" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><SalaryConfigPage /></ProtectedRoute>} />
          <Route path="/salary/payslips" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><SalaryPayslipsPage /></ProtectedRoute>} />
          <Route path="/revenue" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><RevenueStatisticsPage /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;