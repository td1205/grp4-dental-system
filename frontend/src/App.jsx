import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import StaffManagementPage from './pages/StaffManagementPage/StaffManagementPage'
import ServicePricePage from './pages/ServicePricePage/ServicePricePage'
import CustomerManagementPage from './pages/CustomerManagement/CustomerManagementPage'
// Import trang Danh mục dịch vụ mới
import ServiceCategoryPage from './pages/ServiceCategory/ServiceCategoryPage'

// Import phân hệ Lễ tân của bạn
import ReceptionPage from './pages/reception/ReceptionPage'

// BƯỚC 1: Import trang Quản lý lịch hẹn mới của bạn vào đây
import AppointmentPage from './pages/appointment/AppointmentPage'
import BillingPage from './pages/billing/BillingPage'
import RevenueCustomerPage from './pages/customers/CustomerPage'
import PersonalSchedulePage from './pages/schedule/PersonalSchedulePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang mặc định khi mở web sẽ tự động nhảy vào trang lễ tân để test */}
        <Route path="/" element={<Navigate to="/reception" replace />} />
        
        {/* Tuyến đường (Route) dành cho phân hệ Lễ tân của bạn */}
        <Route path="/reception" element={<ReceptionPage />} />

        {/* BƯỚC 2: Thêm tuyến đường cho Quản lý lịch hẹn */}
        {/* (Đường dẫn /schedule này sẽ khớp 100% với thuộc tính 'path' trong file navigation.js) */}
        <Route path="/schedule" element={<AppointmentPage />} />

        {/* Các tuyến đường cũ của dự án */}
        <Route path="/staff" element={<StaffManagementPage />} />
        <Route path="/customers" element={<CustomerManagementPage />} />
        
        {/* Tuyến đường mới cho Danh mục dịch vụ */}
        <Route path="/services/categories" element={<ServiceCategoryPage />} />
        <Route path="/services/prices" element={<ServicePricePage />} />
        
        {/* Nếu người dùng gõ sai đường dẫn, tự động đá về trang của bạn */}
        <Route path="*" element={<Navigate to="/reception" replace />} />

        <Route path="/billing" element={<BillingPage />} />

        {/* Đổi path thành /revenue để khớp với mục dưới cùng của Sidebar */}
        <Route path="/revenue" element={<RevenueCustomerPage />} />


        <Route path="/personal-schedule" element={<PersonalSchedulePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App