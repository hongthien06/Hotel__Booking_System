package com.hotel.modules.invoice.service;

import com.hotel.modules.booking.dto.BookingDTO;
import com.hotel.modules.booking.repository.BookingRepository;
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
import jakarta.transaction.Transactional;
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
public class PdfService implements IPdfService {
    private static final DateTimeFormatter DATE_ONLY = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    private final IInvoiceService invoiceService;
    private final BookingRepository bookingRepo;

    @Transactional
    public byte[] generateInvoicePdf(Long invoiceId) {
        InvoiceResponse invoice = invoiceService.getInvoiceById(invoiceId);

        var booking = bookingRepo.findById(invoice.getBookingId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy booking #" + invoice.getBookingId()));

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

    @Transactional
    private byte[] buildPdf(InvoiceResponse invoice, BookingDTO booking) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf, PageSize.A4);
            doc.setMargins(40, 40, 40, 40);

            PdfFont regular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

            addHeader(doc, invoice, bold, regular);
            addAddresses(doc, booking, bold, regular);
            addAmountDue(doc, invoice, bold, regular);
            addItemsTable(doc, invoice, bold, regular);
            addTotals(doc, invoice, bold, regular);

            doc.close();
            return baos.toByteArray();
        } catch (IOException e) {
            log.error("Lỗi xuất PDF: {}", e.getMessage());
            throw new RuntimeException("Không thể tạo file PDF: " + e.getMessage(), e);
        }
    }

    private void addHeader(Document doc, InvoiceResponse invoice, PdfFont bold, PdfFont regular) {
        Table headerTable = new Table(new float[] { 1, 1 }).setWidth(UnitValue.createPercentValue(100));
        Cell titleCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.LEFT);
        titleCell.add(new Paragraph("Invoice").setFont(bold).setFontSize(28));
        headerTable.addCell(titleCell);

        Cell logoCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT)
                .setVerticalAlignment(VerticalAlignment.MIDDLE);
        logoCell.add(new Paragraph("AI").setFont(bold).setFontSize(40));
        headerTable.addCell(logoCell);
        doc.add(headerTable);

        doc.add(new Paragraph("\n").setFontSize(10));

        Table metaTable = new Table(new float[] { 100f, 250f }).setTextAlignment(TextAlignment.LEFT);
        String issueDate = invoice.getIssuedAt() != null ? invoice.getIssuedAt().format(DATE_ONLY) : "-";
        addMetaRow(metaTable, "Invoice number", invoice.getInvoiceNumber(), bold, regular);
        addMetaRow(metaTable, "Date of issue", issueDate, regular, regular);
        addMetaRow(metaTable, "Date due", issueDate, regular, regular);
        addMetaRow(metaTable, "VAT Registration", "Vietnam VAT: 9000020034", regular, regular);

        doc.add(metaTable);
        doc.add(new Paragraph("\n").setFontSize(10));
    }

    private void addMetaRow(Table t, String label, String value, PdfFont valueFont, PdfFont labelFont) {
        t.addCell(new Cell().setBorder(Border.NO_BORDER).setPadding(2)
                .add(new Paragraph(label).setFont(labelFont).setFontSize(10).setFontColor(new DeviceRgb(50, 50, 50))));
        t.addCell(new Cell().setBorder(Border.NO_BORDER).setPadding(2)
                .add(new Paragraph(value).setFont(valueFont).setFontSize(10)));
    }

    private void addAddresses(Document doc, BookingDTO booking, PdfFont bold, PdfFont regular) {
        Table t = new Table(new float[] { 1, 1 }).setWidth(UnitValue.createPercentValue(100));

        Cell left = new Cell().setBorder(Border.NO_BORDER).setPaddingRight(20);
        left.add(new Paragraph("Anthropic, PBC").setFont(bold).setFontSize(10));
        left.add(new Paragraph(
                "548 Market Street\nPMB 90375\nSan Francisco, California 94104\nUnited States\nsupport@anthropic.com")
                .setFont(regular).setFontSize(10));
        t.addCell(left);

        Cell right = new Cell().setBorder(Border.NO_BORDER);
        right.add(new Paragraph("Bill to").setFont(bold).setFontSize(10));
        String name = booking.getUserName() != null ? booking.getUserName() : "Khách hàng";
        String email = booking.getUserEmail() != null ? booking.getUserEmail() : "";
        right.add(new Paragraph(name + "\n" + email).setFont(regular).setFontSize(10));
        t.addCell(right);

        doc.add(t);
        doc.add(new Paragraph("\n").setFontSize(10));
    }

    private void addAmountDue(Document doc, InvoiceResponse invoice, PdfFont bold, PdfFont regular) {
        String issueDate = invoice.getIssuedAt() != null ? invoice.getIssuedAt().format(DATE_ONLY) : "-";
        Paragraph p = new Paragraph(fmtVnd(invoice.getTotalAmount()) + " VND due " + issueDate)
                .setFont(bold).setFontSize(16);
        doc.add(p);

        Paragraph link = new Paragraph("Pay online")
                .setFont(bold).setFontSize(10).setFontColor(new DeviceRgb(0, 0, 255)).setUnderline();
        doc.add(link);

        doc.add(new Paragraph("\n").setFontSize(10));

        doc.add(new Paragraph(
                "While we prefer electronic payment methods,\nany checks must be sent to the address below, NOT to our San Francisco office.")
                .setFont(regular).setFontSize(10));
        doc.add(new Paragraph("--------------------------------------------------")
                .setFont(regular).setFontSize(10));
        doc.add(new Paragraph("PAYMENT ADDRESS:\nAnthropic, PBC\nP.O. Box 104477\nPasadena, CA 91189-4477")
                .setFont(regular).setFontSize(10));

        doc.add(new Paragraph("\n").setFontSize(10));
    }

    private void addItemsTable(Document doc, InvoiceResponse invoice, PdfFont bold, PdfFont regular) {
        float[] colWidths = { 200f, 40f, 80f, 60f, 80f };
        Table table = new Table(colWidths).setWidth(UnitValue.createPercentValue(100));

        String[] headers = { "Description", "Qty", "Unit price", "Tax", "Amount" };
        TextAlignment[] aligns = { TextAlignment.LEFT, TextAlignment.RIGHT, TextAlignment.RIGHT, TextAlignment.RIGHT,
                TextAlignment.RIGHT };

        for (int i = 0; i < headers.length; i++) {
            table.addHeaderCell(new Cell().setBorder(Border.NO_BORDER)
                    .setBorderBottom(new SolidBorder(ColorConstants.BLACK, 1f))
                    .setPaddingTop(5).setPaddingBottom(5)
                    .add(new Paragraph(headers[i]).setFont(regular).setFontSize(9).setTextAlignment(aligns[i])));
        }

        for (InvoiceItemResponse item : invoice.getItems()) {
            table.addCell(itemCell(item.getDescription(), regular, TextAlignment.LEFT));
            table.addCell(itemCell(String.valueOf(item.getQuantity()), regular, TextAlignment.RIGHT));
            table.addCell(itemCell(fmtVnd(item.getUnitPrice()), regular, TextAlignment.RIGHT));
            table.addCell(itemCell(invoice.getTaxRate().stripTrailingZeros().toPlainString() + "%", regular,
                    TextAlignment.RIGHT));
            table.addCell(itemCell(fmtVnd(item.getLineTotal()), regular, TextAlignment.RIGHT));
        }

        doc.add(table);
    }

    private Cell itemCell(String text, PdfFont font, TextAlignment align) {
        return new Cell().setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(new DeviceRgb(230, 230, 230), 0.5f))
                .setPaddingTop(8).setPaddingBottom(8)
                .add(new Paragraph(text).setFont(font).setFontSize(10).setTextAlignment(align));
    }

    private void addTotals(Document doc, InvoiceResponse invoice, PdfFont bold, PdfFont regular) {
        Table t = new Table(new float[] { 300f, 160f })
                .setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.RIGHT)
                .setMarginTop(10);

        addTotalRow(t, "Subtotal", fmtVnd(invoice.getSubtotal()), regular, regular);
        addTotalRow(t, "Total excluding tax", fmtVnd(invoice.getSubtotal()), regular, regular);
        addTotalRow(t, "VAT - Vietnam (" + invoice.getTaxRate().stripTrailingZeros().toPlainString() + "% on "
                + fmtVnd(invoice.getSubtotal()) + ")", fmtVnd(invoice.getTaxAmount()), regular, regular);

        if (invoice.getDiscountAmount() != null && invoice.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            addTotalRow(t, "Discount", "-" + fmtVnd(invoice.getDiscountAmount()), regular, regular);
        }

        addTotalRow(t, "Total", fmtVnd(invoice.getTotalAmount()), regular, regular);

        t.addCell(new Cell().setBorder(Border.NO_BORDER).setPaddingTop(5).setPaddingBottom(5)
                .add(new Paragraph("Amount due").setFont(bold).setFontSize(10)));
        t.addCell(new Cell().setBorder(Border.NO_BORDER).setPaddingTop(5).setPaddingBottom(5)
                .add(new Paragraph(fmtVnd(invoice.getTotalAmount()) + " VND").setFont(bold).setFontSize(10)
                        .setTextAlignment(TextAlignment.RIGHT)));

        doc.add(t);
    }

    private void addTotalRow(Table t, String label, String value, PdfFont fontLabel, PdfFont fontValue) {
        t.addCell(new Cell().setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(new DeviceRgb(230, 230, 230), 0.5f))
                .setPaddingTop(5).setPaddingBottom(5)
                .add(new Paragraph(label).setFont(fontLabel).setFontSize(10).setFontColor(new DeviceRgb(80, 80, 80))));
        t.addCell(new Cell().setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(new DeviceRgb(230, 230, 230), 0.5f))
                .setPaddingTop(5).setPaddingBottom(5)
                .add(new Paragraph(value).setFont(fontValue).setFontSize(10).setTextAlignment(TextAlignment.RIGHT)));
    }

    private String fmtVnd(BigDecimal amount) {
        if (amount == null)
            return "0.00";
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.US);
        symbols.setGroupingSeparator(',');
        DecimalFormat df = new DecimalFormat("#,###.00", symbols);
        return df.format(amount);
    }
}
