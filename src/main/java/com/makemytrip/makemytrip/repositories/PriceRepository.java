package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.PriceSnapshot;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PriceRepository extends MongoRepository<PriceSnapshot, String> {
    List<PriceSnapshot> findByResourceIdOrderByTimestampAsc(String resourceId);
    List<PriceSnapshot> findByResourceIdAndTimestampGreaterThanOrderByTimestampAsc(
            String resourceId, long since
    );
}