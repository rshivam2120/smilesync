import { MembershipClient } from "@/components/membership/membership-client";

export default function MembershipPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <h1 className="text-4xl font-bold">Membership & Subscription</h1>
      <MembershipClient />
    </div>
  );
}
