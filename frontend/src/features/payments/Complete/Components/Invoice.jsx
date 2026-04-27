import {
  Box
} from '@mui/material'
import InvoiceFooter from './Invoice/InvoiceFooter'
import InvoiceHeader from './Invoice/InvoiceHeader'
import InvoiceMain from './Invoice/InvoiceMain'

const Invoice = ({ invoiceData }) => {
  return (
    <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column' }}>
      <InvoiceHeader invoiceData={invoiceData} />
      <InvoiceMain invoiceData={invoiceData} />
      <InvoiceFooter />
    </Box>
  )
}

export default Invoice