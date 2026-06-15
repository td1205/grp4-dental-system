import { ModalWrapper } from '../../common/ModalWrapper/ModalWrapper';
import { PrimaryButton } from '../../ui/Button/PrimaryButton';
import { MacDropdown } from '../../common/MacDropdown/MacDropdown';

export function ServiceCategoryFormModal({
  isOpen,
  isEditMode,
  formError,
  newServiceId,
  newServiceName,
  newServiceCategory,
  newServiceDepartment,
  newServiceDuration,
  newServiceDescription,
  setNewServiceId,
  setNewServiceName,
  setNewServiceCategory,
  setNewServiceDepartment,
  setNewServiceDuration,
  setNewServiceDescription,
  onClose,
  onSubmit
}) {
  const durationNum = Number(newServiceDuration);
  const isDurationInvalid = newServiceDuration === '' || isNaN(durationNum) || durationNum <= 0;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Chỉnh sửa thông tin dịch vụ" : "Thêm dịch vụ mới"}
      footer={
        <>
          <button type="button" className="customer-btn-cancel" onClick={onClose}>Hủy</button>
          <PrimaryButton onClick={onSubmit} disabled={isDurationInvalid}>
            {isEditMode ? "Cập nhật dịch vụ" : "Lưu dịch vụ"}
          </PrimaryButton>
        </>
      }
    >
      <form onSubmit={onSubmit} id="add-service-form">
        <div className="service-modal__body" style={{ padding: 0 }}>
          {formError && (
            <p style={{ color: '#ef4444', fontSize: '12px', margin: '0 0 8px 0', padding: '8px', background: '#fef2f2', borderRadius: '4px', borderLeft: '3px solid #ef4444' }}>{formError}</p>
          )}

          <div className="service-modal__field" style={{ marginBottom: '16px' }}>
            <label htmlFor="svc-id" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>
              Mã dịch vụ
            </label>
            <input
              id="svc-id"
              type="text"
              placeholder={isEditMode ? "" : "Hệ thống tự sinh mã sau khi lưu..."}
              value={newServiceId}
              onChange={(e) => setNewServiceId(e.target.value)}
              disabled
              style={{
                backgroundColor: '#f8fafc',
                cursor: 'not-allowed',
                border: '1px solid #e2e8f0',
                color: '#94a3b8'
              }}
            />
          </div>

          <div className="service-modal__field" style={{ marginBottom: '16px' }}>
            <label htmlFor="svc-name" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Tên dịch vụ <span className="required" style={{ color: '#dc2626' }}>*</span></label>
            <input
              id="svc-name"
              type="text"
              placeholder="Ví dụ: Trám răng thẩm mỹ công nghệ mới"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              required
            />
          </div>

          <div className="service-modal__field" style={{ marginBottom: '16px' }}>
            <label htmlFor="svc-category" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Loại dịch vụ <span className="required" style={{ color: '#dc2626' }}>*</span></label>
            <MacDropdown
              value={newServiceCategory}
              onChange={(val) => setNewServiceCategory(val)}
              options={[
                { value: "Khám bệnh", label: "Khám bệnh", disabled: isEditMode },
                { value: "Xét nghiệm", label: "Xét nghiệm", disabled: isEditMode },
                { value: "CĐHA", label: "CĐHA", disabled: isEditMode },
                { value: "Phẫu thuật", label: "Phẫu thuật", disabled: isEditMode }
              ]}
            />
          </div>

          <div className="service-modal__field" style={{ marginBottom: '16px' }}>
            <label htmlFor="svc-department" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Khoa chuyên môn phụ trách <span className="required" style={{ color: '#dc2626' }}>*</span></label>
            <MacDropdown
              value={newServiceDepartment}
              onChange={(val) => setNewServiceDepartment(val)}
              options={[
                { value: "Khoa Khám Bệnh", label: "Khoa Khám Bệnh" },
                { value: "Khoa Phục Hình", label: "Khoa Phục Hình" },
                { value: "Khoa Chẩn Đoán Hình Ảnh", label: "Khoa Chẩn Đoán Hình Ảnh" },
                { value: "Khoa Xét Nghiệm", label: "Khoa Xét Nghiệm" }
              ]}
            />
          </div>

          <div className="service-modal__field" style={{ marginBottom: '16px' }}>
            <label htmlFor="svc-duration" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Thời gian điều trị (phút)</label>
            <input
              id="svc-duration"
              type="number"
              placeholder="30"
              value={newServiceDuration}
              onChange={(e) => setNewServiceDuration(e.target.value)}
            />
            {isDurationInvalid && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Thời gian trung bình phải là số nguyên dương (phút)
              </span>
            )}
          </div>

          <div className="service-modal__field" style={{ marginBottom: '16px' }}>
            <label htmlFor="svc-desc" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Mô tả chi tiết</label>
            <textarea
              id="svc-desc"
              placeholder="Nhập mô tả cho dịch vụ..."
              value={newServiceDescription}
              onChange={(e) => setNewServiceDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
}
