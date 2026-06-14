import { useState } from 'react'
import { Icon } from '../../components/common/Icon/Icon'
import { LeaveList } from './LeaveList'
import { SystemHolidayManager } from './SystemHolidayManager'
import './ScheduleLeavesPage.css'

export function ScheduleLeavesPage() {
  const [activeTab, setActiveTab] = useState('leaves')

  return (
    <div className="staff-page" id="schedule-leaves-page">
      <header className="staff-page__header">
        <h1 className="staff-page__title">Quản lý lịch nghỉ</h1>
        <p>Duyệt và lập lịch nghỉ của Bác sĩ và Nhân viên phòng khám</p>
      </header>

      {/* Thanh điều hướng Tab */}
      <div className="schedule-tabs">
        <button
          onClick={() => setActiveTab('leaves')}
          className={`schedule-tab ${activeTab === 'leaves' ? 'schedule-tab--active' : ''}`}
        >
          <Icon name="calendar" size={15} />
          Lịch nghỉ phép
        </button>
        <button
          onClick={() => setActiveTab('holidays')}
          className={`schedule-tab ${activeTab === 'holidays' ? 'schedule-tab--active' : ''}`}
        >
          <Icon name="sun" size={15} />
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