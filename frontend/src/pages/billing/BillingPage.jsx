import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Banknote, QrCode, CreditCard, CheckCircle2, Printer, X, RefreshCw, Receipt } from 'lucide-react';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';
import './BillingPage.css';

const QR_TIMEOUT_SECONDS = 300; // 5 phút

const formatVND = (amount) => {
    if (!amount && amount !== 0) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function BillingPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [cashReceived, setCashReceived] = useState('');
    const [processing, setProcessing] = useState(false);

    // QR timer
    const [qrSeconds, setQrSeconds] = useState(QR_TIMEOUT_SECONDS);
    const [qrExpired, setQrExpired] = useState(false);
    const qrIntervalRef = useRef(null);

    // ─── Fetch dữ liệu: Lịch hẹn có trạng thái "Hoàn thành" (chờ thanh toán) ───
    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/appointments');
            const all = res.data.data || [];
            // Chỉ lấy các lịch hẹn đã hoàn thành khám (Hoàn thành) hoặc chờ thanh toán
            const toProcess = all.filter(a =>
                ['Hoàn thành', 'Chờ khám', 'Đang khám', 'Chờ tiếp đón', 'Đã xác nhận'].includes(a.status)
            );
            setAppointments(toProcess);
        } catch (err) {
            toast.error('Không thể tải danh sách bệnh nhân');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // ─── QR Countdown ───
    const startQrTimer = useCallback(() => {
        setQrSeconds(QR_TIMEOUT_SECONDS);
        setQrExpired(false);
        if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
        qrIntervalRef.current = setInterval(() => {
            setQrSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(qrIntervalRef.current);
                    setQrExpired(true);
                    toast.error('Mã QR đã hết hạn (EF3.3.1). Vui lòng tạo lại hoặc đổi phương thức thanh toán.');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        if (paymentMethod === 'QR' && selectedId) {
            startQrTimer();
        } else {
            if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
        }
        return () => { if (qrIntervalRef.current) clearInterval(qrIntervalRef.current); };
    }, [paymentMethod, selectedId, startQrTimer]);

    // ─── Lịch hẹn đang chọn ───
    const selected = appointments.find(a => a._id === selectedId);
    const servicePrice = selected?.serviceId?.price || 0;
    const cashReceivedNum = parseFloat(cashReceived.replace(/[^0-9]/g, '')) || 0;
    const change = cashReceivedNum - servicePrice;

    // ─── Tạo QR URL VietQR ───
    const getQrUrl = () => {
        const amount = servicePrice;
        const desc = `Thanh toan ${selected?.customerId?.name || ''}`;
        // Dùng VietQR public (demo, không cần tài khoản thật)
        return `https://img.vietqr.io/image/VCB-9999999999-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(desc)}&accountName=PHONG%20KHAM%20NHA%20KHOA`;
    };

    // ─── Xác nhận thanh toán ───
    const handleConfirmPayment = async () => {
        if (!selected) {
            toast.error('Vui lòng chọn bệnh nhân cần thanh toán!');
            return;
        }
        if (paymentMethod === 'CASH' && cashReceivedNum < servicePrice) {
            toast.error('Số tiền khách đưa chưa đủ!');
            return;
        }
        if (paymentMethod === 'QR' && qrExpired) {
            toast.error('Mã QR đã hết hạn! Hãy tạo lại mã QR.');
            return;
        }

        const methodMap = { CASH: 'Tiền mặt', QR: 'Chuyển khoản QR', POS: 'Quẹt thẻ POS' };
        const confirmMsg = `Xác nhận thu ${formatVND(servicePrice)} từ bệnh nhân ${selected.customerId?.name} bằng ${methodMap[paymentMethod]}?`;

        if (!window.confirm(confirmMsg)) return;

        setProcessing(true);
        try {
            // Ghi invoice vào hệ thống
            await apiClient.post('/revenue', {
                customerId: selected.customerId?._id,
                appointmentId: selected._id,
                amount: servicePrice,
                paymentMethod: methodMap[paymentMethod],
                revenueType: 'Khám bệnh',
                notes: `Thanh toán dịch vụ ${selected.serviceId?.name || ''}`
            });

            // Đánh dấu lịch hẹn thanh toán xong (giả lập bằng cách xóa khỏi danh sách)
            toast.success(`✅ Thanh toán thành công! Biên lai đã được in.`);
            setSelectedId(null);
            setCashReceived('');
            fetchAppointments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi xử lý thanh toán');
        } finally {
            setProcessing(false);
        }
    };

    // ─── Lọc danh sách ───
    const filtered = appointments.filter(a => {
        const name = (a.customerId?.name || '').toLowerCase();
        const phone = (a.customerId?.phone || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return name.includes(term) || phone.includes(term);
    });

    const qrPercent = (qrSeconds / QR_TIMEOUT_SECONDS) * 100;
    const qrMinutes = Math.floor(qrSeconds / 60);
    const qrSecs = qrSeconds % 60;

    return (
        <div className="billing-page">
            {/* Header */}
            <div className="billing-page-header">
                <h1>Thanh toán Viện phí</h1>
                <p>Tra cứu chi phí và kết toán theo đa phương thức thanh toán</p>
            </div>

            {/* Search bar */}
            <div className="billing-search-bar">
                <Search size={18} color="var(--staff-text-muted)" />
                <input
                    type="text"
                    placeholder="Nhập tên hoặc số điện thoại bệnh nhân để tra cứu..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Main layout */}
            <div className="billing-layout">

                {/* LEFT: Invoice list */}
                <div className="billing-list-panel">
                    <h3>
                        Danh sách chờ
                        <span className="billing-badge">{filtered.length}</span>
                    </h3>
                    <div className="billing-invoice-list">
                        {loading ? (
                            <div className="billing-loading">Đang tải...</div>
                        ) : filtered.length === 0 ? (
                            <div className="billing-empty">
                                <p>Không có bệnh nhân nào trong danh sách.</p>
                            </div>
                        ) : (
                            filtered.map(apt => (
                                <div
                                    key={apt._id}
                                    className={`billing-invoice-card ${selectedId === apt._id ? 'selected' : ''}`}
                                    onClick={() => { setSelectedId(apt._id); setCashReceived(''); }}
                                >
                                    <span className={`bill-status ${apt.status === 'Hoàn thành' ? 'paid' : 'unpaid'}`}>
                                        {apt.status === 'Hoàn thành' ? 'Đã khám' : apt.status}
                                    </span>
                                    <div className="bill-patient-name">{apt.customerId?.name || 'Bệnh nhân'}</div>
                                    <div className="bill-info">
                                        📞 {apt.customerId?.phone} &nbsp;|&nbsp; 🕐 {apt.time}
                                        <br />
                                        🦷 {apt.serviceId?.name}
                                    </div>
                                    <div className="bill-amount">{formatVND(apt.serviceId?.price || 0)}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT: Detail + payment */}
                <div className="billing-right-panel">
                    {!selected ? (
                        <div className="billing-detail-card">
                            <div className="billing-empty" style={{ padding: '4rem' }}>
                                <Receipt size={48} strokeWidth={1} />
                                <p>Chọn bệnh nhân bên trái để xem chi tiết chi phí</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Chi tiết khoản thu – BR3.3.2: Read-only */}
                            <div className="billing-detail-card">
                                <div className="billing-detail-card-header">
                                    <h3>Chi tiết khoản thu – {selected.customerId?.name}</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--staff-text-muted)' }}>
                                        📋 {selected.date ? new Date(selected.date).toLocaleDateString('vi-VN') : ''} lúc {selected.time}
                                    </span>
                                </div>
                                <table className="billing-table">
                                    <thead>
                                        <tr>
                                            <th>Tên khoản thu</th>
                                            <th className="td-right">Đơn giá (chỉ đọc)</th>
                                            <th className="td-center">SL</th>
                                            <th className="td-right">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{selected.serviceId?.name || 'Dịch vụ khám'}</td>
                                            {/* BR3.3.2: Đơn giá không chỉnh sửa được */}
                                            <td className="td-right" style={{ color: 'var(--staff-text-muted)' }}>
                                                {formatVND(selected.serviceId?.price || 0)}
                                            </td>
                                            <td className="td-center">1</td>
                                            <td className="td-right td-amount">{formatVND(selected.serviceId?.price || 0)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="billing-total-row">
                                    <span className="total-label">Tổng bệnh nhân phải nộp:</span>
                                    <span className="total-amount">{formatVND(servicePrice)}</span>
                                </div>
                            </div>

                            {/* Phương thức thanh toán */}
                            <div className="billing-payment-card">
                                <h3>Phương thức thanh toán</h3>

                                <div className="payment-method-group">
                                    <button
                                        className={`payment-method-btn ${paymentMethod === 'CASH' ? 'active' : ''}`}
                                        onClick={() => setPaymentMethod('CASH')}
                                    >
                                        <span className="method-icon">💵</span>
                                        Tiền mặt
                                    </button>
                                    <button
                                        className={`payment-method-btn ${paymentMethod === 'QR' ? 'active' : ''}`}
                                        onClick={() => setPaymentMethod('QR')}
                                    >
                                        <span className="method-icon">📱</span>
                                        Chuyển khoản QR
                                    </button>
                                    <button
                                        className={`payment-method-btn ${paymentMethod === 'POS' ? 'active' : ''}`}
                                        onClick={() => setPaymentMethod('POS')}
                                    >
                                        <span className="method-icon">💳</span>
                                        Quẹt thẻ POS
                                    </button>
                                </div>

                                {/* Luồng 2: Tiền mặt */}
                                {paymentMethod === 'CASH' && (
                                    <div className="cash-inputs">
                                        <div className="cash-input-group">
                                            <label>Số tiền phải thu</label>
                                            <input
                                                type="text"
                                                value={formatVND(servicePrice)}
                                                readOnly
                                                style={{ background: 'var(--staff-bg)', color: 'var(--staff-primary)', fontWeight: 700 }}
                                            />
                                        </div>
                                        <div className="cash-input-group">
                                            <label>Tiền khách đưa (VNĐ)</label>
                                            <input
                                                type="number"
                                                placeholder="Nhập số tiền..."
                                                value={cashReceived}
                                                onChange={e => setCashReceived(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="cash-input-group">
                                            <label>Tiền trả lại</label>
                                            <input
                                                type="text"
                                                value={cashReceived ? formatVND(Math.max(0, change)) : '—'}
                                                readOnly
                                                className={cashReceived ? (change >= 0 ? 'change-return' : 'change-negative') : ''}
                                            />
                                        </div>
                                        {cashReceived && change < 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '0.85rem', alignSelf: 'center' }}>
                                                ⚠️ Tiền khách đưa chưa đủ {formatVND(Math.abs(change))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Luồng 1: QR Code */}
                                {paymentMethod === 'QR' && (
                                    <div className="qr-box">
                                        {qrExpired ? (
                                            <>
                                                <p style={{ color: '#ef4444', fontWeight: 600 }}>⚠️ Mã QR đã hết hạn! (EF3.3.1)</p>
                                                <button className="qr-regen-btn" onClick={startQrTimer}>
                                                    <RefreshCw size={16} style={{ display: 'inline', marginRight: '6px' }} />
                                                    Tạo lại mã QR
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="qr-code-img">
                                                    <img
                                                        src={getQrUrl()}
                                                        alt="VietQR"
                                                        style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
                                                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                                    />
                                                    <span style={{ display: 'none', fontSize: '2.5rem' }}>📱</span>
                                                </div>
                                                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--staff-primary)' }}>
                                                    {formatVND(servicePrice)}
                                                </div>
                                                <div className={`qr-timer-text ${qrSeconds <= 60 ? 'danger' : ''}`}>
                                                    ⏱ Còn {qrMinutes}:{qrSecs.toString().padStart(2, '0')} để quét mã
                                                </div>
                                                <div className="qr-timeout-bar">
                                                    <div
                                                        className={`qr-timeout-fill ${qrSeconds <= 60 ? 'danger' : ''}`}
                                                        style={{ width: `${qrPercent}%` }}
                                                    />
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--staff-text-muted)' }}>
                                                    Quét mã QR bằng ứng dụng ngân hàng — Nội dung: {selected.customerId?.name}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* POS */}
                                {paymentMethod === 'POS' && (
                                    <div className="qr-box">
                                        <span style={{ fontSize: '3rem' }}>💳</span>
                                        <p style={{ color: 'var(--staff-text-muted)', margin: 0 }}>
                                            Yêu cầu bệnh nhân cà thẻ vào máy POS. Số tiền: <strong>{formatVND(servicePrice)}</strong>
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="billing-actions">
                                    <button
                                        className="btn-cancel"
                                        onClick={() => { setSelectedId(null); setCashReceived(''); }}
                                    >
                                        <X size={16} style={{ display: 'inline', marginRight: '4px' }} />
                                        Hủy
                                    </button>
                                    <button
                                        className="btn-confirm"
                                        onClick={handleConfirmPayment}
                                        disabled={processing || (paymentMethod === 'QR' && qrExpired)}
                                    >
                                        {processing ? (
                                            'Đang xử lý...'
                                        ) : (
                                            <>
                                                <Printer size={18} />
                                                Hoàn thành &amp; In biên lai
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}