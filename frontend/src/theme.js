import { extendTheme } from '@mui/material/styles'

const HEADER_HEIGHT = '58px'
const PAYMENT_BAR_HEIGHT = '50px'

const theme = extendTheme({
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
          main: '#ffbfeb',
          light: '#fcd0ed',
          contrastText: '#ffffff'
        },
        text: {
          primary: '#383838',
          secondary: '#606060'
        },
        background: {
          paper: '#ffffff',
          default: '#fafafa'
        }
      }
    }
  },
  colorSchemeSelector: 'class',
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
        },
        body1: { fontSize: '0.875rem' },
        h6: { fontWeight: '550' }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: '0.875rem',
          color: theme.vars.palette.primary.main,
          '&.Mui-focused': {
            color: theme.vars.palette.primary.main
          }
        })
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '8px',
          fontSize: '0.875rem',
          backgroundColor: '#fff',
          '& fieldset': {
            borderColor: theme.vars.palette.primary.main
          },
          '&:hover fieldset': {
            borderColor: `${theme.vars.palette.primary.main} !important`,
            borderWidth: '1.5px'
          },
          '&.Mui-focused fieldset': {
            borderColor: theme.vars.palette.primary.main,
            borderWidth: '1px'
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
      }
    },
    // Fix luôn cho Select để đồng bộ với TextField
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