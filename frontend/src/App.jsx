import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import StaffManagementPage from './pages/StaffManagementPage';
import AddStaffPage from './pages/AddStaffPage';
import EditStaffPage from './pages/EditStaffPage';
import PlaceholderPage from './pages/PlaceholderPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/staff" replace />} />
          <Route path="/staff/new" element={<AddStaffPage />} />
          <Route path="/staff/:id/edit" element={<EditStaffPage />} />
          <Route path="/staff" element={<StaffManagementPage />} />
          <Route
            path="/dashboard"
            element={<PlaceholderPage title="Tổng quan" />}
          />
          <Route
            path="/appointments"
            element={<PlaceholderPage title="Lịch hẹn" />}
          />
          <Route
            path="/patients"
            element={<PlaceholderPage title="Bệnh nhân" />}
          />
          <Route
            path="/services"
            element={<PlaceholderPage title="Dịch vụ" />}
          />
          <Route
            path="/reports"
            element={<PlaceholderPage title="Báo cáo" />}
          />
          <Route
            path="/settings"
            element={<PlaceholderPage title="Cài đặt" />}
          />
          <Route path="*" element={<Navigate to="/staff" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
