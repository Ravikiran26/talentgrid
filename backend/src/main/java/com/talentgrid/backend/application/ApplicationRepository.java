package com.talentgrid.backend.application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Page<Application> findByUserId(Long userId, Pageable pageable);
    Page<Application> findByJobId(Long jobId, Pageable pageable);
    boolean existsByUserIdAndJobId(Long userId, Long jobId);
    long countByJobId(Long jobId);
    long countByUserIdAndAppliedAtGreaterThanEqual(Long userId, java.time.Instant since);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("delete from Application a where a.user.id = :userId")
    int deleteByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
}
