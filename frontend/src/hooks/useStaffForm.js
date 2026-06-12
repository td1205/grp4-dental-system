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

function removeAccents(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase();
}

function generateEmail(name, role, existingEmails = []) {
  if (!name || !role) return '';
  const cleanName = removeAccents(name)
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
  if (!cleanName) return '';

  const nameParts = cleanName.split(/\s+/);
  const nameJoined = nameParts.join('');

  let prefix = 'nv';
  const roleLower = role.toLowerCase();
  if (roleLower === 'doctor') prefix = 'bs';
  else if (roleLower === 'admin') prefix = 'admin';
  else if (roleLower === 'receptionist') prefix = 'lt';

  const baseEmailPrefix = `${prefix}.${nameJoined}`;
  let email = `${baseEmailPrefix}@dentalcare.com`;

  let counter = 2;
  const existingSet = new Set(existingEmails?.map(e => e.toLowerCase().trim()));
  while (existingSet.has(email)) {
    email = `${baseEmailPrefix}${counter}@dentalcare.com`;
    counter++;
  }
  return email;
}

export function useStaffForm({ mode = 'create', staffId } = {}) {
  const isEdit = mode === 'edit';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [values, setValues] = useState(EMPTY_STAFF_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isEmailDirty, setIsEmailDirty] = useState(false);

  const staffQuery = useQuery({
    queryKey: ['staff', staffId],
    queryFn: () => staffApi.getById(staffId),
    enabled: isEdit && Boolean(staffId),
  });

  const allStaffQuery = useQuery({
    queryKey: ['all-staffs'],
    queryFn: () => staffApi.getAll({ limit: 500 }),
    enabled: !isEdit,
  });

  useEffect(() => {
    if (staffQuery.data) {
      setValues(staffToFormValues(staffQuery.data));
    }
  }, [staffQuery.data]);

  // Tự động sinh email dựa trên name và role mới
  useEffect(() => {
    if (!isEdit && !isEmailDirty && values.name && values.role) {
      const existingEmails = allStaffQuery.data?.data?.map((s) => s.email) || [];
      const generated = generateEmail(values.name, values.role, existingEmails);
      if (generated) {
        setValues((prev) => ({ ...prev, email: generated }));
      }
    }
  }, [values.name, values.role, allStaffQuery.data, isEmailDirty, isEdit]);

  const onMutationError = (err) => {
    const data = err.response?.data;
    if (data?.fields) {
      setErrors((prev) => ({ ...prev, ...mapServerErrors(data.fields) }));
    }
    setSubmitError(data?.message || 'Có lỗi xảy ra khi lưu thông tin.');
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
    if (field === 'email') setIsEmailDirty(true);
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setSubmitError('');
  }, []);

  const handleBlur = useCallback((field) => {
    setValues((current) => {
      const message = validateStaffField(field, current, mode);
      setErrors((prev) => ({ ...prev, [field]: message || undefined }));
      return current;
    });
  }, [mode]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const { valid, errors: validationErrors } = validateStaffForm(values, mode);
    setErrors(validationErrors);

    if (!valid) {
      setSubmitError('Vui lòng sửa các lỗi trong biểu mẫu trước khi lưu.');
      return;
    }
    setSubmitError('');

    // GỬI THẲNG 'values' VÌ ĐÃ ĐỒNG BỘ KEY VỚI BACKEND
    if (isEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }, [values, mode, isEdit, createMutation, updateMutation]);

  const handleCancel = useCallback(() => navigate('/staff'), [navigate]);

  return {
    values, errors, submitError, handleChange, handleBlur,
    handleSubmit, handleCancel, isSubmitting: createMutation.isPending || updateMutation.isPending,
    isLoading: isEdit && staffQuery.isLoading,
    isEdit,
  };
}