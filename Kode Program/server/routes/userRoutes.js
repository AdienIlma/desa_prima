const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
const xlsx = require("xlsx");
const upload = multer({ storage: multer.memoryStorage() });
const prisma = new PrismaClient();
const {
  loginUser,
  getUserProfile,
  changePassword,
  getCurrentUser,
  authMiddleware,
  authenticateToken,
} = require("../service/userAuthService");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkCreateUsers,
} = require("../service/userCRUDService");

const {
  generateResetToken,
  resetPasswordWithToken,
} = require("../service/passwordResetService");

const router = express.Router();

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email harus diisi",
      });
    }

    const result = await generateResetToken(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Token, password baru, dan konfirmasi password harus diisi",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Password baru dan konfirmasi password tidak sama",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password minimal 8 karakter",
      });
    }

    const result = await resetPasswordWithToken(token, newPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/validate-reset-token", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Token harus disertakan",
      });
    }

    // Cari user berdasarkan token dan cek expiry
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Token tidak valid atau sudah kadaluarsa",
      });
    }

    res.status(200).json({
      success: true,
      message: "Token valid",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Gagal memvalidasi token",
    });
  }
});

router.get("/list", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

router.get("/list/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
});

// Create a new user
router.post("/users/list", async (req, res) => {
  try {
    // Validasi awal di route handler
    if (!req.body.name && !req.body.email && !req.body.role) {
      return res
        .status(400)
        .json({ error: "Nama, email, dan role wajib diisi" });
    }

    if (!req.body.name) {
      return res.status(400).json({ error: "Nama harus diisi" });
    }

    if (!req.body.email) {
      return res.status(400).json({ error: "Email harus diisi" });
    }

    if (!req.body.role) {
      return res.status(400).json({ error: "Role harus diisi" });
    }

    const result = await createUser({
      ...req.body,
      nip: req.body.nip || null,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in user creation route:", error);

    // Handle Prisma error khusus
    if (error.code === "P2011") {
      return res.status(400).json({
        error: "Data tidak valid",
        details: "Kabupaten harus dipilih untuk Ketua Forum",
      });
    }

    res.status(error.status || 500).json({
      error: error.message || "Terjadi kesalahan saat membuat user",
      ...(error.details && { details: error.details }),
    });
  }
});

router.put("/users/list/:id", async (req, res) => {
  try {
    const updatedUser = await updateUser(req.params.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
      ...(error.details && { details: error.details }),
    });
  }
});

router.delete("/list/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await deleteUser(userId);
    res.json({ message: "User deleted successfully", deletedUser });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal menghapus user", details: error.message });
  }
});

// Gunakan middleware di endpoint yang memerlukan autentikasi
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const profile = await getUserProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// ==================== CHANGE PASSWORD ====================
router.post("/password", authMiddleware, async (req, res) => {
  const { current_password, new_password, new_password_confirmation } =
    req.body;
  const userId = req.user.id;

  try {
    // Validasi input lebih ketat
    if (!current_password || !new_password || !new_password_confirmation) {
      return res.status(400).json({
        success: false,
        error: "Semua field harus diisi",
        fields: {
          current_password: !current_password,
          new_password: !new_password,
          new_password_confirmation: !new_password_confirmation,
        },
      });
    }

    if (new_password !== new_password_confirmation) {
      return res.status(400).json({
        success: false,
        error: "Password baru dan konfirmasi password tidak sama",
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password baru minimal 8 karakter",
      });
    }

    const result = await changePassword(userId, current_password, new_password);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: error.code || "PASSWORD_CHANGE_FAILED",
    });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email dan password wajib diisi",
      });
    }

    const { token, user } = await loginUser(email, password);

    // Pastikan user selalu memiliki minimal field wajib
    const responseUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      kabupatenId: user.kabupatenId || null,
      kelompokId: user.kelompokId || null,
      kabupatenName: user.kabupatenName || null,
    };

    res.status(200).json({
      success: true,
      token,
      user: responseUser,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/upload-excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File Excel tidak ditemukan" });
    }

    // Parse Excel file
    const workbook = xlsx.read(req.file.buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    // Transform data to match our structure
    const usersData = jsonData.map((row) => ({
      nama: row["Nama"],
      email: row["Email"],
      role: row["Role"],
      nip: row["NIP"],
      kabupaten: row["Kabupaten"].toLowerCase(),
      kelurahan: row["Kelurahan"].toLowerCase(),
      kelompokDesa: row["Kelompok Desa"].toLowerCase(),
    }));

    // Process the data
    const result = await bulkCreateUsers(usersData);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error processing Excel upload:", error);
    res.status(error.status || 500).json({
      error: error.message || "Terjadi kesalahan saat memproses file Excel",
    });
  }
});

router.get("/auth/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getCurrentUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        kabupatenId: user.kabupatenId,
        kelompokId: user.kelompokId,
        kabupatenName: user.Kabupaten?.nama_kabupaten || null,
        kelompokName: user.Kelompok?.nama || null,
        nip: user.nip || null,
      },
    });
  } catch (error) {
    console.error("Error in /auth/me:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user data",
    });
  }
});

module.exports = router;
