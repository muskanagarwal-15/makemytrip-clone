package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

@Document(collection = "price_freezes")
public class PriceFreeze {

    public enum Status { ACTIVE, USED, EXPIRED }

    @Id
    private String id;

    @Indexed
    private String userId;

    private String resourceId;      // flightId or hotelId
    private String resourceType;    // "FLIGHT" or "HOTEL"
    private double frozenPrice;     // price locked in at freeze time
    private double multiplierAtFreeze;
    private long   createdAt;
    private long   expiresAt;       // createdAt + 30 minutes (configurable)
    private Status status = Status.ACTIVE;

    public PriceFreeze() {}

    public PriceFreeze(String userId, String resourceId, String resourceType,
                       double frozenPrice, double multiplierAtFreeze, long ttlMs) {
        this.userId             = userId;
        this.resourceId         = resourceId;
        this.resourceType       = resourceType;
        this.frozenPrice        = frozenPrice;
        this.multiplierAtFreeze = multiplierAtFreeze;
        this.createdAt          = System.currentTimeMillis();
        this.expiresAt          = this.createdAt + ttlMs;
        this.status             = Status.ACTIVE;
    }

    // Getters & Setters
    public String getId()                         { return id; }
    public void   setId(String id)                { this.id = id; }

    public String getUserId()                     { return userId; }
    public void   setUserId(String userId)        { this.userId = userId; }

    public String getResourceId()                 { return resourceId; }
    public void   setResourceId(String v)         { this.resourceId = v; }

    public String getResourceType()               { return resourceType; }
    public void   setResourceType(String v)       { this.resourceType = v; }

    public double getFrozenPrice()                { return frozenPrice; }
    public void   setFrozenPrice(double v)        { this.frozenPrice = v; }

    public double getMultiplierAtFreeze()         { return multiplierAtFreeze; }
    public void   setMultiplierAtFreeze(double v) { this.multiplierAtFreeze = v; }

    public long   getCreatedAt()                  { return createdAt; }
    public void   setCreatedAt(long v)            { this.createdAt = v; }

    public long   getExpiresAt()                  { return expiresAt; }
    public void   setExpiresAt(long v)            { this.expiresAt = v; }

    public Status getStatus()                     { return status; }
    public void   setStatus(Status status)        { this.status = status; }

    public boolean isExpired() {
        return System.currentTimeMillis() > this.expiresAt;
    }
}
