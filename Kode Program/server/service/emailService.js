const transporter = require("../config/emailConfig");

const sendWelcomeEmail = async (email, name, password) => {
  try {
    console.log("Mengirim email ke:", email);
    const info = await transporter.sendMail({
      from: `"SIDESAPRIMA" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "PEMBERITAHUAN AKUN LOGIN - Sistem Desa Prima DIY",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0;">
          <!-- Header -->
          <div style="background-color: #2c5f9e; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">PEMBERITAHUAN AKUN LOGIN</h1>
            <p style="margin: 5px 0 0; font-size: 16px;">Sistem Desa Prima DIY</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 20px;">
            <p style="margin-bottom: 20px;">Kepada Yth. Bapak/Ibu <strong>${name}</strong>,</p>
            
            <p style="text-align: justify; line-height: 1.6;">
              Dengan hormat,<br>
              Kami sampaikan bahwa akun Anda untuk mengakses Sistem Desa Prima DIY telah berhasil dibuat. 
              Berikut adalah informasi login yang dapat Anda gunakan:
            </p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #2c5f9e; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
              <p style="margin: 5px 0;">
                <strong>Login melalui:</strong> 
                <a href="https://frontend-desa-prima-dev.student.stis.ac.id/" target="_blank">
                  https://frontend-desa-prima-dev.student.stis.ac.id/
                </a>
              </p>
            </div>
            
            <p style="text-align: justify; line-height: 1.6;">
              Demi keamanan akun Anda, kami sangat menyarankan untuk segera mengganti password setelah login pertama kali.
            </p>
            
            <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; border: 1px solid #ffd54f;">
              <p style="margin: 0; color: #d32f2f; font-weight: bold;">
                HARAP GANTI PASSWORD SETELAH LOGIN!
              </p>
            </div>
            
            <p style="text-align: justify; line-height: 1.6;">
              Jika Anda mengalami kesulitan atau memiliki pertanyaan, jangan ragu untuk menghubungi tim dukungan kami.
            </p>
            
            <p style="margin-top: 30px;">
              Hormat kami,<br>
              <strong>Tim Sistem Desa Prima DIY</strong>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">
              Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
            </p>
          </div>
        </div>
      `,
    });
    console.log("Email terkirim:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    return { success: false, error };
  }
};

const sendPasswordResetEmail = async (email, name, token) => {
  try {
    const resetUrl = `https://frontend-desa-prima-dev.student.stis.ac.id/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Sistem Desa Prima" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Password - Sistem Desa Prima",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #542d48;">Halo ${name},</h2>
          <p>Anda menerima email ini karena Anda (atau seseorang) meminta reset password untuk akun Anda.</p>
          <p>Silakan klik link di bawah ini untuk mereset password Anda:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #542d48; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </p>
          <p>Link ini akan kadaluarsa dalam 1 jam.</p>
          <p>Jika Anda tidak meminta reset password, Anda bisa mengabaikan email ini.</p>
          <hr>
          <p style="font-size: 12px; color: #777;">
            © ${new Date().getFullYear()} Sistem Desa Prima - DP3AP Provinsi Yogyakarta
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };
