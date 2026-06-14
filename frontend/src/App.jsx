import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

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

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) return <Navigate to="/login" replace />;

  try {
    const user = JSON.parse(userStr);
    if (user.status === 'pending') return <Navigate to="/first-time-password" replace />;

    const userRole = user.role || user.position;
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
      if (userRole === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
      if (userRole === 'receptionist') return <Navigate to="/receptionist/dashboard" replace />;
      return <Navigate to="/login" replace />;
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

        {/* Khối bảo toàn Layout với đầy đủ mọi route */}
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<Navigate to="/staff" replace />} />
          <Route path="/receptionist/dashboard" element={<Navigate to="/reception" replace />} />

          {/* Phân hệ Lễ tân mới */}
          <Route path="/reception" element={<ProtectedRoute allowedRoles={['admin', 'receptionist']}><ReceptionPage /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor']}><AppointmentPage /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute allowedRoles={['admin', 'receptionist']}><BillingPage /></ProtectedRoute>} />
          <Route path="/personal-schedule" element={<ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor']}><PersonalSchedulePage /></ProtectedRoute>} />

          {/* CÁC TRANG BÁC SĨ & Y TẾ */}
          <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'doctor']}><DoctorDashboardPage /></ProtectedRoute>} />
          <Route path="/doctor/medical-record/:id" element={<ProtectedRoute allowedRoles={['admin', 'doctor']}><MedicalRecordPage /></ProtectedRoute>} />
          <Route path="/doctor/income" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><IncomeReportPage /></ProtectedRoute>} />
          <Route path="/doctor/history" element={<ProtectedRoute allowedRoles={['admin', 'doctor']}><PatientHistory /></ProtectedRoute>} />

          {/* CÁC TRANG QUẢN LÝ (Giữ nguyên cấu trúc cũ) */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['admin']}><StaffManagementPage /></ProtectedRoute>} />
          <Route path="/staff/new" element={<ProtectedRoute allowedRoles={['admin']}><AddStaffPage /></ProtectedRoute>} />
          <Route path="/staff/:id/edit" element={<ProtectedRoute allowedRoles={['admin']}><EditStaffPage /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute allowedRoles={['admin', 'receptionist']}><CustomerManagementPage /></ProtectedRoute>} />
          <Route path="/services/categories" element={<ProtectedRoute allowedRoles={['admin']}><ServiceCategoryPage /></ProtectedRoute>} />
          <Route path="/services/prices" element={<ProtectedRoute allowedRoles={['admin']}><ServicePricePage /></ProtectedRoute>} />
          <Route path="/schedule/leaves" element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}><ScheduleLeavesPage /></ProtectedRoute>} />
          <Route path="/schedule/shifts" element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}><ScheduleShiftsPage /></ProtectedRoute>} />
          <Route path="/salary/config" element={<ProtectedRoute allowedRoles={['admin']}><SalaryConfigPage /></ProtectedRoute>} />
          <Route path="/salary/payslips" element={<ProtectedRoute allowedRoles={['admin']}><SalaryPayslipsPage /></ProtectedRoute>} />
          <Route path="/revenue" element={<ProtectedRoute allowedRoles={['admin']}><RevenueStatisticsPage /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;