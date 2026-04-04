import * as React from 'react'
import { Box, MenuItem, FormControl, InputLabel, Select } from '@mui/material'

export default function CountryCode() {
  const [code, setCode] = React.useState('+84')

  const handleChange = (event) => {
    setCode(event.target.value)
  }

  return (
    <Box >
      <FormControl fullWidth size="small">

        <Select
          labelId="country-code-label"
          id="country-code-select"
          value={code}
          onChange={handleChange}
          sx={{
            height: '48px',
            width: '80px',
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center'
            }
          }}
        >
          <MenuItem value="+84">+84</MenuItem>
          <MenuItem value="+93">+93</MenuItem>
          <MenuItem value="+12">+12</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}