package com.hotel.modules.invoice.dto.request;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.Data;

@Data
public class InvoiceQueryRequest {
  private int page = 0;
  private int size = 10;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private LocalDate startDate;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private LocalDate endDate;

  // Helper methods để lấy LocalDateTime ngay trong DTO
  public LocalDateTime getStartDateTime() {
    return (startDate != null) ? startDate.atStartOfDay() : null;
  }

  public LocalDateTime getEndDateTime() {
    return (endDate != null) ? endDate.atTime(LocalTime.MAX) : null;
  }
}
