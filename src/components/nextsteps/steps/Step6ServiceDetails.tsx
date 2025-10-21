import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StepProps {
  formData: any;
  onSave: (data: any) => void;
  caseId: string;
}

export function Step6ServiceDetails({ formData, onSave }: StepProps) {
  const [data, setData] = useState({
    serviceType: formData?.step6?.serviceType || "",
    venueName: formData?.step6?.venueName || "",
    venueAddress: formData?.step6?.venueAddress || "",
    dateTime: formData?.step6?.dateTime || "",
    officiants: formData?.step6?.officiants || "",
    musicReadings: formData?.step6?.musicReadings || "",
    confirmed: formData?.step6?.confirmed || false,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave({ step6: data });
    }, 1000);
    return () => clearTimeout(timer);
  }, [data]);

  const updateField = (field: string, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground mb-4">
        Record memorial service or funeral ceremony details.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="serviceType">Service Type</Label>
          <Select value={data.serviceType} onValueChange={(value) => updateField("serviceType", value)}>
            <SelectTrigger id="serviceType">
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="traditional">Traditional Funeral</SelectItem>
              <SelectItem value="memorial">Memorial Service</SelectItem>
              <SelectItem value="celebration">Celebration of Life</SelectItem>
              <SelectItem value="graveside">Graveside Service</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="venueName">Venue Name</Label>
          <Input
            id="venueName"
            placeholder="Church, funeral home, or venue name"
            value={data.venueName}
            onChange={(e) => updateField("venueName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="venueAddress">Venue Address</Label>
          <Input
            id="venueAddress"
            placeholder="Full address"
            value={data.venueAddress}
            onChange={(e) => updateField("venueAddress", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateTime">Date and Time</Label>
          <Input
            id="dateTime"
            type="datetime-local"
            value={data.dateTime}
            onChange={(e) => updateField("dateTime", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="officiants">Officiant / Speaker Names</Label>
          <Textarea
            id="officiants"
            placeholder="List names of clergy, speakers, or ceremony leaders"
            value={data.officiants}
            onChange={(e) => updateField("officiants", e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="musicReadings">Music or Readings</Label>
          <Textarea
            id="musicReadings"
            placeholder="List any special music, hymns, readings, or poems"
            value={data.musicReadings}
            onChange={(e) => updateField("musicReadings", e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="confirmed"
            checked={data.confirmed}
            onCheckedChange={(checked) => updateField("confirmed", checked)}
          />
          <Label htmlFor="confirmed" className="cursor-pointer font-medium">
            Confirmed with funeral home
          </Label>
        </div>
      </div>
    </div>
  );
}
