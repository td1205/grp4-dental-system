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
    mutationFn: (id) => staffApi.toggleLock(id),
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

  const confirmModal = useCallback(() => {
    if (!modal.staff) return;
    if (modal.type === 'lock') {
      lockMutation.mutate(modal.staff.id);
    } else if (modal.type === 'delete') {
      deleteMutation.mutate(modal.staff.id);
    }
  }, [modal, lockMutation, deleteMutation]);

  const isModalLoading = lockMutation.isPending || deleteMutation.isPending;

  const modalConfig =
    modal.type === 'lock' && modal.staff
      ? {
          title: modal.staff.status === 'locked' ? 'Mở khóa tài khoản' : 'Tạm khóa tài khoản',
          message:
            modal.staff.status === 'locked'
              ? `Bạn có chắc muốn mở khóa tài khoản của ${modal.staff.fullName}?`
              : `Bạn có chắc muốn tạm khóa tài khoản của ${modal.staff.fullName}?`,
          confirmLabel: modal.staff.status === 'locked' ? 'Mở khóa' : 'Tạm khóa',
          variant: 'default',
        }
      : modal.type === 'delete' && modal.staff
        ? {
            title: 'Xóa tài khoản nhân viên',
            message: `Bạn có chắc chắn muốn xóa tài khoản "${modal.staff.fullName}"? Thao tác này sẽ chuyển trạng thái sang "${STATUS_LABELS.inactive}" (xóa logic).`,
            confirmLabel: 'Xác nhận',
            variant: 'danger',
          }
        : null;

  return {
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
