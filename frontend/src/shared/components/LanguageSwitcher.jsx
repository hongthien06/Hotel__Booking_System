import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Menu, MenuItem, Box, Typography } from "@mui/material";
import { Translate, ExpandMore } from "@mui/icons-material";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    handleClose();
  };

  const currentLanguage = i18n.language === "en" ? "EN" : "VI";

  return (
    <Box>
      <Button
        id="language-button"
        aria-controls={open ? "language-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        startIcon={<Translate sx={{ fontSize: { xs: 18, sm: 20 } }} />}
        endIcon={<ExpandMore sx={{ fontSize: { xs: 14, sm: 18 }, display: { xs: 'none', sm: 'inline-flex' } }} />}
        sx={{
          color: "inherit",
          fontWeight: 700,
          borderRadius: 2,
          px: { xs: 1, sm: 2 },
          minWidth: { xs: 'auto', sm: 80 },
          textTransform: "none",
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
        }}
      >
        {currentLanguage}
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "language-button",
        }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            minWidth: 120
          }
        }}
      >
        <MenuItem 
          onClick={() => changeLanguage("vi")}
          selected={i18n.language === "vi"}
          sx={{ py: 1.5, gap: 1.5 }}
        >
          <Typography variant="body2" sx={{ fontWeight: i18n.language === "vi" ? 700 : 400 }}>
            Tiếng Việt (VI)
          </Typography>
        </MenuItem>
        <MenuItem 
          onClick={() => changeLanguage("en")}
          selected={i18n.language === "en"}
          sx={{ py: 1.5, gap: 1.5 }}
        >
          <Typography variant="body2" sx={{ fontWeight: i18n.language === "en" ? 700 : 400 }}>
            English (EN)
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LanguageSwitcher;
