import React, { useEffect, useState } from "react";
import {
  User, Phone, Mail, Edit2, Calendar, CreditCard,
  X, Check, LogOut, Plane, Building2, Lock,
  Clock, ChevronDown, ChevronUp, Ticket,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { clearUser, setUser } from "@/store";
import { editprofile, getUserFreezes } from "@/api";

type BookingType = {
  type: string;
  bookingId: string;
  date: string;
  quantity: number;
  totalPrice: number;
  resourceId: string;
};

type FreezeType = {
  id: string;
  resourceId: string;
  resourceType: string;
  frozenPrice: number;
  multiplierAtFreeze: number;
  createdAt: number;
  expiresAt: number;
  status: "ACTIVE" | "USED" | "EXPIRED";
};

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  USED: "bg-blue-50 text-blue-700 border border-blue-200",
  EXPIRED: "bg-gray-100 text-gray-500 border border-gray-200",
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"bookings" | "freezes">("bookings");
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [freezes, setFreezes] = useState<FreezeType[]>([]);
  const [loadingFreezes, setLoadingFreezes] = useState(false);

  const [userData, setUserData] = useState({
    firstName: "", lastName: "", email: "", phoneNumber: "", bookings: [] as BookingType[],
  });

  useEffect(() => {
    if (user) {
      setUserData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        bookings: user.bookings || [],
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.id && activeTab === "freezes") {
      setLoadingFreezes(true);
      getUserFreezes(user.id)
        .then(setFreezes)
        .finally(() => setLoadingFreezes(false));
    }
  }, [activeTab, user]);

  const handleEditFormChange = (field: string, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const data = await editprofile(
        user?.id, userData.firstName, userData.lastName,
        userData.email, userData.phoneNumber,
      );
      dispatch(setUser(data));
      setIsEditing(false);
    } catch {
      setIsEditing(false);
    }
  };

  const formatDate = (ms: string | number) => {
    const d = typeof ms === "number" ? new Date(ms) : new Date(ms);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatTime = (ms: number) => {
    return new Date(ms).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const msLeft = (expiresAt: number) => {
    const diff = expiresAt - Date.now();
    if (diff <= 0) return null;
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  const flightBookings = userData.bookings.filter((b) => b.type === "Flight");
  const hotelBookings = userData.bookings.filter((b) => b.type === "Hotel");
  const activeFreezes = freezes.filter((f) => f.status === "ACTIVE");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-8 px-4 pb-16">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Header stat bar ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Bookings", value: userData.bookings.length, color: "text-blue-600" },
            { label: "Flights", value: flightBookings.length, color: "text-indigo-600" },
            { label: "Hotels", value: hotelBookings.length, color: "text-emerald-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Left: Profile card ── */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <h2 className="mt-3 text-lg font-bold text-gray-800">
                  {user?.firstName} {user?.lastName}
                </h2>
                <span className="text-xs text-gray-400 mt-1">{user?.role || "Traveller"}</span>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  {[
                    { label: "First Name", field: "firstName", type: "text" },
                    { label: "Last Name", field: "lastName", type: "text" },
                    { label: "Email", field: "email", type: "email" },
                    { label: "Phone", field: "phoneNumber", type: "tel" },
                  ].map(({ label, field, type }) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                      <input
                        type={type}
                        value={(userData as any)[field]}
                        onChange={(e) => handleEditFormChange(field, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{user?.phoneNumber || "—"}</span>
                  </div>
                  <div className="pt-3 flex flex-col gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" /> Edit Profile
                    </button>
                    <button
                      onClick={() => { dispatch(clearUser()); router.push("/"); }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-red-100 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Active freeze quick-look */}
            {activeFreezes.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-800">Active Price Locks</span>
                </div>
                {activeFreezes.slice(0, 2).map((f) => (
                  <div key={f.id} className="flex justify-between items-center text-xs text-amber-700 mb-1">
                    <span className="font-medium">₹{f.frozenPrice.toLocaleString("en-IN")}</span>
                    <span className="text-amber-500">{msLeft(f.expiresAt) ?? "Expiring…"}</span>
                  </div>
                ))}
                {activeFreezes.length > 2 && (
                  <p className="text-xs text-amber-500 mt-1">+{activeFreezes.length - 2} more</p>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Tabs ── */}
          <div className="md:col-span-2">
            {/* Tab bar */}
            <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 mb-4">
              {(["bookings", "freezes"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${
                    activeTab === tab
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab === "bookings" ? (
                    <span className="flex items-center justify-center gap-2">
                      <Ticket className="w-4 h-4" /> My Bookings
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" /> Price Freezes
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Bookings tab ── */}
            {activeTab === "bookings" && (
              <div className="space-y-3">
                {userData.bookings.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400">
                    <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No bookings yet</p>
                    <p className="text-sm mt-1">Your flight and hotel bookings will appear here.</p>
                    <button
                      onClick={() => router.push("/")}
                      className="mt-4 px-5 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Explore Now
                    </button>
                  </div>
                ) : (
                  userData.bookings.map((booking) => {
                    const isFlight = booking.type === "Flight";
                    const isOpen = expandedBooking === booking.bookingId;
                    return (
                      <div
                        key={booking.bookingId}
                        className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all"
                      >
                        {/* Coloured top stripe */}
                        <div className={`h-1 w-full ${isFlight ? "bg-blue-500" : "bg-emerald-500"}`} />

                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl ${isFlight ? "bg-blue-50" : "bg-emerald-50"}`}>
                                {isFlight
                                  ? <Plane className="w-5 h-5 text-blue-600" />
                                  : <Building2 className="w-5 h-5 text-emerald-600" />}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{booking.type} Booking</p>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">{booking.bookingId}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-bold text-gray-800">
                                  ₹{booking.totalPrice.toLocaleString("en-IN")}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {isFlight
                                    ? `${booking.quantity} seat${booking.quantity > 1 ? "s" : ""}`
                                    : `${booking.quantity} room${booking.quantity > 1 ? "s" : ""}`}
                                </p>
                              </div>
                              <button
                                onClick={() => setExpandedBooking(isOpen ? null : booking.bookingId)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                              >
                                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Inline meta row */}
                          <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> {formatDate(booking.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5" /> Paid
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              isFlight ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                            }`}>
                              {booking.type}
                            </span>
                          </div>

                          {/* Expanded detail */}
                          {isOpen && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                              <div className="flex justify-between text-gray-600">
                                <span>Resource ID</span>
                                <span className="font-mono text-xs text-gray-400">{booking.resourceId}</span>
                              </div>
                              <div className="flex justify-between text-gray-600">
                                <span>Unit price</span>
                                <span className="font-medium">
                                  ₹{(booking.totalPrice / booking.quantity).toLocaleString("en-IN")}
                                </span>
                              </div>
                              <div className="flex justify-between text-gray-600">
                                <span>{isFlight ? "Seats" : "Rooms"}</span>
                                <span className="font-medium">{booking.quantity}</span>
                              </div>
                              <div className="flex justify-between text-gray-800 font-semibold pt-1 border-t border-gray-100">
                                <span>Total paid</span>
                                <span>₹{booking.totalPrice.toLocaleString("en-IN")}</span>
                              </div>
                              {isFlight && (
                                <button
                                  onClick={() => router.push("/flight-status")}
                                  className="mt-3 w-full py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Plane className="w-4 h-4" /> Check Live Status
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── Price Freezes tab ── */}
            {activeTab === "freezes" && (
              <div className="space-y-3">
                {loadingFreezes ? (
                  <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
                    <Clock className="w-8 h-8 mx-auto animate-spin opacity-30 mb-3" />
                    <p className="text-sm">Loading price freezes…</p>
                  </div>
                ) : freezes.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400">
                    <Lock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No price freezes yet</p>
                    <p className="text-sm mt-1">Lock in a price on any flight or hotel for 30 minutes.</p>
                  </div>
                ) : (
                  freezes.map((f) => (
                    <div key={f.id} className="bg-white rounded-2xl shadow-sm p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${
                            f.resourceType === "FLIGHT" ? "bg-blue-50" : "bg-emerald-50"
                          }`}>
                            {f.resourceType === "FLIGHT"
                              ? <Plane className="w-5 h-5 text-blue-600" />
                              : <Building2 className="w-5 h-5 text-emerald-600" />}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{f.resourceType} Price Lock</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">{f.resourceId}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[f.status]}`}>
                          {f.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400 mb-1">Frozen at</p>
                          <p className="font-bold text-gray-800 text-sm">₹{f.frozenPrice.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400 mb-1">Multiplier</p>
                          <p className={`font-bold text-sm ${f.multiplierAtFreeze > 1 ? "text-red-600" : "text-emerald-600"}`}>
                            {f.multiplierAtFreeze}×
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400 mb-1">Locked on</p>
                          <p className="font-bold text-gray-800 text-xs">{formatDate(f.createdAt)}</p>
                        </div>
                      </div>

                      {f.status === "ACTIVE" && (
                        <div className="mt-3 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                          <span className="text-xs text-amber-700 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Expires at {formatTime(f.expiresAt)}
                          </span>
                          <span className="text-xs font-bold text-amber-800">
                            {msLeft(f.expiresAt) ?? "Expiring…"}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;