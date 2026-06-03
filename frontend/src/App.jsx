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
        
        {/* Giữ lại cả trang khách hàng */}
        <Route path="/customers" element={<CustomerManagementPage />} />
        
        {/* Và giữ lại cả các trang khác đang có trên develop */}
        <Route path="/services/prices" element={<ServicePricePage />} />
        
        <Route path="*" element={<Navigate to="/staff" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App