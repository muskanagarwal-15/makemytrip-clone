package com.makemytrip.makemytrip.controllers;

import com.makemytrip.makemytrip.models.PriceFreeze;
import com.makemytrip.makemytrip.models.PriceSnapshot;
import com.makemytrip.makemytrip.services.PricingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/pricing")
@CrossOrigin(origins = "*")
public class PricingController {

    @Autowired
    private PricingService pricingService;

    // ── Price History ─────────────────────────────────────────────────────────

    @GetMapping("/history/{resourceId}")
    public ResponseEntity<List<PriceSnapshot>> getHistory(@PathVariable String resourceId) {
        return ResponseEntity.ok(pricingService.getHistory(resourceId));
    }

    @GetMapping("/history/{resourceId}/since")
    public ResponseEntity<List<PriceSnapshot>> getHistorySince(
            @PathVariable String resourceId, @RequestParam long since) {
        return ResponseEntity.ok(pricingService.getRecentHistory(resourceId, since));
    }

    @PostMapping("/recalculate")
    public ResponseEntity<?> triggerRecalculation(
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (!"ADMIN".equalsIgnoreCase(role))
            return ResponseEntity.status(403).body(Map.of("error", "ADMIN only"));
        pricingService.recalculateAll();
        return ResponseEntity.ok(Map.of("status", "recalculated"));
    }

    // ── Price Freeze ──────────────────────────────────────────────────────────

    @PostMapping("/freeze/flight")
    public ResponseEntity<?> freezeFlight(@RequestBody Map<String, String> body) {
        String userId = body.get("userId"), flightId = body.get("flightId");
        if (userId == null || flightId == null)
            return ResponseEntity.badRequest().body("userId and flightId required");
        try {
            return ResponseEntity.ok(pricingService.freezeFlightPrice(userId, flightId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/freeze/hotel")
    public ResponseEntity<?> freezeHotel(@RequestBody Map<String, String> body) {
        String userId = body.get("userId"), hotelId = body.get("hotelId");
        if (userId == null || hotelId == null)
            return ResponseEntity.badRequest().body("userId and hotelId required");
        try {
            return ResponseEntity.ok(pricingService.freezeHotelPrice(userId, hotelId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @GetMapping("/freeze/active")
    public ResponseEntity<?> getActiveFreeze(
            @RequestParam String userId, @RequestParam String resourceId) {
        Optional<PriceFreeze> freeze = pricingService.getActiveFreeze(userId, resourceId);
        return freeze.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(Map.of("active", false)));
    }

    @GetMapping("/freeze/user/{userId}")
    public ResponseEntity<List<PriceFreeze>> getUserFreezes(@PathVariable String userId) {
        return ResponseEntity.ok(pricingService.getUserFreezes(userId));
    }
}