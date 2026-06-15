"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import FlightList from "@/components/Flights/Flightlist";
import {
  addflight,
  addhotel,
  editflight,
  edithotel,
  getuserbyemail,
  getflight,
  updateFlightStatus,
} from "@/api";
import HotelList from "@/components/Hotel/Hotel";
import { useSelector } from "react-redux";

const FLIGHT_STATUSES = [
  "ON_TIME",
  "DELAYED",
  "BOARDING",
  "GATE_CHANGED",
  "DEPARTED",
  "LANDED",
  "CANCELLED",
];

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phoneNumber: string;
}

function UserSearch() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await getuserbyemail(email);
    const mockUser: User = data;
    setUser(mockUser);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Search user by email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
      {user && (
        <div className="border p-4 rounded-md">
          <h3 className="font-bold mb-2">User Details</h3>
          <p>
            <strong>Name:</strong> {user.firstName} {user.lastName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
          <p>
            <strong>Phone:</strong> {user.phoneNumber}
          </p>
        </div>
      )}
    </div>
  );
}

interface Hotel {
  id?: string;
  hotelName: string;
  location: string;
  pricePerNight: number;
  availableRooms: number;
  amenities: string;
}

function AddEditHotel({ hotel }: { hotel: Hotel | null }) {
  const [formData, setFormData] = useState<Hotel>({
    hotelName: "",
    location: "",
    pricePerNight: 0,
    availableRooms: 0,
    amenities: "",
  });

  useEffect(() => {
    if (hotel) {
      setFormData(hotel);
    } else {
      setFormData({
        hotelName: "",
        location: "",
        pricePerNight: 0,
        availableRooms: 0,
        amenities: "",
      });
    }
  }, [hotel]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hotel) {
      await edithotel(
        hotel.id,
        formData.hotelName,
        formData.location,
        formData.pricePerNight,
        formData.availableRooms,
        formData.amenities,
      );
      return;
    }
    await addhotel(
      formData.hotelName,
      formData.location,
      formData.pricePerNight,
      formData.availableRooms,
      formData.amenities,
    );
    if (!hotel) {
      setFormData({
        hotelName: "",
        location: "",
        pricePerNight: 0,
        availableRooms: 0,
        amenities: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">
        {hotel ? "Edit Hotel" : "Add New Hotel"}
      </h3>
      <div>
        <Label htmlFor="hotelName">Hotel Name</Label>
        <Input
          id="hotelName"
          name="hotelName"
          value={formData.hotelName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="pricePerNight">Price Per Night</Label>
        <Input
          id="pricePerNight"
          name="pricePerNight"
          type="number"
          value={formData.pricePerNight}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="availableRooms">Available Rooms</Label>
        <Input
          id="availableRooms"
          name="availableRooms"
          type="number"
          value={formData.availableRooms}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="amenities">Amenities</Label>
        <Textarea
          id="amenities"
          name="amenities"
          value={formData.amenities}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit">{hotel ? "Update Hotel" : "Add Hotel"}</Button>
    </form>
  );
}

interface Flight {
  _id?: string;
  id?: string;
  flightName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}

function AddEditFlight({ flight }: { flight: Flight | null }) {
  const [formData, setFormData] = useState<Flight>({
    flightName: "",
    from: "",
    to: "",
    departureTime: "",
    arrivalTime: "",
    price: 0,
    availableSeats: 0,
  });

  useEffect(() => {
    if (flight) {
      setFormData(flight);
    } else {
      setFormData({
        flightName: "",
        from: "",
        to: "",
        departureTime: "",
        arrivalTime: "",
        price: 0,
        availableSeats: 0,
      });
    }
  }, [flight]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send this data to your backend
    console.log("Submitting flight data:", formData);
    if (flight) {
      await editflight(
        flight?.id,
        formData.flightName,
        formData.from,
        formData.to,
        formData.departureTime,
        formData.arrivalTime,
        formData.price,
        formData.availableSeats,
      );
      return;
    }
    await addflight(
      formData.flightName,
      formData.from,
      formData.to,
      formData.departureTime,
      formData.arrivalTime,
      formData.price,
      formData.availableSeats,
    );
    if (!flight) {
      setFormData({
        flightName: "",
        from: "",
        to: "",
        departureTime: "",
        arrivalTime: "",
        price: 0,
        availableSeats: 0,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">
        {flight ? "Edit Flight" : "Add New Flight"}
      </h3>
      <div>
        <Label htmlFor="flightName">Flight Name</Label>
        <Input
          id="flightName"
          name="flightName"
          value={formData.flightName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="from">From</Label>
        <Input
          id="from"
          name="from"
          value={formData.from}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="to">To</Label>
        <Input
          id="to"
          name="to"
          value={formData.to}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="departureTime">Departure Time</Label>
        <Input
          id="departureTime"
          name="departureTime"
          type="datetime-local"
          value={formData.departureTime}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="arrivalTime">Arrival Time</Label>
        <Input
          id="arrivalTime"
          name="arrivalTime"
          type="datetime-local"
          value={formData.arrivalTime}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="availableSeats">Available Seats</Label>
        <Input
          id="availableSeats"
          name="availableSeats"
          type="number"
          value={formData.availableSeats}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit">{flight ? "Update Flight" : "Add Flight"}</Button>
    </form>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("flights");
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);

  // ── Status update state ───────────────────────────────────────
  const [flights, setFlights] = useState<any[]>([]);
  const [statusEditId, setStatusEditId] = useState<string | null>(null);
  const [statusForms, setStatusForms] = useState<any>({});
  const user = useSelector((state: any) => state.user.user);
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  useEffect(() => {
    const fetchFlights = async () => {
      const data = await getflight();
      if (data) setFlights(data);
    };
    fetchFlights();
  }, []);

  const handleStatusUpdate = async (flightId: string) => {
    try {
      const form = statusForms[flightId];

      if (!form) return;

      const updatedFlight = await updateFlightStatus(
        flightId,
        form.status || undefined,
        form.statusReason || undefined,
        form.gate || undefined,
        form.delayMinutes ? parseInt(form.delayMinutes) : undefined,
        user?.role,
      );

      if (!updatedFlight) {
        alert("Failed to update flight status");
        return;
      }

      // update ONLY that flight
      setFlights((prev: any) =>
        prev.map((f: any) => (f._id === flightId ? updatedFlight : f)),
      );

      // close editor
      setStatusEditId(null);
    } catch (error) {
      console.log(error);
      alert("Error updating status");
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white max-w-full">
      <h1 className="text-3xl font-bold mb-6 ">Admin Dashboard</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3  text-black">
          <TabsTrigger value="flights">Flights</TabsTrigger>
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="flights">
          <Card>
            <CardHeader>
              <CardTitle>Manage Flights</CardTitle>
              <CardDescription>
                Add, edit, or remove flights from the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <FlightList onSelect={setSelectedFlight} />
                <AddEditFlight flight={selectedFlight} />
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3">
                  Update Live Flight Status
                </h3>

                {!isAdmin ? (
                  <div className="p-4 rounded-lg border bg-gray-50 text-gray-600">
                    Only ADMIN users can edit flight status.
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left px-4 py-2">Flight</th>
                          <th className="text-left px-4 py-2">Route</th>
                          <th className="text-left px-4 py-2">
                            Current Status
                          </th>
                          <th className="text-left px-4 py-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flights.map((flight: any) => (
                          <>
                            <tr
                              key={flight._id}
                              className="border-b last:border-b-0"
                            >
                              <td className="px-4 py-3 font-medium">
                                {flight.flightName}
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {flight.from} → {flight.to}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    flight.status === "DELAYED"
                                      ? "bg-amber-100 text-amber-700"
                                      : flight.status === "CANCELLED"
                                        ? "bg-red-100 text-red-700"
                                        : flight.status === "BOARDING"
                                          ? "bg-blue-100 text-blue-700"
                                          : flight.status === "GATE_CHANGED"
                                            ? "bg-orange-100 text-orange-700"
                                            : flight.status === "LANDED"
                                              ? "bg-teal-100 text-teal-700"
                                              : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {flight.status ?? "ON_TIME"}
                                </span>
                                {flight.gate && (
                                  <span className="ml-2 text-xs text-gray-400">
                                    Gate {flight.gate}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-orange-600 border-orange-200"
                                  onClick={() => {
                                    setStatusEditId(
                                      statusEditId === flight._id
                                        ? null
                                        : flight._id,
                                    );
                                    setStatusForms((prev: any) => ({
                                      ...prev,
                                      [flight._id]: {
                                        status: flight.status ?? "",
                                        statusReason: flight.statusReason ?? "",
                                        gate: flight.gate ?? "",
                                        delayMinutes:
                                          flight.delayMinutes?.toString() ?? "",
                                      },
                                    }));
                                  }}
                                >
                                  {statusEditId === flight._id
                                    ? "Cancel"
                                    : "Update Status"}
                                </Button>
                              </td>
                            </tr>

                            {statusEditId === flight._id && (
                              <tr
                                key={`${flight._id}-form`}
                                className="bg-orange-50"
                              >
                                <td colSpan={4} className="px-4 py-4">
                                  <div className="flex flex-wrap gap-3 items-end">
                                    <div>
                                      <label className="text-xs font-medium text-gray-600 block mb-1">
                                        Status
                                      </label>
                                      <select
                                        value={
                                          statusForms[flight._id]?.status || ""
                                        }
                                        onChange={(e) =>
                                          setStatusForms((prev: any) => ({
                                            ...prev,
                                            [flight._id]: {
                                              ...prev[flight._id],
                                              status: e.target.value,
                                            },
                                          }))
                                        }
                                        className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                                      >
                                        <option value="">— select —</option>
                                        {FLIGHT_STATUSES.map((s) => (
                                          <option key={s} value={s}>
                                            {s.replace("_", " ")}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div>
                                      <label className="text-xs font-medium text-gray-600 block mb-1">
                                        Reason
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="e.g. Weather conditions"
                                        value={
                                          statusForms[flight._id]
                                            ?.statusReason || ""
                                        }
                                        onChange={(e) =>
                                          setStatusForms((prev: any) => ({
                                            ...prev,
                                            [flight._id]: {
                                              ...prev[flight._id],
                                              statusReason: e.target.value,
                                            },
                                          }))
                                        }
                                        className="border rounded-lg px-3 py-2 text-sm w-52 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="text-xs font-medium text-gray-600 block mb-1">
                                        Gate
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="e.g. B12"
                                        value={
                                          statusForms[flight._id]?.gate || ""
                                        }
                                        onChange={(e) =>
                                          setStatusForms((prev: any) => ({
                                            ...prev,
                                            [flight._id]: {
                                              ...prev[flight._id],
                                              gate: e.target.value,
                                            },
                                          }))
                                        }
                                        className="border rounded-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="text-xs font-medium text-gray-600 block mb-1">
                                        Delay (mins)
                                      </label>
                                      <input
                                        type="number"
                                        placeholder="e.g. 30"
                                        value={
                                          statusForms[flight._id]
                                            ?.delayMinutes || ""
                                        }
                                        onChange={(e) =>
                                          setStatusForms((prev: any) => ({
                                            ...prev,
                                            [flight._id]: {
                                              ...prev[flight._id],
                                              delayMinutes: e.target.value,
                                            },
                                          }))
                                        }
                                        className="border rounded-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                                      />
                                    </div>

                                    <Button
                                      size="sm"
                                      className="bg-orange-500 hover:bg-orange-600 text-white"
                                      onClick={() =>
                                        handleStatusUpdate(flight._id)
                                      }
                                    >
                                      Apply
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="hotels">
          <Card>
            <CardHeader>
              <CardTitle>Manage Hotels</CardTitle>
              <CardDescription>
                Add, edit, or remove hotels from the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <HotelList onSelect={setSelectedHotel} />
                <AddEditHotel hotel={selectedHotel} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Search for users by email.</CardDescription>
            </CardHeader>
            <CardContent>
              <UserSearch />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
