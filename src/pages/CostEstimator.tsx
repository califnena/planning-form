import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";
import { Home, ArrowLeft, Calculator, DollarSign, Save, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlanDataStatus } from "@/hooks/usePlanDataStatus";
import { toast } from "sonner";
import { US_STATES } from "@/lib/us-states";

// Cost estimation data (baseline ranges)
const BASE_COSTS = {
  burial: {
    direct: { low: 1500, typical: 2500, high: 4000 },
    simple: { low: 4000, typical: 6000, high: 8000 },
    traditional: { low: 7000, typical: 10000, high: 15000 },
  },
  cremation: {
    direct: { low: 800, typical: 1500, high: 2500 },
    simple: { low: 2500, typical: 4000, high: 6000 },
    traditional: { low: 5000, typical: 7500, high: 10000 },
  },
};

const CASKET_COSTS = {
  none: { low: 0, typical: 0, high: 0 },
  basic: { low: 500, typical: 1000, high: 2000 },
  midrange: { low: 2000, typical: 3500, high: 5000 },
  premium: { low: 5000, typical: 8000, high: 15000 },
};

const ADDON_COSTS = {
  obituary: { low: 100, typical: 300, high: 600 },
  flowers: { low: 200, typical: 500, high: 1500 },
  reception: { low: 500, typical: 1500, high: 4000 },
  travel: { low: 200, typical: 500, high: 1500 },
  plot: { low: 1000, typical: 3000, high: 8000 },
  headstone: { low: 500, typical: 2000, high: 6000 },
};

type Disposition = "burial" | "cremation";
type ServiceLevel = "direct" | "simple" | "traditional";
type CasketLevel = "none" | "basic" | "midrange" | "premium";
type Addon = "obituary" | "flowers" | "reception" | "travel" | "plot" | "headstone";

export default function CostEstimator() {
  const navigate = useNavigate();
  const planDataStatus = usePlanDataStatus();
  
  const [state, setState] = useState("");
  const [disposition, setDisposition] = useState<Disposition | "">("");
  const [serviceLevel, setServiceLevel] = useState<ServiceLevel | "">("");
  const [casketLevel, setCasketLevel] = useState<CasketLevel | "">("");
  const [addons, setAddons] = useState<Addon[]>([]);
  const [saving, setSaving] = useState(false);
  
  const [estimate, setEstimate] = useState<{
    low: number;
    typical: number;
    high: number;
    breakdown: string;
  } | null>(null);

  const calculateEstimate = () => {
    if (!state || !disposition || !serviceLevel || !casketLevel) {
      toast.error("Please fill in all required fields");
      return;
    }

    const base = BASE_COSTS[disposition][serviceLevel];
    const casket = CASKET_COSTS[casketLevel];
    
    let low = base.low + casket.low;
    let typical = base.typical + casket.typical;
    let high = base.high + casket.high;
    
    const addonLabels: string[] = [];
    addons.forEach((addon) => {
      // Filter burial-only addons
      if ((addon === "plot" || addon === "headstone") && disposition !== "burial") {
        return;
      }
      const cost = ADDON_COSTS[addon];
      low += cost.low;
      typical += cost.typical;
      high += cost.high;
      addonLabels.push(addon);
    });

    // Generate breakdown explanation
    const serviceLevelLabels = {
      direct: "Direct (no service)",
      simple: "Simple gathering",
      traditional: "Traditional with viewing",
    };
    const casketLabels = {
      none: "No casket/already have one",
      basic: "Basic casket/container",
      midrange: "Mid-range casket",
      premium: "Premium casket",
    };

    let breakdown = `Based on ${disposition} with ${serviceLevelLabels[serviceLevel]}, ${casketLabels[casketLevel]}`;
    if (addonLabels.length > 0) {
      breakdown += `, plus ${addonLabels.join(", ")}`;
    }
    breakdown += ".";

    setEstimate({ low, typical, high, breakdown });
  };

  const handleSave = async () => {
    if (!estimate) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to save your estimate");
      navigate("/login");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("cost_estimates").insert({
        user_id: user.id,
        plan_id: planDataStatus.planId,
        state,
        disposition,
        service_level: serviceLevel,
        casket_level: casketLevel,
        addons,
        low_estimate: estimate.low,
        typical_estimate: estimate.typical,
        high_estimate: estimate.high,
      });

      if (error) throw error;
      toast.success("Estimate saved to your plan");
    } catch (error) {
      console.error("Error saving estimate:", error);
      toast.error("Failed to save estimate");
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const toggleAddon = (addon: Addon) => {
    setAddons((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GlobalHeader />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
          <Link to="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
            <Home className="h-4 w-4" /> Home
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link to="/resources?section=tools-calculators" className="text-muted-foreground hover:text-primary">
            Tools & Calculators
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">Cost Estimator</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            Cost Estimator
          </h1>
          <p className="text-muted-foreground mt-2">
            Get a general cost range based on your choices.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Your Choices</CardTitle>
              <CardDescription>Select options to see estimated costs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Disposition */}
              <div className="space-y-2">
                <Label htmlFor="disposition">Disposition *</Label>
                <Select value={disposition} onValueChange={(v) => setDisposition(v as Disposition)}>
                  <SelectTrigger id="disposition">
                    <SelectValue placeholder="Select disposition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="burial">Burial</SelectItem>
                    <SelectItem value="cremation">Cremation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Service Level */}
              <div className="space-y-2">
                <Label htmlFor="serviceLevel">Service Level *</Label>
                <Select value={serviceLevel} onValueChange={(v) => setServiceLevel(v as ServiceLevel)}>
                  <SelectTrigger id="serviceLevel">
                    <SelectValue placeholder="Select service level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct (no service)</SelectItem>
                    <SelectItem value="simple">Simple (small gathering)</SelectItem>
                    <SelectItem value="traditional">Traditional (viewing + service)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Casket Level */}
              <div className="space-y-2">
                <Label htmlFor="casketLevel">Casket/Container *</Label>
                <Select value={casketLevel} onValueChange={(v) => setCasketLevel(v as CasketLevel)}>
                  <SelectTrigger id="casketLevel">
                    <SelectValue placeholder="Select casket option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None / Already have one</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="midrange">Mid-range</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Optional Add-ons */}
              <div className="space-y-3">
                <Label>Optional Add-ons</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="addon-obituary"
                      checked={addons.includes("obituary")}
                      onCheckedChange={() => toggleAddon("obituary")}
                    />
                    <Label htmlFor="addon-obituary" className="text-sm font-normal cursor-pointer">
                      Obituary/Death notice
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="addon-flowers"
                      checked={addons.includes("flowers")}
                      onCheckedChange={() => toggleAddon("flowers")}
                    />
                    <Label htmlFor="addon-flowers" className="text-sm font-normal cursor-pointer">
                      Flowers
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="addon-reception"
                      checked={addons.includes("reception")}
                      onCheckedChange={() => toggleAddon("reception")}
                    />
                    <Label htmlFor="addon-reception" className="text-sm font-normal cursor-pointer">
                      Reception/Meal
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="addon-travel"
                      checked={addons.includes("travel")}
                      onCheckedChange={() => toggleAddon("travel")}
                    />
                    <Label htmlFor="addon-travel" className="text-sm font-normal cursor-pointer">
                      Travel/Transport
                    </Label>
                  </div>
                  {disposition === "burial" && (
                    <>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="addon-plot"
                          checked={addons.includes("plot")}
                          onCheckedChange={() => toggleAddon("plot")}
                        />
                        <Label htmlFor="addon-plot" className="text-sm font-normal cursor-pointer">
                          Cemetery plot
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="addon-headstone"
                          checked={addons.includes("headstone")}
                          onCheckedChange={() => toggleAddon("headstone")}
                        />
                        <Label htmlFor="addon-headstone" className="text-sm font-normal cursor-pointer">
                          Headstone/Marker
                        </Label>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Button onClick={calculateEstimate} className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Estimate
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            {estimate ? (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Estimated Cost Range
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">Low</div>
                      <div className="text-xl font-bold text-foreground">
                        {formatMoney(estimate.low)}
                      </div>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary/20">
                      <div className="text-sm text-primary mb-1">Typical</div>
                      <div className="text-2xl font-bold text-primary">
                        {formatMoney(estimate.typical)}
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">High</div>
                      <div className="text-xl font-bold text-foreground">
                        {formatMoney(estimate.high)}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{estimate.breakdown}</p>

                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    variant="outline"
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save to My Plan"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Fill in your choices and click "Calculate" to see estimated costs.</p>
                </CardContent>
              </Card>
            )}

            {/* Disclaimer */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                These are estimates for planning purposes only. Actual prices vary significantly
                by funeral home, location, and specific choices. Always request a General Price
                List from providers for accurate costs.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
