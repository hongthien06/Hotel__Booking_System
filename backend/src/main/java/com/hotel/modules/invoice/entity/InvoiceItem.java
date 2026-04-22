package com.hotel.modules.invoice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "InvoiceItems")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long id;

    @Column(name = "invoice_id", nullable = false)
    private Long invoiceId;

    @Column(name = "item_type", length = 20, nullable = false)
    private String itemType;

    @Column(name = "description", length = 255, nullable = false)
    private String description;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Short quantity = 1;

    @Column(name = "unit_price", precision = 18, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "line_total", precision = 18, scale = 2, insertable = false, updatable = false)
    private BigDecimal lineTotal;
}
