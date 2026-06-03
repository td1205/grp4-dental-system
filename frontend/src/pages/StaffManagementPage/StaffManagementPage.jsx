import { useCallback, useMemo, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout'
import ToastStack from '../../components/common/ToastStack/ToastStack'
import AddStaffModal from '../../components/staff/AddStaffModal/AddStaffModal'
import StaffGrid from '../../components/staff/StaffGrid/StaffGrid'
import StaffToolbar from '../../components/staff/StaffToolbar/StaffToolbar'
import './StaffManagementPage.css'

const ACTIVE_PATH = '/staff'
const TOAST_DURATION_MS = 4000
const RESEND_SUCCESS_MESSAGE = 'Đã gửi lại email thành công!'

const NAV_ITEMS = [
  {
    id: 'users',
    label: 'Quản lý người dùng',
    icon: 'users',
    path: '/users',
    children: [
      { id: 'staff', label: 'Quản lý nhân viên', path: '/staff' },
      { id: 'customers', label: 'Quản lý khách hàng', path: '/customers' },
    ],
  },
  { id: 'services', label: 'Dịch vụ', icon: 'services', path: '/services' },
  { id: 'schedule', label: 'Lịch làm việc', icon: 'schedule', path: '/schedule' },
  { id: 'salary', label: 'Lương', icon: 'salary', path: '/salary' },
  { id: 'revenue', label: 'Thống kê doanh thu', icon: 'stats', path: '/revenue' },
]

const ADMIN_USER = {
  initials: 'AU',
  name: 'Admin User',
  email: 'admin@dentalcare.vn',
}

const INITIAL_STAFF = [
  {
    id: 'BS001',
    initials: 'NA',
    name: 'BS. Nguyễn Văn A',
    specialty: 'Implant',
    email: 'nguyen.a@dentalcare.com',
    phone: '0901234567',
    status: 'active',
  },
  {
    id: 'BS002',
    initials: 'TB',
    name: 'BS. Trần Thị B',
    specialty: 'Orthodontics',
    email: 'tran.b@dentalcare.com',
    phone: '0912345678',
    status: 'active',
  },
  {
    id: 'LT003',
    initials: 'LC',
    name: 'Lê Văn C',
    specialty: 'Lễ tân',
    email: 'le.c@dentalcare.com',
    phone: '0923456789',
    status: 'pending',
  },
]

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  position: '',
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

function generateStaffId(list) {
  const num = list.length + 1
  return `NV${String(num).padStart(3, '0')}`
}

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState(INITIAL_STAFF)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formValues, setFormValues] = useState(EMPTY_FORM)
  const [toasts, setToasts] = useState([])

  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return staffList
    return staffList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.specialty.toLowerCase().includes(q),
    )
  }, [staffList, searchQuery])

  const pushToast = useCallback((message) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message }])

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

  const handleSubmit = () => {
    if (!formValues.fullName.trim() || !formValues.phone.trim()) return

    const specialty =
      formValues.specialty ||
      (formValues.position === 'receptionist' ? 'Lễ tân' : 'General')
    const displayName =
      formValues.position === 'doctor' && !formValues.fullName.startsWith('BS.')
        ? `BS. ${formValues.fullName}`
        : formValues.fullName

    const newStaff = {
      id: generateStaffId(staffList),
      initials: getInitials(displayName),
      name: displayName,
      specialty,
      email: `${formValues.fullName.replace(/\s+/g, '.').toLowerCase()}@dentalcare.com`,
      phone: formValues.phone,
      status: 'pending',
    }

    setStaffList((prev) => [...prev, newStaff])
    handleCloseModal()
  }

  const handleResendMail = () => {
    pushToast(RESEND_SUCCESS_MESSAGE)
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS} activePath={ACTIVE_PATH} user={ADMIN_USER}>
      <section className="staff-page">
        <header className="staff-page__header">
          <h1 className="staff-page__title">Quản lý nhân viên &amp; Bác sĩ</h1>
          <StaffToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddClick={handleOpenModal}
          />
        </header>

        <StaffGrid staffList={filteredStaff} onResendMail={handleResendMail} />

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
  