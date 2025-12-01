const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const loginUser = async (email, password) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        Kabupaten: { select: { id: true, nama_kabupaten: true } },
        Kelompok: { select: { id: true, nama: true } },
      },
    });

    if (!user) throw { status: 404, message: "User tidak ditemukan" };

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw { status: 401, message: "Password salah" };

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        kabupatenId: user.kabupatenId || null,
        kelompokId: user.kelompokId || null,
        kabupatenName: user.Kabupaten?.nama_kabupaten || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        kabupatenId: user.kabupatenId || null,
        kelompokId: user.kelompokId || null,
        kabupatenName: user.Kabupaten?.nama_kabupaten || null,
        kelompokName: user.Kelompok?.nama || null,
        nip: user.nip || null,
      },
    };
  } catch (error) {
    console.error("Login service error:", error);
    throw error;
  }
};

const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    if (!currentPassword || !newPassword) {
      throw {
        status: 400,
        message: "Current password dan new password harus diisi",
      };
    }

    if (newPassword.length < 8) {
      throw { status: 400, message: "Password baru minimal 8 karakter" };
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { id: true, password: true },
    });

    if (!user) throw { status: 404, message: "User tidak ditemukan" };

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw { status: 400, message: "Password lama tidak sesuai" };

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password berhasil diubah" };
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
};

const getUserProfile = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        name: true,
        email: true,
        role: true,
        nip: true,
        kabupatenId: true,
      },
    });

    if (!user) {
      throw { status: 404, message: "User tidak ditemukan" };
    }

    return user;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    throw { status: 500, message: "Terjadi kesalahan pada server" };
  }
};

const getCurrentUser = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        Kabupaten: { select: { nama_kabupaten: true } },
        Kelompok: { select: { nama: true } },
      },
    });

    if (!user) throw { status: 404, message: "User not found" };

    return {
      ...user,
      kabupatenName: user.Kabupaten?.nama_kabupaten || null,
      kelompokName: user.Kelompok?.nama || null,
    };
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    throw error;
  }
};

const authMiddleware = async (req, res, next) => {
  // Izinkan preflight request
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Token tidak ditemukan",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User tidak ditemukan",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      error: "Autentikasi gagal",
      details: error.message,
    });
  }
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authorization token required",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: "Invalid or expired token",
      });
    }

    // Simpan data lengkap ke req.user
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  });
};

module.exports = {
  loginUser,
  changePassword,
  getCurrentUser,
  getUserProfile,
  authMiddleware,
  authenticateToken,
};
