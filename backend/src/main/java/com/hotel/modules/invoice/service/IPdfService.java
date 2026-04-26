package com.hotel.modules.invoice.service;

public interface IPdfService {
  public byte[] generateInvoicePdf(Long invoiceId);
}
