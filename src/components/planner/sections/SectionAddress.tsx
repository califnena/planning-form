import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

/**
 * CANONICAL DATA MODEL for plan_payload.address
 * 
 * plan_payload.address = {
 *   full_name: string|null,
 *   street_1: string|null,
 *   street_2: string|null,
 *   city: string|null,
 *   state: string|null,
 *   postal_code: string|null,
 *   country: string|null,
 *   notes: string|null,
 *   last_updated: timestamp|null
 * }
 */
interface AddressData {
  full_name?: string | null;
  street_1?: string | null;
  street_2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  notes?: string | null;
  last_updated?: string | null;
}

interface SectionAddressProps {
  data: any;
  onChange: (data: any) => void;
}

/**
 * SectionAddress - Simple optional address section
 * 
 * CANONICAL KEY: plan_payload.address
 */
export const SectionAddress = ({ data, onChange }: SectionAddressProps) => {
  const planPayload = data.plan_payload || data;
  const addressData: AddressData = planPayload.address || {};

  // Local form state
  const [fullName, setFullName] = useState(addressData.full_name || '');
  const [street1, setStreet1] = useState(addressData.street_1 || '');
  const [street2, setStreet2] = useState(addressData.street_2 || '');
  const [city, setCity] = useState(addressData.city || '');
  const [state, setState] = useState(addressData.state || '');
  const [postalCode, setPostalCode] = useState(addressData.postal_code || '');
  const [country, setCountry] = useState(addressData.country || '');
  const [notes, setNotes] = useState(addressData.notes || '');

  // Sync from prop changes (e.g., plan switch)
  useEffect(() => {
    const addr = planPayload.address || {};
    setFullName(addr.full_name || '');
    setStreet1(addr.street_1 || '');
    setStreet2(addr.street_2 || '');
    setCity(addr.city || '');
    setState(addr.state || '');
    setPostalCode(addr.postal_code || '');
    setCountry(addr.country || '');
    setNotes(addr.notes || '');
  }, [planPayload.address]);

  // Save changes on blur
  const saveAddress = () => {
    const updatedAddress: AddressData = {
      full_name: fullName.trim() || null,
      street_1: street1.trim() || null,
      street_2: street2.trim() || null,
      city: city.trim() || null,
      state: state.trim() || null,
      postal_code: postalCode.trim() || null,
      country: country.trim() || null,
      notes: notes.trim() || null,
      last_updated: new Date().toISOString(),
    };

    onChange({
      ...data,
      address: updatedAddress,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          Address
        </h2>
        <p className="text-muted-foreground">
          Optional. Used for reference only.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-base">Name</Label>
          <Input
            id="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={saveAddress}
            placeholder="Full name"
            className="h-12"
          />
        </div>

        {/* Street 1 */}
        <div className="space-y-2">
          <Label htmlFor="street_1" className="text-base">Street Address</Label>
          <Input
            id="street_1"
            value={street1}
            onChange={(e) => setStreet1(e.target.value)}
            onBlur={saveAddress}
            placeholder="Street address"
            className="h-12"
          />
        </div>

        {/* Street 2 */}
        <div className="space-y-2">
          <Label htmlFor="street_2" className="text-base">Address Line 2</Label>
          <Input
            id="street_2"
            value={street2}
            onChange={(e) => setStreet2(e.target.value)}
            onBlur={saveAddress}
            placeholder="Apartment, suite, etc. (optional)"
            className="h-12"
          />
        </div>

        {/* City, State, Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-base">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onBlur={saveAddress}
              placeholder="City"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state" className="text-base">State</Label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              onBlur={saveAddress}
              placeholder="State"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postal_code" className="text-base">ZIP / Postal Code</Label>
            <Input
              id="postal_code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              onBlur={saveAddress}
              placeholder="ZIP code"
              className="h-12"
            />
          </div>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country" className="text-base">Country</Label>
          <Input
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            onBlur={saveAddress}
            placeholder="Country"
            className="h-12"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-base">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveAddress}
            placeholder="Any additional notes about this address..."
            rows={3}
          />
        </div>
      </Card>
    </div>
  );
};
