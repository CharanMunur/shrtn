package com.example.demo.repository;

import com.example.demo.model.Url;
import com.example.demo.model.User;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UrlRepository extends JpaRepository<Url, Long> {
    Optional<Url> findByShortCode(String shortCode);
    List<Url> findByUser(User user);    
    Long countByUser(User user);
    @Query("SELECT u.id FROM Url u WHERE u.shortCode = :shortCode")
    Optional<Long> findIdByShortCode(@Param("shortCode") String shortCode);
    boolean existsByShortCode(String shortCode);
    
}
