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
            // Gửi dữ liệu đúng với cấu trúc Controller của bạn
            await axios.post('/api/shifts', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSave(); // Gọi hàm cập nhật bảng lịch
            onClose();
        } catch (err) {
            // Hiển thị lỗi từ backend (BR2.2.2, EF2.2.2, etc.)
            alert(err.response?.data?.message || "Có lỗi xảy ra khi lưu lịch");
        }
    };

    return (
        <div className="shift-modal-overlay">
            <div className="shift-modal-content" onClick={e => e.stopPropagation()}>
                <div className="shift-modal-header" style={{ backgroundColor: '#2563eb', padding: '16px', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
                    <h2>Thêm lịch trực mới</h2>
                    <button className="btn-close-modal" onClick={onClose}>&times;</button>
                </div>

                <div className="shift-modal-body" style={{ padding: '20px' }}>
                    <div className="mb-3">
                        <label className="block mb-1 font-semibold">Nhân viên:</label>
                        <select className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, staffId: e.target.value })}>
                            <option value="">-- Chọn nhân viên --</option>
                            {staffList && staffList.map(s => (
                                <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="block mb-1 font-semibold">Ngày:</label>
                        <input type="date" className="w-full p-2 border rounded" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                    </div>

                    <div className="flex gap-2 mb-3">
                        <div className="flex-1">
                            <label className="block mb-1 font-semibold">Bắt đầu:</label>
                            <input type="time" className="w-full p-2 border rounded" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                        </div>
                        <div className="flex-1">
                            <label className="block mb-1 font-semibold">Kết thúc:</label>
                            <input type="time" className="w-full p-2 border rounded" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="block mb-1 font-semibold">Phòng:</label>
                        <select className="w-full p-2 border rounded" value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })}>
                            <option>Phòng khám 1</option>
                            <option>Phòng khám 2</option>
                            <option>Phòng X-Quang</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="block mb-1 font-semibold">Vai trò:</label>
                        <select className="w-full p-2 border rounded" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                            <option>Bác sĩ</option>
                            <option>Lễ tân</option>
                        </select>
                    </div>

                    <button
                        className="btn-add-shift w-full mt-4"
                        style={{ padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        onClick={handleSubmit}
                    >
                        Lưu lịch trực
                    </button>
                </div>
            </div>
        </div>
    );
}