const express = require('express');
const cors = require('cors');

// Sửa đường dẫn thành ./routes/ thay vì ./src/routes/
const receptionRoutes = require('./routes/receptionRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const billingRoutes = require('./routes/billingRoutes');

const app = express();
const PORT = 3001; 

app.use(cors());
app.use(express.json());

app.use('/api/reception', receptionRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/billing', billingRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: "Backend Lễ tân chạy độc lập tại cổng 3001!" });
});

app.listen(PORT, () => {
  console.log(`🚀 BACKEND LỄ TÂN ĐANG TRẠY TẠI: http://localhost:${PORT}`);
});