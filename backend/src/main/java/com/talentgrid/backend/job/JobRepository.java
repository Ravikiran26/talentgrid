package com.talentgrid.backend.job;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {
    Page<Job> findByPostedById(Long userId, Pageable pageable);

    long countByActiveTrue();
    long countByPostedById(Long userId);
    long countByPostedByIdAndActiveTrue(Long userId);
    @Query("select j from Job j where j.companyProfile.id = :companyId")
    java.util.List<Job> findByCompanyId(@Param("companyId") Long companyId);

    @Query("select j from Job j where j.companyProfile.id = :companyId and j.active = true order by j.postedAt desc")
    java.util.List<Job> findByCompanyIdAndActiveTrueOrderByPostedAtDesc(@Param("companyId") Long companyId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("update Job j set j.postedBy = null where j.postedBy.id = :userId")
    int detachPoster(@Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("update Job j set j.companyProfile = null where j.companyProfile.id in "
         + "(select c.id from Company c where c.owner.id = :userId)")
    int detachCompany(@Param("userId") Long userId);

    @Query("select count(distinct j.company) from Job j where j.active = true")
    long countDistinctCompanies();

    @Query("select count(distinct j.location) from Job j where j.active = true")
    long countDistinctLocations();

    @Query("select j.category, count(j) from Job j where j.active = true group by j.category order by count(j) desc")
    java.util.List<Object[]> countByCategory();

    @Query("select j.company, count(j) from Job j where j.active = true group by j.company order by count(j) desc")
    java.util.List<Object[]> countByCompany();

    @Query("select j.location, count(j) from Job j where j.active = true group by j.location order by count(j) desc")
    java.util.List<Object[]> countByLocation();

    @Query("select j.category, count(j) from Job j where j.active = true and j.postedAt >= :since group by j.category order by count(j) desc")
    java.util.List<Object[]> countByCategorySince(@Param("since") java.time.Instant since);
}
