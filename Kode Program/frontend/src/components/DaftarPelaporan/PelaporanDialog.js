import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Typography,
  Box,
  Divider
} from "@mui/material";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const PelaporanDialog = ({
  openDialog,
  handleCloseDialog,
  selectedItem,
  getJenisPelaporan,
  renderDetailContent,
  handleNavigateToDetail
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

  return (
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 32,
              height: 32,
              fontSize: "0.9rem",
            }}
          >
            {selectedItem && getIconByType(getJenisPelaporan(selectedItem))}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              {selectedItem?.deskripsi}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.8rem" }}
            >
              {selectedItem &&
                format(
                  new Date(selectedItem.tgl_lapor),
                  "dd MMMM yyyy HH:mm",
                  { locale: id }
                )}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 1 }}>
        {selectedItem && renderDetailContent(selectedItem)}
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1 }}>
        <Button onClick={handleCloseDialog} sx={{ textTransform: "none" }}>
          Tutup
        </Button>
        <Button
          variant="contained"
          onClick={() => handleNavigateToDetail(selectedItem)}
          sx={{ textTransform: "none" }}
        >
          Lihat Detail Lengkap
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PelaporanDialog;