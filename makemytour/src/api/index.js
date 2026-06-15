import axios from "axios";

//url from render
const BACKEND_URL = "https://makemytrip-clone-springboot.onrender.com";

export const login = async (email, password) => {
  try {
    const url = `${BACKEND_URL}/user/login?email=${email}&password=${password}`;
    const res = await axios.post(url);
    const data = res.data;
    // console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const signup = async (
  firstName,
  lastName,
  email,
  phoneNumber,
  password
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/user/signup`, {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
    });
    const data = res.data;
    // console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getuserbyemail = async (email) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/user/email?email=${email}`);
    const data = res.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const editprofile = async (
  id,
  firstName,
  lastName,
  email,
  phoneNumber
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/user/edit?id=${id}`, {
      firstName,
      lastName,
      email,
      phoneNumber,
    });
    const data = res.data;
    return data;
  } catch (error) {}
};
export const getflight = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/flight`);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(data);
  }
};

export const addflight = async (
  flightName,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  availableSeats
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/admin/flight`, {
      flightName,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const editflight = async (
  id,
  flightName,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  availableSeats
) => {
  try {
    const res = await axios.put(`${BACKEND_URL}/admin/flight/${id}`, {
      flightName,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const gethotel = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/hotel`);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(data);
  }
};

export const addhotel = async (
  hotelName,
  location,
  pricePerNight,
  availableRooms,
  amenities
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/admin/hotel`, {
      hotelName,
      location,
      pricePerNight,
      availableRooms,
      amenities,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const edithotel = async (
  id,
  hotelName,
  location,
  pricePerNight,
  availableRooms,
  amenities
) => {
  try {
    const res = await axios.put(`${BACKEND_URL}/admin/hotel/${id}`, {
      hotelName,
      location,
      pricePerNight,
      availableRooms,
      amenities,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const handleflightbooking = async (userId, flightId, seats, price) => {
  try {
    const url = `${BACKEND_URL}/booking/flight?userId=${userId}&flightId=${flightId}&seats=${seats}&price=${price}`;
    const res = await axios.post(url);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getFlightStatus = async (flightId) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/flight-status/${flightId}`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getBulkFlightStatus = async (flightIds) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/flight-status/bulk`, { flightIds });
    return res.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const trackFlight = async (userId, flightId) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/flight-status/track`, { userId, flightId });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const untrackFlight = async (userId, flightId) => {
  try {
    const res = await axios.delete(`${BACKEND_URL}/flight-status/track`, {
      data: { userId, flightId },
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getTrackedFlights = async (userId) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/flight-status/tracked/${userId}`);
    return res.data;   // { trackedIds: [...], flights: [...] }
  } catch (error) {
    console.log(error);
    return { trackedIds: [], flights: [] };
  }
};

export const getBookedFlightStatuses = async (userId) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/flight-status/booked/${userId}`);
    return res.data; // { bookedIds: [...], flights: [...] }
  } catch (error) {
    console.log(error);
    return { bookedIds: [], flights: [] };
  }
};

export const handlehotelbooking = async (userId, hotelId, rooms, price) => {
  try {
    const url = `${BACKEND_URL}/booking/hotel?userId=${userId}&hotelId=${hotelId}&rooms=${rooms}&price=${price}`;
    const res = await axios.post(url);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const updateFlightStatus = async (
  flightId,
  status,
  statusReason,
  gate,
  delayMinutes,
  userRole
) => {
  try {
    const body = { flightId };
    if (status !== undefined) body.status = status;
    if (statusReason !== undefined) body.statusReason = statusReason;
    if (gate !== undefined) body.gate = gate;
    if (delayMinutes !== undefined) body.delayMinutes = delayMinutes;

    const res = await axios.put(`${BACKEND_URL}/admin/flight/status`, body, {
      headers: userRole ? { "X-User-Role": userRole } : {},
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
