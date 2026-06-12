import { useState } from 'react'
import axios from 'axios'
import { Icon } from '../../components/common/Icon/Icon'

export function SystemHolidayManager() {
    const [formData, setFormData] = useState({
        startDate: '', endDate: '', description: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            // Gọi API tạo lịch nghỉ toàn hệ thống đã định nghĩa trong Controller
            await axios.post('/api/leaves/system-leave', formData)
            alert("Đã thiết lập nghỉ lễ thành công!")
            setFormData({ startDate: '', endDate: '', description: '' })
        } catch (err) { alert("Lỗi khi thiết lập: " + err.message) }
    }
    return (
        <div style={{ padding: '20px' }}>
            <div className="staff-toolbar" style={{ marginBottom: '16px' }}>
                <h3>Thiết lập nghỉ lễ toàn cơ sở</h3>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
                {/* ... các input ... */}
                <button type="submit" className="staff-btn staff-btn--primary">
                    <Icon name="plus" size={16} /> Lưu nghỉ lễ
                </button>
            </form>
        </div>
    )
}