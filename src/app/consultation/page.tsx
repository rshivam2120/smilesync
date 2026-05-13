import { ConsultationClient } from "@/components/consultation/consultation-client";

export default function ConsultationPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <h1 className="text-4xl font-bold">Online Consultation</h1>
      <div className="mt-6">
        <ConsultationClient />
      </div>
    </div>
  );
}
