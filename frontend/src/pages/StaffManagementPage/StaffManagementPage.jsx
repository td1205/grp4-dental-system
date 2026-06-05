import { useCallback, useMemo, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout'
import ToastStack from '../../components/common/ToastStack/ToastStack'
import AddStaffModal from '../../components/staff/AddStaffModal/AddStaffModal'
import StaffGrid from '../../components/staff/StaffGrid/StaffGrid'
import StaffToolbar from '../../components/staff/StaffToolbar/StaffToolbar'
import './StaffManagementPage.css'
import { NAV_ITEMS, DEFAULT_USER } from '../../constants/navigation'

const ACTIVE_PATH = '/staff'
const TOAST_DURATION_MS = 4000

// Dữ liệu giả lập ban đầu bao gồm cả trường cccd và trạng thái chuẩn
const INITIAL_STAFF = [
  {
    id: 'BS001',
    initials: 'NA',
    name: 'BS. Nguyễn Văn A',
    specialty: 'Implant',
    email: 'bs.nguyenvana@dentalcare.com',
    phone: '0901234567',
    cccd: '001234567890',
    status: 'active', // Hoạt động
    workplace: 'Phòng khám chính',
  },
  {
    id: 'BS002',
    initials: 'TB',
    name: 'BS. Trần Thị B',
    specialty: 'Orthodontics',
    email: 'bs.tranthib@dentalcare.com',
    phone: '0912345678',
    cccd: '001234567891',
    status: 'active',
    workplace: 'Phòng khám chính',
  },
  {
    id: 'LT001',
    initials: 'LC',
    name: 'Lê Văn C',
    specialty: 'Lễ tân',
    email: 'nv.levanc@dentalcare.com',
    phone: '0923456789',
    cccd: '001234567892',
    status: 'pending', // Chờ kích hoạt
    workplace: 'Quầy tiếp đón',
  },
]

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  cccd: '',
  position: 'doctor', // 'doctor' hoặc 'receptionist'
  specialty: '',
  dateOfBirth: '',
  workplace: '',
}

function getInitials(name) {
  const parts = name.replace(/^BS\.\s*/i, '').trim().split(/\s+/)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState(INITIAL_STAFF)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formValues, setFormValues] = useState(EMPTY_FORM)
  const [toasts, setToasts] = useState([])

  // Bộ lọc tìm kiếm nhân viên (Ẩn các nhân viên có trạng thái 'inactive' - Xóa logic)
  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const activeStaff = staffList.filter((s) => s.status !== 'inactive') // Quy tắc BR1.3.2
    
    if (!q) return activeStaff
    return activeStaff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.specialty.toLowerCase().includes(q),
    )
  }, [staffList, searchQuery])

  const pushToast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, TOAST_DURATION_MS)
  }, [])

  const handleFieldChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleOpenModal = () => {
    setFormValues(EMPTY_FORM)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormValues(EMPTY_FORM)
  }

  // LUỒNG 1: Xử lý Thêm mới Nhân viên & Kiểm tra ngoại lệ
  const handleSubmit = () => {
    const { fullName, phone, cccd, position, specialty, workplace } = formValues

    // Kiểm tra bỏ trống các trường bắt buộc
    if (!fullName.trim() || !phone.trim() || !cccd.trim() || !workplace.trim()) {
      pushToast('Vui lòng nhập đầy đủ các thông tin bắt buộc!', 'error')
      return
    }

    // Ngoại lệ EF1.3.1: Kiểm tra trùng lặp Số điện thoại hoặc CCCD
    const isDuplicate = staffList.some(
      (s) => s.phone === phone.trim() || s.cccd === cccd.trim()
    )
    if (isDuplicate) {
      pushToast('Số CCCD hoặc Số điện thoại đã được đăng ký trong hệ thống!', 'error')
      return // Chặn không cho lưu và giữ nguyên form biểu mẫu
    }

    // Chuẩn hóa tên hiển thị cho Bác sĩ
    const displayName =
      position === 'doctor' && !fullName.startsWith('BS.')
        ? `BS. ${fullName}`
        : fullName

    const generatedId = generateStaffId(staffList, position)
    const autoEmail = generateAutoEmail(fullName, position, staffList)

    const newStaff = {
      id: generatedId,
      initials: getInitials(displayName),
      name: displayName,
      specialty: specialty || (position === 'receptionist' ? 'Lễ tân' : 'Tổng quát'),
      email: autoEmail,
      phone: phone.trim(),
      cccd: cccd.trim(),
      status: 'pending', // Mặc định trạng thái ban đầu là "Chờ kích hoạt"
      workplace: workplace,
    }

    setStaffList((prev) => [...prev, newStaff])
    pushToast(`Thêm mới nhân viên thành công! Mã số định danh: ${generatedId}`)
    handleCloseModal()
  }

  // LUỒNG 4 & Quy tắc BR1.3.2: Xóa logic (Soft Delete) nhân viên
  const handleDeleteStaff = (id) => {
    const staff = staffList.find(s => s.id === id)
    if (!staff) return

    if (window.confirm(`Bạn có chắc chắn muốn ngừng kích hoạt tài khoản của nhân viên ${staff.name}?`)) {
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: 'inactive' } : s
        )
      )
      pushToast(`Đã chuyển trạng thái nhân viên ${id} sang Ngưng hoạt động.`)
    }
  }

  // Luồng thay thế AF1.2.2: Gửi lại email kích hoạt
  const handleResendMail = (id) => {
    const staff = staffList.find((s) => s.id === id)
    if (staff && staff.status === 'pending') {
      // Giả lập hệ thống tạo mã token mới và gửi mail thành công
      pushToast(`Đã tạo token mới và gửi lại email kích hoạt đến: ${staff.email}`)
    } else {
      pushToast('Tài khoản này đã hoạt động hoặc không hợp lệ!', 'error')
    }
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS} activePath={ACTIVE_PATH} user={DEFAULT_USER}>
      <section className="staff-page">
        <header className="staff-page__header">
          <h1 className="staff-page__title">Quản lý nhân viên &amp; Bác sĩ</h1>
          <StaffToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddClick={handleOpenModal}
          />
        </header>

        {/* Truyền thêm hàm handleResendMail và handleDeleteStaff vào Grid/Card */}
        <StaffGrid 
          staffList={filteredStaff} 
          onResendMail={handleResendMail} 
          onDeleteStaff={handleDeleteStaff}
        />

        <AddStaffModal
          isOpen={isModalOpen}
          formValues={formValues}
          onFieldChange={handleFieldChange}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />

        <ToastStack toasts={toasts} />
      </section>
    </DashboardLayout>
  )
}