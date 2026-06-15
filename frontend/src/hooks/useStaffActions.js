import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../services/staffApi';
import { STATUS_LABELS } from '../constants/staff';

const INITIAL_MODAL = {
  open: false,
  type: null,
  staff: null,
};

export function useStaffActions({ onSuccessAction } = {}) {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(INITIAL_MODAL);

  const closeModal = useCallback(() => setModal(INITIAL_MODAL), []);

  const lockMutation = useMutation({
    mutationFn: ({ id, reason }) => staffApi.toggleLock({ id, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] });
      closeModal();
      if (onSuccessAction) onSuccessAction(modal.staff.status === 'locked' ? 'Khôi phục tài khoản thành công!' : 'Đình chỉ tài khoản thành công!');
    },
    onError: (err) => {
      if (onSuccessAction) onSuccessAction(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => staffApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] });
      closeModal();
      if (onSuccessAction) onSuccessAction('Xóa tài khoản thành công!');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (id) => staffApi.resetPassword(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] });
      closeModal();
      if (onSuccessAction) onSuccessAction('Đã gửi email khôi phục mật khẩu thành công. Tài khoản đã chuyển về trạng thái Chờ kích hoạt.');
    },
  });

  const openLockModal = useCallback((staff) => {
    setModal({ open: true, type: 'lock', staff });
  }, []);

  const openDeleteModal = useCallback((staff) => {
    setModal({ open: true, type: 'delete', staff });
  }, []);

  const openResetPasswordModal = useCallback((staff) => {
    setModal({ open: true, type: 'reset-password', staff });
  }, []);

  const confirmModal = useCallback(async (reason) => {
    if (!modal.staff) return;
    const staffId = modal.staff.id || modal.staff._id;
    if (modal.type === 'lock') {
      const isDoctor = String(modal.staff.role).toLowerCase() === 'doctor' || String(modal.staff.role).toLowerCase() === 'bác sĩ';
      if (isDoctor && modal.staff.status !== 'locked') {
        try {
          const data = await staffApi.checkAppointments(staffId);
          if (data.hasAppointments) {
            setModal({ open: true, type: 'reassign', staff: modal.staff, appointments: data.appointments, reason });
            return;
          }
        } catch (err) {
          if (onSuccessAction) onSuccessAction(err.response?.data?.message || 'Có lỗi xảy ra khi kiểm tra lịch', 'error');
          return;
        }
      }
      lockMutation.mutate({ id: staffId, reason });
    } else if (modal.type === 'delete') {
      deleteMutation.mutate(staffId);
    } else if (modal.type === 'reset-password') {
      resetPasswordMutation.mutate(staffId);
    }
  }, [modal, lockMutation, deleteMutation, resetPasswordMutation]);

  const isModalLoading = lockMutation.isPending || deleteMutation.isPending || resetPasswordMutation.isPending;

  const modalConfig =
    modal.type === 'lock' && modal.staff
      ? {
        title: modal.staff.status === 'locked' ? 'Khôi phục tài khoản' : 'Đình chỉ tài khoản',
        message:
          modal.staff.status === 'locked'
            ? `Bạn có chắc muốn khôi phục tài khoản của ${modal.staff.name || modal.staff.fullName}?`
            : `Bạn có chắc muốn đình chỉ tài khoản của ${modal.staff.name || modal.staff.fullName}?`,
        confirmLabel: modal.staff.status === 'locked' ? 'Khôi phục' : 'Đình chỉ',
        variant: 'default',
        requireReason: modal.staff.status !== 'locked',
      }
      : modal.type === 'delete' && modal.staff
        ? {
          title: 'Xóa tài khoản nhân viên',
          message: `Bạn có chắc chắn muốn xóa tài khoản "${modal.staff.name || modal.staff.fullName}"? Thao tác này sẽ chuyển trạng thái sang "${STATUS_LABELS.inactive}".`,
          confirmLabel: 'Xác nhận',
          variant: 'danger',
        }
        : modal.type === 'reset-password' && modal.staff
          ? {
            title: 'Khôi phục mật khẩu',
            message: `Bạn có chắc chắn muốn khôi phục mật khẩu cho tài khoản "${modal.staff.name || modal.staff.fullName}"? Hệ thống sẽ tạo một Token bảo mật mới và gửi liên kết đổi mật khẩu tới email của nhân sự.`,
            confirmLabel: 'Đồng ý',
            variant: 'default',
          }
          : null;

  return {
    modalState: modal,
    modalOpen: modal.open,
    modalConfig,
    openLockModal,
    openDeleteModal,
    openResetPasswordModal,
    closeModal,
    confirmModal,
    isModalLoading,
    actionError: lockMutation.error || deleteMutation.error || resetPasswordMutation.error,
  };
}
