import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';

export default function BillingPage() {
  const mockUser = { name: "Lê Tân", role: "Lễ Tân", initials: "LT" };

  // --- CÁC STATE QUẢN LÝ DỮ LIỆU THỰC ---
  const [invoices, setInvoices] = useState([]); // Chứa danh sách hóa đơn từ Backend
  const [selectedInvoice, setSelectedInvoice] = useState(''); // ID hóa đơn đang chọn (Ví dụ: 'INV002')
  const [paymentMethod, setPaymentMethod] = useState('QR'); // 'CASH', 'QR', 'POS'
  const [searchTerm, setSearchTerm] = useState(''); // Thanh tìm kiếm nhanh

  // --- Hàm tải danh sách hóa đơn từ Server 3001 ---
  const loadInvoices = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/billing/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
        
        // Mặc định tự động chọn hóa đơn đầu tiên hoặc giữ nguyên lựa chọn cũ
        if (data.length > 0 && !selectedInvoice) {
          setSelectedInvoice(data[0].id);
        }
      }
    } catch (error) {
      console.error("Lỗi kết nối API lấy danh sách hóa đơn viện phí:", error);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // Tìm kiếm đối tượng chi tiết tương ứng với ID đang được chọn từ mảng State
  const currentDetail = invoices.find(inv => inv.id === selectedInvoice);

  // --- Hàm xử lý click nút Xác nhận đã thu tiền ---
  const handleConfirmPayment = async () => {
    if (!currentDetail) {
      alert("Vui lòng lựa chọn một hóa đơn cần kết toán!");
      return;
    }

    const methodLabel = paymentMethod === 'CASH' ? 'Tiền mặt' : paymentMethod === 'QR' ? 'Chuyển khoản QR' : 'Quét thẻ POS';

    try {
      const response = await fetch(`http://localhost:3001/api/billing/invoices/${currentDetail.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: methodLabel
        })
      });

      if (response.ok) {
        alert(`🎉 THÀNH CÔNG!\n\nHệ thống DentalCare đã phê duyệt phiếu thu viện phí:\n• Mã hóa đơn: ${currentDetail.id}\n• Khách hàng: ${currentDetail.patientName || currentDetail.name}\n• Số tiền đã thu: ${currentDetail.totalCost}\n• Hình thức thanh toán: [${methodLabel}]\n\nTrạng thái: Phiếu thu hợp lệ, đã chốt hóa đơn thành công!`);
        loadInvoices(); // Tải lại dữ liệu để cập nhật tag màu sắc của hóa đơn sang xanh lá
      } else {
        alert("Thanh toán thất bại, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi kết nối kết toán:", error);
    }
  };

  // Bộ lọc tìm kiếm nhanh theo Họ tên hoặc Mã Hóa đơn
  const filteredInvoices = invoices.filter(inv => 
    (inv.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: '"Inter", sans-serif' }}>
      <Sidebar user={mockUser} />

      <div style={{ flexGrow: 1, padding: '40px 32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>Thanh toán Viện phí</h1>

        {/* Thanh Tìm kiếm */}
        <div style={{ backgroundColor: '#ffffff', padding: '16px 24px', borderRadius: '16px', border: '1px solid #f1f5f9', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Nhập Tên bệnh nhân hoặc Mã hóa đơn..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 48px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', outline: 'none', fontSize: '15px' }}
            />
          </div>
        </div>

        {/* Bố cục 2 cột chính */}
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* CỘT TRÁI: Hóa đơn chờ thanh toán */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', marginTop: 0 }}>Hóa đơn chờ thanh toán</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '530px', overflowY: 'auto' }}>
              {invoices.map((inv) => {
                const isSelected = selectedInvoice === inv.id;
                const isPaid = inv.status === 'Đã thanh toán';

                return (
                  <div 
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv.id)}
                    style={{
                      padding: '16px', borderRadius: '12px',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#f0f5ff' : '#ffffff',
                      cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: '16px', right: '16px', padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: '600',
                      backgroundColor: isPaid ? '#dcfce7' : '#fee2e2',
                      color: isPaid ? '#16a34a' : '#ef4444'
                    }}>
                      {inv.status || 'Chưa thanh toán'}
                    </span>

                    <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>{inv.patientName}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>{inv.id}</div>
                    <div style={{ textAlign: 'right', fontWeight: '700', color: '#2563eb', fontSize: '16px' }}>{inv.totalCost}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CỘT PHẢI: Chi tiết và Kết toán */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Chi tiết khoản thu */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', marginTop: 0 }}>
                Chi tiết khoản thu - {currentDetail ? currentDetail.patientName : 'Chưa chọn'}
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px', fontWeight: '600' }}>Tên khoản thu</th>
                    <th style={{ padding: '12px 8px', fontWeight: '600', textAlign: 'right' }}>Đơn giá</th>
                    <th style={{ padding: '12px 8px', fontWeight: '600', textAlign: 'center' }}>Số lượng</th>
                    <th style={{ padding: '12px 8px', fontWeight: '600', textAlign: 'right' }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDetail?.items?.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 8px', color: '#334155' }}>{item.name}</td>
                      <td style={{ padding: '16px 8px', textAlign: 'right', color: '#475569' }}>{item.price}</td>
                      <td style={{ padding: '16px 8px', textAlign: 'center', color: '#475569' }}>{item.quantity}</td>
                      <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Kết toán & Phương thức */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '20px', marginTop: 0 }}>Kết toán & Phương thức</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', maxWidth: '400px', marginLeft: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Tổng chi phí:</span>
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>{currentDetail?.totalCost || '0 VND'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', borderBottom: '1px dashed #e2e8f0', paddingBottom: '12px' }}>
                  <span>BHYT chi trả:</span>
                  <span style={{ color: '#64748b' }}>- 0 VND</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '700' }}>
                  <span style={{ color: '#0f172a' }}>Bệnh nhân phải nộp:</span>
                  <span style={{ color: '#2563eb' }}>{currentDetail?.totalCost || '0 VND'}</span>
                </div>
              </div>

              <div>
                <p style={{ fontSize: '14px', color: '#475569', fontWeight: '600', marginBottom: '12px' }}>Phương thức thanh toán</p>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <button type="button" onClick={() => setPaymentMethod('CASH')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: paymentMethod === 'CASH' ? '2px solid #2563eb' : '1px solid #e2e8f0', backgroundColor: paymentMethod === 'CASH' ? '#f0f5ff' : '#ffffff', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>Tiền mặt</button>
                  <button type="button" onClick={() => setPaymentMethod('QR')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: paymentMethod === 'QR' ? '2px solid #2563eb' : '1px solid #e2e8f0', backgroundColor: paymentMethod === 'QR' ? '#f0f5ff' : '#ffffff', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>Chuyển khoản QR</button>
                  <button type="button" onClick={() => setPaymentMethod('POS')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: paymentMethod === 'POS' ? '2px solid #2563eb' : '1px solid #e2e8f0', backgroundColor: paymentMethod === 'POS' ? '#f0f5ff' : '#ffffff', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>Quét thẻ POS</button>
                </div>
              </div>

              {paymentMethod === 'QR' && (
                <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '140px', height: '140px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', fontSize: '40px' }}>📱</div>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Quét mã QR để tất toán</span>
                  </div>
                </div>
              )}

              <button 
                type="button"
                onClick={handleConfirmPayment}
                style={{ width: '100%', marginTop: '24px', backgroundColor: '#00a651', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}
              >
                ✓ Xác nhận đã thu tiền
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}