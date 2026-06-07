import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import StaffManagementPage from './pages/StaffManagementPage/StaffManagementPage'
import AddStaffPage from './pages/AddStaffPage'
import EditStaffPage from './pages/EditStaffPage'
import CustomerManagementPage from './pages/CustomerManagement/CustomerManagementPage'
import ServiceCategoryPage from './pages/ServiceCategory/ServiceCategoryPage'
import ServicePricePage from './pages/ServicePricePage/ServicePricePage'
import ScheduleLeavesPage from './pages/ScheduleLeaves/ScheduleLeavesPage'
import ScheduleShiftsPage from './pages/ScheduleShifts/ScheduleShiftsPage'
import SalaryConfigPage from './pages/SalaryConfig/SalaryConfigPage'
import SalaryPayslipsPage from './pages/SalaryPayslips/SalaryPayslipsPage'
import RevenueStatsPage from './pages/RevenueStats/RevenueStatsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/staff" replace />} />
        
        {/* Quản lý nhân viên */}
        <Route path="/staff" element={<StaffManagementPage />} />
        <Route path="/staff/new" element={<AddStaffPage />} />
        <Route path="/staff/:id/edit" element={<EditStaffPage />} />
        
        {/* Quản lý khách hàng */}
        <Route path="/customers" element={<CustomerManagementPage />} />
        
        {/* Danh mục dịch vụ & Bảng giá */}
        <Route path="/services/categories" element={<ServiceCategoryPage />} />
        <Route path="/services/prices" element={<ServicePricePage />} />
        
        {/* Lịch làm việc */}
        <Route path="/schedule/leaves" element={<ScheduleLeavesPage />} />
        <Route path="/schedule/shifts" element={<ScheduleShiftsPage />} />
        
        {/* Quản lý lương */}
        <Route path="/salary/config" element={<SalaryConfigPage />} />
        <Route path="/salary/payslips" element={<SalaryPayslipsPage />} />
        
        {/* Thống kê doanh thu */}
        <Route path="/revenue" element={<RevenueStatsPage />} />
        
        <Route path="*" element={<Navigate to="/staff" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App