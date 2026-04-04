import Box from '@mui/material/Box'
import Step from '@mui/material/Step'
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import { styled } from '@mui/material/styles'

const steps = ['Review Booking', 'Guest & Payment Detail', 'Booking Successfully']
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 12
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: theme.palette.primary.main
    }
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: theme.palette.primary.main
    }
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 2,
    border: 0,
    backgroundColor: '#d8d7d7e0',
    borderRadius: 1
  }
}))
const StepCircle = styled('div')(({ theme }) => ({
  width: 24,
  height: 24,
  borderRadius: '50%',
  display: 'flex',
  border: '1px solid #d8d7d7e0',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#757575',
  fontSize: '12px',
  backgroundColor: 'transparent',
  '.Mui-completed &': {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    border: 'none'
  },
  '.Mui-active &': {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    border: 'none'
  }
}))

const CustomStepLabel = styled(StepLabel)(({ theme }) => ({
  '& .MuiStepLabel-label': { color: '#757575' },
  '& .MuiStepLabel-label.Mui-active': { color: theme.palette.primary.main },
  '& .MuiStepLabel-label.Mui-completed': { color: theme.palette.primary.main }
}))

const CustomStepIcon = (props) => {
  const { icon } = props
  return <StepCircle>{icon}</StepCircle>
}

const PaymentBar = ({ activeStep }) => {

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', padding: 1 }}>
      <Box sx={{ width: '80%' }}>
        <Stepper activeStep={activeStep} connector={<ColorlibConnector />}
          alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <CustomStepLabel StepIconComponent={CustomStepIcon}>{label}</CustomStepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Box>

  )
}

export default PaymentBar