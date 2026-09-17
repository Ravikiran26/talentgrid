package com.talentgrid.backend.application;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationStatusHistoryRepository extends JpaRepository<ApplicationStatusHistory, Long> {

    List<ApplicationStatusHistory> findByApplicationIdOrderByChangedAtAsc(Long applicationId);

    @Modifying
    @Query("delete from ApplicationStatusHistory h where h.application.id in "
         + "(select a.id from Application a where a.user.id = :userId)")
    int deleteByUserId(@Param("userId") Long userId);
}
