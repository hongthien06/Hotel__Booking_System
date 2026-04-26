import './index.css'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import App from '~/App.jsx'
import theme from './theme'
import { AuthProvider } from './shared/context/AuthContext'
import { ToastContainer } from 'react-toastify'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter basename='/'>
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <App />
            <ToastContainer autoClose={2000} theme="colored" />
          </AuthProvider>
        </ThemeProvider >
      </QueryClientProvider>
    </React.StrictMode>
  </BrowserRouter>
)
