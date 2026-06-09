import { useState } from 'react'
import { Icon } from '../../common/Icon/Icon'
import './ServiceCategoryBlock.css'

export function ServiceCategoryBlock({ categoryName, itemsCount, children }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`service-category-block ${isOpen ? 'service-category-block--open' : ''}`}>
      {/* Thanh tiêu đề bấm vào để đóng/mở */}
      <button 
        type="button" 
        className="service-category-block__header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="service-category-block__title">
          {categoryName} <span className="service-category-block__count">({itemsCount} dịch vụ)</span>
        </span>
        <Icon 
          name="chevron-down" 
          className={`service-category-block__chevron ${isOpen ? 'service-category-block__chevron--rotated' : ''}`} 
          size={16} 
        />
      </button>

      {/* Nội dung dịch vụ con xổ ra */}
      {isOpen && (
        <div className="service-category-block__content">
          {children ? children : <p className="service-category-block__empty">Chưa có dịch vụ nào trong danh mục này.</p>}
        </div>
      )}
    </div>
  )
}