import { Box, Grid } from '@mui/material'
import InfomationRental from './Content/InfomationRental'
import InfomationCustomer from './Content/InfomationCustomer'
import Checkout from './Content/checkout'
import Policy from './Content/Policy'

const Review = () => {
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, maxWidth: '1440px', mx: 'auto' }}>
      <Grid container spacing={4} columns={10}>
        <Grid size={{ xs: 10, md: 6 }}>
          <Grid container direction="column" spacing={4}>
            <Grid>
              <InfomationCustomer />
            </Grid>
            <Grid>
              <Policy />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 10, md: 4 }}>
          <Grid container direction="column" spacing={4}>
            <Grid>
              <InfomationRental />
            </Grid>
            <Grid>
              <Checkout />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Review