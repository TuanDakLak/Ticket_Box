import { Button } from "@/components/common";
import { ProcessingAnimation } from "@/components/screens";

export default function ProcessingPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full space-y-8">
        <ProcessingAnimation />
        <div className="mx-auto flex max-w-2xl flex-wrap justify-center gap-3">
          <Button href="/orders/order-2048/confirmed">View confirmation</Button>
          <Button href="/support" variant="soft">
            Need help
          </Button>
        </div>
      </div>
    </section>
  );
}
