import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { staffApi } from '../../services/staffApi';
import './AuthPages.css';

export function FirstTimePasswordPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [password, setPassword] = useState('');
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

    if (!tokenInput) {
      setError('Vui lòng nhập Token xác nhận.');
      return;
    }



    // EF1.2.3: Bắt buộc kiểm tra độ bảo mật
    if (!validatePassword(password)) {
      setError('Mật khẩu phải tối thiểu 8 ký tự, gồm ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt.');
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
      await staffApi.activate({ token: tokenInput, newPassword: password });
      
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



  return (
    <div className="login-wrapper">
      {/* Background blobs for aesthetic */}
      <div className="blob blob-top-left"></div>
      <div className="blob blob-bottom-left"></div>
      <div className="blob blob-bottom-right"></div>
      <div className="blob blob-top-right"></div>

      <div className="login-container" style={{ width: '550px', height: 'auto', minHeight: '400px' }}>
        <div className="login-left" style={{ padding: '50px 60px' }}>
          <div className="login-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px' }}>{step === 1 ? 'Thiết lập mật khẩu' : 'Cập nhật hồ sơ'}</h1>
            <p style={{ marginTop: '8px' }}>{step === 1 ? 'Vui lòng thiết lập mật khẩu an toàn để kích hoạt' : 'Cập nhật chứng chỉ hành nghề của bạn'}</p>
          </div>
          
          {step === 1 && (
            <form onSubmit={handlePasswordSubmit} className="login-form" autoComplete="off">
              {error && <div className="login-error" style={{ textAlign: 'center', padding: '10px', background: '#ffebee', borderRadius: '8px', color: '#d32f2f', fontSize: '13px', fontWeight: '500' }}>{error}</div>}
              
              <div className="input-group">
                <i className="fas fa-key input-icon"></i>
                <input 
                  type="text" 
                  name="token_secure"
                  value={tokenInput} 
                  onChange={(e) => setTokenInput(e.target.value)} 
                  placeholder="Dán mã Token từ email vào đây"
                  autoComplete="off"
                />
              </div>

              <div className="input-group" style={{ flexDirection: 'column', alignItems: 'flex-start', borderBottom: 'none', paddingBottom: '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', borderBottom: '2px solid #aebcfa', paddingBottom: '8px', transition: 'border-color 0.3s ease' }}>
                  <i className="fas fa-lock input-icon"></i>
                  <input 
                    type="password" 
                    name="new_password_secure"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px' }}
                    autoComplete="new-password"
                  />
                </div>
                <small style={{ color: '#888', fontSize: '12px', marginTop: '10px' }}>* Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ số và ký tự đặc biệt.</small>
              </div>
              
              <button type="submit" className="btn-login" disabled={isLoading} style={{ marginTop: '15px', padding: '14px', fontSize: '16px', fontWeight: '600', borderRadius: '8px', boxShadow: '0 4px 12px rgba(74, 114, 250, 0.3)' }}>
                {isLoading ? (
                  <span><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>Đang xử lý...</span>
                ) : (
                  <span>Lưu mật khẩu <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i></span>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleUploadSubmit} className="login-form">
              {error && <div className="login-error" style={{ textAlign: 'center', padding: '10px', background: '#ffebee', borderRadius: '8px', color: '#d32f2f' }}>{error}</div>}
              
              <div className="input-group" style={{ borderBottom: 'none', flexDirection: 'column', alignItems: 'flex-start' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#444', marginBottom: '10px' }}>Chứng chỉ hành nghề / Bằng cấp</label>
                <div style={{ width: '100%', border: '2px dashed #aebcfa', borderRadius: '8px', padding: '30px', textAlign: 'center', cursor: 'pointer', background: '#f8faff', transition: 'all 0.3s ease' }}>
                  <i className="fas fa-cloud-upload-alt" style={{ fontSize: '32px', color: '#4a72fa', marginBottom: '10px' }}></i>
                  <input 
                    type="file" 
                    onChange={(e) => {
                      setCertificate(e.target.files[0]);
                      setError('');
                    }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    id="cert-upload"
                  />
                  <label htmlFor="cert-upload" style={{ display: 'block', cursor: 'pointer' }}>
                    <p style={{ color: '#555', margin: '0 0 5px 0', fontSize: '14px' }}>Nhấn vào đây để tải lên file</p>
                    <p style={{ color: '#4a72fa', margin: 0, fontWeight: '600', fontSize: '13px' }}>{certificate ? certificate.name : 'Chưa có tệp nào được chọn'}</p>
                  </label>
                </div>
              </div>
              
              <button type="submit" className="btn-login" style={{ marginTop: '15px', padding: '14px', fontSize: '16px', fontWeight: '600', borderRadius: '8px' }}>
                Hoàn tất kích hoạt
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
