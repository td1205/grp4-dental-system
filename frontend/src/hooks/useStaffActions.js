import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../services/staffApi';
import { STATUS_LABELS } from '../constants/staff';

const INITIAL_MODAL = {
  open: false,
  type: null,
  staff: null,
};

export function useStaffActions() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(INITIAL_MODAL);

  const closeModal = useCallback(() => setModal(INITIAL_MODAL), []);

  const lockMutation = useMutation({
    mutationFn: ({ id, reason }) => staffApi.toggleLock({ id, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => staffApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] });
      closeModal();
    },
  });

  const openLockModal = useCallback((staff) => {
    setModal({ open: true, type: 'lock', staff });
  }, []);

  const openDeleteModal = useCallback((staff) => {
    setModal({ open: true, type: 'delete', staff });
  }, []);

  const confirmModal = useCallback(async (reason) => {
    if (!modal.staff) return;
    if (modal.type === 'lock') {
      if (modal.staff.role === 'doctor' && modal.staff.status !== 'suspended') {
        const data = await staffApi.checkAppointments(modal.staff.id);
        if (data.hasAppointments) {
          setModal({ open: true, type: 'reassign', staff: modal.staff, appointments: data.appointments, reason });
          return;
        }
      }
      lockMutation.mutate({ id: modal.staff.id, reason });
    } else if (modal.type === 'delete') {
      deleteMutation.mutate(modal.staff.id);
    }
  }, [modal, lockMutation, deleteMutation]);

  const isModalLoading = lockMutation.isPending || deleteMutation.isPending;

  const modalConfig =
    modal.type === 'lock' && modal.staff
      ? {
        title: modal.staff.status === 'suspended' ? 'Khôi phục tài khoản' : 'Đình chỉ tài khoản',
        message:
          modal.staff.status === 'suspended'
            ? `Bạn có chắc muốn khôi phục tài khoản của ${modal.staff.fullName}?`
            : `Bạn có chắc muốn đình chỉ tài khoản của ${modal.staff.fullName}?`,
        confirmLabel: modal.staff.status === 'suspended' ? 'Khôi phục' : 'Đình chỉ',
        variant: 'default',
        requireReason: modal.staff.status !== 'suspended',
      }
      : modal.type === 'delete' && modal.staff
        ? {
          title: 'Xóa tài khoản nhân viên',
          message: `Bạn có chắc chắn muốn xóa tài khoản "${modal.staff.fullName}"? Thao tác này sẽ chuyển trạng thái sang "${STATUS_LABELS.inactive}".`,
          confirmLabel: 'Xác nhận',
          variant: 'danger',
        }
        : null;

  return {
    modalState: modal,
    modalOpen: modal.open,
    modalConfig,
    openLockModal,
    openDeleteModal,
    closeModal,
    confirmModal,
    isModalLoading,
    actionError: lockMutation.error || deleteMutation.error,
  };
}
