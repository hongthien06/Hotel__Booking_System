package com.hotel.modules.payment.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.hotel.common.utils.CryptoUtil;
import com.hotel.modules.payment.constant.MomoParams;
import com.hotel.modules.payment.dto.request.MoMoRequest;
import com.hotel.modules.payment.dto.response.MomoResponse;
import com.hotel.modules.payment.entity.Locale;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MomoService implements IMomoService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.payment.momo.partner-code}")
    private String PARTNER_CODE;
    @Value("${app.payment.momo.access-key}")
    private String ACCESS_KEY;
    @Value("${app.payment.momo.secret-key}")
    private String SECRET_KEY;
    @Value("${app.payment.momo.return-url}")
    private String REDIRECT_URL;
    @Value("${app.payment.momo.ipn-url}")
    private String IPN_URL;
    @Value("${app.payment.momo.request-type}")
    private String REQUEST_TYPE;
    @Value("${app.payment.momo.endpoint-url}")
    private String ENDPOINT_URL;

    @Override
    public MomoResponse createQR(MoMoRequest request) {
        long amount = request.getAmount();
        String orderId = request.getOrderId();
        String orderInfo = buildOrderInfo(request);
        String requestId = request.getRequestId();
        String extraData = request.getExtraData() != null ? request.getExtraData() : "";

        String rawHash = "accessKey=" + ACCESS_KEY +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&ipnUrl=" + IPN_URL +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + PARTNER_CODE +
                "&redirectUrl=" + REDIRECT_URL +
                "&requestId=" + requestId +
                "&requestType=" + REQUEST_TYPE;

        String signature = CryptoUtil.hmacSHA256(SECRET_KEY, rawHash);
        System.out.println("=== RAW HASH: " + rawHash);
        System.out.println("=== SIGNATURE: " + signature);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put(MomoParams.REQUEST_ID, requestId);
        requestBody.put(MomoParams.AMOUNT, amount);
        requestBody.put(MomoParams.ORDER_ID, orderId);
        requestBody.put(MomoParams.ORDER_INFO, orderInfo);
        requestBody.put(MomoParams.EXTRA_DATA, extraData);
        requestBody.put(MomoParams.SIGNATURE, signature);
        requestBody.put(MomoParams.LANG, Locale.VIETNAMVI.getCode());
        requestBody.put(MomoParams.IPN_URL, IPN_URL);
        requestBody.put(MomoParams.PARTNER_CODE, PARTNER_CODE);
        requestBody.put(MomoParams.REQUEST_TYPE, REQUEST_TYPE);
        requestBody.put(MomoParams.REDIRECT_URL, REDIRECT_URL);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        try {
            ResponseEntity<MomoResponse> response = restTemplate.postForEntity(ENDPOINT_URL, entity,
                    MomoResponse.class);
            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private String buildOrderInfo(MoMoRequest request) {
        return "Thanh toan don hang " + request.getOrderId();
    }

    @Override
    public boolean verifyIpn(Map<String, String> params) {
        String mSignature = params.get("signature");
        String rawHash = "accessKey=" + ACCESS_KEY +
                "&amount=" + params.get("amount") +
                "&extraData=" + params.getOrDefault("extraData", "") +
                "&message=" + params.get("message") +
                "&orderId=" + params.get("orderId") +
                "&orderInfo=" + params.get("orderInfo") +
                "&orderType=" + params.get("orderType") +
                "&partnerCode=" + params.get("partnerCode") +
                "&payType=" + params.get("payType") +
                "&requestId=" + params.get("requestId") +
                "&responseTime=" + params.get("responseTime") +
                "&resultCode=" + params.get("resultCode") +
                "&transId=" + params.get("transId");

        String signature = CryptoUtil.hmacSHA256(SECRET_KEY, rawHash);
        return signature.equals(mSignature);
    }
}
