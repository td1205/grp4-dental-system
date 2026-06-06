import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';
import { staffApi } from '../services/staffApi';

const PAGE_SIZE = 4;

export function useStaffQuery() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const query = useQuery({
    queryKey: ['staffs', debouncedSearch, role, status, page, PAGE_SIZE],
    queryFn: () =>
      staffApi.getAll({
        search: debouncedSearch || undefined,
        role: role || undefined,
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
      }),
  });

  const setSearchAndReset = (value) => {
    setSearch(value);
    setPage(1);
  };

  const setRoleAndReset = (value) => {
    setRole(value);
    setPage(1);
  };

  const setStatusAndReset = (value) => {
    setStatus(value);
    setPage(1);
  };

  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return {
    search,
    setSearch: setSearchAndReset,
    role,
    setRole: setRoleAndReset,
    status,
    setStatus: setStatusAndReset,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    total,
    totalPages,
    staffs: query.data?.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
