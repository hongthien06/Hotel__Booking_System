import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack
} from '@mui/material'
import { useTranslation } from 'react-i18next'

const accordionSx = {
  borderRadius: 2,
  boxShadow: 'none',
  border: 'none',
  '&:before': { display: 'none' },
  bgcolor: 'transparent'
}

const Policy = () => {
  const { t } = useTranslation()

  return (
    <Box sx={{
      width: '100%',
      borderRadius: 2,
      bgcolor: 'background.paper',
      p: 3,
      boxShadow: '0 0 6px 1px rgba(180, 180, 180, 0.2)'
    }}>
      <Typography
        variant='h6'
        sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600, mb: 2 }}
      >
        <StickyNote2OutlinedIcon />
        {t('payment.policy_title')}
      </Typography>

      <Stack spacing={1.5}>
        <Accordion disableGutters sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>
              {t('payment.policy_checkin_title')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              {t('payment.policy_checkin_content')}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>
              {t('payment.policy_cancel_title')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              {t('payment.policy_cancel_content')}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>
              {t('payment.policy_rules_title')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              {t('payment.policy_rules_content')}
            </Typography>
          </AccordionDetails>
        </Accordion>

      </Stack>
    </Box>
  )
}

export default Policy
