package com.makemytrip.makemytrip.controllers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.repositories.UserRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.services.FlightStatusService;
import java.util.Map;
import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private FlightStatusService flightStatusService;

    @GetMapping("/users")
    public ResponseEntity<List<Users>> getallusers(){
        List<Users> users=userRepository.findAll();
        return ResponseEntity.ok(users);
    }
    @PostMapping("/flight")
    public Flight addflight(@RequestBody Flight flight){
        return flightRepository.save(flight);
    }

    @PostMapping("/hotel")
    public Hotel addhotel(@RequestBody Hotel hotel){
        return hotelRepository.save(hotel);
    }

    @PutMapping("/flight/status")
    public ResponseEntity<?> updateFlightStatus(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestBody Map<String, Object> body
    ) {
        if (userRole == null || !"ADMIN".equalsIgnoreCase(userRole)) {
            return ResponseEntity.status(403).body("Only ADMIN can update flight status");
        }

        String flightId = (String) body.get("flightId");
        if (flightId == null) return ResponseEntity.badRequest().build();

        Optional<Flight> opt = flightRepository.findById(flightId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Flight flight = opt.get();

        if (body.containsKey("status"))       flight.setStatus((String) body.get("status"));
        if (body.containsKey("statusReason")) flight.setStatusReason((String) body.get("statusReason"));
        if (body.containsKey("gate"))         flight.setGate((String) body.get("gate"));
        if (body.containsKey("delayMinutes")) flight.setDelayMinutes((Integer) body.get("delayMinutes"));

        if (body.containsKey("delayMinutes")) {
            int mins = (Integer) body.get("delayMinutes");
            flight.setEstimatedDeparture(flightStatusService.shiftTimePublic(flight.getDepartureTime(), mins));
            flight.setEstimatedArrival(flightStatusService.shiftTimePublic(flight.getArrivalTime(), mins));
        }

        flight.setLastUpdated(System.currentTimeMillis());
        flightRepository.save(flight);
        return ResponseEntity.ok(flight);
    }

    @PutMapping("/flight/{id}")
    public ResponseEntity<Flight> editflight(@PathVariable String id, @RequestBody Flight updatedFlight){
        Optional<Flight> flightOptional=flightRepository.findById(id);
        if(flightOptional.isPresent()){
            Flight flight = flightOptional.get();
            flight.setFlightName(updatedFlight.getFlightName());
            flight.setFrom(updatedFlight.getFrom());
            flight.setTo(updatedFlight.getTo());
            flight.setDepartureTime(updatedFlight.getDepartureTime());
            flight.setArrivalTime(updatedFlight.getArrivalTime());
            flight.setPrice(updatedFlight.getPrice());
            flight.setAvailableSeats(updatedFlight.getAvailableSeats());
            flightRepository.save(flight);
            return  ResponseEntity.ok(flight);
        }
        return ResponseEntity.notFound().build();
    }
    @PutMapping("/hotel/{id}")
    public ResponseEntity<Hotel> editHotel (@PathVariable String id, @RequestBody Hotel updatedHotel) {
        Optional<Hotel> hotelOptional = hotelRepository.findById(id);
        if (hotelOptional.isPresent()) {
            Hotel hotel = hotelOptional.get();
            hotel.sethotelName(updatedHotel.gethotelName());
            hotel.setLocation(updatedHotel.getLocation());
            hotel.setAvailableRooms(updatedHotel.getAvailableRooms());
            hotel.setPricePerNight(updatedHotel.getPricePerNight());
            hotel.setamenities((updatedHotel.getamenities()));
            hotelRepository.save(hotel);
            return ResponseEntity.ok(hotel);
        }
        return ResponseEntity.notFound().build();
    }
}