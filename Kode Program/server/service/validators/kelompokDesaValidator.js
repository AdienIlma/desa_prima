import Joi from 'joi';

export const validateKelompokDesaInput = (data) => {
  const schema = Joi.object({
    nama_kelompok: Joi.string().required().messages({
      'string.empty': 'Nama kelompok tidak boleh kosong',
      'any.required': 'Nama kelompok harus diisi'
    }),
    kabupaten_id: Joi.number().integer().required().messages({
      'number.base': 'ID Kabupaten harus berupa angka',
      'any.required': 'Kabupaten harus dipilih'
    }),
    nama_kabupaten: Joi.string().required(),
    kecamatan: Joi.string().required(),
    kelurahan: Joi.string().required(),
    tanggal_pembentukan: Joi.date().iso().required(),
    jumlah_hibah: Joi.number().min(0),
    saldo_dana: Joi.number().min(0),
    anggota_awal: Joi.number().integer().min(0),
    anggota_sekarang: Joi.number().integer().min(0),
    status: Joi.string().valid('Pending', 'Disetujui', 'Ditolak'),
    catatan: Joi.string().allow(null, ''),
    latitude: Joi.number().allow(null),
    longitude: Joi.number().allow(null),
    kategori: Joi.string().valid('Tumbuh', 'Berkembang', 'Maju')
  });

  return schema.validate(data, { abortEarly: false });
};