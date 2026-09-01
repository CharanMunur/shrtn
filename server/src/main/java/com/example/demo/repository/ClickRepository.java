package com.example.demo.repository;

import com.example.demo.model.Click;
import com.example.demo.model.Url;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClickRepository extends JpaRepository<Click, Long> {
    List<Click> findByUrl(Url url);
    long countByUrl(Url url);
    long countByUrlId(Long urlId);
    @Modifying
    void deleteByUrl(Url url);
    @Query("SELECT c.url.id, COUNT(c) FROM Click c WHERE c.url IN :urls GROUP BY c.url.id")
    List<Object[]> countClicksGroupedByUrl(@Param("urls") List<Url> urls);
}
