package com.hotel.modules.payment.service;

import com.hotel.common.utils.CryptoUtil;
import com.hotel.modules.payment.constant.VNPayParams;
import com.hotel.modules.payment.dto.request.VNPayRequest;
import com.hotel.modules.payment.dto.response.VNPayResponse;
import com.hotel.modules.payment.entity.Currency;
import com.hotel.modules.payment.entity.Locale;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

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
    public VNPayResponse init(VNPayRequest request){
        String amount = String.valueOf(Integer.parseInt(request.getAmount()) * 100);
        String txnRef = request.getTxnRef(); //booking id
        String returnUrl = buildReturnUrl(txnRef);
        Calendar vnCalendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        String createDate = formatter.format(vnCalendar.getTime());
        vnCalendar.add(Calendar.MINUTE, paymentTimeout);
        String exprireDate = formatter.format(vnCalendar.getTime());
        String ipAddress = request.getIpAddress();
        var orderInfo = buildPaymentDetail(request);
        String requestId = request.getRequestId();

        Map<String, String> params = new HashMap<>();
        params.put(VNPayParams.VERSION, VERSION);
        params.put(VNPayParams.COMMAND, COMMAND);

        params.put(VNPayParams.TMN_CODE,tmnCode);
        params.put(VNPayParams.AMOUNT,amount);
        params.put(VNPayParams.CURRENCY, Currency.VND.getValue());

        params.put(VNPayParams.TXN_REF, txnRef);
        params.put(VNPayParams.RETURN_URL, returnUrl);

        params.put(VNPayParams.CREATED_DATE, createDate);
        params.put(VNPayParams.EXPIRE_DATE, exprireDate);

        params.put(VNPayParams.IP_ADDRESS, ipAddress);
        params.put(VNPayParams.LOCALE, Locale.VIETNAM.getCode());

        params.put(VNPayParams.ORDER_INFO, orderInfo);
        params.put(VNPayParams.ORDER_TYPE, ORDER_TYPE);

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
    private String buildInitPaymentUrl(Map<String, String> params){
        StringBuilder hashPayload = new StringBuilder();
        StringBuilder query = new StringBuilder();
        List fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Giống VNPay demo: encode bằng US_ASCII
                hashPayload.append(fieldName);
                hashPayload.append('=');
                hashPayload.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashPayload.append('&');
                }
            }
        }
        String secureHash = CryptoUtil.hmacSHA512(secretKey, hashPayload.toString());
        query.append("&vnp_SecureHash=");
        query.append(secureHash);
        return paymentPrefixUrl + "?" + query;
    }

    @Override
    @SneakyThrows
    public boolean verifyIpn(Map<String, String > params){
        String reqSecureHash = params.get(VNPayParams.SECURE_HASH);
        params.remove(VNPayParams.SECURE_HASH);
        params.remove(VNPayParams.SECURE_HASH_TYPE);
        StringBuilder hashPayload = new StringBuilder();
        List fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                String encodedKey = URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString());
                String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString());

                hashPayload.append(encodedKey);
                hashPayload.append('=');
                hashPayload.append(encodedValue);

                if (itr.hasNext()) {
                    hashPayload.append('&');
                }
            }
        }
        String secureHash = CryptoUtil.hmacSHA512(secretKey, hashPayload.toString());
        return secureHash.equals(reqSecureHash);
    }
}
