import { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import {
  Plane,
  Bell,
  BellOff,
  Plus,
  X,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  DoorOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/Loader";
import { getflight, getBookedFlightStatuses } from "@/api";
import { setUser } from "@/store";

// ── Status config ─────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: any; pulse: boolean }
> = {
  ON_TIME: {
    label: "On Time",
    color: "text-green-700",
    bg: "bg-green-100 border-green-300",
    icon: CheckCircle,
    pulse: false,
  },
  DELAYED: {
    label: "Delayed",
    color: "text-amber-700",
    bg: "bg-amber-100 border-amber-300",
    icon: AlertTriangle,
    pulse: true,
  },
  BOARDING: {
    label: "Boarding",
    color: "text-blue-700",
    bg: "bg-blue-100 border-blue-300",
    icon: Plane,
    pulse: true,
  },
  DEPARTED: {
    label: "Departed",
    color: "text-purple-700",
    bg: "bg-purple-100 border-purple-300",
    icon: Plane,
    pulse: false,
  },
  LANDED: {
    label: "Landed",
    color: "text-teal-700",
    bg: "bg-teal-100 border-teal-300",
    icon: CheckCircle,
    pulse: false,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-100 border-red-300",
    icon: XCircle,
    pulse: false,
  },
  GATE_CHANGED: {
    label: "Gate Changed",
    color: "text-orange-700",
    bg: "bg-orange-100 border-orange-300",
    icon: DoorOpen,
    pulse: true,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["ON_TIME"];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${cfg.bg} ${cfg.color}`}
    >
      {cfg.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      <Icon className="w-4 h-4" />
      {cfg.label}
    </span>
  );
}

function formatTime(iso: string | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

type ToastType = "info" | "warning" | "error" | "success";
interface Toast {
  id: number;
  type: ToastType;
  title: string;
  body: string;
}

const TOAST_COLORS: Record<ToastType, string> = {
  info: "bg-blue-600",
  warning: "bg-amber-500",
  error: "bg-red-600",
  success: "bg-green-600",
};
const TOAST_ICONS: Record<ToastType, any> = {
  info: DoorOpen,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const Icon = TOAST_ICONS[t.type];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 text-white shadow-xl ${TOAST_COLORS[t.type]}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{t.title}</p>
              <p className="text-xs mt-0.5 opacity-90">{t.body}</p>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback(
    (type: ToastType, title: string, body: string) => {
      const id = ++counterRef.current;
      setToasts((prev) => [...prev.slice(-4), { id, type, title, body }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        5000,
      );
    },
    [],
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}

// ── Single flight status card ────────────────────────────────────────────
function FlightCard({ flight }: { flight: any }) {
  const [expanded, setExpanded] = useState(false);
  const isDelayed = flight.status === "DELAYED";
  const timeAgo = Math.round((Date.now() - flight.lastUpdated) / 1000);
  const timeAgoLabel =
    timeAgo < 60 ? `${timeAgo}s ago` : `${Math.round(timeAgo / 60)}m ago`;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-300 ${
        flight.status === "BOARDING"
          ? "border-blue-300 shadow-blue-100"
          : flight.status === "DELAYED"
            ? "border-amber-300 shadow-amber-50"
            : flight.status === "GATE_CHANGED"
              ? "border-orange-300 shadow-orange-50"
              : flight.status === "CANCELLED"
                ? "border-red-300"
                : "border-gray-100"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg leading-tight">
                {flight.flightName}
              </p>
              <p className="text-sm text-gray-500">
                {flight.from} → {flight.to}
              </p>
            </div>
          </div>

          <StatusBadge status={flight.status ?? "ON_TIME"} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 items-center">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Departure</p>
            <p
              className={`text-lg font-bold ${
                isDelayed ? "line-through text-gray-400" : "text-gray-900"
              }`}
            >
              {formatTime(flight.departureTime)}
            </p>
            {isDelayed && (
              <p className="text-sm font-semibold text-amber-600">
                {formatTime(flight.estimatedDeparture)}
              </p>
            )}
          </div>

          <div className="text-center">
            <div className="h-0.5 bg-gray-200 relative">
              <div className="absolute -top-1.5 right-1/2 translate-x-1/2">
                <Plane className="w-3 h-3 text-gray-400 rotate-90" />
              </div>
            </div>
            {isDelayed && (
              <p className="text-xs text-amber-600 mt-1 font-medium">
                +{flight.delayMinutes}m delay
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">Arrival</p>
            <p
              className={`text-lg font-bold ${
                isDelayed ? "line-through text-gray-400" : "text-gray-900"
              }`}
            >
              {formatTime(flight.arrivalTime)}
            </p>
            {isDelayed && (
              <p className="text-sm font-semibold text-amber-600">
                {formatTime(flight.estimatedArrival)}
              </p>
            )}
          </div>
        </div>

        {flight.statusReason && (
          <div
            className={`mt-3 flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
              STATUS_CONFIG[flight.status]?.bg ?? "bg-gray-50"
            } ${STATUS_CONFIG[flight.status]?.color ?? "text-gray-600"}`}
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{flight.statusReason}</span>
          </div>
        )}
      </div>

      <button
        className="w-full flex items-center justify-between px-5 py-2 border-t text-xs text-gray-400 hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <span>Updated {timeAgoLabel}</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {expanded && (
        <div className="px-5 pb-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600 border-t">
          <div className="flex gap-2 items-center pt-3">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>
              From: <strong>{flight.from}</strong>
            </span>
          </div>
          <div className="flex gap-2 items-center pt-3">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>
              To: <strong>{flight.to}</strong>
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>
              Sched. Depart: <strong>{formatTime(flight.departureTime)}</strong>
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>
              Sched. Arrive: <strong>{formatTime(flight.arrivalTime)}</strong>
            </span>
          </div>

          {flight.gate && (
            <div className="flex gap-2 items-center col-span-2">
              <DoorOpen className="w-4 h-4 text-gray-400" />
              <span>
                Gate: <strong>{flight.gate}</strong>
              </span>
            </div>
          )}

          {isDelayed && (
            <>
              <div className="flex gap-2 items-center text-amber-600">
                <Clock className="w-4 h-4" />
                <span>
                  Est. Depart:{" "}
                  <strong>{formatTime(flight.estimatedDeparture)}</strong>
                </span>
              </div>
              <div className="flex gap-2 items-center text-amber-600">
                <Clock className="w-4 h-4" />
                <span>
                  Est. Arrive:{" "}
                  <strong>{formatTime(flight.estimatedArrival)}</strong>
                </span>
              </div>
            </>
          )}

          <div className="col-span-2 flex gap-2 items-center text-xs text-gray-400">
            <RefreshCw className="w-3 h-3" />
            <span>
              Last updated:{" "}
              {new Date(flight.lastUpdated).toLocaleTimeString("en-IN")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlightStatusPage() {
  const user = useSelector((state: any) => state.user.user);

  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [notifGranted, setNotifGranted] = useState(false);
  const [lastPoll, setLastPoll] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(30);

  const prevStatusMap = useRef<Record<string, string>>({});
  const pollIntervalRef = useRef<any>(null);
  const countdownRef = useRef<any>(null);
  const { toasts, addToast, dismissToast } = useToasts();

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setNotifGranted(true);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((p) => {
          setNotifGranted(p === "granted");
        });
      }
    }
  }, []);

  const sendNotification = useCallback(
    (flight: any) => {
      const cfg = STATUS_CONFIG[flight.status ?? "ON_TIME"];
      const title = `✈ ${flight.flightName} — ${cfg?.label}`;
      let body = `${flight.from} → ${flight.to}`;

      if (flight.status === "DELAYED") {
        body += `\nDelayed by ${flight.delayMinutes || 0} min. ${flight.statusReason || ""}`;
        if (flight.estimatedDeparture) {
          body += `\nNew departure: ${formatTime(flight.estimatedDeparture)}`;
        }
      } else if (flight.status === "BOARDING") {
        body += `\n${flight.statusReason || "Now boarding"}`;
      } else if (flight.status === "CANCELLED") {
        body += `\nCancelled. Reason: ${flight.statusReason || "N/A"}`;
      }

      const toastType =
        flight.status === "CANCELLED"
          ? "error"
          : flight.status === "DELAYED"
            ? "warning"
            : flight.status === "GATE_CHANGED"
              ? "info"
              : "success";

      addToast(toastType, title, body);

      if (notifGranted) {
        new Notification(title, { body, icon: "/favicon.ico" });
      }
    },
    [notifGranted, addToast],
  );

  const refreshBookedFlights = useCallback(async () => {
    try {
      if (!user?.id) {
        setFlights([]);
        setLoading(false);
        return;
      }

      const data = await getBookedFlightStatuses(user.id);
      const freshFlights = data?.flights ?? [];

      freshFlights.forEach((f: any) => {
        const prev = prevStatusMap.current[f.id];
        const nextStatus = f.status ?? "ON_TIME";
        if (prev && prev !== nextStatus) {
          sendNotification(f);
        }
        prevStatusMap.current[f.id] = nextStatus;
      });

      setFlights(freshFlights);
      setLastPoll(new Date());
      setCountdown(300);
      setLoading(false);
    } catch (e) {
      console.error("Refresh error", e);
      setLoading(false);
    }
  }, [user?.id, sendNotification]);

  useEffect(() => {
    refreshBookedFlights();
  }, [refreshBookedFlights]);

  useEffect(() => {
    if (!user?.id || loading) return;

    pollIntervalRef.current = setInterval(refreshBookedFlights, 300000);
    countdownRef.current = setInterval(
      () => setCountdown((c) => (c <= 1 ? 300 : c - 1)),
      1000,
    );

    return () => {
      clearInterval(pollIntervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, [loading, refreshBookedFlights, user?.id]);

  const filteredFlights = flights.filter((f) => {
    const matchSearch =
      !searchQuery ||
      f.flightName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.to?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "ALL" || f.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <Loader />;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center max-w-md">
          <Plane className="w-12 h-12 mx-auto mb-3 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">
            Live Flight Status
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Please log in to view your booked flight statuses.
          </p>
        </div>
      </div>
    );
  }

  const statusCounts = flights.reduce(
    (acc: any, f: any) => {
      acc[f.status ?? "ON_TIME"] = (acc[f.status ?? "ON_TIME"] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Live Flight Status
              </h1>
              <p className="text-xs text-gray-500">
                Showing only your booked flights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5 border">
              <RefreshCw
                className="w-3.5 h-3.5 animate-spin"
                style={{ animationDuration: "4s" }}
              />
              <span>
                Next refresh in {Math.floor(countdown / 60)}m {countdown % 60}s
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setCountdown(30);
                refreshBookedFlights();
              }}
            >
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh now
            </Button>
            {lastPoll && (
              <span className="text-xs text-gray-400 hidden md:inline">
                Last: {lastPoll.toLocaleTimeString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() =>
                setFilterStatus((prev) => (prev === key ? "ALL" : key))
              }
              className={`rounded-xl border-2 p-3 text-center transition-all ${
                filterStatus === key
                  ? cfg.bg + " " + cfg.color + " border-current scale-105"
                  : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
              }`}
            >
              <p className="text-2xl font-bold">{statusCounts[key] ?? 0}</p>
              <p className="text-xs mt-0.5">{cfg.label}</p>
            </button>
          ))}
        </div>

        {!notifGranted && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-amber-700">
              <Bell className="w-5 h-5" />
              <span className="text-sm font-medium">
                Enable push notifications to get instant alerts when your flight
                status changes.
              </span>
            </div>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => {
                Notification.requestPermission().then((p) =>
                  setNotifGranted(p === "granted"),
                );
              }}
            >
              Enable Notifications
            </Button>
          </div>
        )}

        <div className="bg-white rounded-xl border shadow-sm p-4 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by flight name, origin, or destination…"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredFlights.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Plane className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">
              No booked flights match your filters.
            </p>
            <p className="text-sm mt-1">
              Book a flight first, then check its live status here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredFlights.map((flight: any) => (
              <FlightCard key={flight.id} flight={flight} />
            ))}
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
