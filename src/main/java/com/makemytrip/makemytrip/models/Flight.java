package com.makemytrip.makemytrip.models;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;

@Document(collection = "flight")
public class Flight {
    @Id
    @JsonProperty("_id")
    private String id;
    private String flightName;
    private String from;
    private String to;
    private String departureTime;
    private String arrivalTime;
    private double price;
    private int availableSeats;
    private String status = "ON_TIME";     // ON_TIME|DELAYED|BOARDING|DEPARTED|LANDED|CANCELLED|GATE_CHANGED
    private String statusReason;           // e.g. "Air traffic congestion"
    private String estimatedDeparture;     // ISO string, filled in when delayed
    private String estimatedArrival;       // ISO string, filled in when delayed
    private int    delayMinutes = 0;
    private long   lastUpdated  = System.currentTimeMillis();
    private String gate;
    private boolean adminLocked = false;


    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFlightName() {
        return flightName;
    }

    public void setFlightName(String flightName) {
        this.flightName = flightName;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(String departureTime) {
        this.departureTime = departureTime;
    }

    public String getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(String arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(int availableSeats) {
        this.availableSeats = availableSeats;
    }

    public String getStatus()                  { return status; }
    public void   setStatus(String v)          { this.status = v; }

    public String getStatusReason()            { return statusReason; }
    public void   setStatusReason(String v)    { this.statusReason = v; }

    public String getEstimatedDeparture()      { return estimatedDeparture; }
    public void   setEstimatedDeparture(String v) { this.estimatedDeparture = v; }

    public String getEstimatedArrival()        { return estimatedArrival; }
    public void   setEstimatedArrival(String v){ this.estimatedArrival = v; }

    public int    getDelayMinutes()            { return delayMinutes; }
    public void   setDelayMinutes(int v)       { this.delayMinutes = v; }

    public long   getLastUpdated()             { return lastUpdated; }
    public void   setLastUpdated(long v)       { this.lastUpdated = v; }

    public String getGate()         { return gate; }
    public void   setGate(String v) { this.gate = v; }

    public boolean isAdminLocked() { return adminLocked; }
    public void setAdminLocked(boolean adminLocked) { this.adminLocked = adminLocked; }
}