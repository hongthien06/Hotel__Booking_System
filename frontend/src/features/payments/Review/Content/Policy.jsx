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

const accordionSx = {
  borderRadius: 2,
  boxShadow: 'none',
  border: 'none',
  '&:before': { display: 'none' },
  bgcolor: 'transparent'
}

const Policy = () => {
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
        Chính sách chỗ ở
      </Typography>

      <Stack spacing={1.5}>
        <Accordion disableGutters sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>
              Nhận phòng, trả phòng & yêu cầu đặc biệt
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              Thời gian nhận phòng bắt đầu từ 14:00 và thời gian trả phòng là trước 12:00 trưa,
              mọi yêu cầu nhận phòng sớm hoặc trả phòng muộn đều phụ thuộc vào tình trạng phòng
              thực tế tại thời điểm khách đến và có thể phát sinh thêm chi phí. Các yêu cầu đặc biệt
              như chọn loại phòng cụ thể, giường phụ hoặc dịch vụ đưa đón sân bay sẽ được chỗ ở ghi nhận
              nhưng không đảm bảo chắc chắn được đáp ứng và có thể đi kèm phụ phí tùy theo chính sách riêng.
            </Typography>
          </AccordionDetails>
        </Accordion>


        <Accordion disableGutters sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>
              Hủy phòng, thanh toán & xác nhận đặt chỗ
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              Khách có thể hủy đặt phòng miễn phí trong khoảng thời gian quy định trước ngày nhận phòng,
              thường là 24 giờ, tuy nhiên các trường hợp hủy muộn hoặc không đến sẽ có thể bị tính phí toàn bộ
              hoặc một phần giá trị đơn đặt phòng. Để đảm bảo giữ chỗ, chỗ ở có thể yêu cầu khách thanh toán trước
              một phần hoặc toàn bộ chi phí thông qua các phương thức như thẻ tín dụng, thẻ ghi nợ hoặc thanh toán
              trực tuyến, và việc xác nhận đặt phòng chỉ có hiệu lực sau khi thanh toán được hoàn tất theo quy định.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>
              Nội quy lưu trú & trách nhiệm của khách
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              Trong thời gian lưu trú, khách cần tuân thủ các quy định chung của chỗ ở bao gồm không hút thuốc
              trong khu vực phòng, không mang theo thú cưng nếu không được cho phép và giữ yên tĩnh, đặc biệt
              trong khoảng thời gian ban đêm để tránh ảnh hưởng đến các khách khác. Khách lưu trú hoàn toàn chịu
              trách nhiệm đối với mọi thiệt hại, mất mát hoặc hư hỏng tài sản xảy ra trong quá trình sử dụng dịch vụ
              và có thể phải bồi thường chi phí sửa chữa hoặc thay thế theo mức giá do chỗ ở quy định.
            </Typography>
          </AccordionDetails>
        </Accordion>

      </Stack>
    </Box>
  )
}

export default Policy