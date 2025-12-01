import React from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
  Select,
  MenuItem,
  Divider,
  Chip
} from "@mui/material";
import { Audio } from "react-loader-spinner";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const PelaporanContent = ({
  loading,
  error,
  pelaporan,
  filteredPelaporan,
  page,
  rowsPerPage,
  handleItemClick,
  getJenisPelaporan,
  renderShortContent,
  getCreatorName,
  renderPageNumbers,
  handleChangeRowsPerPage
}) => {
  const getIconByType = (type) => {
    switch (type) {
      case "Produk": return "🛒";
      case "Anggota": return "👤";
      case "kas": return "💰";
      case "Laporan": return "📝";
      case "Kegiatan": return "🖼️";
      default: return "📋";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Audio type="Bars" color="#542d48" height={80} width={80} />
      </div>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  if (filteredPelaporan.length === 0 && !loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          backgroundColor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
          mt: 3,
        }}
      >
        <Typography variant="h15" color="text.secondary">
          {pelaporan.length === 0
            ? "Belum ada data pelaporan"
            : "Tidak ada pelaporan yang sesuai dengan filter"}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gridAutoRows: "1fr",
          gap: 2,
          mt: 2,
          width: "100%",
          "& > *": {
            minHeight: 0,
            minWidth: 0,
          },
        }}
      >
        {filteredPelaporan
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item) => (
                      <Card
                        key={item.id}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                          borderRadius: 2,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          transition: "transform 0.3s, box-shadow 0.3s",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            cursor: "pointer",
                          },
                        }}
                        onClick={() => handleItemClick(item)}
                      >
                        <CardHeader
                          avatar={
                            <Avatar
                              sx={{
                                bgcolor: "primary.main",
                                width: 36,
                                height: 36,
                                fontSize: "0.9rem",
                              }}
                            >
                              {getIconByType(getJenisPelaporan(item))}
                            </Avatar>
                          }
                          title={
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: "bold",
                                fontSize: "0.95rem",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item.deskripsi}
                            </Typography>
                          }
                          subheader={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.75rem" }}
                            >
                              {format(
                                new Date(item.tgl_lapor),
                                "dd MMMM yyyy HH:mm",
                                { locale: id }
                              )}
                            </Typography>
                          }
                          sx={{
                            pb: 0.5,
                            px: 1,
                            pt: 1,
                            "& .MuiCardHeader-content": {
                              overflow: "hidden",
                            },
                          }}
                        />
                        <CardContent sx={{ px: 2, py: 0.5, flexGrow: 1 }}>
                          {renderShortContent(item)}
                        </CardContent>
                        <Box
                          sx={{
                            px: 2,
                            py: 1,
                            textAlign: "right",
                            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            Dibuat oleh: {getCreatorName(item)}
                          </Typography>
                        </Box>
                      </Card>
                    ))}
      </Box>
      
      <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    mt: 3,
                    p: 2,
                    backgroundColor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 1,
                    gap: 2, 
                  }}
                >
                  {/* Keterangan jumlah data */}
                  <Typography variant="body2" color="text.secondary">
                    Menampilkan {page * rowsPerPage + 1} -{" "}
                    {Math.min(
                      (page + 1) * rowsPerPage,
                      filteredPelaporan.length
                    )}{" "}
                    dari {filteredPelaporan.length} data
                  </Typography>

                  {/* Kontrol Pagination + Rows Per Page */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" },
                      gap: { xs: 1.5, sm: 2 },
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    {/* Dropdown Jumlah Baris */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2">Tampilkan:</Typography>
                      <Select
                        value={rowsPerPage}
                        onChange={handleChangeRowsPerPage}
                        size="small"
                        sx={{
                          minWidth: 70,
                          "& .MuiSelect-select": {
                            py: 1,
                          },
                        }}
                      >
                        {[6, 9, 15, 20].map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>

                    {/* Tombol Pagination */}
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap", // jika tombolnya banyak
                        gap: 1,
                      }}
                    >
                      {renderPageNumbers()}
                    </Box>
                  </Box>
                </Box>
    </>
  );
};

export default PelaporanContent;