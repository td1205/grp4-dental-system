import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { staffApi } from '../../services/staffApi';
import './AuthPages.css';

export default function FirstTimePasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const validatePassword = (pass) => {
    // Tối thiểu 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    return regex.test(pass);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!token || !email) {
      setError('Đường dẫn kích hoạt không hợp lệ (thiếu token hoặc email).');
      return;
    }



    // EF1.2.3: Bắt buộc kiểm tra độ bảo mật
    if (!validatePassword(password)) {
      setError('Mật khẩu phải tối thiểu 8 ký tự, gồm ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    // Giả sử lấy thông tin user role từ URL hoặc backend, nhưng ta gọi backend activate luôn
    // Ở đây ta gọi API activate. Nếu thành công thì mới sang upload chứng chỉ nếu là bác sĩ.
    // Thực tế có thể gộp bước, nhưng đây là demo. Ta gọi activate trước.
    submitActivation();
  };

  const submitActivation = async () => {
    try {
      setIsLoading(true);
      await staffApi.activate({ token, email, newPassword: password });
      
      // Demo: Chuyển sang bước 2 để upload chứng chỉ (thực tế phải biết user là BS hay không)
      // Ta tạm coi như ai cũng có thể upload, hoặc có thể bỏ qua nếu là role khác.
      // Vì không trả về role từ /activate (ta có thể sửa /activate để trả về role),
      // Nhưng để đơn giản, ta sẽ gọi finishActivation luôn, hoặc bạn có thể mở rộng sau.
      alert('Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi kích hoạt tài khoản');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!certificate) {
      setError('Vui lòng tải lên chứng chỉ hành nghề hoặc bằng cấp hợp lệ.');
      return;
    }
    // Upload API would go here
    alert('Cập nhật hồ sơ thành công! Đang chuyển đến màn hình đăng nhập...');
    navigate('/login');
  };

  if (!token || !email) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Đường dẫn không hợp lệ</h2>
          <p>Link kích hoạt bị thiếu thông số. Vui lòng kiểm tra lại email.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{step === 1 ? 'Đổi mật khẩu lần đầu' : 'Cập nhật hồ sơ Bác sĩ'}</h2>
        <p>Tài khoản của bạn cần được kích hoạt trước khi sử dụng</p>
        
        {step === 1 && (
          <form onSubmit={handlePasswordSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            
            <div className="auth-field">
              <label>Email định danh</label>
              <input type="text" value={email} disabled />
            </div>

            <div className="auth-field">
              <label>Mật khẩu mới</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
              />
              <small className="auth-hint">Ít nhất 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt.</small>
            </div>
            
            <div className="auth-field">
              <label>Xác nhận mật khẩu mới</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
              />
            </div>
            
            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Tiếp tục'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleUploadSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            
            <div className="auth-field">
              <label>Chứng chỉ hành nghề / Bằng cấp</label>
              <div className="auth-upload">
                <input 
                  type="file" 
                  onChange={(e) => {
                    setCertificate(e.target.files[0]);
                    setError('');
                  }}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <p>{certificate ? certificate.name : 'Chưa chọn file nào'}</p>
              </div>
            </div>
            
            <button type="submit" className="auth-submit">Hoàn tất kích hoạt</button>
          </form>
        )}
      </div>
    </div>
  );
}
