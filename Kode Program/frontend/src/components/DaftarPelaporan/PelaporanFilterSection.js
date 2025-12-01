import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilter,
  faCalendarAlt,
  faAngleUp, 
  faAngleDown,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import useMediaQuery from "../useMediaQuery";
import { id } from 'date-fns/locale';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Divider,
  Chip
} from '@mui/material';

const PelaporanFilterSection = ({
  toggleFilter,
  filters,
  setFilters,
  kabupatenList,
  kecamatanList,
  kelompokDesaList,
  userRole
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  useEffect(() => {
    if (filters.kabupaten.length === 0) {
      setFilters(prev => ({ ...prev, kecamatan: [] }));
    }
  }, [filters.kabupaten, setFilters]);

  console.log("Kelompok:", kelompokDesaList);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
        bgcolor: 'background.paper',
        boxShadow: 3,
        height: isMobile ? '100%' : 'auto',
        position: isMobile ? 'relative' : 'static',
        zIndex: isMobile ? 10 : 'auto'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FontAwesomeIcon icon={faFilter} style={{ color: '#6366f1' }} />
          <Typography variant="h6" fontWeight="600">
            Filter Pelaporan
          </Typography>
        </Box>
        <Button
          onClick={toggleFilter}
          size="small"
          sx={{ minWidth: 0, p: 1 }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Filter Sections */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Jenis Pelaporan */}
        <Box>
          <Button
            fullWidth
            onClick={() => toggleDropdown('jenis')}
            sx={{ 
              justifyContent: 'space-between',
              textTransform: 'none',
              color: 'text.primary'
            }}
          >
            <Typography fontWeight="500">Jenis Pelaporan</Typography>
            <FontAwesomeIcon
              icon={activeDropdown === 'jenis' ? faAngleUp : faAngleDown}
            />
          </Button>
          
          {activeDropdown === 'jenis' && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 0,
              pl: 1,
              mt: 1
            }}>
              {["Kelompok Desa", "Produk", "Anggota", "Kas", "Laporan", "Kegiatan"].map((jenis) => (
                <FormControlLabel
                  key={jenis}
                  control={
                    <Checkbox
                      size="small"
                      checked={filters.jenis.includes(jenis)}
                      onChange={(e) => {
                        const value = e.target.value;
                        const isChecked = e.target.checked;
                        setFilters((prev) => ({
                          ...prev,
                          jenis: isChecked
                            ? [...prev.jenis, value]
                            : prev.jenis.filter((item) => item !== value),
                        }));
                      }}
                      value={jenis}
                    />
                  }
                  label={<Typography variant="body2">{jenis}</Typography>}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Kabupaten */}
        {(userRole === "Pegawai" || userRole === "Admin") && (
          <Box>
            <Button
              fullWidth
              onClick={() => toggleDropdown('kabupaten')}
              sx={{ 
                justifyContent: 'space-between',
                textTransform: 'none',
                color: 'text.primary'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography fontWeight="500">Kabupaten</Typography>
                {filters.kabupaten.length > 0 && (
                  <Chip 
                    label={filters.kabupaten.length} 
                    size="small" 
                    color="primary"
                  />
                )}
              </Box>
              <FontAwesomeIcon
                icon={activeDropdown === 'kabupaten' ? faAngleUp : faAngleDown}
              />
            </Button>
            
            {activeDropdown === 'kabupaten' && (
              <Box sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>                
                {kabupatenList.map(kabupaten => (
                  <FormControlLabel
  key={kabupaten}
  control={
    <Checkbox
      size="small"
      checked={filters.kabupaten.includes(kabupaten)}
      onChange={() => {
        setFilters(prev => {
          const isChecked = prev.kabupaten.includes(kabupaten);
          const newKabupaten = isChecked
            ? prev.kabupaten.filter(k => k !== kabupaten)
            : [...prev.kabupaten, kabupaten];
          
          return {
            ...prev,
            kabupaten: newKabupaten,
            kecamatan: [] 
          };
        });
      }}
    />
  }
  label={<Typography variant="body2">{kabupaten}</Typography>}
  sx={{ 
    ml: 0.5,
    display: 'flex', 
    alignItems: 'center' 
  }}
/>
                ))}
              </Box>
            )}
          </Box>
        )}

       {/* Kecamatan */}
<Box>
  <Button
    fullWidth
    onClick={() => toggleDropdown('kecamatan')}
    sx={{ 
      justifyContent: 'space-between',
      textTransform: 'none',
      color: 'text.primary'
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography fontWeight="500">Kecamatan</Typography>
      {filters.kecamatan.length > 0 && (
        <Chip 
          label={filters.kecamatan.length} 
          size="small" 
          color="primary"
        />
      )}
    </Box>
    <FontAwesomeIcon
      icon={activeDropdown === 'kecamatan' ? faAngleUp : faAngleDown}
    />
  </Button>
  
  {activeDropdown === 'kecamatan' && (
    <Box sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
      
      {kecamatanList
        .filter(kecamatan => 
          filters.kabupaten.length === 0 || 
          kecamatan.kabupaten === filters.kabupaten[0]
        )
        .map((kecamatan) => (
          <FormControlLabel
            key={kecamatan.nama}
            control={
              <Checkbox
                size="small"
                checked={filters.kecamatan.includes(kecamatan.nama)}
                onChange={(e) => {
                  const value = e.target.value;
                  const isChecked = e.target.checked;
                  setFilters((prev) => ({
                    ...prev,
                    kecamatan: isChecked
                      ? [...prev.kecamatan, value]
                      : prev.kecamatan.filter((item) => item !== value),
                  }));
                }}
                value={kecamatan.nama}
              />
            }
            label={<Typography variant="body2">{kecamatan.nama}</Typography>}
            sx={{ 
    ml: 0.5,
    display: 'flex', 
    alignItems: 'center'
  }}
          />
        ))}
    </Box>
  )}
</Box>

{/* Kelompok Desa */}
      <Box>
        <Button
          fullWidth
          onClick={() => toggleDropdown('kelompokDesa')}
          sx={{ 
            justifyContent: 'space-between',
            textTransform: 'none',
            color: 'text.primary'
          }}
          disabled={filters.kecamatan.length === 0} // Disable jika tidak ada kecamatan yang dipilih
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography fontWeight="500">Kelompok Desa</Typography>
            {filters.kelompokDesa.length > 0 && (
              <Chip 
                label={filters.kelompokDesa.length} 
                size="small" 
                color="primary"
              />
            )}
          </Box>
          <FontAwesomeIcon
            icon={activeDropdown === 'kelompokDesa' ? faAngleUp : faAngleDown}
          />
        </Button>
        
        {activeDropdown === 'kelompokDesa' && (
          <Box sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
            
{kelompokDesaList
  .filter(kelompok => 
    filters.kecamatan.length === 0 || 
    kelompok.kecamatan === filters.kecamatan[0]
  )
  .map((kelompok) => (
    <FormControlLabel
      key={kelompok.id}
      control={
        <Checkbox
          size="small"
          checked={filters.kelompokDesa.some(k => k.id === kelompok.id)}
          onChange={(e) => {
            const isChecked = e.target.checked;
            setFilters(prev => ({
              ...prev,
              kelompokDesa: isChecked
                ? [...prev.kelompokDesa, { id: kelompok.id, nama: kelompok.nama }] // Simpan objek lengkap
                : prev.kelompokDesa.filter(k => k.id !== kelompok.id)
            }));
          }}
        />
      }
      label={<Typography variant="body2">{kelompok.nama}</Typography>}
    />
  ))}
          </Box>
        )}
      </Box>

        {/* Tanggal Pelaporan */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#6366f1' }} />
            <Typography fontWeight="500">Tanggal Pelaporan</Typography>
          </Box>
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DatePicker
                label="Dari"
                value={filters.startDate}
                onChange={(newValue) => {
                  setFilters(prev => ({
                    ...prev,
                    startDate: newValue
                  }));
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    size="small"
                    fullWidth
                  />
                )}
              />
              
              <DatePicker
                label="Sampai"
                value={filters.endDate}
                onChange={(newValue) => {
                  setFilters(prev => ({
                    ...prev,
                    endDate: newValue
                  }));
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    size="small"
                    fullWidth
                  />
                )}
              />
            </Box>
          </LocalizationProvider>
        </Box>
      </Box>
    </Box>
  );
};

export default PelaporanFilterSection;