package com.hotel.modules.voucher.service;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.voucher.dto.request.ApplyVoucherRequest;
import com.hotel.modules.voucher.dto.request.VoucherCreateRequest;
import com.hotel.modules.voucher.dto.request.VoucherUpdateRequest;
import com.hotel.modules.voucher.dto.response.ApplyVoucherResponse;
import com.hotel.modules.voucher.dto.response.VoucherResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IVoucherService {


    VoucherResponse createVoucher(VoucherCreateRequest request);

    VoucherResponse updateVoucher(Long voucherId, VoucherUpdateRequest request);

    void deleteVoucher(Long voucherId);

    Page<VoucherResponse> getVouchers(String status, String code, Pageable pageable);

    List<VoucherResponse> getActiveVouchers();

    VoucherResponse getVoucherByCode(String code);

    ApplyVoucherResponse applyVoucher(ApplyVoucherRequest request, User currentUser);

    void removeVoucher(Long bookingId, User currentUser);
}
