export const getMembershipTierName = (tier, lang = 'vi') => {
  if (!tier) return ''
  if (lang === 'en') return tier.displayNameEn || tier.displayNameVi || tier.tierCode || ''
  return tier.displayNameVi || tier.displayNameEn || tier.tierCode || ''
}

export const getMembershipTrackingPhone = (membership) => {
  const phone = membership?.userPhone || ''
  return typeof phone === 'string' ? phone.trim() : ''
}
