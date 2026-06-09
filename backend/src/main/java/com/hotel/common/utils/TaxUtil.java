package com.hotel.common.utils;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class TaxUtil {

    public static final BigDecimal VAT_RATE_PERCENT = new BigDecimal("8.00");
    private static final BigDecimal PERCENT_DIVISOR = BigDecimal.valueOf(100);

    private TaxUtil() {
    }

    public static BigDecimal calculateVat(BigDecimal subtotal) {
        if (subtotal == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return subtotal.multiply(VAT_RATE_PERCENT)
                .divide(PERCENT_DIVISOR, 2, RoundingMode.HALF_UP);
    }
}
