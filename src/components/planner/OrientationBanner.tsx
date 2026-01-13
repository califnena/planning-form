import { ClipboardList, Clock, Pencil, Lock } from "lucide-react";

export const OrientationBanner = () => {
  return (
    <div className="bg-primary/5 border-b border-primary/10 px-4 sm:px-6 py-5 mb-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                You're building your pre-planning guide
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                This page helps you choose what information you want to include.
                You can change these choices anytime.
                Nothing is final unless you choose to save.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 lg:gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary/70" />
              <span>Go at your pace</span>
            </div>
            <div className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-primary/70" />
              <span>Edit anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary/70" />
              <span>Just for you</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
