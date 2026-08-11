import { Suspense } from "react";
import CheckoutCancelContent from "./CheckoutCancelContent";

export default function CheckoutCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-charcoal/60">
          Cargando...
        </div>
      }
    >
      <CheckoutCancelContent />
    </Suspense>
  );
}
