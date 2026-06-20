package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.PriceFreeze;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PriceFreezeRepository extends MongoRepository<PriceFreeze, String> {

    // All active freezes for a user on a specific resource
    Optional<PriceFreeze> findByUserIdAndResourceIdAndStatus(
            String userId, String resourceId, PriceFreeze.Status status
    );

    // All freezes for a user (for profile display)
    List<PriceFreeze> findByUserIdOrderByCreatedAtDesc(String userId);

    // All still-ACTIVE freezes (for expiry scheduler)
    List<PriceFreeze> findByStatus(PriceFreeze.Status status);
}
