import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Orientation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground text-center leading-tight">
          Here's what people usually handle
        </h1>

        <div className="space-y-8">
          {/* Immediate */}
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-foreground">Immediate</h2>
            <ul className="space-y-2 text-lg text-muted-foreground">
              <li>• Notify close family</li>
              <li>• Locate basic documents</li>
              <li>• Understand next steps</li>
            </ul>
          </section>

          {/* Soon */}
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-foreground">Soon</h2>
            <ul className="space-y-2 text-lg text-muted-foreground">
              <li>• Burial or cremation preferences</li>
              <li>• Service wishes</li>
              <li>• People to contact</li>
            </ul>
          </section>

          {/* Later */}
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-foreground">Later</h2>
            <ul className="space-y-2 text-lg text-muted-foreground">
              <li>• Life story or obituary</li>
              <li>• Notes and keepsakes</li>
              <li>• Updates over time</li>
            </ul>
          </section>
        </div>

        <div className="pt-6 space-y-6 text-center">
          <p className="text-lg text-muted-foreground">
            You don't have to do all of this now.
          </p>

          <Button
            size="lg"
            className="min-h-[52px] text-lg w-full max-w-sm"
            onClick={() => navigate("/guided-action")}
          >
            Start with one small step
          </Button>
        </div>
      </div>
    </div>
  );
}
