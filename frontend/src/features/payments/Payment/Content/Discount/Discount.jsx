import { useState } from 'react'
import PromoInput from './PromoInput'


const Discount = () => {
  const [promo, setPromo] = useState(null)
  return (
    <PromoInput
      applied={promo}
      onApply={setPromo}
      onRemove={() => setPromo(null)}
    />
  )
}

export default Discount