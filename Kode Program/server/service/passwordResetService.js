const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendPasswordResetEmail } = require("./emailService");

// Generate reset token
const generateResetToken = async (email) => {
  try {
    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw { status: 404, message: "Email tidak terdaftar" };
    }

    // Generate token dan expiry (1 jam dari sekarang)
    const token = crypto.randomBytes(20).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 jam

    // Update user dengan token dan expiry
    await prisma.user.updateMany({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    // Kirim email reset password
    await sendPasswordResetEmail(user.email, user.name, token);

    return {
      success: true,
      message: "Email reset password telah dikirim",
    };
  } catch (error) {
    console.error("Error in generateResetToken:", error);
    throw error;
  }
};

// Reset password dengan token
const resetPasswordWithToken = async (token, newPassword) => {
  try {
    // Cari user berdasarkan token dan cek expiry
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw {
        status: 400,
        message: "Token tidak valid atau sudah kadaluarsa",
      };
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 8);

    // Update password dan hapus token
    await prisma.user.updateMany({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return {
      success: true,
      message: "Password berhasil direset",
    };
  } catch (error) {
    console.error("Error in resetPasswordWithToken:", error);
    throw error;
  }
};

module.exports = {
  generateResetToken,
  resetPasswordWithToken,
};
