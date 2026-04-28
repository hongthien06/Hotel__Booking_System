import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  IconButton,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import RoomStatus, { STATUS_CONFIG } from "../RoomStatus";

const ROOM_TYPES = ["Standard", "Deluxe", "VIP Suite", "Family", "Penthouse"];
const BED_TYPES = [
  { value: "SINGLE", label: "Single" },
  { value: "DOUBLE", label: "Double" },
  { value: "TRIPLE", label: "Triple" },
  { value: "KING", label: "King" },
  { value: "QUEEN", label: "Queen" },
];

// Provinces được load từ API

const emptyForm = {
  roomNumber: "",
  roomType: "Standard",
  floor: "",
  bedType: "DOUBLE",
  pricePerNight: "",
  provinceCode: "",
  province: "",
  district: "",
  address: "",
  status: "AVAILABLE",
  thumbnailUrl: "",
  description: "",
};

const RoomForm = ({ open, onClose, onSubmit, editRoom, loading }) => {
  const isEdit = !!editRoom;
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingProv, setLoadingProv] = useState(false);
  const [loadingDist, setLoadingDist] = useState(false);

  // Load danh sách tỉnh khi mount
  useEffect(() => {
    setLoadingProv(true);
    fetch("https://provinces.open-api.vn/api/p/")
      .then((r) => r.json())
      .then((data) => setProvinces(data || []))
      .catch(() => setProvinces([]))
      .finally(() => setLoadingProv(false));
  }, []);

  // Load quận/huyện khi đổi tỉnh
  useEffect(() => {
    if (!form.provinceCode) {
      setDistricts([]);
      return;
    }
    setLoadingDist(true);
    fetch(`https://provinces.open-api.vn/api/p/${form.provinceCode}?depth=2`)
      .then((r) => r.json())
      .then((data) => setDistricts(data?.districts || []))
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDist(false));
  }, [form.provinceCode]);

  useEffect(() => {
    if (!open) return;
    if (isEdit && editRoom) {
      setForm({
        roomNumber: editRoom.roomNumber || "",
        roomType: editRoom.roomType || editRoom.type || "Standard",
        floor: editRoom.floor || "",
        bedType: editRoom.bedType || "DOUBLE",
        pricePerNight: editRoom.pricePerNight || "",
        provinceCode: editRoom.provinceCode || "",
        province: editRoom.province || "",
        district: editRoom.district || "",
        address: editRoom.address || "",
        status: editRoom.status || "AVAILABLE",
        thumbnailUrl: editRoom.thumbnailUrl || "",
        description: editRoom.description || "",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, editRoom]);

  const validate = () => {
    const e = {};
    if (!form.roomNumber.trim()) e.roomNumber = "Không được để trống";
    if (!form.pricePerNight || Number(form.pricePerNight) <= 0)
      e.pricePerNight = "Phải lớn hơn 0";
    if (!form.province) e.province = "Vui lòng chọn tỉnh/TP";
    if (!form.district) e.district = "Vui lòng chọn quận/huyện";
    return e;
  };

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    const prov = provinces.find((p) => p.code === code);
    setForm((prev) => ({
      ...prev,
      provinceCode: code,
      province: prov?.name || "",
      district: "",
    }));
    setErrors((prev) => ({
      ...prev,
      province: undefined,
      district: undefined,
    }));
  };

  const handleDistrictChange = (e) => {
    const dist = districts.find((d) => d.code === e.target.value);
    setForm((prev) => ({ ...prev, district: dist?.name || "" }));
    setErrors((prev) => ({ ...prev, district: undefined }));
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSubmit({
      ...form,
      floor: Number(form.floor) || null,
      pricePerNight: Number(form.pricePerNight),
    });
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "action.inputBg" },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          px: 3.5,
          py: 2.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={900}>
            {isEdit
              ? `Chỉnh sửa phòng #${editRoom?.roomNumber}`
              : "Thêm phòng mới"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isEdit
              ? "Cập nhật thông tin phòng"
              : "Điền đầy đủ thông tin để tạo phòng"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3.5, py: 3 }}>
        <Grid container spacing={2.5}>
          {/* Hàng 1: Số phòng + Loại phòng */}
          <Grid item xs={6}>
            <TextField
              label="Số phòng *"
              fullWidth
              value={form.roomNumber}
              onChange={set("roomNumber")}
              error={!!errors.roomNumber}
              helperText={errors.roomNumber}
              placeholder="VD: 101, A201..."
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              label="Loại phòng"
              fullWidth
              value={form.roomType}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, roomType: e.target.value }))
              }
              sx={inputSx}
            >
              {ROOM_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Hàng 2: Tầng + Loại giường */}
          <Grid item xs={6}>
            <TextField
              label="Tầng"
              type="number"
              fullWidth
              value={form.floor}
              onChange={set("floor")}
              placeholder="VD: 3"
              sx={inputSx}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              label="Loại giường"
              fullWidth
              value={form.bedType}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bedType: e.target.value }))
              }
              sx={inputSx}
            >
              {BED_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Hàng 3: Giá + Địa chỉ chi tiết */}
          <Grid item xs={6}>
            <TextField
              label="Giá / đêm (₫) *"
              type="number"
              fullWidth
              value={form.pricePerNight}
              onChange={set("pricePerNight")}
              error={!!errors.pricePerNight}
              helperText={errors.pricePerNight}
              placeholder="VD: 800000"
              sx={inputSx}
              inputProps={{ step: 10000, min: 0 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Địa chỉ chi tiết"
              fullWidth
              value={form.address}
              onChange={set("address")}
              placeholder="VD: 15 Nguyễn Huệ, P. Bến Nghé"
              sx={inputSx}
            />
          </Grid>

          {/* Hàng 4: Tỉnh/TP + Quận/Huyện */}
          <Grid item xs={6}>
            <TextField
              select
              label="Tỉnh / Thành phố *"
              fullWidth
              value={form.provinceCode || "default"}
              onChange={handleProvinceChange}
              error={!!errors.province}
              helperText={errors.province}
              disabled={loadingProv}
              sx={inputSx}
            >
              <MenuItem value="default" disabled>
                {loadingProv ? "Đang tải..." : "Chọn tỉnh / thành phố"}
              </MenuItem>
              {provinces.map((p) => (
                <MenuItem key={p.code} value={p.code}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              label="Quận / Huyện *"
              fullWidth
              value={
                districts.find((d) => d.name === form.district)?.code ||
                "default"
              }
              onChange={handleDistrictChange}
              error={!!errors.district}
              helperText={errors.district}
              disabled={!form.provinceCode || loadingDist}
              sx={inputSx}
            >
              <MenuItem value="default" disabled>
                {loadingDist
                  ? "Đang tải..."
                  : form.provinceCode
                    ? "Chọn quận / huyện"
                    : "Chọn tỉnh/TP trước"}
              </MenuItem>
              {districts.map((d) => (
                <MenuItem key={d.code} value={d.code}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* Trạng thái */}
          <Grid item xs={12}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{
                textTransform: "uppercase",
                letterSpacing: 1,
                display: "block",
                mb: 1,
              }}
            >
              Trạng thái phòng
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {Object.keys(STATUS_CONFIG).map((key) => (
                <Box
                  key={key}
                  onClick={() => setForm((prev) => ({ ...prev, status: key }))}
                  sx={{
                    cursor: "pointer",
                    borderRadius: "999px",
                    border: "2px solid",
                    borderColor:
                      form.status === key ? "secondary.main" : "transparent",
                    p: 0.25,
                    transition: "all 0.15s",
                    transform: form.status === key ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  <RoomStatus status={key} size="md" />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* URL ảnh */}
          <Grid item xs={12}>
            <TextField
              label="URL ảnh phòng"
              fullWidth
              value={form.thumbnailUrl}
              onChange={set("thumbnailUrl")}
              placeholder="https://example.com/room.jpg"
              sx={inputSx}
            />
          </Grid>

          {/* Mô tả */}
          <Grid item xs={12}>
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={3}
              value={form.description}
              onChange={set("description")}
              placeholder="Mô tả ngắn về phòng..."
              sx={inputSx}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3.5, py: 2.5, gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          color="inherit"
          sx={{
            borderRadius: 3,
            flex: 1,
            py: 1.25,
            fontWeight: 700,
            textTransform: "none",
            borderColor: "divider",
            color: "text.secondary",
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          color="secondary"
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : null
          }
          sx={{
            borderRadius: 3,
            flex: 1,
            py: 1.25,
            fontWeight: 700,
            textTransform: "none",
          }}
        >
          {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo phòng"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomForm;
