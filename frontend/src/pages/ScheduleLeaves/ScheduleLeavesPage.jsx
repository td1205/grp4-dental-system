import { useState } from 'react'
import { Icon } from '../../components/common/Icon/Icon'
import { LeaveList } from './LeaveList'
import { SystemHolidayManager } from './SystemHolidayManager'

export function ScheduleLeavesPage() {
  const [activeTab, setActiveTab] = useState('leaves')

  return (
    <div className="staff-page" id="schedule-leaves-page">
      <header className="staff-page__header">
        <h1 className="staff-page__title">Quản lý lịch nghỉ</h1>
        <p>Duyệt và lập lịch nghỉ của Bác sĩ và Nhân viên phòng khám</p>
      </header>

      {/* Thanh điều hướng Tab - Đã sửa màu sắc đúng ý bạn */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-1">
        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'leaves'
            ? 'bg-[#92a8d9] text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Lịch nghỉ phép
        </button>
        <button
          onClick={() => setActiveTab('holidays')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'holidays'
            ? 'bg-[#7599e6] text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Lịch nghỉ toàn cơ sở
        </button>
      </div>

      {/* Nội dung thay đổi theo Tab */}
      <div className="staff-card">
        {activeTab === 'leaves' ? (
          <LeaveList />
        ) : (
          <SystemHolidayManager />
        )}
      </div>
    </div>
  )
}