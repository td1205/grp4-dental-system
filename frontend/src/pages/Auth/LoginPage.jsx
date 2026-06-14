import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffApi } from '../../services/staffApi';
import { ROLES } from '../../constants/roles';
import './AuthPages.css';
import { User, Lock } from 'lucide-react';

export function LoginPage() {
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
        navigate('/activate');
        return;
      }

      const userRole = (user.role || user.position || '').toLowerCase();

      if (userRole === ROLES.ADMIN.toLowerCase()) {
        navigate('/admin/dashboard');
      } else if (userRole === ROLES.DOCTOR.toLowerCase()) {
        navigate('/doctor/dashboard');
      } else if (userRole === ROLES.RECEPTIONIST.toLowerCase()) {
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
    <div className="login-wrapper">
      {/* Decorative blobs */}
      <div className="blob blob-top-left"></div>
      <div className="blob blob-bottom-left"></div>
      <div className="blob blob-bottom-right"></div>
      <div className="blob blob-top-right"></div>

      <div className="login-container">
        <div className="login-left">
          <div className="login-header">
            <h1>Đăng nhập Hệ thống</h1>
            <p>Quản lý nha khoa DentalCare</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && <div className="login-error">{error}</div>}

            <div className="input-group">
              <User className="input-icon" size={20} />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email đăng nhập"
                required
              />
            </div>

            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                required
              />
            </div>

            <div className="form-actions" style={{ justifyContent: 'center' }}>
              <button type="submit" className="btn-login" style={{ width: '100%', marginTop: '10px' }} disabled={isLoading}>
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="login-right">
          <div className="brand-logo">
            <span className="logo-icon">🦷</span> OrionDental
          </div>
          <img 
            src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1974&auto=format&fit=crop" 
            alt="Dental Clinic" 
            className="login-image"
          />
        </div>
      </div>
    </div>
  );
}
