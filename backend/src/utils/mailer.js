const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendWelcomeEmail = async (email, fullName, token) => {
  const activationLink = `http://localhost:5173/first-time-password?token=${token}&email=${email}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2563eb; color: #ffffff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Nha khoa Dental Care</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Hệ thống quản trị phòng khám</p>
      </div>
      <div style="padding: 30px 20px; color: #334155; line-height: 1.6;">
        <p style="font-size: 16px; margin-top: 0;">Xin chào <strong>${fullName}</strong>,</p>
        <p>Tài khoản truy cập Hệ thống quản trị Nha khoa Dental Care của bạn đã được khởi tạo thành công.</p>
        <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; font-size: 14px;">
          <p style="margin: 0 0 10px 0;"><strong>Tên đăng nhập (Email):</strong> ${email}</p>
          <p style="margin: 0;"><strong>Mật khẩu mặc định:</strong> Dentalcare@123</p>
        </div>
        <p>Để đảm bảo bảo mật, bạn vui lòng kích hoạt tài khoản và đổi mật khẩu lần đầu bằng cách nhấn vào nút bên dưới:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${activationLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Kích hoạt tài khoản</a>
        </div>
        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
          Nếu bạn không có yêu cầu tạo tài khoản này, vui lòng bỏ qua email này hoặc liên hệ Quản trị viên hệ thống.
        </p>
      </div>
      <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Dental Care Clinic. All rights reserved.
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Dental Care System" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Kích hoạt tài khoản nhân viên - Dental Care',
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Gửi email thành công tới ${email}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Mailer] Lỗi khi gửi email tới ${email}:`, error);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
};
