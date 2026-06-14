const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

const sendShiftNotification = async (staff, shift, isReplacement = false) => {
    try {
        const staffEmail = staff.email || staff.email_noi_bo;
        if (!staffEmail) return; // Không có email thì bỏ qua

        const subject = isReplacement
            ? 'Thông báo: Bạn được phân công ca trực thay thế'
            : 'Thông báo phân công ca trực mới';

        const dateStr = new Date(shift.date).toLocaleDateString('vi-VN');
        const message = isReplacement
            ? `Chào ${staff.name}, Quản trị viên đã phân công bạn trực thay thế vào ca ${shift.startTime}–${shift.endTime}, ngày ${dateStr}, tại ${shift.room}.`
            : `Chào ${staff.name}, Quản trị viên đã phân công ca trực ${shift.startTime}–${shift.endTime} vào ngày ${dateStr}, tại ${shift.room}.`;

        await transporter.sendMail({
            from: '"Dental Care System" <noreply@dentalcare.com>',
            to: staffEmail,
            subject,
            text: message
        });
    } catch (err) {
        console.error('Lỗi gửi thông báo ca trực:', err.message);
    }
};

const sendAdminLeaveNotification = async (admins, staff, leave, isCancelRequest = false) => {
    try {
        const adminEmails = admins.map(a => a.email || a.email_noi_bo).filter(e => e);
        if (adminEmails.length === 0) return;

        const subject = isCancelRequest
            ? `Thông báo: Nhân sự ${staff.name} yêu cầu hủy đơn xin nghỉ`
            : `Thông báo: Nhân sự ${staff.name} vừa nộp đơn xin nghỉ phép`;

        const startDateStr = new Date(leave.startDate).toLocaleDateString('vi-VN');
        const endDateStr = new Date(leave.endDate).toLocaleDateString('vi-VN');
        const timeStr = startDateStr === endDateStr ? startDateStr : `${startDateStr} - ${endDateStr}`;

        const message = isCancelRequest
            ? `Chào Quản trị viên,\n\nNhân sự ${staff.name} vừa gửi yêu cầu HỦY đơn xin nghỉ đã được duyệt trước đó.\nThời gian: ${timeStr} (${leave.duration})\nLý do: ${leave.reason}\n\nVui lòng truy cập hệ thống để xem xét và xác nhận.`
            : `Chào Quản trị viên,\n\nNhân sự ${staff.name} vừa nộp một đơn xin nghỉ phép mới.\nThời gian: ${timeStr} (${leave.duration})\nLoại nghỉ: ${leave.leaveType}\nLý do: ${leave.reason}\n\nVui lòng truy cập hệ thống để phê duyệt.`;

        await transporter.sendMail({
            from: '"Dental Care System" <noreply@dentalcare.com>',
            to: adminEmails.join(','),
            subject,
            text: message
        });
    } catch (err) {
        console.error('Lỗi gửi thông báo cho Admin:', err.message);
    }
};

/**
 * Gửi email thông báo lịch hẹn cho Bệnh nhân (UC 2.4)
 * type: 'create' | 'reschedule' | 'cancel'
 */
const sendPatientAppointmentNotification = async (customer, appointment, type = 'create') => {
    try {
        const email = customer.email;
        if (!email) return; // Chưa có email -> bỏ qua (SMS mô phỏng)

        const dateStr = new Date(appointment.date).toLocaleDateString('vi-VN', {
            weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
        });
        const doctorName = appointment.doctorId?.name || 'Bác sĩ';
        const serviceName = appointment.serviceId?.name || 'Dịch vụ';

        let subject, message;

        if (type === 'reschedule') {
            subject = 'Dental Care: Lịch hẹn của bạn đã được dời';
            message = `Chào ${customer.name},\n\nLịch hẹn khám bệnh của bạn đã được cập nhật.\n\nTHÔNG TIN LỊCH HẸN MỚI:\n  - Dịch vụ: ${serviceName}\n  - Ngày khám: ${dateStr}\n  - Giờ khám: ${appointment.time} - ${appointment.endTime}\n  - Bác sĩ: ${doctorName}\n\nVui lòng có mặt đúng giờ. Nếu cần hỗ trợ, vui lòng liên hệ quầy lễ tân.\n\nTrân trọng,\nPhòng khám Dental Care`;
        } else if (type === 'cancel') {
            subject = 'Dental Care: Lịch hẹn của bạn đã bị hủy';
            message = `Chào ${customer.name},\n\nLịch hẹn khám bệnh của bạn vào lúc ${appointment.time} ngày ${dateStr} với ${doctorName} đã bị hủy.\n\nNếu bạn muốn đặt lịch mới, vui lòng liên hệ quầy lễ tân hoặc trực tiếp tới phòng khám.\n\nTrân trọng,\nPhòng khám Dental Care`;
        } else {
            subject = 'Dental Care: Xác nhận đặt lịch hẹn khám bệnh';
            message = `Chào ${customer.name},\n\nPhòng khám Dental Care xác nhận bạn đã đặt lịch hẹn thành công.\n\nTHÔNG TIN LỊCH HẸN:\n  - Dịch vụ: ${serviceName}\n  - Ngày khám: ${dateStr}\n  - Giờ khám: ${appointment.time} - ${appointment.endTime}\n  - Bác sĩ: ${doctorName}\n${appointment.notes ? `  - Ghi chú: ${appointment.notes}` : ''}\n\nVui lòng đến sớm 10 phút để hoàn tất thủ tục tiếp đón. Mang theo CCCD hoặc sổ khám bệnh nếu có.\n\nTrân trọng,\nPhòng khám Dental Care`;
        }

        await transporter.sendMail({
            from: '"Dental Care" <noreply@dentalcare.com>',
            to: email,
            subject,
            text: message
        });
    } catch (err) {
        console.error('Lỗi gửi email thông báo lịch hẹn cho bệnh nhân:', err.message);
    }
};

module.exports = { sendShiftNotification, sendAdminLeaveNotification, sendPatientAppointmentNotification };