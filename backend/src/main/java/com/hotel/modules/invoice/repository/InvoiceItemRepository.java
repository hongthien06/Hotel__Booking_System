package com.hotel.modules.invoice.repository;

import com.hotel.modules.invoice.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {

    List<InvoiceItem> findByInvoice_Id(Long invoiceId);

    void deleteByInvoice_Id(Long invoiceId);
}
