package com.makemytrip.makemytrip.controllers;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.repositories.UserRepository;
import com.makemytrip.makemytrip.services.FlightStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/flight-status")
@CrossOrigin(origins = "*")
public class FlightStatusController {

    @Autowired
    private FlightStatusService flightStatusService;

    @Autowired
    private UserRepository userRepository;

    // ── GET /flight-status/{id}
    // Returns current status snapshot for a single flight
    @GetMapping("/{id}")
    public ResponseEntity<?> getStatus(@PathVariable String id) {
        Optional<Flight> flight = flightStatusService.getFlightStatus(id);
        if (flight.isPresent()) return ResponseEntity.ok(flight.get());
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<Flight>> getBulkStatus(@RequestBody Map<String, List<String>> body) {
        List<String> ids = body.get("flightIds");
        if (ids == null || ids.isEmpty()) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(flightStatusService.getMultipleFlightStatuses(ids));
    }

    @PostMapping("/track")
    public ResponseEntity<?> trackFlight(@RequestBody Map<String, String> body) {
        String userId   = body.get("userId");
        String flightId = body.get("flightId");
        if (userId == null || flightId == null) return ResponseEntity.badRequest().build();

        Optional<Users> opt = userRepository.findById(userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Users user = opt.get();
        if (!user.getTrackedFlights().contains(flightId)) {
            user.getTrackedFlights().add(flightId);
            userRepository.save(user);
        }
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/track")
    public ResponseEntity<?> untrackFlight(@RequestBody Map<String, String> body) {
        String userId   = body.get("userId");
        String flightId = body.get("flightId");
        if (userId == null || flightId == null) return ResponseEntity.badRequest().build();

        Optional<Users> opt = userRepository.findById(userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Users user = opt.get();
        user.getTrackedFlights().remove(flightId);
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/tracked/{userId}")
    public ResponseEntity<?> getTrackedFlights(@PathVariable String userId) {
        Optional<Users> opt = userRepository.findById(userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        List<String> ids = opt.get().getTrackedFlights();
        List<Flight> flights = flightStatusService.getMultipleFlightStatuses(ids);
        return ResponseEntity.ok(Map.of(
                "trackedIds", ids,
                "flights",    flights
        ));
    }

    @GetMapping("/booked/{userId}")
    public ResponseEntity<?> getBookedFlightStatuses(@PathVariable String userId) {
        Optional<Users> opt = userRepository.findById(userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Users user = opt.get();

        List<String> ids = user.getBookings().stream()
                .filter(b -> "Flight".equalsIgnoreCase(b.getType()))
                .map(b -> b.getResourceId() != null ? b.getResourceId() : b.getBookingId())
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .collect(Collectors.toList());

        List<Flight> flights = flightStatusService.getMultipleFlightStatuses(ids);

        return ResponseEntity.ok(Map.of(
                "bookedIds", ids,
                "flights", flights
        ));
    }
}
