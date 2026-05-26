package com.hotel.modules.membership.repository;

import com.hotel.modules.membership.entity.CustomerMembership;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CustomerMembershipRepository extends JpaRepository<CustomerMembership, Long> {

    Optional<CustomerMembership> findByUser_UserId(Long userId);

    @Query("SELECT cm FROM CustomerMembership cm " +
           "JOIN FETCH cm.user u " +
           "JOIN FETCH cm.tier t")
    Page<CustomerMembership> findAllWithDetails(Pageable pageable);
}
