const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendWelcomeEmail } = require("./emailService");

// Helper functions
const validateUserInput = (userData) => {
  if (!userData.name || !userData.email || !userData.role) {
    throw { status: 400, message: "Nama, email, dan role wajib diisi" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    throw { status: 400, message: "Format email tidak valid" };
  }

  const validRoles = ["Admin", "Pegawai", "Pengurus", "Pendamping"];
  if (!validRoles.includes(userData.role)) {
    throw { status: 400, message: "Role tidak valid" };
  }
};

const generateRandomPassword = () => Math.random().toString(36).slice(-8) + "A1!";

const createUser = async (userData) => {
  try {
    validateUserInput(userData);
    
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email.toLowerCase().trim() }
    });
    if (existingUser) throw { status: 409, message: "Email sudah terdaftar" };

    const generatedPassword = userData.password || generateRandomPassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 8);

    const userCreateData = {
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      role: userData.role,
      password: hashedPassword,
      nip: userData.nip,
      sendEmail: Boolean(userData.sendEmail),
      kelompokId: userData.kelompokId || null,
      ...(userData.role === "Pendamping" && userData.kabupatenId && {
        kabupatenId: parseInt(userData.kabupatenId)
      })
    };

    const newUser = await prisma.user.create({
      data: userCreateData,
      select: {
        id: true, name: true, email: true, role: true, 
        nip: true, kabupatenId: true, kelompokId: true, createdAt: true
      }
    });

    if (userData.sendEmail) {
      try {
        await sendWelcomeEmail(newUser.email, newUser.name, generatedPassword);
      } catch (emailError) {
        console.error("Gagal mengirim email:", emailError);
      }
    }

    return {
      success: true,
      message: userData.sendEmail 
        ? "User berhasil dibuat dan email notifikasi terkirim" 
        : "User berhasil dibuat",
      data: newUser,
      ...(!userData.password && { generatedPassword })
    };
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      include: {
        Kabupaten: { select: { nama_kabupaten: true } },
        Kelompok: { select: { nama: true } }
      }
    });
    
    return users.map(user => ({
      ...user,
      nama_kabupaten: user.Kabupaten?.nama_kabupaten || null,
      nama_kelompok: user.Kelompok?.nama || null
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const updateUser = async (userId, updateData) => {
  try {
    // Validasi field wajib
    if (!updateData.name || !updateData.email || !updateData.role) {
      throw { status: 400, message: "Nama, email, dan role wajib diisi" };
    }

    // Cek apakah NIP sudah digunakan oleh user lain
    if (updateData.nip) {
      const existingUser = await prisma.user.findFirst({
        where: {
          nip: String(updateData.nip),
          NOT: {
            id: Number(userId) // Kecuali user yang sedang diupdate
          }
        }
      });

      if (existingUser) {
        throw { 
          status: 400, 
          message: "NIP sudah digunakan oleh user lain" 
        };
      }
    }

    // Proses update
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        name: updateData.name,
        email: updateData.email,
        role: updateData.role,
        nip: updateData.nip ? String(updateData.nip) : null, // Set null jika nip kosong
        kabupatenId: updateData.role === "Pendamping" 
          ? parseInt(updateData.kabupatenId) 
          : null
      },
      select: {
        id: true, name: true, email: true, 
        role: true, nip: true, kabupatenId: true
      }
    });

    return updatedUser;
  } catch (error) {
    console.error("Error in updateUser:", error);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    return await prisma.user.delete({
      where: { id: parseInt(userId) }
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

const bulkCreateUsers = async (usersData) => {
  try {
    if (!Array.isArray(usersData)) {
      throw { status: 400, message: "Data harus berupa array" };
    }

    const results = [];
    const errors = [];

    for (const [index, userData] of usersData.entries()) {
      try {
        // Cek email duplikat
        const existingEmail = await prisma.user.findUnique({
          where: { email: userData.email.toLowerCase().trim() },
        });
        if (existingEmail) {
          throw {
            message: "Email sudah terdaftar",
            details: `Baris ${index + 1}: Email '${
              userData.email
            }' sudah terdaftar`,
          };
        }

        // Cek NIP duplikat jika NIP ada
        if (userData.nip) {
          const existingNip = await prisma.user.findFirst({
            where: { nip: String(userData.nip).trim() },
          });
          if (existingNip) {
            throw {
              message: "NIP sudah terdaftar",
              details: `Baris ${index + 1}: NIP '${
                userData.nip
              }' sudah terdaftar`,
            };
          }
        }

        // Validasi data minimal
        if (!userData.nama || !userData.email || !userData.role) {
          throw {
            message: "Nama, email, dan role wajib diisi",
            details: `Baris ${index + 1}: Kolom nama, email, atau role kosong`,
          };
        }

        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
          throw {
            message: "Format email tidak valid",
            details: `Baris ${index + 1}: Format email '${
              userData.email
            }' tidak valid`,
          };
        }

        // Cek email duplikat
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email.toLowerCase().trim() },
        });
        if (existingUser) {
          throw {
            message: "Email sudah terdaftar",
            details: `Baris ${index + 1}: Email '${
              userData.email
            }' sudah terdaftar`,
          };
        }

        // Validasi role
        const validRoles = ["Admin", "Pegawai", "Pengurus", "Pendamping"];
        if (!validRoles.includes(userData.role)) {
          throw {
            message: "Role tidak valid",
            details: `Baris ${index + 1}: Role '${userData.role}' tidak valid`,
          };
        }

        const [allKabupaten, allKelompok] = await Promise.all([
          prisma.kabupaten.findMany(),
          prisma.kelompokDesa.findMany(),
        ]);

        // VALIDASI KABUPATEN
        let kabupatenId = null;
        if (userData.kabupaten) {
          const cleanKabupatenName = userData.kabupaten
            .replace(/^(kab\.|kabupaten|kota)\s*/i, "")
            .trim()
            .toLowerCase();

          const matchedKabupaten = allKabupaten.find((k) =>
            k.nama_kabupaten.toLowerCase().includes(cleanKabupatenName)
          );

          if (!matchedKabupaten) {
            const availableKabupaten = allKabupaten
              .map((k) => k.nama_kabupaten)
              .join(", ");
            throw {
              message: "Kabupaten tidak valid",
              details: `Baris ${index + 1}: Kabupaten/Kota '${
                userData.kabupaten
              }' tidak ditemukan. Kabupaten yang tersedia: ${availableKabupaten}`,
            };
          }
          kabupatenId = matchedKabupaten.id;
        }

        // VALIDASI KELOMPOK
        let kelompokId = null;
        if (userData.kelompokDesa) {
          const cleanKelompokName = userData.kelompokDesa
            .replace(/^kelompok\s*/i, "")
            .trim()
            .toLowerCase();

          const cleanKelurahan = userData.kelurahan
            ? userData.kelurahan.trim().toLowerCase()
            : null;

          const filteredKelompok = allKelompok.filter((k) => {
            const namaKelompok = k.nama?.toLowerCase() || "";
            const namaKelurahan = k.kelurahan?.toLowerCase() || "";
            const isMatchKabupaten = kabupatenId
              ? k.kabupatenId === kabupatenId
              : true;
            const isMatchKelurahan = cleanKelurahan
              ? namaKelurahan === cleanKelurahan
              : true;
            const isMatchNama = cleanKelompokName
              ? namaKelompok === cleanKelompokName
              : false;

            return isMatchKabupaten && isMatchKelurahan && isMatchNama;
          });

          const matchedKelompok = filteredKelompok[0]; // Ambil yang pertama cocok

          if (!matchedKelompok) {
            let errorMessage = `Baris ${index + 1}: Kelompok '${
              userData.kelompokDesa
            }' tidak ditemukan`;

            if (kabupatenId) {
              errorMessage += ` di kabupaten/kota tersebut`;
            }

            if (userData.kelurahan) {
              errorMessage += ` dan kelurahan '${userData.kelurahan}'`;
            }

            const availableKelompok = filteredKelompok
              .map((k) => `${k.nama} (${k.kelurahan})`)
              .join(", ");

            errorMessage += `. Kelompok yang tersedia: ${
              availableKelompok || "Tidak ada"
            }`;

            throw {
              message: "Kelompok tidak valid",
              details: errorMessage,
            };
          }

          kelompokId = matchedKelompok.id;
        }

        // Format NIP
        let nipValue = null;
        if (userData.nip) {
          nipValue = String(userData.nip).replace(/\D/g, "") || null;
        }

        const password = Math.random().toString(36).slice(-8) + "A1!";
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
          data: {
            name: userData.nama,
            email: userData.email,
            role: userData.role,
            nip: nipValue,
            kabupatenId,
            kelompokId,
            password: hashedPassword,
            sendEmail: true,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            nip: true,
            kabupatenId: true,
            createdAt: true,
          },
        });

        // Kirim email
        try {
          await sendWelcomeEmail(newUser.email, newUser.name, password);
        } catch (emailError) {
          console.error("Gagal mengirim email:", emailError);
        }

        results.push({
          row: index + 1,
          status: "success",
          data: newUser,
        });
      } catch (error) {
        errors.push({
          row: index + 1,
          status: "error",
          message: error.message || "Gagal membuat user",
          details: error.details || error.message,
        });
      }
    }

    return {
      success: true,
      total: usersData.length,
      successCount: results.length,
      errorCount: errors.length,
      results,
      errors,
    };
  } catch (error) {
    console.error("Error in bulkCreateUsers:", error);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    console.log("User ID:", userId); // Debugging

    if (!userId) {
      throw new Error("User ID is missing");
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

module.exports = { 
  createUser, 
  getAllUsers, 
  updateUser, 
  deleteUser,
  bulkCreateUsers,
  getUserById 
};