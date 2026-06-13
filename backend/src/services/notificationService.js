const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

exports.sendShiftNotification = async (staff, shift) => {
    try {
        const message = `Chào ${staff.name}, Quản trị viên đã phân công ca trực ${shift.startTime}-${shift.endTime} vào ngày ${shift.date}.`;

        await transporter.sendMail({
            from: '"Dental Care System" <noreply@dentalcare.com>',
            to: staff.email,
            subject: 'Thông báo phân công ca trực',
            text: message
        });
    } catch (err) {
        console.error("Lỗi gửi thông báo:", err);
    }
};

module.exports = { sendShiftNotification: exports.sendShiftNotification };