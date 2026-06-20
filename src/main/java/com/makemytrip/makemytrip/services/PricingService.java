package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.models.PriceFreeze;
import com.makemytrip.makemytrip.models.PriceSnapshot;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.repositories.PriceFreezeRepository;
import com.makemytrip.makemytrip.repositories.PriceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;
import java.util.Optional;

@Service
public class PricingService {

    private static final long FREEZE_TTL_MS = 30 * 60 * 1000L;

    @Autowired private FlightRepository        flightRepository;
    @Autowired private HotelRepository         hotelRepository;
    @Autowired private PriceRepository snapshotRepository;
    @Autowired private PriceFreezeRepository   freezeRepository;

    // ── Dynamic Pricing ──────────────────────────────────────────────────────

    public void recalculateAll() {
        recalculateFlights();
        recalculateHotels();
    }

    public double computeFlightMultiplier(Flight flight) {
        double m = seasonalFactor() * demandFactor(flight.getAvailableSeats(), 180);
        return Math.round(m * 100.0) / 100.0;
    }

    public double computeHotelMultiplier(Hotel hotel) {
        double m = seasonalFactor() * demandFactor(hotel.getAvailableRooms(), 50);
        return Math.round(m * 100.0) / 100.0;
    }

    public List<PriceSnapshot> getHistory(String resourceId) {
        return snapshotRepository.findByResourceIdOrderByTimestampAsc(resourceId);
    }

    public List<PriceSnapshot> getRecentHistory(String resourceId, long sinceMs) {
        return snapshotRepository
                .findByResourceIdAndTimestampGreaterThanOrderByTimestampAsc(resourceId, sinceMs);
    }

    @Scheduled(fixedDelay = 5 * 60 * 1000)
    public void scheduledRecalculation() {
        recalculateAll();
    }

    private void recalculateFlights() {
        for (Flight flight : flightRepository.findAll()) {
            if (flight.getBasePrice() == 0) flight.setBasePrice(flight.getPrice());
            double multiplier = computeFlightMultiplier(flight);
            double newPrice   = Math.round(flight.getBasePrice() * multiplier * 100.0) / 100.0;
            flight.setCurrentPrice(newPrice);
            flightRepository.save(flight);
            snapshotRepository.save(new PriceSnapshot(
                    flight.getId(), "FLIGHT", newPrice, multiplier, reasonLabel(multiplier)
            ));
        }
    }

    private void recalculateHotels() {
        for (Hotel hotel : hotelRepository.findAll()) {
            if (hotel.getBasePricePerNight() == 0) hotel.setBasePricePerNight(hotel.getPricePerNight());
            double multiplier = computeHotelMultiplier(hotel);
            double newPrice   = Math.round(hotel.getBasePricePerNight() * multiplier * 100.0) / 100.0;
            hotel.setCurrentPricePerNight(newPrice);
            hotelRepository.save(hotel);
            snapshotRepository.save(new PriceSnapshot(
                    hotel.getId(), "HOTEL", newPrice, multiplier, reasonLabel(multiplier)
            ));
        }
    }

    private double seasonalFactor() {
        return switch (LocalDate.now().getMonth()) {
            case MAY, JUNE, JULY, DECEMBER          -> 1.20;
            case OCTOBER, NOVEMBER                  -> 1.10;
            case AUGUST, SEPTEMBER, JANUARY         -> 0.90;
            default                                 -> 1.00;
        };
    }

    private double demandFactor(int remaining, int capacity) {
        double fillRate = 1.0 - ((double) remaining / capacity);
        if (fillRate > 0.90) return 1.30;
        if (fillRate > 0.75) return 1.20;
        if (fillRate > 0.50) return 1.10;
        if (fillRate < 0.20) return 0.90;
        return 1.00;
    }

    private String reasonLabel(double m) {
        if (m >= 1.20) return "HIGH_DEMAND";
        if (m >= 1.10) return "MODERATE_DEMAND";
        if (m <= 0.90) return "LOW_DEMAND";
        return "NORMAL";
    }

    // ── Price Freeze ─────────────────────────────────────────────────────────

    public PriceFreeze freezeFlightPrice(String userId, String flightId) {
        Optional<PriceFreeze> existing = freezeRepository
                .findByUserIdAndResourceIdAndStatus(userId, flightId, PriceFreeze.Status.ACTIVE);
        if (existing.isPresent() && !existing.get().isExpired()) return existing.get();

        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new RuntimeException("Flight not found: " + flightId));
        double price = flight.getCurrentPrice() > 0 ? flight.getCurrentPrice() : flight.getPrice();
        return freezeRepository.save(
                new PriceFreeze(userId, flightId, "FLIGHT", price,
                        computeFlightMultiplier(flight), FREEZE_TTL_MS)
        );
    }

    public PriceFreeze freezeHotelPrice(String userId, String hotelId) {
        Optional<PriceFreeze> existing = freezeRepository
                .findByUserIdAndResourceIdAndStatus(userId, hotelId, PriceFreeze.Status.ACTIVE);
        if (existing.isPresent() && !existing.get().isExpired()) return existing.get();

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found: " + hotelId));
        double price = hotel.getCurrentPricePerNight() > 0
                ? hotel.getCurrentPricePerNight() : hotel.getPricePerNight();
        return freezeRepository.save(
                new PriceFreeze(userId, hotelId, "HOTEL", price,
                        computeHotelMultiplier(hotel), FREEZE_TTL_MS)
        );
    }

    public Optional<PriceFreeze> getActiveFreeze(String userId, String resourceId) {
        Optional<PriceFreeze> opt = freezeRepository
                .findByUserIdAndResourceIdAndStatus(userId, resourceId, PriceFreeze.Status.ACTIVE);
        if (opt.isPresent() && opt.get().isExpired()) {
            PriceFreeze f = opt.get();
            f.setStatus(PriceFreeze.Status.EXPIRED);
            freezeRepository.save(f);
            return Optional.empty();
        }
        return opt;
    }

    public void consumeFreeze(String freezeId) {
        freezeRepository.findById(freezeId).ifPresent(f -> {
            f.setStatus(PriceFreeze.Status.USED);
            freezeRepository.save(f);
        });
    }

    public List<PriceFreeze> getUserFreezes(String userId) {
        return freezeRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Scheduled(fixedDelay = 5 * 60 * 1000)
    public void expireOldFreezes() {
        long now = System.currentTimeMillis();
        for (PriceFreeze f : freezeRepository.findByStatus(PriceFreeze.Status.ACTIVE)) {
            if (now > f.getExpiresAt()) {
                f.setStatus(PriceFreeze.Status.EXPIRED);
                freezeRepository.save(f);
            }
        }
    }
}
