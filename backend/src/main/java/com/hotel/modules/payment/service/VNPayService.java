package com.hotel.modules.payment.service;

import com.hotel.common.utils.CryptoUtil;
import com.hotel.modules.payment.constant.VNPayParams;
import com.hotel.modules.payment.dto.request.VNPayRequest;
import com.hotel.modules.payment.dto.response.VNPayResponse;
import com.hotel.modules.payment.entity.Currency;
import com.hotel.modules.payment.entity.Locale;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VNPayService implements IVNPayService {
    private static final String VERSION = "2.1.0";
    private static final String COMMAND = "pay";
    private static final String ORDER_TYPE = "other";

    @Value("${app.payment.vnpay.timeout}")
    private int paymentTimeout;

    @Value("${app.payment.vnpay.return-url}")
    private String returnUrlFormat;

    @Value("${app.payment.vnpay.tmn-code}")
    private String tmnCode;

    @Value("${app.payment.vnpay.hash-secret}")
    private String secretKey;

    @Value("${app.payment.vnpay.pay-url}")
    private String paymentPrefixUrl;

    @Override
    public VNPayResponse init(VNPayRequest request) {
        String amount = new BigDecimal(request.getAmount())
                .setScale(0, RoundingMode.HALF_UP)
                .multiply(new BigDecimal(100))
                .toPlainString();
        String txnRef = request.getTxnRef(); // booking id
        String returnUrl = buildReturnUrl(txnRef);
        Calendar vnCalendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        String createDate = formatter.format(vnCalendar.getTime());
        vnCalendar.add(Calendar.MINUTE, paymentTimeout);
        String exprireDate = formatter.format(vnCalendar.getTime());
        String ipAddress = request.getIpAddress();
        var orderInfo = buildPaymentDetail(request);

        Map<String, String> params = new HashMap<>();
        params.put(VNPayParams.VERSION, VERSION);
        params.put(VNPayParams.COMMAND, COMMAND);

        params.put(VNPayParams.TMN_CODE, tmnCode);
        params.put(VNPayParams.AMOUNT, amount);
        params.put(VNPayParams.CURRENCY, Currency.VND.getValue());

        params.put(VNPayParams.TXN_REF, txnRef);
        params.put(VNPayParams.RETURN_URL, returnUrl);

        params.put(VNPayParams.CREATED_DATE, createDate);
        params.put(VNPayParams.EXPIRE_DATE, exprireDate);

        params.put(VNPayParams.IP_ADDRESS, ipAddress);
        params.put(VNPayParams.LOCALE, Locale.VIETNAM.getCode());

        params.put(VNPayParams.ORDER_INFO, orderInfo);
        params.put(VNPayParams.ORDER_TYPE, ORDER_TYPE);
        log.info("PARAM+{}", params);

        String initPaymentUrl = buildInitPaymentUrl(params);
        return VNPayResponse.builder()
                .vnpUrl(initPaymentUrl)
                .build();
    }

    private String buildReturnUrl(String txnRef) {
        return returnUrlFormat;
    }

    private String buildPaymentDetail(VNPayRequest request) {
        return String.format("Thanh toan don hang: %s | Ma giao dich: %s",
                request.getTxnRef(),
                request.getRequestId());
    }

    @SneakyThrows
    private String buildInitPaymentUrl(Map<String, String> params) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = params.get(fieldName);

            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName)
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                if (itr.hasNext()) {
                    hashData.append('&');
                    query.append('&');
                }
            }
        }

        String secureHash = CryptoUtil.hmacSHA512(secretKey, hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);
        return paymentPrefixUrl + "?" + query;
    }

    @Override
    @SneakyThrows
    public boolean verifyIpn(Map<String, String> params) {
        String reqSecureHash = params.get(VNPayParams.SECURE_HASH);
        params.remove(VNPayParams.SECURE_HASH);
        params.remove(VNPayParams.SECURE_HASH_TYPE);

        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {

                hashData.append(fieldName)
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        String secureHash = CryptoUtil.hmacSHA512(secretKey, hashData.toString());
        log.info("Hash payload : {}", hashData);
        log.info("Expected hash: {}", secureHash);
        log.info("Received hash: {}", reqSecureHash);
        return secureHash.equals(reqSecureHash);
    }
}
