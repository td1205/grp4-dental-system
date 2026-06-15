const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Cấu hình transporter (người vận chuyển)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  // 2. Cấu hình nội dung email
  const mailOptions = {
    from: '"Hệ thống Nha Khoa DentalCare" <no-reply@dentalcare.com>',
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  // 3. Gửi email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;