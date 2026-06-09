import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { StaffManagementPage } from './pages/StaffManagementPage/StaffManagementPage'
import { AddStaffPage } from './pages/AddStaffPage'
import { EditStaffPage } from './pages/EditStaffPage'
import { CustomerManagementPage } from './pages/CustomerManagement/CustomerManagementPage'
import { ServiceCategoryPage } from './pages/ServiceCategory/ServiceCategoryPage'
import { ServicePricePage } from './pages/ServicePricePage/ServicePricePage'
import { ScheduleLeavesPage } from './pages/ScheduleLeaves/ScheduleLeavesPage'
import { ScheduleShiftsPage } from './pages/ScheduleShifts/ScheduleShiftsPage'
import { SalaryConfigPage } from './pages/SalaryConfig/SalaryConfigPage'
import { SalaryPayslipsPage } from './pages/SalaryPayslips/SalaryPayslipsPage'
import { RevenueStatisticsPage } from './pages/RevenueStats/RevenueStatisticsPage'

import { LoginPage } from './pages/Auth/LoginPage'
import { FirstTimePasswordPage } from './pages/Auth/FirstTimePasswordPage'
import { DashboardLayout } from './components/layout/DashboardLayout/DashboardLayout'

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    // Bắt buộc đổi mật khẩu nếu trạng thái là pending
    if (user.status === 'pending') {
      return <Navigate to="/first-time-password" replace />;
    }

    // Phân quyền theo position/role
    const userRole = user.role || user.position;
    
    // Chặn nếu role không nằm trong mảng allowedRoles
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // Tùy theo role, đẩy về trang chủ mặc định của họ
      if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
      if (userRole === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
      if (userRole === 'receptionist') return <Navigate to="/receptionist/dashboard" replace />;
      
      // Fallback an toàn
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
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/first-time-password" element={<FirstTimePasswordPage />} />
        
        <Route element={<DashboardLayout />}>
          {/* Dashboard Mặc định theo Role */}
          <Route path="/admin/dashboard" element={<Navigate to="/staff" replace />} />
          <Route path="/receptionist/dashboard" element={<Navigate to="/customers" replace />} />
          <Route path="/doctor/dashboard" element={<Navigate to="/schedule/shifts" replace />} />

          {/* Quản lý nhân viên - Chỉ Admin */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['admin']}><StaffManagementPage /></ProtectedRoute>} />
          <Route path="/staff/new" element={<ProtectedRoute allowedRoles={['admin']}><AddStaffPage /></ProtectedRoute>} />
          <Route path="/staff/:id/edit" element={<ProtectedRoute allowedRoles={['admin']}><EditStaffPage /></ProtectedRoute>} />
          
          {/* Quản lý Khách hàng - Admin, Lễ tân */}
          <Route path="/customers" element={<ProtectedRoute allowedRoles={['admin', 'receptionist']}><CustomerManagementPage /></ProtectedRoute>} />
          
          {/* Danh mục và giá dịch vụ - Admin */}
          <Route path="/services/categories" element={<ProtectedRoute allowedRoles={['admin']}><ServiceCategoryPage /></ProtectedRoute>} />
          <Route path="/services/prices" element={<ProtectedRoute allowedRoles={['admin']}><ServicePricePage /></ProtectedRoute>} />
          
          {/* Lịch làm việc - Tất cả đều xem được (Bác sĩ, Lễ tân, Admin) */}
          <Route path="/schedule/leaves" element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}><ScheduleLeavesPage /></ProtectedRoute>} />
          <Route path="/schedule/shifts" element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}><ScheduleShiftsPage /></ProtectedRoute>} />
          
          {/* Cấu hình lương, phiếu lương - Admin */}
          <Route path="/salary/config" element={<ProtectedRoute allowedRoles={['admin']}><SalaryConfigPage /></ProtectedRoute>} />
          <Route path="/salary/payslips" element={<ProtectedRoute allowedRoles={['admin']}><SalaryPayslipsPage /></ProtectedRoute>} />
          
          {/* Thống kê - Admin */}
          <Route path="/revenue" element={<ProtectedRoute allowedRoles={['admin']}><RevenueStatisticsPage /></ProtectedRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App