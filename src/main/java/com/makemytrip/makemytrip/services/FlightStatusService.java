package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class FlightStatusService {

    @Autowired
    private FlightRepository flightRepository;

    // ── Possible statuses and their realistic reasons ──────────────────────
    private static final String[] STATUSES = {
            "ON_TIME", "ON_TIME", "ON_TIME",   // weighted: more ON_TIME
            "DELAYED", "DELAYED",
            "BOARDING",
            "GATE_CHANGED",
            "DEPARTED",
            "LANDED",
            "CANCELLED"
    };

    private static final String[] GATES = {
            "A1","A4","A7","B2","B5","B9","C3","C6","C11","D1","D8","E2","E5"
    };

    private static final Map<String, String[]> DELAY_REASONS = new HashMap<>();
    static {
        DELAY_REASONS.put("DELAYED", new String[]{
                "Air traffic congestion at destination",
                "Late arriving aircraft",
                "Crew scheduling issue",
                "Weather conditions at origin",
                "Technical inspection required",
                "Baggage loading delay"
        });
        DELAY_REASONS.put("CANCELLED", new String[]{
                "Severe weather conditions",
                "Operational reasons",
                "Air traffic control restriction"
        });
        DELAY_REASONS.put("BOARDING", new String[]{
                "Now boarding — please proceed to gate",
        });
        DELAY_REASONS.put("ON_TIME",   new String[]{ "Flight is on schedule" });
        DELAY_REASONS.put("DEPARTED",  new String[]{ "Flight has departed" });
        DELAY_REASONS.put("LANDED",    new String[]{ "Flight has landed" });

        DELAY_REASONS.put("GATE_CHANGED", new String[]{
                "Gate reassigned due to aircraft swap",
                "Gate change due to operational requirements",
                "Previous gate unavailable — new gate assigned",
                "Gate change due to terminal congestion"
        });
    }

    // ── Run every 30 seconds ───────────────────────────────────────────────
    @Scheduled(fixedDelay = 30000)
    public void updateFlightStatuses() {
        List<Flight> flights = flightRepository.findAll();
        Random rng = new Random();

        for (Flight flight : flights) {
            // 40% chance to change this flight's status on each tick
            if (rng.nextDouble() > 0.40) continue;
            if (flight.isAdminLocked()) continue;

            String newStatus = STATUSES[rng.nextInt(STATUSES.length)];
            String[] reasons = DELAY_REASONS.getOrDefault(newStatus, new String[]{ "" });
            String reason    = reasons[rng.nextInt(reasons.length)];

            flight.setStatus(newStatus);
            flight.setStatusReason(reason);
            flight.setLastUpdated(System.currentTimeMillis());
            if ("GATE_CHANGED".equals(newStatus) || "BOARDING".equals(newStatus)) {
                flight.setGate(GATES[rng.nextInt(GATES.length)]);
            }

            // If delayed, compute estimated times
            if ("DELAYED".equals(newStatus)) {
                int delayMins = (rng.nextInt(6) + 1) * 15;   // 15–90 min in 15-min steps
                flight.setDelayMinutes(delayMins);
                flight.setEstimatedDeparture(shiftTimePublic(flight.getDepartureTime(), delayMins));
                flight.setEstimatedArrival(shiftTimePublic(flight.getArrivalTime(), delayMins));
            } else {
                flight.setDelayMinutes(0);
                flight.setEstimatedDeparture(flight.getDepartureTime());
                flight.setEstimatedArrival(flight.getArrivalTime());
            }

            flightRepository.save(flight);
        }
    }

    // ── Fetch status for a single flight ──────────────────────────────────
    public Optional<Flight> getFlightStatus(String flightId) {
        return flightRepository.findById(flightId);
    }

    // ── Fetch statuses for multiple flights ───────────────────────────────
    public List<Flight> getMultipleFlightStatuses(List<String> flightIds) {
        List<Flight> result = new ArrayList<>();
        for (String id : flightIds) {
            flightRepository.findById(id).ifPresent(result::add);
        }
        return result;
    }

    // ── Utility: add minutes to an ISO-8601 datetime string ───────────────
    public String shiftTimePublic(String isoTime, int minutes) {
        if (isoTime == null || isoTime.isBlank()) return isoTime;
        try {
            Instant base = Instant.parse(isoTime);
            return base.plus(minutes, ChronoUnit.MINUTES).toString();
        } catch (Exception e) {
            // If stored as "yyyy-MM-ddTHH:mm" (no Z), try appending Z
            try {
                Instant base = Instant.parse(isoTime + ":00Z");
                return base.plus(minutes, ChronoUnit.MINUTES).toString();
            } catch (Exception ex) {
                return isoTime;   // return unchanged on any parse failure
            }
        }
    }
}