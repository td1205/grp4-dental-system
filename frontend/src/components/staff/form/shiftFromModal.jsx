import { useState } from 'react';
import axios from 'axios';

export function ShiftFormModal({ isOpen, onClose, onSave, staffList }) {
    const [formData, setFormData] = useState({
        staffId: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '12:00',
        room: 'Phòng khám 1',
        role: 'Bác sĩ'
    });

    if (!isOpen) return null;

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/shifts', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSave();
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Có lỗi xảy ra khi lưu lịch");
        }
    };

    return (
        <div className="shift-modal-overlay">
            <div className="shift-modal-box" onClick={e => e.stopPropagation()}>
                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Thêm lịch trực mới</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                </div>

                <div style={{ padding: '20px' }}>
                    {/* Bố cục Grid 2 cột hoặc hàng đơn linh hoạt */}
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Nhân viên</label>
                            <select className="w-full p-2.5 border rounded-lg border-slate-300" onChange={e => setFormData({ ...formData, staffId: e.target.value })}>
                                <option value="">-- Chọn nhân viên --</option>
                                {staffList && staffList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Ngày làm việc</label>
                            <input type="date" className="w-full p-2.5 border rounded-lg border-slate-300" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Bắt đầu</label>
                                <input type="time" className="w-full p-2.5 border rounded-lg border-slate-300" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Kết thúc</label>
                                <input type="time" className="w-full p-2.5 border rounded-lg border-slate-300" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Phòng</label>
                                <select className="w-full p-2.5 border rounded-lg border-slate-300" value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })}>
                                    <option>Phòng khám 1</option>
                                    <option>Phòng khám 2</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Vai trò</label>
                                <select className="w-full p-2.5 border rounded-lg border-slate-300" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option>Bác sĩ</option>
                                    <option>Lễ tân</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn-save-shift"
                        onClick={handleSubmit}
                        style={{
                            width: '100%',
                            marginTop: '24px',
                            padding: '12px',
                            backgroundColor: '#0ea5e9',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px', // Bo góc mềm mại hơn
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.2)', // Đổ bóng nhẹ cùng tone màu
                            transition: 'all 0.2s ease-in-out' // Hiệu ứng chuyển động mượt mà
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#0284c7'; // Màu đậm hơn khi di chuột
                            e.target.style.boxShadow = '0 6px 8px -1px rgba(14, 165, 233, 0.3)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#0ea5e9'; // Trả về màu gốc
                            e.target.style.boxShadow = '0 4px 6px -1px rgba(14, 165, 233, 0.2)';
                        }}
                    >
                        Lưu lịch trực
                    </button>
                </div>
            </div>
        </div>
    );
}