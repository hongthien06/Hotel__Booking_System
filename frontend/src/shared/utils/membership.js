export const getMembershipTierName = (tier, lang = 'vi') => {
  if (!tier) return ''
  const name = lang === 'en'
    ? (tier.displayNameEn || tier.displayNameVi || tier.tierCode || '')
    : (tier.displayNameVi || tier.displayNameEn || tier.tierCode || '')
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : ''
}

export const getMembershipTrackingPhone = (membership) => {
  const phone = membership?.userPhone || ''
  return typeof phone === 'string' ? phone.trim() : ''
}
