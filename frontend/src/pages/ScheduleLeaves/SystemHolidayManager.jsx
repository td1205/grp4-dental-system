import { useState, useEffect } from 'react'
import apiClient from '../../services/apiClient'
import { Icon } from '../../components/common/Icon/Icon'
import { Button } from '../../components/ui/Button/Button'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { ModalWrapper } from '../../components/common/ModalWrapper/ModalWrapper'
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

    // Confirm dialog
    const [confirmType, setConfirmType] = useState(null) // 'save-add' | 'save-edit' | 'delete'
    const [conflictWarning, setConflictWarning] = useState(null) // for EF2.1.4

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
        setConflictWarning(null)
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
        setConflictWarning(null)
        setMode('edit')
    }

    const handleOpenDetail = (h) => {
        setSelected(h)
        setMode('detail')
    }

    const handleClose = () => {
        setMode(null)
        setSelected(null)
        setConflictWarning(null)
        setConfirmType(null)
    }

    // Validate form on the frontend side
    const validateForm = () => {
        if (!form.name.trim()) return 'Vui lòng nhập tên ngày nghỉ.'
        if (!form.startDate) return 'Vui lòng chọn ngày bắt đầu.'
        if (!form.endDate) return 'Vui lòng chọn ngày kết thúc.'
        if (mode === 'add' && form.startDate < TODAY) return 'Ngày bắt đầu lịch nghỉ không được nằm trong quá khứ.'
        if (form.endDate < form.startDate) return 'Thời gian kết thúc phải sau thời gian bắt đầu.'
        if (form.type === 'department' && !form.department) return 'Vui lòng chọn chuyên khoa áp dụng.'
        return null
    }

    // "Lưu" button in form — shows confirm dialog
    const handleClickSave = () => {
        const err = validateForm()
        if (err) { setFormError(err); return }
        setFormError('')
        setConfirmType(mode === 'add' ? 'save-add' : 'save-edit')
    }

    // User pressed "Đồng ý" in confirm dialog
    const handleConfirm = async () => {
        if (confirmType === 'save-add') {
            await doCreate()
        } else if (confirmType === 'save-edit') {
            await doUpdate()
        } else if (confirmType === 'delete') {
            await doDelete()
        }
    }

    const doCreate = async () => {
        try {
            const res = await apiClient.post(API, form)
            fetchHolidays()
            if (res.data.hasConflict) {
                toast.success(`Thiết lập thành công. ${res.data.affectedAppointments} lịch khám đã được chuyển sang Chờ điều phối.`, { duration: 5000 })
            } else {
                toast.success('Thiết lập thành công')
            }
            handleClose()
        } catch (err) {
            const msg = err.response?.data?.message || 'Lỗi khi thiết lập lịch nghỉ'
            if (err.response?.status === 409) {
                // EF2.1.4 — overlap warning
                setConflictWarning({ msg, conflict: err.response.data.conflictWith })
                setConfirmType(null)
            } else {
                setFormError(msg)
                setConfirmType(null)
            }
        }
    }

    const doUpdate = async () => {
        try {
            await apiClient.put(`${API}/${selected._id}`, form)
            fetchHolidays()
            toast.success('Chỉnh sửa thành công')
            handleClose()
        } catch (err) {
            const msg = err.response?.data?.message || 'Lỗi khi cập nhật lịch nghỉ'
            setFormError(msg)
            setConfirmType(null)
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

    // Modal title for confirm dialog
    const confirmTitle = confirmType === 'save-add'
        ? 'Thiết lập ngày nghỉ này?'
        : confirmType === 'save-edit'
        ? 'Chỉnh sửa ngày nghỉ này?'
        : 'Xác nhận xoá ngày nghỉ này?'

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

                    {/* Conflict EF2.1.4 warning */}
                    {conflictWarning && (
                        <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '6px', padding: '12px' }}>
                            <p style={{ color: '#92400e', fontSize: '13px', margin: '0 0 8px 0', fontWeight: 600 }}>⚠ Cảnh báo xung đột lịch nghỉ</p>
                            <p style={{ color: '#78350f', fontSize: '12px', margin: 0 }}>{conflictWarning.msg}</p>
                        </div>
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
                        <select value={form.type} onChange={e => handleFieldChange('type', e.target.value)}>
                            <option value="all">Toàn cơ sở</option>
                            <option value="department">Theo chuyên khoa</option>
                        </select>
                    </div>

                    {form.type === 'department' && (
                        <div className="holiday-form__field">
                            <label>Chuyên khoa áp dụng <span style={{ color: '#ef4444' }}>*</span></label>
                            <select value={form.department} onChange={e => handleFieldChange('department', e.target.value)}>
                                <option value="">-- Chọn chuyên khoa --</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
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

            {/* Confirm Dialog */}
            <ModalWrapper
                isOpen={!!confirmType}
                onClose={() => setConfirmType(null)}
                title={confirmTitle}
                footer={
                    <>
                        <button className="customer-btn-cancel" onClick={() => setConfirmType(null)}>Hủy</button>
                        <PrimaryButton onClick={handleConfirm}>Đồng ý</PrimaryButton>
                    </>
                }
            >
                <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
                    {confirmType === 'delete'
                        ? `Xác nhận xoá ngày nghỉ "${selected?.name}"? Thao tác này không thể hoàn tác.`
                        : confirmType === 'save-add'
                        ? `Xác nhận thiết lập ngày nghỉ "${form.name}" từ ${formatDate(form.startDate)} đến ${formatDate(form.endDate)}?`
                        : `Xác nhận chỉnh sửa thông tin ngày nghỉ "${form.name}"?`
                    }
                </p>
            </ModalWrapper>

            <Toaster />
        </div>
    )
}