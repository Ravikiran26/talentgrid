package com.talentgrid.backend.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>,
        org.springframework.data.jpa.repository.JpaSpecificationExecutor<User> {
    long countByRoleAndStatus(Role role, CandidateStatus status);
    long countByRole(Role role);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Page<User> findAllByRole(Role role, Pageable pageable);
}
