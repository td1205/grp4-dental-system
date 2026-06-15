import { useState, useEffect } from 'react'
import apiClient from '../../services/apiClient'
import { Icon } from '../../components/common/Icon/Icon'
import { Button } from '../../components/ui/Button/Button'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { ModalWrapper } from '../../components/common/ModalWrapper/ModalWrapper'
import { MacDropdown } from '../../components/common/MacDropdown/MacDropdown'
import { Badge } from '../../components/common/Badge/Badge'
import toast, { Toaster } from 'react-hot-toast'
import './SystemHolidayManager.css'

const API = '/holidays'

const DEPARTMENTS = [
    'Khoa Khám Bệnh', 'Khoa Phục Hình', 'Khoa Chẩn Đoán Hình Ảnh', 'Khoa Xét Nghiệm'
]

const TODAY = new Date().toISOString().slice(0, 10)

function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('vi-VN')
}

const emptyForm = {
    name: '',
    type: 'all',
    department: '',
    startDate: '',
    endDate: '',
    description: ''
}

export function SystemHolidayManager() {
    const [holidays, setHolidays] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Modal state
    const [mode, setMode] = useState(null) // 'add' | 'edit' | 'detail'
    const [selected, setSelected] = useState(null)
    const [form, setForm] = useState(emptyForm)
    const [formError, setFormError] = useState('')

    // Action tracking
    const [holidayAction, setHolidayAction] = useState('separate')
    const [appointmentAction, setAppointmentAction] = useState('')
    const [checkResult, setCheckResult] = useState(null)

    // Confirm dialog
    const [confirmType, setConfirmType] = useState(null) // 'check-merge' | 'check-appointments' | 'save-add' | 'save-edit' | 'delete'

    useEffect(() => { fetchHolidays() }, [])

    const fetchHolidays = async () => {
        try {
            setIsLoading(true)
            const res = await apiClient.get(API)
            setHolidays(res.data.data || [])
        } catch (err) {
            toast.error('Không thể tải danh sách lịch nghỉ')
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenAdd = () => {
        setForm(emptyForm)
        setFormError('')
        setMode('add')
    }

    const handleOpenEdit = (h) => {
        setSelected(h)
        setForm({
            name: h.name,
            type: h.type,
            department: h.department || '',
            startDate: h.startDate ? new Date(h.startDate).toISOString().slice(0, 10) : '',
            endDate: h.endDate ? new Date(h.endDate).toISOString().slice(0, 10) : '',
            description: h.description || ''
        })
        setFormError('')
        setMode('edit')
    }

    const handleOpenDetail = (h) => {
        setSelected(h)
        setMode('detail')
    }

    const handleClose = () => {
        setMode(null)
        setSelected(null)
        setConfirmType(null)
        setCheckResult(null)
        setHolidayAction('separate')
        setAppointmentAction('')
    }

    const validateForm = () => {
        if (!form.name.trim()) return 'Vui lòng nhập tên ngày nghỉ.'
        if (!form.startDate) return 'Vui lòng chọn ngày bắt đầu.'
        if (!form.endDate) return 'Vui lòng chọn ngày kết thúc.'
        if (mode === 'add' && form.startDate < TODAY) return 'Ngày bắt đầu lịch nghỉ không được nằm trong quá khứ.'
        if (form.endDate < form.startDate) return 'Thời gian kết thúc phải sau thời gian bắt đầu.'
        if (form.type === 'department' && !form.department) return 'Vui lòng chọn chuyên khoa áp dụng.'
        return null
    }

    // Step 1: When user clicks Save in the form modal
    const handleClickSave = async () => {
        const err = validateForm()
        if (err) { setFormError(err); return }
        setFormError('')

        // Call check endpoint
        try {
            const checkRes = await apiClient.post(`${API}/check`, {
                ...form,
                ignoreHolidayId: mode === 'edit' ? selected._id : undefined
            })
            const data = checkRes.data
            setCheckResult(data)
            
            if (mode === 'add' && data.overlapHoliday) {
                setConfirmType('check-merge')
            } else if (data.affectedAppointmentsCount > 0) {
                setConfirmType('check-appointments')
            } else {
                setConfirmType(mode === 'add' ? 'save-add' : 'save-edit')
            }
        } catch (error) {
            setFormError(error.response?.data?.message || 'Lỗi kiểm tra xung đột')
        }
    }

    // Step 2: Merge resolution
    const handleMergeDecision = (decision) => {
        setHolidayAction(decision)
        if (checkResult.affectedAppointmentsCount > 0) {
            setConfirmType('check-appointments')
        } else {
            setConfirmType('save-add')
        }
    }

    // Step 3: Appointment resolution
    const handleAppointmentDecision = (decision) => {
        setAppointmentAction(decision)
        setConfirmType(mode === 'add' ? 'save-add' : 'save-edit')
    }

    const doCreate = async () => {
        try {
            await apiClient.post(API, { ...form, holidayAction, appointmentAction })
            fetchHolidays()
            toast.success('Thiết lập thành công')
            handleClose()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi thiết lập lịch nghỉ')
            handleClose()
        }
    }

    const doUpdate = async () => {
        try {
            await apiClient.put(`${API}/${selected._id}`, { ...form, appointmentAction })
            fetchHolidays()
            toast.success('Chỉnh sửa thành công')
            handleClose()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi cập nhật lịch nghỉ')
            handleClose()
        }
    }

    const doDelete = async () => {
        try {
            await apiClient.delete(`${API}/${selected._id}`)
            fetchHolidays()
            toast.success('Xóa ngày nghỉ thành công')
            handleClose()
        } catch (err) {
            toast.error('Lỗi khi xóa lịch nghỉ')
            handleClose()
        }
    }

    const handleFieldChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))
        setFormError('')
    }

    const typeLabel = (h) => h.type === 'all' ? 'Toàn cơ sở' : `Chuyên khoa — ${h.department}`

    return (
        <div className="holiday-manager">
            {/* Header toolbar */}
            <div className="holiday-manager__toolbar">
                <p className="holiday-manager__subtitle">Quản lý ngày nghỉ lễ, Tết và đột xuất toàn cơ sở</p>
                <PrimaryButton onClick={handleOpenAdd}>
                    <Icon name="plus" size={15} /> Thêm ngày nghỉ
                </PrimaryButton>
            </div>

            {/* Table danh sách */}
            <div className="holiday-table-wrap">
                {isLoading ? (
                    <p className="holiday-empty">Đang tải...</p>
                ) : holidays.length === 0 ? (
                    <p className="holiday-empty">Chưa có lịch nghỉ nào được thiết lập.</p>
                ) : (
                    <table className="holiday-table">
                        <thead>
                            <tr>
                                <th>TÊN NGÀY NGHỈ</th>
                                <th>PHẠM VI</th>
                                <th>TỪ NGÀY</th>
                                <th>ĐẾN NGÀY</th>
                                <th>MÔ TẢ</th>
                                <th style={{ textAlign: 'right' }}>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {holidays.map(h => (
                                <tr key={h._id}>
                                    <td style={{ fontWeight: 600 }}>{h.name}</td>
                                    <td>
                                        <Badge
                                            variant={h.type === 'all' ? 'primary' : 'warning'}
                                            label={typeLabel(h)}
                                        />
                                    </td>
                                    <td>{formatDate(h.startDate)}</td>
                                    <td>{formatDate(h.endDate)}</td>
                                    <td style={{ color: '#64748b', fontSize: '13px' }}>{h.description || '—'}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                            <Button variant="ghost" style={{ padding: '6px 8px', height: 'auto' }} onClick={() => handleOpenDetail(h)} title="Xem chi tiết">
                                                <Icon name="eye" size={14} />
                                            </Button>
                                            <Button variant="ghost" style={{ padding: '6px 8px', height: 'auto' }} onClick={() => handleOpenEdit(h)} title="Chỉnh sửa">
                                                <Icon name="edit" size={14} />
                                            </Button>
                                            <Button variant="danger" style={{ padding: '6px 8px', height: 'auto' }} onClick={() => { setSelected(h); setConfirmType('delete') }} title="Xóa">
                                                <Icon name="trash" size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Thêm / Chỉnh sửa */}
            <ModalWrapper
                isOpen={mode === 'add' || mode === 'edit'}
                onClose={handleClose}
                title={mode === 'add' ? 'Thêm ngày nghỉ mới' : 'Chỉnh sửa ngày nghỉ'}
                footer={
                    <>
                        <button className="customer-btn-cancel" onClick={handleClose}>Hủy</button>
                        <PrimaryButton onClick={handleClickSave}>Lưu</PrimaryButton>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {formError && (
                        <p style={{ color: '#ef4444', fontSize: '12px', padding: '8px', background: '#fef2f2', borderRadius: '4px', borderLeft: '3px solid #ef4444', margin: 0 }}>
                            {formError}
                        </p>
                    )}

                    <div className="holiday-form__field">
                        <label>Tên ngày nghỉ <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" placeholder="VD: Tết Nguyên Đán 2025" value={form.name} onChange={e => handleFieldChange('name', e.target.value)} />
                    </div>

                    <div className="holiday-form__row">
                        <div className="holiday-form__field">
                            <label>Từ ngày <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="date" value={form.startDate} onChange={e => handleFieldChange('startDate', e.target.value)} />
                        </div>
                        <div className="holiday-form__field">
                            <label>Đến ngày <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="date" value={form.endDate} onChange={e => handleFieldChange('endDate', e.target.value)} />
                        </div>
                    </div>

                    <div className="holiday-form__field">
                        <label>Phạm vi nghỉ <span style={{ color: '#ef4444' }}>*</span></label>
                        <MacDropdown 
                            value={form.type} 
                            onChange={val => handleFieldChange('type', val)}
                            options={[
                                { value: "all", label: "Toàn cơ sở" },
                                { value: "department", label: "Theo chuyên khoa" }
                            ]}
                        />
                    </div>

                    {form.type === 'department' && (
                        <div className="holiday-form__field">
                            <label>Chuyên khoa áp dụng <span style={{ color: '#ef4444' }}>*</span></label>
                            <MacDropdown 
                                value={form.department} 
                                onChange={val => handleFieldChange('department', val)}
                                placeholder="-- Chọn chuyên khoa --"
                                options={[
                                    { value: "", label: "-- Chọn chuyên khoa --" },
                                    ...DEPARTMENTS.map(d => ({ value: d, label: d }))
                                ]}
                            />
                        </div>
                    )}

                    <div className="holiday-form__field">
                        <label>Mô tả</label>
                        <textarea rows={3} placeholder="Mô tả chi tiết về ngày nghỉ..." value={form.description} onChange={e => handleFieldChange('description', e.target.value)} />
                    </div>
                </div>
            </ModalWrapper>

            {/* Modal Xem chi tiết */}
            <ModalWrapper
                isOpen={mode === 'detail'}
                onClose={handleClose}
                title="Chi tiết ngày nghỉ"
                footer={
                    <button className="customer-btn-cancel" onClick={handleClose}>Đóng</button>
                }
            >
                {selected && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Tên ngày nghỉ</p>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '16px' }}>{selected.name}</p>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Phạm vi nghỉ</p>
                            <Badge variant={selected.type === 'all' ? 'primary' : 'warning'} label={typeLabel(selected)} />
                        </div>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Trạng thái</p>
                            <Badge variant={new Date(selected.endDate) >= new Date() ? 'success' : 'error'} label={new Date(selected.endDate) >= new Date() ? 'Còn hiệu lực' : 'Đã qua'} />
                        </div>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Từ ngày</p>
                            <p style={{ margin: 0, fontWeight: 500 }}>{formatDate(selected.startDate)}</p>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Đến ngày</p>
                            <p style={{ margin: 0, fontWeight: 500 }}>{formatDate(selected.endDate)}</p>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Mô tả</p>
                            <p style={{ margin: 0 }}>{selected.description || 'Không có mô tả'}</p>
                        </div>
                    </div>
                )}
            </ModalWrapper>

            {/* Confirm Dialog Delete */}
            <ModalWrapper
                isOpen={confirmType === 'delete'}
                onClose={() => setConfirmType(null)}
                title="Xác nhận xoá ngày nghỉ này?"
                footer={
                    <>
                        <button className="customer-btn-cancel" onClick={() => setConfirmType(null)}>Hủy</button>
                        <PrimaryButton onClick={doDelete}>Đồng ý</PrimaryButton>
                    </>
                }
            >
                <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
                    Xác nhận xoá ngày nghỉ "{selected?.name}"? Thao tác này không thể hoàn tác.
                </p>
            </ModalWrapper>

            {/* Confirm Dialog Merge */}
            <ModalWrapper
                isOpen={confirmType === 'check-merge'}
                onClose={() => setConfirmType(null)}
                title="Cảnh báo xung đột lịch nghỉ"
                footer={
                    <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'flex-end' }}>
                        <button className="customer-btn-cancel" onClick={() => setConfirmType(null)}>Hủy thao tác</button>
                        <Button variant="secondary" onClick={() => handleMergeDecision('separate')}>Không gộp</Button>
                        <PrimaryButton onClick={() => handleMergeDecision('merge')}>Đồng ý gộp</PrimaryButton>
                    </div>
                }
            >
                <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '6px', padding: '12px' }}>
                    <p style={{ color: '#92400e', fontSize: '13px', margin: '0 0 8px 0', fontWeight: 600 }}>Phát hiện lịch nghỉ giao thoa/liên tiếp</p>
                    <p style={{ color: '#78350f', fontSize: '14px', margin: 0 }}>
                        Khoảng thời gian bạn chọn trùng lặp/liên tiếp với lịch nghỉ <strong>"{checkResult?.overlapHoliday?.name}"</strong>. Bạn có muốn gộp chúng thành một chu kỳ nghỉ duy nhất không?
                    </p>
                </div>
            </ModalWrapper>

            {/* Confirm Dialog Appointments */}
            <ModalWrapper
                isOpen={confirmType === 'check-appointments'}
                onClose={() => setConfirmType(null)}
                title="Cảnh báo ảnh hưởng lịch khám"
                footer={
                    <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'flex-end' }}>
                        <button className="customer-btn-cancel" onClick={() => setConfirmType(null)}>Hủy thiết lập</button>
                        <Button variant="secondary" onClick={() => handleAppointmentDecision('reschedule')}>Dời lịch thủ công</Button>
                        <PrimaryButton onClick={() => handleAppointmentDecision('cancel')}>Hủy toàn bộ lịch</PrimaryButton>
                    </div>
                }
            >
                <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '6px', padding: '12px' }}>
                    <p style={{ color: '#991b1b', fontSize: '13px', margin: '0 0 8px 0', fontWeight: 600 }}>Tồn tại lịch khám</p>
                    <p style={{ color: '#7f1d1d', fontSize: '14px', margin: 0 }}>
                        Đã có <strong>{checkResult?.affectedAppointmentsCount}</strong> bệnh nhân đặt lịch trong khoảng thời gian này. Vui lòng chọn hướng xử lý:
                    </p>
                </div>
            </ModalWrapper>

            {/* Confirm Dialog Final Save */}
            <ModalWrapper
                isOpen={confirmType === 'save-add' || confirmType === 'save-edit'}
                onClose={() => setConfirmType(null)}
                title={confirmType === 'save-add' ? "Xác nhận thiết lập" : "Xác nhận chỉnh sửa"}
                footer={
                    <>
                        <button className="customer-btn-cancel" onClick={() => setConfirmType(null)}>Hủy</button>
                        <PrimaryButton onClick={confirmType === 'save-add' ? doCreate : doUpdate}>Đồng ý</PrimaryButton>
                    </>
                }
            >
                <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
                    {confirmType === 'save-add'
                        ? `Thiết lập ngày nghỉ "${form.name}" từ ${formatDate(form.startDate)} đến ${formatDate(form.endDate)}?`
                        : `Lưu thay đổi ngày nghỉ "${form.name}"?`}
                </p>
            </ModalWrapper>

            <Toaster />
        </div>
    )
}