import React from 'react'
import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Header from './Header/Header'
import Chatbot from '~/features/chatbot/Chatbot'

const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header />
      
      {/* Main Content Area - full width, no sidebar */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarGutter: 'stable',
          backgroundColor: 'background.default'
        }}
      >
        <Outlet />
      </Box>

      <Chatbot />
    </Box>
  )
}

export default MainLayout
