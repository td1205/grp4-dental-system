import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EMPTY_STAFF_FORM } from '../constants/staffForm';
import { staffApi } from '../services/staffApi';
import { staffToFormValues } from '../utils/staffFormMappers';
import {
  validateStaffForm,
  validateStaffField,
  mapServerErrors,
} from '../utils/validateStaffForm';

export function useStaffForm({ mode = 'create', staffId } = {}) {
  const isEdit = mode === 'edit';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [values, setValues] = useState(EMPTY_STAFF_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const staffQuery = useQuery({
    queryKey: ['staff', staffId],
    queryFn: () => staffApi.getById(staffId),
    enabled: isEdit && Boolean(staffId),
  });

  useEffect(() => {
    if (staffQuery.data) {
      setValues(staffToFormValues(staffQuery.data));
    }
  }, [staffQuery.data]);

  const onMutationError = (err) => {
    const data = err.response?.data;
    if (data?.fields) {
      setErrors((prev) => ({ ...prev, ...mapServerErrors(data.fields) }));
    }
    setSubmitError(
      data?.message ||
        (isEdit
          ? 'Không thể cập nhật nhân viên. Vui lòng kiểm tra lại thông tin.'
          : 'Không thể tạo nhân viên. Vui lòng kiểm tra lại thông tin.'),
    );
  };

  const createMutation = useMutation({
    mutationFn: (payload) => staffApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] });
      navigate('/staff');
    },
    onError: onMutationError,
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => staffApi.update(staffId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] });
      queryClient.invalidateQueries({ queryKey: ['staff', staffId] });
      navigate('/staff');
    },
    onError: onMutationError,
  });

  const handleChange = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setSubmitError('');
  }, []);

  const handleBlur = useCallback(
    (field) => {
      setValues((current) => {
        const message = validateStaffField(field, current, mode);
        setErrors((prev) => ({ ...prev, [field]: message || undefined }));
        return current;
      });
    },
    [mode],
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const { valid, errors: validationErrors } = validateStaffForm(values, mode);
      const cleaned = Object.fromEntries(
        Object.entries(validationErrors).filter(([, msg]) => msg),
      );
      setErrors(cleaned);
      if (!valid) {
        setSubmitError('Vui lòng sửa các lỗi trong biểu mẫu trước khi lưu.');
        return;
      }
      setSubmitError('');
      const payload = { ...values };
      if (isEdit && !payload.password) {
        delete payload.password;
        delete payload.confirmPassword;
      }
      if (isEdit) {
        updateMutation.mutate(payload);
      } else {
        createMutation.mutate(payload);
      }
    },
    [values, mode, isEdit, createMutation, updateMutation],
  );

  const handleCancel = useCallback(() => {
    navigate('/staff');
  }, [navigate]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return {
    values,
    errors,
    submitError,
    handleChange,
    handleBlur,
    handleSubmit,
    handleCancel,
    isSubmitting,
    isLoading: isEdit && staffQuery.isLoading,
    loadError: isEdit && staffQuery.isError,
    isEdit,
  };
}
