package com.makemytrip.makemytrip.models;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;

@Document(collection = "hotels")
public class Hotel {
    @Id
    @JsonProperty("_id")
    private String id;
    private String hotelName;
    private String location;
    private double pricePerNight;
    private int availableRooms;
    private String amenities;
    private double basePricePerNight;
    private double currentPricePerNight;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setamenities(String amenities) {
        this.amenities = amenities;
    }

    public String getamenities() {
        return amenities;
    }

    public String gethotelName() {
        return hotelName;
    }

    public void sethotelName(String hotelName) {
        this.hotelName = hotelName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public int getAvailableRooms() {
        return availableRooms;
    }

    public void setAvailableRooms(int availableRooms) {
        this.availableRooms = availableRooms;
    }

    public double getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(double pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public double getBasePricePerNight() { return basePricePerNight; }
    public void setBasePricePerNight(double v) { this.basePricePerNight = v; }

    public double getCurrentPricePerNight() { return currentPricePerNight; }
    public void setCurrentPricePerNight(double v) {
        this.currentPricePerNight = v;
        this.pricePerNight = v;
    }
}