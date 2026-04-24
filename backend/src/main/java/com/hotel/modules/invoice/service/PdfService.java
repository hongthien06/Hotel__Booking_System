package com.hotel.modules.invoice.service;

import com.hotel.modules.booking.dto.BookingDTO;
import com.hotel.modules.booking.repository.bookingRepository;
import com.hotel.modules.invoice.dto.response.InvoiceItemResponse;
import com.hotel.modules.invoice.dto.response.InvoiceResponse;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class PdfService {
    // color const
    private static final Color DARK_NAVY = new DeviceRgb(0x1a, 0x1a, 0x2e);
    private static final Color GOLD = new DeviceRgb(0xe2, 0xb9, 0x6f);
    private static final Color LIGHT_GRAY = new DeviceRgb(0xf8, 0xf9, 0xff);
    private static final Color BORDER_GRAY = new DeviceRgb(0xe8, 0xec, 0xf0);
    private static final Color TEXT_MUTED = new DeviceRgb(0x71, 0x80, 0x96);
    private static final Color RED = new DeviceRgb(0xe5, 0x3e, 0x3e);
    private static final Color GREEN = new DeviceRgb(0x38, 0xa1, 0x69);

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter DATE_ONLY = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final IInvoiceService invoiceService;
    private final bookingRepository bookingRepo;

    // GENERATE
    public byte[] generateInvoicePdf(Long invoiceId) {
        // found invoice
        InvoiceResponse invoice = invoiceService.getInvoiceById(invoiceId);

        // found booking
        var booking = bookingRepo.findById(invoice.getBookingId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy booking #" + invoice.getBookingId()));

        BookingDTO dto = new BookingDTO();
        dto.setBookingId(booking.getBookingId());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setTotalNights(booking.getTotalNights());
        if (booking.getUser() != null) {
            dto.setUserName(booking.getUser().getFullName());
            dto.setUserEmail(booking.getUser().getEmail());
        }
        if (booking.getRoom() != null) {
            dto.setRoomNumber(booking.getRoom().getRoomNumber());
            if (booking.getRoom().getRoomType() != null) {
                dto.setRoomTypeName(booking.getRoom().getRoomType().getTypeName());
            }
        }

        return buildPdf(invoice, dto);
    }

    // PDF Builder

    private byte[] buildPdf(InvoiceResponse invoice, BookingDTO booking) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf, PageSize.A4);
            doc.setMargins(0, 0, 30, 0);

            PdfFont regular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

            addHeader(doc, invoice, bold, regular);
            addInfoGrid(doc, invoice, booking, bold, regular);
            addItemsTable(doc, invoice.getItems(), bold, regular);
            addTotals(doc, invoice, bold, regular);
            addNotes(doc, invoice.getNotes(), bold, regular);
            addFooter(doc, bold, regular);

            doc.close();
            return baos.toByteArray();

        } catch (IOException e) {
            log.error("Lỗi xuất PDF: {}", e.getMessage());
            throw new RuntimeException("Không thể tạo file PDF: " + e.getMessage(), e);
        }
    }

    private void addHeader(Document doc, InvoiceResponse invoice,
            PdfFont bold, PdfFont regular) {
        Table header = new Table(new float[] { 1, 1 })
                .setWidth(UnitValue.createPercentValue(100))
                .setBackgroundColor(DARK_NAVY)
                .setPadding(30)
                .setMarginBottom(0);

        Cell brandCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setVerticalAlignment(VerticalAlignment.TOP);
        brandCell.add(new Paragraph("\u2605 LUXURY HOTEL")
                .setFont(bold).setFontSize(18).setFontColor(GOLD));
        brandCell.add(new Paragraph("Where Every Stay Becomes a Memory")
                .setFont(regular).setFontSize(9).setFontColor(TEXT_MUTED));
        header.addCell(brandCell);

        Cell titleCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT)
                .setVerticalAlignment(VerticalAlignment.TOP);
        titleCell.add(new Paragraph("HÓA ĐƠN")
                .setFont(bold).setFontSize(24).setFontColor(GOLD));
        titleCell.add(new Paragraph("#" + invoice.getInvoiceNumber())
                .setFont(regular).setFontSize(10).setFontColor(TEXT_MUTED));
        header.addCell(titleCell);

        doc.add(header);

        Table meta = new Table(new float[] { 1, 1, 1 })
                .setWidth(UnitValue.createPercentValue(100))
                .setBackgroundColor(DARK_NAVY)
                .setPaddingLeft(30).setPaddingRight(30)
                .setPaddingBottom(20).setPaddingTop(10)
                .setMarginBottom(0);

        meta.addCell(metaCell("Ngày xuất hóa đơn",
                invoice.getIssuedAt() != null ? invoice.getIssuedAt().format(DATE_FMT) : "-",
                bold, regular));
        meta.addCell(metaCell("Mã đặt phòng", "#" + invoice.getBookingId(), bold, regular));
        meta.addCell(metaCell("Thanh toán", "#" + invoice.getPaymentId(), bold, regular));

        doc.add(meta);
    }

    private Cell metaCell(String label, String value, PdfFont bold, PdfFont regular) {
        Cell c = new Cell().setBorder(Border.NO_BORDER);
        c.add(new Paragraph(label).setFont(regular).setFontSize(9).setFontColor(TEXT_MUTED));
        c.add(new Paragraph(value).setFont(bold).setFontSize(11).setFontColor(GOLD));
        return c;
    }

    private void addInfoGrid(Document doc, InvoiceResponse invoice, BookingDTO booking,
            PdfFont bold, PdfFont regular) {
        Table grid = new Table(new float[] { 1, 1, 1 })
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginLeft(30).setMarginRight(30)
                .setMarginTop(20).setMarginBottom(10)
                // shrink actual width due to margins
                .setWidth(UnitValue.createPercentValue(88));

        grid.addCell(infoCard("KHÁCH HÀNG",
                (booking.getUserName() != null ? booking.getUserName() : "Khách lẻ")
                        + "\n" + (booking.getUserEmail() != null ? booking.getUserEmail() : ""),
                bold, regular));
        grid.addCell(infoCard("PHÒNG",
                booking.getRoomNumber() + " — " +
                        (booking.getRoomTypeName() != null ? booking.getRoomTypeName() : ""),
                bold, regular));

        String stay = "-";
        if (booking.getCheckInDate() != null && booking.getCheckOutDate() != null) {
            stay = booking.getCheckInDate().format(DATE_ONLY)
                    + " → " + booking.getCheckOutDate().format(DATE_ONLY)
                    + "\n" + booking.getTotalNights() + " đêm";
        }
        grid.addCell(infoCard("THỜI GIAN LƯU TRÚ", stay, bold, regular));

        doc.add(grid);
    }

    private Cell infoCard(String label, String value, PdfFont bold, PdfFont regular) {
        Cell c = new Cell()
                .setBackgroundColor(LIGHT_GRAY)
                .setBorderLeft(new SolidBorder(GOLD, 3))
                .setBorderTop(Border.NO_BORDER)
                .setBorderRight(Border.NO_BORDER)
                .setBorderBottom(Border.NO_BORDER)
                .setPadding(12)
                .setMarginRight(8);
        c.add(new Paragraph(label)
                .setFont(regular).setFontSize(8)
                .setFontColor(TEXT_MUTED));
        for (String line : value.split("\n")) {
            c.add(new Paragraph(line)
                    .setFont(bold).setFontSize(11)
                    .setFontColor(DARK_NAVY)
                    .setMarginTop(2));
        }
        return c;
    }

    private void addItemsTable(Document doc, List<InvoiceItemResponse> items,
            PdfFont bold, PdfFont regular) {
        doc.add(new Paragraph("CHI TIẾT HÓA ĐƠN")
                .setFont(bold).setFontSize(10)
                .setFontColor(TEXT_MUTED)
                .setMarginLeft(30).setMarginTop(10).setMarginBottom(6));

        float[] colWidths = { 30f, 60f, 200f, 40f, 90f, 90f };
        Table table = new Table(colWidths)
                .setWidth(UnitValue.createPercentValue(88))
                .setMarginLeft(30).setMarginRight(30);

        String[] headers = { "#", "Loại", "Mô tả", "SL", "Đơn giá", "Thành tiền" };
        for (String h : headers) {
            table.addHeaderCell(new Cell()
                    .setBackgroundColor(DARK_NAVY)
                    .setBorder(Border.NO_BORDER)
                    .setPadding(8)
                    .add(new Paragraph(h)
                            .setFont(bold).setFontSize(9)
                            .setFontColor(GOLD)));
        }

        int idx = 1;
        for (InvoiceItemResponse item : items) {
            boolean even = (idx % 2 == 0);
            Color bg = even ? LIGHT_GRAY : ColorConstants.WHITE;

            table.addCell(rowCell(String.valueOf(idx), regular, bg, TextAlignment.LEFT));
            table.addCell(rowCell(item.getItemType(), bold, bg, TextAlignment.LEFT));
            table.addCell(rowCell(item.getDescription(), regular, bg, TextAlignment.LEFT));
            table.addCell(rowCell(String.valueOf(item.getQuantity()), regular, bg, TextAlignment.CENTER));
            table.addCell(rowCell(fmtVnd(item.getUnitPrice()), regular, bg, TextAlignment.RIGHT));
            table.addCell(rowCell(fmtVnd(item.getLineTotal()), bold, bg, TextAlignment.RIGHT));
            idx++;
        }

        doc.add(table);
    }

    private Cell rowCell(String text, PdfFont font, Color bg, TextAlignment align) {
        return new Cell()
                .setBackgroundColor(bg)
                .setBorderLeft(Border.NO_BORDER)
                .setBorderRight(Border.NO_BORDER)
                .setBorderTop(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(BORDER_GRAY, 0.5f))
                .setPadding(8)
                .add(new Paragraph(text)
                        .setFont(font).setFontSize(10)
                        .setTextAlignment(align));
    }

    private void addTotals(Document doc, InvoiceResponse invoice,
            PdfFont bold, PdfFont regular) {
        float[] cols = { 150f, 120f };
        Table t = new Table(cols)
                .setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.RIGHT)
                .setMarginRight(30).setMarginTop(16).setMarginBottom(16);

        addTotalRow(t, "Tạm tính", fmtVnd(invoice.getSubtotal()),
                regular, DARK_NAVY, ColorConstants.WHITE);
        // VAT
        addTotalRow(t, "Thuế VAT (" + invoice.getTaxRate().stripTrailingZeros().toPlainString() + "%)",
                "+ " + fmtVnd(invoice.getTaxAmount()),
                regular, TEXT_MUTED, ColorConstants.WHITE);
        // Discount (conditional)
        if (invoice.getDiscountAmount() != null
                && invoice.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            addTotalRow(t, "Giảm giá",
                    "- " + fmtVnd(invoice.getDiscountAmount()),
                    regular, RED, ColorConstants.WHITE);
        }
        // Grand total
        addGrandTotal(t, "TỔNG CỘNG", fmtVnd(invoice.getTotalAmount()), bold);

        doc.add(t);
    }

    private void addTotalRow(Table t, String label, String value,
            PdfFont font, Color textColor, Color bg) {
        t.addCell(new Cell()
                .setBackgroundColor(bg)
                .setBorderLeft(Border.NO_BORDER).setBorderRight(Border.NO_BORDER)
                .setBorderTop(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(BORDER_GRAY, 0.5f))
                .setPaddingTop(7).setPaddingBottom(7)
                .add(new Paragraph(label).setFont(font).setFontSize(11).setFontColor(textColor)));
        t.addCell(new Cell()
                .setBackgroundColor(bg)
                .setBorderLeft(Border.NO_BORDER).setBorderRight(Border.NO_BORDER)
                .setBorderTop(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(BORDER_GRAY, 0.5f))
                .setPaddingTop(7).setPaddingBottom(7)
                .add(new Paragraph(value).setFont(font).setFontSize(11)
                        .setFontColor(textColor).setTextAlignment(TextAlignment.RIGHT)));
    }

    private void addGrandTotal(Table t, String label, String value, PdfFont bold) {
        t.addCell(new Cell()
                .setBackgroundColor(DARK_NAVY).setBorder(Border.NO_BORDER)
                .setPadding(10)
                .add(new Paragraph(label).setFont(bold).setFontSize(13).setFontColor(GOLD)));
        t.addCell(new Cell()
                .setBackgroundColor(DARK_NAVY).setBorder(Border.NO_BORDER)
                .setPadding(10)
                .add(new Paragraph(value).setFont(bold).setFontSize(13)
                        .setFontColor(GOLD).setTextAlignment(TextAlignment.RIGHT)));
    }

    /** Notes block */
    private void addNotes(Document doc, String notes, PdfFont bold, PdfFont regular) {
        if (notes == null || notes.isBlank())
            return;

        Table t = new Table(1)
                .setWidth(UnitValue.createPercentValue(88))
                .setMarginLeft(30).setMarginBottom(16);
        t.addCell(new Cell()
                .setBackgroundColor(new DeviceRgb(0xff, 0xfb, 0xf0))
                .setBorderLeft(new SolidBorder(GOLD, 2))
                .setBorderTop(new SolidBorder(BORDER_GRAY, 0.5f))
                .setBorderRight(new SolidBorder(BORDER_GRAY, 0.5f))
                .setBorderBottom(new SolidBorder(BORDER_GRAY, 0.5f))
                .setPadding(12)
                .add(new Paragraph("GHI CHÚ").setFont(bold).setFontSize(9).setFontColor(TEXT_MUTED))
                .add(new Paragraph(notes).setFont(regular).setFontSize(10).setFontColor(DARK_NAVY)));

        doc.add(t);
    }

    /** Footer */
    private void addFooter(Document doc, PdfFont bold, PdfFont regular) {
        doc.add(new Paragraph("\u0110\u00C3 THANH TO\u00C1N")
                .setFont(bold).setFontSize(13)
                .setFontColor(GREEN)
                .setBorder(new SolidBorder(GREEN, 1.5f))
                .setPadding(6)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginLeft(30).setMarginRight(30).setMarginBottom(8));

        doc.add(new Paragraph("Cảm ơn quý khách đã sử dụng dịch vụ!")
                .setFont(bold).setFontSize(12).setFontColor(DARK_NAVY)
                .setTextAlignment(TextAlignment.CENTER));

        doc.add(new Paragraph(
                "123 Đường Khách Sạn, Quận 1, TP. Hồ Chí Minh  |  Tel: (028) 1234-5678  |  Email: info@luxuryhotel.vn")
                .setFont(regular).setFontSize(9).setFontColor(TEXT_MUTED)
                .setTextAlignment(TextAlignment.CENTER));

        doc.add(new Paragraph("Hóa đơn được xuất tự động. Vui lòng liên hệ lễ tân nếu có thắc mắc.")
                .setFont(regular).setFontSize(9).setFontColor(TEXT_MUTED)
                .setTextAlignment(TextAlignment.CENTER));
    }

    // ── Helpers ───────────────────────────────────────────────

    private String fmtVnd(BigDecimal amount) {
        if (amount == null)
            return "0 d";
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.US);
        symbols.setGroupingSeparator(',');
        DecimalFormat df = new DecimalFormat("#,###", symbols);
        return df.format(amount) + " d";
    }
}
