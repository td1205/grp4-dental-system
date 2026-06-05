import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import StaffManagementPage from './pages/StaffManagementPage/StaffManagementPage'
import ServicePricePage from './pages/ServicePricePage/ServicePricePage'
import CustomerManagementPage from './pages/CustomerManagement/CustomerManagementPage'
// Import trang Danh mục dịch vụ mới
import ServiceCategoryPage from './pages/ServiceCategory/ServiceCategoryPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/staff" replace />} />
        <Route path="/staff" element={<StaffManagementPage />} />
        <Route path="/customers" element={<CustomerManagementPage />} />
        
        {/* Tuyến đường mới cho Danh mục dịch vụ */}
        <Route path="/services/categories" element={<ServiceCategoryPage />} />
        
        <Route path="/services/prices" element={<ServicePricePage />} />
        <Route path="*" element={<Navigate to="/staff" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App