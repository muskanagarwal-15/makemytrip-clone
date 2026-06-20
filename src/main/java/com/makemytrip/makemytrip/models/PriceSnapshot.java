package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

@Document(collection = "price_snapshots")
public class PriceSnapshot {
    @Id
    private String id;

    @Indexed
    private String resourceId;   // flightId or hotelId

    private String resourceType; // "FLIGHT" or "HOTEL"
    private double price;
    private double multiplier;
    private String reason;       // e.g. "PEAK_DEMAND", "HOLIDAY", "LOW_DEMAND"
    private long timestamp;

    public PriceSnapshot() {}

    public PriceSnapshot(String resourceId, String resourceType,
                         double price, double multiplier, String reason) {
        this.resourceId   = resourceId;
        this.resourceType = resourceType;
        this.price        = price;
        this.multiplier   = multiplier;
        this.reason       = reason;
        this.timestamp    = System.currentTimeMillis();
    }

    public String getId()           { return id; }
    public String getResourceId()   { return resourceId; }
    public String getResourceType() { return resourceType; }
    public double getPrice()        { return price; }
    public double getMultiplier()   { return multiplier; }
    public String getReason()       { return reason; }
    public long   getTimestamp()    { return timestamp; }

    public void setId(String id)                   { this.id = id; }
    public void setResourceId(String resourceId)   { this.resourceId = resourceId; }
    public void setResourceType(String t)          { this.resourceType = t; }
    public void setPrice(double price)             { this.price = price; }
    public void setMultiplier(double multiplier)   { this.multiplier = multiplier; }
    public void setReason(String reason)           { this.reason = reason; }
    public void setTimestamp(long timestamp)       { this.timestamp = timestamp; }
}
