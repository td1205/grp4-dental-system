const express = require('express');
const router = express.Router();
const { MOCK_STAFF } = require('../data/mockData');

function normalize(str) { return (str || '').toLowerCase().trim(); }
function filterStaff(list, { search, role, status }) {
  const q = normalize(search);
  return list.filter((s) => {
    if (!status && s.status === 'inactive') return false;
    if (role && s.role !== role) return false;
    if (status && s.status !== status) return false;
    if (!q) return true;
    const haystack = [s.id, s.fullName, s.email, s.phone, s.idNumber].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

// Lấy danh sách nhân viên công việc của Admin cũ
router.get('/', (req, res) => {
  const search = req.query.search || '';
  const role = req.query.role || '';
  const status = req.query.status || '';
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const filtered = filterStaff(MOCK_STAFF, { search, role, status });
  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  res.json({ data, total, page, limit });
});

module.exports = router;