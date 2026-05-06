import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, TextField, MenuItem,
  IconButton, Button, Autocomplete, InputAdornment, Box, Tooltip
} from "@mui/material";
import {
  Close, Hotel, Business, MeetingRoom, Bed,
  MonetizationOn, Description, AddPhotoAlternate, Layers, CheckCircle, Add, Remove, CloudUpload
} from "@mui/icons-material";
import { STATUS_CONFIG } from "../RoomStatus";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "~/shared/utils/formatters";
import axiosInstance from "~/shared/api/axiosInstance";
import { CircularProgress } from "@mui/material";

const BED_TYPES = [
  { value: "SINGLE", label: "Single Bed" },
  { value: "DOUBLE", label: "Double Bed" },
  { value: "TRIPLE", label: "Triple Bed" },
  { value: "KING", label: "King Size" },
  { value: "QUEEN", label: "Queen Size" },
];

const PRESET_PRICES = [
  { value: 500000, label: "500,000đ (Standard)" },
  { value: 1000000, label: "1,000,000đ (Deluxe)" },
  { value: 2500000, label: "2,500,000đ (VIP Suite)" },
  { value: 3500000, label: "3,500,000đ (Family)" },
  { value: 10000000, label: "10,000,000đ (Penthouse)" },
];

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const emptyForm = {
  roomNumber: "", hotelId: "", typeId: "", floor: "",
  bedType: "DOUBLE", pricePerNight: 1000000,
  status: "AVAILABLE", imageUrls: [""], description: "",
};

// Chiều cao thống nhất cho tất cả field đơn dòng
const FIELD_HEIGHT = 50;

const fieldSx = {
  width: "100%",
  "& .MuiFormLabel-root": {
    fontWeight: 600,
    // Label ở trạng thái bình thường (chưa focus/shrink) căn giữa theo chiều cao field
    top: "50%",
    transform: "translate(14px, -50%) scale(1)",
    "&.MuiInputLabel-shrink": {
      top: 0,
      transform: "translate(14px, -9px) scale(0.75)",
    },
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    bgcolor: "#f8faff",
    height: FIELD_HEIGHT,
    // Căn nội dung input vào giữa theo chiều cao
    alignItems: "center",
  },
  // Input text không bị clip
  "& .MuiInputBase-input": {
    padding: "0 14px",
    height: FIELD_HEIGHT,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
  },
  // Autocomplete input
  "& .MuiAutocomplete-input": {
    padding: "0 4px !important",
  },
};

// Style riêng cho multiline
const multilineSx = {
  width: "100%",
  "& .MuiFormLabel-root": { fontWeight: 600 },
  "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "#f8faff" },
};

// Row full width
const RowFull = ({ children }) => (
  <Box sx={{ display: "flex", width: "100%", mb: 2 }}>
    <Box sx={{ flex: 1 }}>{children}</Box>
  </Box>
);

// Row chia đôi
const RowHalf = ({ left, right }) => (
  <Box sx={{ display: "flex", width: "100%", gap: 2, mb: 2 }}>
    <Box sx={{ flex: 1, minWidth: 0 }}>{left}</Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>{right}</Box>
  </Box>
);

// Autocomplete với startAdornment icon
const AutoField = ({ icon, label, ...props }) => (
  <Autocomplete
    {...props}
    renderInput={(params) => (
      <TextField
        {...params}
        label={label}
        sx={fieldSx}
        InputProps={{
          ...params.InputProps,
          startAdornment: (
            <>
              <InputAdornment position="start" sx={{ ml: 0.5 }}>{icon}</InputAdornment>
              {params.InputProps.startAdornment}
            </>
          ),
        }}
      />
    )}
  />
);

const RoomForm = ({ open, onClose, onSubmit, editRoom, loading }) => {
  const { t } = useTranslation();
  const isEdit = !!editRoom;
  const [form, setForm] = useState(emptyForm);
  const [allHotels, setAllHotels] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/v1/hotels")
      .then(r => r.json())
      .then(data => setAllHotels(Array.isArray(data) ? data : []))
      .catch(() => setAllHotels([]));
  }, [open]);

  useEffect(() => {
    if (!selectedBranch) { setRoomTypes([]); setSelectedRoomType(null); return; }
    fetch(`/api/v1/room-types/hotel/${selectedBranch.hotelId}`)
      .then(r => r.json())
      .then(data => {
        const types = Array.isArray(data) ? data : [];
        setRoomTypes(types);
        if (isEdit && form.typeId) {
          const cur = types.find(t => t.typeId === form.typeId);
          if (cur) setSelectedRoomType(cur);
        }
      })
      .catch(() => setRoomTypes([]));
  }, [selectedBranch]);

  useEffect(() => {
    if (!open) return;
    if (isEdit && editRoom && allHotels.length > 0) {
      setForm({ ...editRoom, imageUrls: editRoom.imageUrls?.length > 0 ? editRoom.imageUrls : [""] });
      const hotel = allHotels.find(h => h.hotelId === editRoom.hotelId);
      if (hotel) { setSelectedBrand(hotel.hotelName); setSelectedBranch(hotel); }
    } else {
      setForm(emptyForm);
      setSelectedBrand(null); setSelectedBranch(null); setSelectedRoomType(null);
    }
  }, [open, editRoom, isEdit, allHotels]);

  const brands = [...new Set(allHotels.map(h => h.hotelName))].sort();
  const branches = allHotels.filter(h => h.hotelName === selectedBrand);

  const handleBrandChange = (_, v) => { setSelectedBrand(v); setSelectedBranch(null); setSelectedRoomType(null); setForm(p => ({ ...p, hotelId: "", typeId: "" })); };
  const handleBranchChange = (_, v) => { setSelectedBranch(v); setSelectedRoomType(null); setForm(p => ({ ...p, hotelId: v ? v.hotelId : "", typeId: "" })); };
  const handleTypeChange = (_, v) => {
    setSelectedRoomType(v);
    setForm(p => ({
      ...p, typeId: v ? v.typeId : "",
      pricePerNight: v?.typeName.includes("VIP") ? 2500000 : v?.typeName.includes("Deluxe") ? 1000000 : 500000,
    }));
  };

  const handleSubmit = () => {
    if (!form.hotelId || !form.roomNumber || !form.typeId) {
      alert(t("rooms.validation_required"));
      return;
    }
    onSubmit({
      ...form,
      imageUrls: form.imageUrls.filter(url => url && url.trim() !== ""),
      hotelId: Number(form.hotelId),
      typeId: Number(form.typeId),
      floor: form.floor ? Number(form.floor) : null,
      pricePerNight: Number(form.pricePerNight),
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Filter out existing empty string if any
    const currentUrls = form.imageUrls.filter(url => url !== "");
    setFormLoading(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await axiosInstance.post(`${BASE_URL}/files/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        currentUrls.push(res.data.url);
      }
      setForm(p => ({ ...p, imageUrls: currentUrls.length > 0 ? currentUrls : [""] }));
    } catch (err) {
      console.error("Upload failed:", err);
      alert(t("rooms.upload_error"));
    } finally {
      setFormLoading(false);
      e.target.value = null;
    }
  };

  const handleCloudifyUrl = async (index) => {
    const urlToCloudify = form.imageUrls[index];
    if (!urlToCloudify || !urlToCloudify.startsWith("http")) return;

    setFormLoading(true);
    try {
      const res = await axiosInstance.post(`${BASE_URL}/files/upload-url`, null, {
        params: { url: urlToCloudify }
      });
      const newUrls = [...form.imageUrls];
      newUrls[index] = res.data.url;
      setForm(p => ({ ...p, imageUrls: newUrls }));
    } catch (err) {
      console.error("Cloudify failed:", err);
      alert(t("rooms.upload_error"));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 5, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" } }}>

      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 2, pt: 3 }}>
        <Typography variant="h5" fontWeight={900} color="primary.main">
          {isEdit ? t("rooms.title_edit") : t("rooms.title_add")}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: "action.hover" }}><Close /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 1, pt: 3 }}>

        {/* Hàng 1: Khách sạn */}
        <Box sx={{ mt: 1 }}>
          <RowFull>
            <AutoField
              fullWidth
            icon={<Hotel color="primary" />}
            label={t("rooms.hotel_name")}
            options={brands}
            value={selectedBrand}
            onChange={handleBrandChange}
          />
        </RowFull>
        </Box>

        {/* Hàng 2: Chi nhánh */}
        <RowFull>
          <AutoField
            fullWidth
            icon={<Business color="primary" />}
            label={t("rooms.branch")}
            options={branches}
            getOptionLabel={(o) => `${o.address}, ${o.district}`}
            value={selectedBranch}
            onChange={handleBranchChange}
            disabled={!selectedBrand}
          />
        </RowFull>

        {/* Hàng 3: Tầng | Mã phòng */}
        <RowHalf
          left={
            <TextField fullWidth label={t("rooms.floor")} type="number" value={form.floor}
              onChange={(e) => setForm(p => ({ ...p, floor: e.target.value }))}
              sx={fieldSx}
              InputProps={{ startAdornment: <InputAdornment position="start"><Layers color="primary" /></InputAdornment> }}
            />
          }
          right={
            <TextField fullWidth label={t("rooms.room_number")} value={form.roomNumber}
              onChange={(e) => setForm(p => ({ ...p, roomNumber: e.target.value }))}
              sx={fieldSx}
              InputProps={{ startAdornment: <InputAdornment position="start"><CheckCircle color="primary" /></InputAdornment> }}
            />
          }
        />

        {/* Hàng 4: Loại phòng | Loại giường */}
        <RowHalf
          left={
            <AutoField
              fullWidth
              icon={<MeetingRoom color="primary" />}
              label={t("rooms.room_type")}
              options={roomTypes}
              getOptionLabel={(o) => o.typeName || ""}
              value={selectedRoomType}
              onChange={handleTypeChange}
              disabled={!selectedBranch}
            />
          }
          right={
            <AutoField
              fullWidth
              icon={<Bed color="primary" />}
              label={t("rooms.bed_type")}
              options={BED_TYPES}
              getOptionLabel={(o) => o.label}
              value={BED_TYPES.find(b => b.value === form.bedType) || null}
              onChange={(_, v) => setForm(p => ({ ...p, bedType: v ? v.value : "" }))}
            />
          }
        />

        {/* Hàng 5: Trạng thái | Giá / đêm */}
        <RowHalf
          left={
            <TextField select fullWidth label={t("common.status")} value={form.status}
              onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
              sx={fieldSx}>
              {Object.keys(STATUS_CONFIG).map(k => (
                <MenuItem key={k} value={k}>{t(STATUS_CONFIG[k].label)}</MenuItem>
              ))}
            </TextField>
          }
          right={
            <AutoField
              fullWidth
              freeSolo
              icon={<MonetizationOn color="primary" />}
              label={t("rooms.price_per_night")}
              options={PRESET_PRICES.map(p => String(p.value))}
              value={String(form.pricePerNight)}
              onInputChange={(_, v) => setForm(p => ({ ...p, pricePerNight: v }))}
            />
          }
        />

        {/* Hàng 6: Hình ảnh (Upload & URLs) */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, ml: 1 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              {t("rooms.image_url")}s
            </Typography>
            <Button
              variant="contained"
              component="label"
              size="small"
              disabled={formLoading}
              startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : <AddPhotoAlternate />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              {formLoading ? t("rooms.uploading") : t("rooms.upload")}
              <input type="file" hidden multiple accept="image/*" onChange={handleFileUpload} />
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {form.imageUrls.filter(url => url).map((url, index) => (
              <Box key={index} sx={{ position: 'relative', width: 80, height: 80 }}>
                <Box
                  component="img"
                  src={url}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2, border: '1px solid #eee' }}
                />
                <IconButton
                  size="small"
                  onClick={() => {
                    const newUrls = form.imageUrls.filter((_, i) => i !== index);
                    setForm(p => ({ ...p, imageUrls: newUrls.length > 0 ? newUrls : [""] }));
                  }}
                  sx={{
                    position: 'absolute', top: -5, right: -5,
                    bgcolor: 'error.main', color: 'white',
                    '&:hover': { bgcolor: 'error.dark' },
                    width: 20, height: 20
                  }}
                >
                  <Close sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}
          </Box>

          {/* Fallback text input for manual URLs if needed */}
          {form.imageUrls.map((url, index) => (
            <RowFull key={index}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField fullWidth placeholder="https://..." value={url}
                  onChange={(e) => {
                    const newUrls = [...form.imageUrls];
                    newUrls[index] = e.target.value;
                    setForm(p => ({ ...p, imageUrls: newUrls }));
                  }}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><AddPhotoAlternate color="primary" /></InputAdornment>,
                    endAdornment: (
                      url && url.startsWith("http") && !url.includes("cloudinary.com") && (
                        <InputAdornment position="end">
                          <Tooltip title={t("rooms.save_to_cloud")}>
                            <IconButton
                              size="small"
                              color="primary"
                              disabled={formLoading}
                              onClick={() => handleCloudifyUrl(index)}
                              sx={{ bgcolor: 'primary.50' }}
                            >
                              {formLoading ? <CircularProgress size={16} /> : <CloudUpload fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      )
                    )
                  }}
                />
                <IconButton onClick={() => {
                  if (form.imageUrls.length > 1) {
                    setForm(p => ({ ...p, imageUrls: p.imageUrls.filter((_, i) => i !== index) }));
                  } else {
                    setForm(p => ({ ...p, imageUrls: [""] }));
                  }
                }} color="error">
                  <Remove />
                </IconButton>
                {index === form.imageUrls.length - 1 && (
                  <IconButton onClick={() => setForm(p => ({ ...p, imageUrls: [...p.imageUrls, ""] }))} color="primary">
                    <Add />
                  </IconButton>
                )}
              </Box>
            </RowFull>
          ))}
        </Box>

        {/* Hàng 7: Mô tả */}
        <Box sx={{ width: "100%", mb: 1 }}>
          <TextField fullWidth label={t("rooms.description")} multiline rows={2}
            value={form.description}
            onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
            sx={multilineSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                  <Description color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 2 }}>
        <Button onClick={onClose} variant="outlined" fullWidth
          sx={{ borderRadius: 4, py: 1.5, fontWeight: 800, border: "2px solid", "&:hover": { border: "2px solid" } }}>
          {t("common.cancel").toUpperCase()}
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="secondary" fullWidth disabled={loading}
          sx={{ borderRadius: 4, py: 1.5, fontWeight: 800, boxShadow: "0 8px 25px rgba(216,27,96,0.3)" }}>
          {isEdit ? t("common.edit").toUpperCase() : t("common.create").toUpperCase()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomForm;