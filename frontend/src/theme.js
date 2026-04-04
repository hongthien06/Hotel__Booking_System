import { extendTheme } from '@mui/material/styles'

//import { lightGreen } from '@mui/material/colors';

const APP_BAR_HEIGHT = '58px'
const PROBLEMS_BAR_HEIGHT = '50px'
const PROBLEM_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${PROBLEMS_BAR_HEIGHT})`
// const COLUMN_HEADER_HEIGHT = '50px'
// const COLUMN_FOOTER_HEIGHT = '56px'
// Create a theme instance.
const theme = extendTheme({
  codesapces: {
    appBarHeight: APP_BAR_HEIGHT,
    problemdBarHeight: PROBLEMS_BAR_HEIGHT,
    problemContentHeight: PROBLEM_CONTENT_HEIGHT
    // columnHeaderHeight: COLUMN_HEADER_HEIGHT,
    // columnFooterHeight: COLUMN_FOOTER_HEIGHT
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#fdf0f5',
          contrastText: '#f19fb9'
        },
      }

    },
    // dark: {
    //   palette: {
    //     primary: {
    //       main: '#222526',
    //       contrastText: '#fafafa'
    //     }
    //   }
    // }
  },
  colorSchemeSelector: 'class',
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          color: 'var(--mui-palette-primary-contrastText)',
          fontSize: '1rem',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' }
        }
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.MuiTypography-body1': { fontSize: '0.875rem' }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'var(--mui-palette-primary-contrastText)',
          fontSize: '0.875rem'

        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& input': {
            color: 'var(--mui-palette-primary-contrastText)'
          },
          '& label.Mui-focused': {
            color: 'var(--mui-palette-primary-contrastText)'
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'var(--mui-palette-secondary-main)'
            },
            '&:hover fieldset': {
              borderColor: 'var(--mui-palette-secondary-main)'
            },
            '&.Mui-focused fieldset': {
              borderColor: 'var(--mui-palette-secondary-main)'
            }
          }
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#ffffff',
          color: '#535454',
          fontSize: '0.75rem',
          borderRadius: 6,
          boxShadow: '0 0 3px rgba(0,0,0,0.15)',
          padding: '6px 12px'
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: '40px'

        },
        indicator: {
          bottom: 0,
          height: 2,
          backgroundColor: 'var(--mui-palette-secondary-main)'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: '40px',
          minWidth: 0,
          padding: '6px 12px',
          color: 'var(--mui-palette-primary-contrastText)',
          '&.Mui-selected .MuiSvgIcon-root': {
            color: 'var(--mui-palette-secondary-main) !important',
            fontWeight: 600
          },
          '&.Mui-selected .MuiTypography-root': {
            color: 'var(--mui-palette-secondary-main) !important',
            fontWeight: 600
          }
        }

      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          '& fieldset': { borderWidth: '0.5px !important' },
          '&:hover fieldset': { borderWidth: '1px !important' },
          '&.Mui-focused fieldset': { borderWidth: '1px !important' }
        }
      }
    }
  }
})

export default theme