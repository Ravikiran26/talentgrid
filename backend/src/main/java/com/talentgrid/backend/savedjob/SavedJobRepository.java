package com.talentgrid.backend.savedjob;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    List<SavedJob> findByUserIdOrderBySavedAtDesc(Long userId);
    Optional<SavedJob> findByUserIdAndJobId(Long userId, Long jobId);
    boolean existsByUserIdAndJobId(Long userId, Long jobId);

    @Query("select s.job.id from SavedJob s where s.user.id = :userId order by s.savedAt desc")
    List<Long> findJobIdsByUserId(@Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("delete from SavedJob s where s.user.id = :userId")
    int deleteByUserId(@Param("userId") Long userId);
}
