package com.makemytrip.makemytrip.services;
import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.models.Users.Booking;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.repositories.UserRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.UUID;
import com.makemytrip.makemytrip.services.PricingService;
import com.makemytrip.makemytrip.models.PriceFreeze;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class BookingService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private PricingService pricingService;

    public Booking bookFlight(String userId,String flightId,int seats,double price){
        Optional<Users> usersOptional =userRepository.findById(userId);
        Optional<Flight> flightOptional =flightRepository.findById(flightId);
        if(usersOptional.isPresent() && flightOptional.isPresent()){
            Users user=usersOptional.get();
            Flight flight=flightOptional.get();
            if(flight.getAvailableSeats() >= seats){
                flight.setAvailableSeats(flight.getAvailableSeats()- seats);
                flightRepository.save(flight);

                Booking booking=new Booking();
                booking.setType("Flight");
                booking.setBookingId("BF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                booking.setResourceId(flightId);
                booking.setDate(LocalDate.now().toString());
                booking.setQuantity(seats);
                Optional<PriceFreeze> freeze = pricingService.getActiveFreeze(userId, flightId);
                if (freeze.isPresent()) {
                    booking.setTotalPrice(freeze.get().getFrozenPrice() * seats);
                    pricingService.consumeFreeze(freeze.get().getId());
                } else {
                    double live = flight.getCurrentPrice() > 0 ? flight.getCurrentPrice() : price;
                    booking.setTotalPrice(live * seats);
                }
                user.getBookings().add(booking);
                userRepository.save(user);
                return booking;
            }else {
                throw new RuntimeException("Not enough seats available");
            }
        }
        throw new RuntimeException("User or flight not found");
    }
    public Booking bookhotel(String userId,String hotelId,int rooms,double price){
        Optional<Users> usersOptional =userRepository.findById(userId);
        Optional<Hotel> hotelOptional = hotelRepository.findById(hotelId);
        if(usersOptional.isPresent() && hotelOptional.isPresent()){
            Users user=usersOptional.get();
            Hotel hotel=hotelOptional.get();
            if(hotel.getAvailableRooms() >= rooms){
                hotel.setAvailableRooms(hotel.getAvailableRooms()- rooms);
                hotelRepository.save(hotel);

                Booking booking=new Booking();
                booking.setType("Hotel");
                booking.setBookingId("BH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                booking.setResourceId(hotelId);
                booking.setDate(LocalDate.now().toString());
                booking.setQuantity(rooms);
                Optional<PriceFreeze> freeze = pricingService.getActiveFreeze(userId, hotelId);
                if (freeze.isPresent()) {
                    booking.setTotalPrice(freeze.get().getFrozenPrice() * rooms);
                    pricingService.consumeFreeze(freeze.get().getId());
                } else {
                    double live = hotel.getCurrentPricePerNight() > 0 ? hotel.getCurrentPricePerNight() : price;
                    booking.setTotalPrice(live * rooms);
                }
                user.getBookings().add(booking);
                userRepository.save(user);
                return booking;
            }else {
                throw new RuntimeException("Not enough rooms available");
            }
        }
        throw new RuntimeException("User or flight not found");
    }

}