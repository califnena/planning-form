import { AlertCircle } from 'lucide-react';

export const VendorDisclaimer = () => {
  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm md:text-base text-foreground">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-1">Important:</p>
          <p className="mb-2">
            These vendors are provided as a helpful starting point only. Everlasting Funeral Advisors does not guarantee, endorse, or control the services of any business listed here.
          </p>
          <p className="mb-2">
            We encourage you to ask questions, compare options, and make your own decision.
          </p>
          <p className="text-sm">
            Some vendors may have separate business relationships with us. Any such relationship will be clearly disclosed in the notes when applicable.
          </p>
        </div>
      </div>
    </div>
  );
};