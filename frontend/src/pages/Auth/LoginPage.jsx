import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffApi } from '../../services/staffApi';
import './AuthPages.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    try {
      setIsLoading(true);
      const response = await staffApi.login({ email, password });
      
      // Lưu thông tin vào localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      const user = response.user;
      if (user.status === 'pending') {
        navigate('/first-time-password');
        return;
      }

      const userRole = user.role || user.position;
      
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (userRole === 'receptionist') {
        navigate('/receptionist/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Đăng nhập Hệ thống</h2>
        <p>Quản lý nha khoa DentalCare</p>
        
        <form onSubmit={handleLogin} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          <div className="auth-field">
            <label>Email đăng nhập</label>
            <input 
              type="text" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="VD: bs.nguyenvan@dentalcare.vn"
            />
          </div>
          
          <div className="auth-field">
            <label>Mật khẩu</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
            />
          </div>
          
          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
