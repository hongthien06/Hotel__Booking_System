import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, TextField, MenuItem,
  IconButton, Button, Autocomplete, InputAdornment, Box
} from "@mui/material";
import {
  Close, Hotel, Business, MeetingRoom, Bed,
  MonetizationOn, Description, AddPhotoAlternate, Layers, CheckCircle
} from "@mui/icons-material";
import { STATUS_CONFIG } from "../RoomStatus";

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

const emptyForm = {
  roomNumber: "", hotelId: "", typeId: "", floor: "",
  bedType: "DOUBLE", pricePerNight: 1000000,
  status: "AVAILABLE", imageUrl: "", description: "",
};

// Chiều cao thống nhất cho tất cả field đơn dòng
const FIELD_HEIGHT = 56;

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
  const isEdit = !!editRoom;
  const [form, setForm] = useState(emptyForm);
  const [allHotels, setAllHotels] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState(null);

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
      setForm({ ...editRoom });
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
      alert("Vui lòng điền đầy đủ: Khách sạn, Chi nhánh và Loại phòng!");
      return;
    }
    onSubmit({
      ...form,
      hotelId: Number(form.hotelId),
      typeId: Number(form.typeId),
      floor: form.floor ? Number(form.floor) : null,
      pricePerNight: Number(form.pricePerNight),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md"
      PaperProps={{ sx: { borderRadius: 5, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" } }}>

      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Typography variant="h5" fontWeight={900} color="primary.main">
          {isEdit ? "Cập nhật phòng" : "Thêm phòng mới"}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: "action.hover" }}><Close /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 1, pt: 2 }}>

        {/* Hàng 1: Khách sạn */}
        <RowFull>
          <AutoField
            fullWidth
            icon={<Hotel color="primary" />}
            label="Tên Khách sạn"
            options={brands}
            value={selectedBrand}
            onChange={handleBrandChange}
          />
        </RowFull>

        {/* Hàng 2: Chi nhánh */}
        <RowFull>
          <AutoField
            fullWidth
            icon={<Business color="primary" />}
            label="Chi nhánh"
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
            <TextField fullWidth label="Tầng" type="number" value={form.floor}
              onChange={(e) => setForm(p => ({ ...p, floor: e.target.value }))}
              sx={fieldSx}
              InputProps={{ startAdornment: <InputAdornment position="start"><Layers color="primary" /></InputAdornment> }}
            />
          }
          right={
            <TextField fullWidth label="Mã phòng (Số)" value={form.roomNumber}
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
              label="Loại phòng"
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
              label="Loại giường"
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
            <TextField select fullWidth label="Trạng thái" value={form.status}
              onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
              sx={fieldSx}>
              {Object.keys(STATUS_CONFIG).map(k => (
                <MenuItem key={k} value={k}>{STATUS_CONFIG[k].label}</MenuItem>
              ))}
            </TextField>
          }
          right={
            <AutoField
              fullWidth
              freeSolo
              icon={<MonetizationOn color="primary" />}
              label="Giá / đêm (VNĐ)"
              options={PRESET_PRICES.map(p => String(p.value))}
              value={String(form.pricePerNight)}
              onInputChange={(_, v) => setForm(p => ({ ...p, pricePerNight: v }))}
            />
          }
        />

        {/* Hàng 6: URL hình ảnh */}
        <RowFull>
          <TextField fullWidth label="URL hình ảnh" value={form.imageUrl}
            onChange={(e) => setForm(p => ({ ...p, imageUrl: e.target.value }))}
            sx={fieldSx}
            InputProps={{ startAdornment: <InputAdornment position="start"><AddPhotoAlternate color="primary" /></InputAdornment> }}
          />
        </RowFull>

        {/* Hàng 7: Mô tả */}
        <Box sx={{ width: "100%", mb: 1 }}>
          <TextField fullWidth label="Mô tả chi tiết" multiline rows={2}
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
          HỦY
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="secondary" fullWidth disabled={loading}
          sx={{ borderRadius: 4, py: 1.5, fontWeight: 800, boxShadow: "0 8px 25px rgba(216,27,96,0.3)" }}>
          {isEdit ? "CẬP NHẬT" : "TẠO PHÒNG"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomForm;