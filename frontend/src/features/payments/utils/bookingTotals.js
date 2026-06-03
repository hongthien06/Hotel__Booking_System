export const getBookingRooms = (booking, fallbackRoom) => {
  if (Array.isArray(booking?.rooms) && booking.rooms.length > 0) {
    return booking.rooms
  }
  if (fallbackRoom || booking?.roomId) {
    return [{
      roomId: booking?.roomId || fallbackRoom?.roomId || fallbackRoom?.id,
      roomNumber: booking?.roomNumber || fallbackRoom?.roomNumber,
      roomTypeName: booking?.roomTypeName || fallbackRoom?.roomTypeName || fallbackRoom?.typeName || 'Standard',
      hotelName: booking?.hotelName || fallbackRoom?.hotelName,
      hotelAddress: booking?.hotelAddress || fallbackRoom?.address,
      roomPriceSnapshot: booking?.roomPriceSnapshot || fallbackRoom?.pricePerNight || fallbackRoom?.priceDay || 0,
      totalNights: booking?.totalNights || 1,
      subtotal: booking?.totalAmount || Number(booking?.roomPriceSnapshot || fallbackRoom?.pricePerNight || 0) * Number(booking?.totalNights || 1)
    }]
  }
  return []
}

export const getBookingTotals = (booking, fallbackRoom, voucherData) => {
  const rooms = getBookingRooms(booking, fallbackRoom)
  const roomTotal = Number(booking?.totalAmount ?? rooms.reduce((sum, room) => sum + Number(room.subtotal || 0), 0))
  const serviceTotal = Number(booking?.serviceTotal || 0)
  const taxFee = Math.round((roomTotal + serviceTotal) * 0.1)
  const automaticDiscount = Number(booking?.discountAmount || 0)
  const voucherDiscount = Number(voucherData?.discountAmount || 0)
  const discountAmount = voucherData ? automaticDiscount + voucherDiscount : automaticDiscount
  const originalTotal = roomTotal + serviceTotal + taxFee
  const finalTotal = Math.max(0, originalTotal - discountAmount)

  return {
    rooms,
    roomTotal,
    serviceTotal,
    taxFee,
    automaticDiscount,
    voucherDiscount,
    discountAmount,
    originalTotal,
    finalTotal
  }
}
