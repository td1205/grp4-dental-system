import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import StaffManagementPage from './pages/StaffManagementPage/StaffManagementPage'
import ServicePricePage from './pages/ServicePricePage/ServicePricePage'
import CustomerManagementPage from './pages/CustomerManagement/CustomerManagementPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/staff" replace />} />
        <Route path="/staff" element={<StaffManagementPage />} />
        
        {/* Tuyến đường chính xác cho trang khách hàng */}
        <Route path="/customers" element={<CustomerManagementPage />} />
        
        <Route path="/services/prices" element={<ServicePricePage />} />
        <Route path="*" element={<Navigate to="/staff" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App