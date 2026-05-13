import { BookingClient } from "@/components/appointments/booking-client";

export default function AppointmentPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <h1 className="mb-6 text-4xl font-bold">Appointment Booking</h1>
      <BookingClient />
    </div>
  );
}
