package com.hotel.modules.invoice.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.hotel.modules.booking.dto.BookingDTO;
import com.hotel.modules.booking.repository.BookingRepository;
import com.hotel.modules.invoice.dto.response.InvoiceItemResponse;
import com.hotel.modules.invoice.dto.response.InvoiceResponse;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.font.PdfFontFactory.EmbeddingStrategy;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PdfService implements IPdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DeviceRgb COLOR_PRIMARY  = new DeviceRgb(26, 26, 46);
    private static final DeviceRgb COLOR_WHITE    = new DeviceRgb(255, 255, 255);
    private static final DeviceRgb COLOR_MUTED    = new DeviceRgb(100, 116, 139);
    private static final DeviceRgb COLOR_DIVIDER  = new DeviceRgb(226, 232, 240);
    private static final DeviceRgb COLOR_SUCCESS  = new DeviceRgb(22, 163, 74);
    private static final DeviceRgb COLOR_PINK     = new DeviceRgb(251, 207, 232);

    private final IInvoiceService invoiceService;
    private final BookingRepository bookingRepo;

    @Transactional
    public byte[] generateInvoicePdf(Long invoiceId) {
        InvoiceResponse invoice = invoiceService.getInvoiceById(invoiceId);

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
            dto.setUserPhone(booking.getUser().getPhone());
        }
        if (booking.getRoom() != null) {
            dto.setRoomNumber(booking.getRoom().getRoomNumber());
            dto.setHotelName(booking.getRoom().getHotel().getHotelName());
            dto.setHotelAddress(booking.getRoom().getHotel().getAddress());
            if (booking.getRoom().getRoomType() != null) {
                dto.setRoomTypeName(booking.getRoom().getRoomType().getTypeName());
            }
        }

        return buildPdf(invoice, dto);
    }

    private byte[] buildPdf(InvoiceResponse invoice, BookingDTO booking) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfFont regular = loadFont("fonts/Roboto-Regular.ttf");
            PdfFont bold    = loadFont("fonts/Roboto-Bold.ttf");

            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf  = new PdfDocument(writer);
            Document doc     = new Document(pdf, PageSize.A4);
            doc.setMargins(40, 40, 40, 40);

            addHeader(doc, invoice, booking, bold, regular);
            addParties(doc, invoice, booking, bold, regular);
            addItemsTable(doc, invoice, bold, regular);
            addTotals(doc, invoice, bold, regular);
            addFooter(doc, regular);

            doc.close();
            return baos.toByteArray();
        } catch (IOException e) {
            log.error("Lỗi xuất PDF: {}", e.getMessage());
            throw new RuntimeException("Không thể tạo file PDF: " + e.getMessage(), e);
        }
    }

    // ─── HEADER ──────────────────────────────────────────────────────────────

    private void addHeader(Document doc, InvoiceResponse invoice, BookingDTO booking,
                           PdfFont bold, PdfFont regular) {
        // Dải màu đầu trang
        Table banner = new Table(new float[]{1}).setWidth(UnitValue.createPercentValue(100));
        Cell bannerCell = new Cell().setBackgroundColor(COLOR_PRIMARY)
                .setBorder(Border.NO_BORDER).setPadding(20);
        bannerCell.add(new Paragraph("HÓA ĐƠN THANH TOÁN").setFont(bold).setFontSize(22)
                .setFontColor(COLOR_WHITE).setTextAlignment(TextAlignment.CENTER));
        String hotelName = booking.getHotelName() != null ? booking.getHotelName() : "Khách sạn";
        bannerCell.add(new Paragraph(hotelName).setFont(regular).setFontSize(12)
                .setFontColor(new DeviceRgb(203, 213, 225)).setTextAlignment(TextAlignment.CENTER));
        banner.addCell(bannerCell);
        doc.add(banner);

        doc.add(new Paragraph(" ").setFontSize(8));

        // Số hóa đơn + ngày
        String issueDate = invoice.getIssuedAt() != null ? invoice.getIssuedAt().format(DATE_FMT) : "-";
        Table meta = new Table(new float[]{1, 1}).setWidth(UnitValue.createPercentValue(100));

        Cell left = new Cell().setBorder(Border.NO_BORDER);
        left.add(new Paragraph("Số hóa đơn").setFont(regular).setFontSize(9).setFontColor(COLOR_MUTED));
        left.add(new Paragraph(invoice.getInvoiceNumber()).setFont(bold).setFontSize(13));
        meta.addCell(left);

        Cell right = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
        right.add(new Paragraph("Ngày lập").setFont(regular).setFontSize(9).setFontColor(COLOR_MUTED)
                .setTextAlignment(TextAlignment.RIGHT));
        right.add(new Paragraph(issueDate).setFont(bold).setFontSize(13).setTextAlignment(TextAlignment.RIGHT));
        meta.addCell(right);

        doc.add(meta);
        doc.add(dividerLine());
    }

    // ─── BÊN PHÁT HÀNH + BÊN NHẬN ───────────────────────────────────────────

    private void addParties(Document doc, InvoiceResponse invoice, BookingDTO booking,
                            PdfFont bold, PdfFont regular) {
        Table t = new Table(new float[]{1, 1}).setWidth(UnitValue.createPercentValue(100));

        // Bên cung cấp (khách sạn)
        String hotelName    = booking.getHotelName()    != null ? booking.getHotelName()    : "Khách sạn";
        String hotelAddress = booking.getHotelAddress() != null ? booking.getHotelAddress() : "";
        Cell left = new Cell().setBorder(Border.NO_BORDER).setPaddingRight(16);
        left.add(new Paragraph("Bên cung cấp").setFont(bold).setFontSize(9).setFontColor(COLOR_MUTED));
        left.add(new Paragraph(hotelName).setFont(bold).setFontSize(11).setMarginTop(2));
        left.add(new Paragraph(hotelAddress).setFont(regular).setFontSize(10).setFontColor(COLOR_MUTED));
        t.addCell(left);

        // Khách hàng
        String name  = booking.getUserName()  != null ? booking.getUserName()  : "Khách hàng";
        String email = booking.getUserEmail() != null ? booking.getUserEmail() : "";
        String phone = booking.getUserPhone() != null ? booking.getUserPhone() : "";
        Cell right = new Cell().setBorder(Border.NO_BORDER);
        right.add(new Paragraph("Khách hàng").setFont(bold).setFontSize(9).setFontColor(COLOR_MUTED));
        right.add(new Paragraph(name).setFont(bold).setFontSize(11).setMarginTop(2));
        right.add(new Paragraph(email).setFont(regular).setFontSize(10).setFontColor(COLOR_MUTED));
        if (!phone.isBlank())
            right.add(new Paragraph(phone).setFont(regular).setFontSize(10).setFontColor(COLOR_MUTED));
        t.addCell(right);

        doc.add(t);

        // Thông tin phòng / ngày
        doc.add(new Paragraph(" ").setFontSize(6));
        Table booking_info = new Table(new float[]{1, 1, 1, 1}).setWidth(UnitValue.createPercentValue(100));
        String[] labels = {"Mã đặt phòng", "Ngày nhận phòng", "Ngày trả phòng", "Số đêm"};
        String[] values = {
            invoice.getBookingCode() != null ? invoice.getBookingCode() : "-",
            invoice.getCheckInDate()  != null ? invoice.getCheckInDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "-",
            invoice.getCheckOutDate() != null ? invoice.getCheckOutDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "-",
            invoice.getTotalNight()   != null ? invoice.getTotalNight() + " đêm" : "-"
        };
        for (int i = 0; i < labels.length; i++) {
            Cell c = new Cell().setBackgroundColor(new DeviceRgb(248, 250, 252))
                    .setBorder(Border.NO_BORDER)
                    .setBorderBottom(new SolidBorder(COLOR_DIVIDER, 1))
                    .setPadding(10);
            c.add(new Paragraph(labels[i]).setFont(regular).setFontSize(9).setFontColor(COLOR_MUTED));
            c.add(new Paragraph(values[i]).setFont(bold).setFontSize(11).setMarginTop(2));
            booking_info.addCell(c);
        }
        doc.add(booking_info);
        doc.add(new Paragraph(" ").setFontSize(6));
    }

    // ─── BẢNG CHI TIẾT ───────────────────────────────────────────────────────

    private void addItemsTable(Document doc, InvoiceResponse invoice,
                               PdfFont bold, PdfFont regular) {
        float[] widths = {240f, 40f, 90f, 50f, 90f};
        Table table = new Table(widths).setWidth(UnitValue.createPercentValue(100));

        String[] headers = {"Mô tả", "SL", "Đơn giá (đ)", "Thuế", "Thành tiền (đ)"};
        TextAlignment[] aligns = {
            TextAlignment.LEFT, TextAlignment.CENTER,
            TextAlignment.RIGHT, TextAlignment.CENTER, TextAlignment.RIGHT
        };

        for (int i = 0; i < headers.length; i++) {
            Cell h = new Cell().setBackgroundColor(COLOR_PRIMARY)
                    .setBorder(Border.NO_BORDER).setPaddingTop(8).setPaddingBottom(8)
                    .setPaddingLeft(i == 0 ? 10 : 6).setPaddingRight(6);
            h.add(new Paragraph(headers[i]).setFont(bold).setFontSize(9)
                    .setFontColor(COLOR_WHITE).setTextAlignment(aligns[i]));
            table.addHeaderCell(h);
        }

        boolean odd = false;
        for (InvoiceItemResponse item : invoice.getItems()) {
            DeviceRgb rowBg = odd ? new DeviceRgb(248, 250, 252) : COLOR_WHITE;
            odd = !odd;
            table.addCell(dataCell(item.getDescription(), regular, TextAlignment.LEFT, rowBg, true));
            table.addCell(dataCell(String.valueOf(item.getQuantity()), regular, TextAlignment.CENTER, rowBg, false));
            table.addCell(dataCell(fmtVnd(item.getUnitPrice()), regular, TextAlignment.RIGHT, rowBg, false));
            table.addCell(dataCell(invoice.getTaxRate().stripTrailingZeros().toPlainString() + "%",
                    regular, TextAlignment.CENTER, rowBg, false));
            table.addCell(dataCell(fmtVnd(item.getLineTotal()), regular, TextAlignment.RIGHT, rowBg, false));
        }

        doc.add(table);
        doc.add(new Paragraph(" ").setFontSize(4));
    }

    // ─── TỔNG KẾT ────────────────────────────────────────────────────────────

    private void addTotals(Document doc, InvoiceResponse invoice,
                           PdfFont bold, PdfFont regular) {
        Table t = new Table(new float[]{300f, 160f})
                .setHorizontalAlignment(HorizontalAlignment.RIGHT)
                .setMarginTop(4);

        addSumRow(t, "Tạm tính", fmtVnd(invoice.getSubtotal()) + " đ", regular, regular, false);
        addSumRow(t,
            "Thuế VAT (" + invoice.getTaxRate().stripTrailingZeros().toPlainString() + "%)",
            fmtVnd(invoice.getTaxAmount()) + " đ", regular, regular, false);

        if (invoice.getDiscountAmount() != null
                && invoice.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            String discLabel = invoice.getVoucherCode() != null
                    ? "Giảm giá (" + invoice.getVoucherCode() + ")"
                    : "Giảm giá";
            // dòng giảm giá màu xanh
            Cell lCell = new Cell().setBorder(Border.NO_BORDER)
                    .setBorderBottom(new SolidBorder(COLOR_DIVIDER, 0.5f))
                    .setPaddingTop(6).setPaddingBottom(6);
            lCell.add(new Paragraph(discLabel).setFont(regular).setFontSize(10)
                    .setFontColor(COLOR_SUCCESS));
            t.addCell(lCell);
            Cell vCell = new Cell().setBorder(Border.NO_BORDER)
                    .setBorderBottom(new SolidBorder(COLOR_DIVIDER, 0.5f))
                    .setPaddingTop(6).setPaddingBottom(6);
            vCell.add(new Paragraph("-" + fmtVnd(invoice.getDiscountAmount()) + " đ")
                    .setFont(bold).setFontSize(10)
                    .setFontColor(COLOR_SUCCESS).setTextAlignment(TextAlignment.RIGHT));
            t.addCell(vCell);
        }

        // Dòng tổng cuối (nền đậm)
        Cell totalLabel = new Cell().setBackgroundColor(COLOR_PRIMARY).setBorder(Border.NO_BORDER)
                .setPaddingTop(10).setPaddingBottom(10).setPaddingLeft(12);
        totalLabel.add(new Paragraph("TỔNG THANH TOÁN").setFont(bold).setFontSize(11)
                .setFontColor(COLOR_WHITE));
        t.addCell(totalLabel);

        Cell totalValue = new Cell().setBackgroundColor(COLOR_PRIMARY).setBorder(Border.NO_BORDER)
                .setPaddingTop(10).setPaddingBottom(10).setPaddingRight(12);
        totalValue.add(new Paragraph(fmtVnd(invoice.getTotalAmount()) + " đ")
                .setFont(bold).setFontSize(14)
                .setFontColor(COLOR_PINK)
                .setTextAlignment(TextAlignment.RIGHT));
        t.addCell(totalValue);

        doc.add(t);
    }

    // ─── FOOTER ──────────────────────────────────────────────────────────────

    private void addFooter(Document doc, PdfFont regular) {
        doc.add(new Paragraph(" ").setFontSize(10));
        doc.add(dividerLine());
        doc.add(new Paragraph(
                "Cảm ơn quý khách đã sử dụng dịch vụ. " +
                "Vui lòng mang theo CCCD/Hộ chiếu khi nhận phòng. " +
                "Mọi thắc mắc xin liên hệ hotline: 1800 6868.")
                .setFont(regular).setFontSize(9).setFontColor(COLOR_MUTED)
                .setTextAlignment(TextAlignment.CENTER));
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    private PdfFont loadFont(String classpathPath) throws IOException {
        try (InputStream is = new ClassPathResource(classpathPath).getInputStream()) {
            byte[] bytes = is.readAllBytes();
            return PdfFontFactory.createFont(bytes, PdfEncodings.IDENTITY_H, EmbeddingStrategy.PREFER_EMBEDDED);
        }
    }

    private Paragraph dividerLine() {
        return new Paragraph(" ")
                .setBorderBottom(new SolidBorder(COLOR_DIVIDER, 1))
                .setMarginBottom(10);
    }

    private Cell dataCell(String text, PdfFont font, TextAlignment align,
                          DeviceRgb bg, boolean leftPad) {
        return new Cell().setBackgroundColor(bg).setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(COLOR_DIVIDER, 0.5f))
                .setPaddingTop(8).setPaddingBottom(8)
                .setPaddingLeft(leftPad ? 10 : 6).setPaddingRight(6)
                .add(new Paragraph(text).setFont(font).setFontSize(10).setTextAlignment(align));
    }

    private void addSumRow(Table t, String label, String value,
                           PdfFont lFont, PdfFont vFont, boolean highlight) {
        Cell lc = new Cell().setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(COLOR_DIVIDER, 0.5f))
                .setPaddingTop(6).setPaddingBottom(6);
        lc.add(new Paragraph(label).setFont(lFont).setFontSize(10).setFontColor(COLOR_MUTED));
        t.addCell(lc);

        Cell vc = new Cell().setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(COLOR_DIVIDER, 0.5f))
                .setPaddingTop(6).setPaddingBottom(6);
        vc.add(new Paragraph(value).setFont(vFont).setFontSize(10).setTextAlignment(TextAlignment.RIGHT));
        t.addCell(vc);
    }

    private String fmtVnd(BigDecimal amount) {
        if (amount == null) return "0";
        DecimalFormatSymbols sym = new DecimalFormatSymbols(Locale.US);
        sym.setGroupingSeparator('.');
        return new DecimalFormat("#,###", sym).format(amount);
    }
}
