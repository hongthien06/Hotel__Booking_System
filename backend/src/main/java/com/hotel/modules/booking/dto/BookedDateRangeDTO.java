package com.hotel.modules.booking.dto;

import java.time.LocalDate;

public class BookedDateRangeDTO {
    private LocalDate checkIn;
    private LocalDate checkOut;
    private LocalDate earlyCheckoutDate;
    private String status;
    private LocalDate cancelledAt;

    public LocalDate getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDate checkIn) { this.checkIn = checkIn; }
    public LocalDate getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDate checkOut) { this.checkOut = checkOut; }
    public LocalDate getEarlyCheckoutDate() { return earlyCheckoutDate; }
    public void setEarlyCheckoutDate(LocalDate earlyCheckoutDate) { this.earlyCheckoutDate = earlyCheckoutDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDate cancelledAt) { this.cancelledAt = cancelledAt; }
}
