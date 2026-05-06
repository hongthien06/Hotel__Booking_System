import { useBookingContext } from '../../../_id'
import PromoInput from './PromoInput'

const Discount = () => {
  const { booking, voucherData, setVoucherData } = useBookingContext() || {}
  const bookingId = booking?.bookingId

  return (
    <PromoInput
      bookingId={bookingId}
      applied={voucherData}
      onApply={setVoucherData}
      onRemove={() => setVoucherData(null)}
    />
  )
}

export default Discount
