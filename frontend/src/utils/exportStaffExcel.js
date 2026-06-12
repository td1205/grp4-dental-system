import { ROLE_LABELS, STATUS_LABELS, formatCreatedDate } from '../constants/staff';


const EXPORT_COLUMNS = [
  { key: 'ma_nhan_vien', header: 'Mã NV' },
  { key: 'name', header: 'Họ tên' },
  { key: 'email_noi_bo', header: 'Email nội bộ' },
  { key: 'phone', header: 'SĐT' },
  { key: 'role', header: 'Vai trò', format: (v) => ROLE_LABELS[v] ?? v },
  { key: 'academicDegree', header: 'Bằng cấp', format: (v) => v || '—' }, // Thay degree
  { key: 'trang_thai', header: 'Trạng thái', format: (v) => STATUS_LABELS[v] ?? v }, // Thay status
  { key: 'createdAt', header: 'Ngày tạo', format: (v) => formatCreatedDate(v) },
];

function escapeCsvCell(value) {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsvRows(staffs) {
  const header = EXPORT_COLUMNS?.map((c) => escapeCsvCell(c.header)).join(',');
  const rows = staffs?.map((staff) =>
    EXPORT_COLUMNS?.map((col) => {
      const raw = staff[col.key];
      const val = col.format ? col.format(raw, staff) : raw;
      return escapeCsvCell(val);
    }).join(','),
  );
  return [header, ...rows].join('\r\n');
}

function downloadBlob(content, filename) {
  const blob = new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export staff list as CSV (opens in Excel).
 */
export function exportStaffsToExcel(staffs, filenamePrefix = 'danh-sach-nhan-vien') {
  if (!staffs?.length) {
    return { ok: false, message: 'Không có dữ liệu để xuất.' };
  }
  const date = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}_${date}.csv`;
  downloadBlob(buildCsvRows(staffs), filename);
  return { ok: true, message: `Đã xuất ${staffs.length} nhân viên.` };
}