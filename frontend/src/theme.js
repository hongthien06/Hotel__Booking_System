import { extendTheme } from '@mui/material/styles'

const HEADER_HEIGHT = '58px'
const PAYMENT_BAR_HEIGHT = '50px'

const theme = extendTheme({
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
  hotel_booking: {
    headerHeight: HEADER_HEIGHT,
    payment: {
      paymentBarHeight: PAYMENT_BAR_HEIGHT,
      paymentContentHeight: `calc(100vh - ${HEADER_HEIGHT} - ${PAYMENT_BAR_HEIGHT})`
    }
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#ffc7dbff',      // Màu nền button chưa hover
          dark: '#c02860ff',      // Màu nền button khi hover
          contrastText: '#a01b4ccd', // Màu chữ trong button lúc chưa hover
          contrastTextHover: '#fff'   // Màu chữ trong button khi hover
        },
        secondary: {
          main: '#a01b4ccd',      // Thay bằng primary.contrastText
          dark: '#ffc7dbff'       // Thay bằng primary.main
        },
        text: {
          primary: '#000000',     // Màu chữ chính (đen)
          secondary: '#606060'    // Màu chữ phụ (xám)
        },
        background: {
          paper: '#fff9fa', // Nền profile
          default: '#ccebffff'// Nền xanh nhạt của trang
        },
        // Thêm các màu tùy chỉnh cho Input
        action: {
          inputBg: '#e8f6ffff',
          inputLabel: '#cbbbc2ff', //chữ chưa hover (ô nhập liệu)
          inputLabelFocus: '#ac184ecd',//chữ đã hover (ô nhập liệu)
          inputBorder: '#cbbbc2ff', // viền ô chưa hover
          inputBorderFocus: '#ac184ecd' // viền ô khi hover
        }
      }
    }
  },
  colorSchemeSelector: 'class',
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif'
        },
        body1: { fontSize: '0.875rem' },
        h6: { fontWeight: '550' }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: '0.875rem',
          color: theme.vars.palette.action.inputLabel,
          '&.Mui-focused': {
            color: theme.vars.palette.action.inputLabelFocus
          }
        })
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '16px',
          fontSize: '0.875rem',
          backgroundColor: theme.vars.palette.action.inputBg,
          '& fieldset': {
            borderColor: theme.vars.palette.action.inputBorder
          },
          '&:hover fieldset': {
            borderColor: `${theme.vars.palette.action.inputBorderFocus} !important`,
            borderWidth: '1.5px'
          },
          '&.Mui-focused fieldset': {
            borderColor: `${theme.vars.palette.action.inputBorderFocus} !important`,
            borderWidth: '1.5px'
          }
        }),
        input: {
          padding: '8px 12px'
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        size: 'small'
      },
      styleOverrides: {
        root: ({ theme }) => ({
          '&:hover .MuiInputLabel-root': {
            color: theme.vars.palette.action.inputLabelFocus
          }
        })
      }
    },
    MuiButton: {
      variants: [
        {
          props: { variant: 'seeAll' },
          style: ({ theme }) => ({
            backgroundColor: theme.vars.palette.primary.main,
            color: theme.vars.palette.primary.contrastText,
            border: 'none',
            '&:hover': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(172, 24, 78, 0.2)'
            },
            '&:active': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(1px)',
              boxShadow: 'none'
            }
          })
        },
        {
          props: { variant: 'bookNow' },
          style: ({ theme }) => ({
            backgroundColor: theme.vars.palette.primary.main,
            color: theme.vars.palette.primary.contrastText,
            border: 'none',
            '&:hover': {
              backgroundColor: theme.vars.palette.primary.contrastTextHover,
              color: theme.vars.palette.primary.contrastText,
              transform: 'translateY(-3px)',
              boxShadow: '0 10px 30px rgba(154, 28, 72, 0.2)'
            },
            '&:active': {
              backgroundColor: theme.vars.palette.primary.contrastTextHover,
              color: theme.vars.palette.primary.contrastText,
              transform: 'translateY(1px)',
              boxShadow: 'none'
            }
          })
        },
        {
          props: { variant: 'writeReview' },
          style: ({ theme }) => ({
            backgroundColor: theme.vars.palette.primary.main,
            color: theme.vars.palette.primary.contrastText,
            border: 'none',
            '&:hover': {
              backgroundColor: theme.vars.palette.primary.contrastTextHover,
              color: theme.vars.palette.primary.contrastText,
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(172, 24, 78, 0.2)'
            },
            '&:active': {
              backgroundColor: theme.vars.palette.primary.contrastTextHover,
              color: theme.vars.palette.primary.contrastText,
              transform: 'translateY(1px)',
              boxShadow: 'none'
            }
          })
        },
        {
          props: { variant: 'loginButton' },
          style: ({ theme }) => ({
            backgroundColor: theme.vars.palette.primary.main,
            color: theme.vars.palette.primary.contrastText,
            border: 'none',
            '&:hover': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(172, 24, 78, 0.2)'
            },
            '&:active': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(1px)',
              boxShadow: 'none'
            }
          })
        },
        {
          props: { variant: 'registerButton' },
          style: ({ theme }) => ({
            backgroundColor: theme.vars.palette.primary.main,
            color: theme.vars.palette.primary.contrastText,
            border: 'none',
            '&:hover': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(172, 24, 78, 0.2)'
            },
            '&:active': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(1px)',
              boxShadow: 'none'
            }
          })
        },
        {
          props: { variant: 'heroBookNow' },
          style: ({ theme }) => ({
            backgroundColor: theme.vars.palette.primary.contrastTextHover,
            color: theme.vars.palette.primary.contrastText,
            border: 'none',
            '&:hover': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(-3px)',
              boxShadow: '0 12px 35px rgba(154, 28, 72, 0.4)'
            },
            '&:active': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(1px)',
              boxShadow: 'none'
            }
          })
        },
        {
          props: { variant: 'continueButton' },
          style: ({ theme }) => ({
            backgroundColor: theme.vars.palette.primary.main,
            color: theme.vars.palette.primary.contrastText,
            border: 'none',
            '&:hover': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(172, 24, 78, 0.2)'
            },
            '&:active': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(1px)',
              boxShadow: 'none'
            }
          })
        },
        {
          props: { variant: 'submitReviewButton' },
          style: ({ theme }) => ({
            backgroundColor: theme.vars.palette.primary.main,
            color: theme.vars.palette.primary.contrastText,
            border: 'none',
            '&:hover': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(172, 24, 78, 0.2)'
            },
            '&:active': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(1px)',
              boxShadow: 'none'
            }
          })
        },
        {
          props: { variant: 'payButton' },
          style: ({ theme }) => ({
            backgroundColor: theme.vars.palette.primary.main,
            color: theme.vars.palette.primary.contrastText,
            border: 'none',
            '&:hover': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(172, 24, 78, 0.2)'
            },
            '&:active': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(1px)',
              boxShadow: 'none'
            }
          })
        },
        {
          props: { variant: 'historySearchButton' },
          style: ({ theme }) => ({
            backgroundColor: theme.vars.palette.primary.main,
            color: theme.vars.palette.primary.contrastText,
            border: 'none',
            '&:hover': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(172, 24, 78, 0.2)'
            },
            '&:active': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(1px)',
              boxShadow: 'none'
            }
          })
        },
        {
          props: { variant: 'historyBookNowButton' },
          style: ({ theme }) => ({
            backgroundColor: theme.vars.palette.primary.main,
            color: theme.vars.palette.primary.contrastText,
            border: 'none',
            '&:hover': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(172, 24, 78, 0.2)'
            },
            '&:active': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(1px)',
              boxShadow: 'none'
            }
          })
        },
        {
          props: { variant: 'cropAvatarButton' },
          style: ({ theme }) => ({
            backgroundColor: theme.vars.palette.primary.main,
            color: theme.vars.palette.primary.contrastText,
            border: 'none',
            '&:hover': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(172, 24, 78, 0.2)'
            },
            '&:active': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.primary.contrastTextHover,
              transform: 'translateY(1px)',
              boxShadow: 'none'
            }
          })
        }
      ],
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 700,
          transition: 'all 0.2s ease-in-out',
        },
        contained: ({ theme }) => ({
          backgroundColor: theme.vars.palette.primary.dark,
          color: theme.vars.palette.primary.contrastTextHover,
          '&:hover': {
            transform: 'translateY(-1px)',
            backgroundColor: theme.vars.palette.primary.main,
            color: theme.vars.palette.primary.contrastText,
            boxShadow: '0 6px 20px rgba(172, 24, 78, 0.4)'
          },
          '&:active': {
            transform: 'translateY(1px)',
            backgroundColor: theme.vars.palette.primary.main,
            color: theme.vars.palette.primary.contrastText,
            boxShadow: 'none'
          }
        })
      }
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center'
        }
      }
    }
  }
})

export default theme