import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StepProps {
  formData: any;
  onSave: (data: any) => void;
  caseId: string;
}

interface Property {
  id: string;
  address: string;
  mortgage: string;
  taxInfo: string;
  insurance: string;
  utilities: {
    water: string;
    electric: string;
    gas: string;
    phone: string;
    internet: string;
    cable: string;
    lawn: string;
    pool: string;
    pest: string;
    propane: string;
    other: string;
  };
  disposition: string;
  realtorEstimate: string;
  futureUse: string;
  transferNotes: string;
  completed: boolean;
  notes: string;
}

export function Step9RealEstateUtilities({ formData, onSave }: StepProps) {
  const [properties, setProperties] = useState<Property[]>(
    formData?.step9?.properties || [
      {
        id: crypto.randomUUID(),
        address: "",
        mortgage: "",
        taxInfo: "",
        insurance: "",
        utilities: {
          water: "",
          electric: "",
          gas: "",
          phone: "",
          internet: "",
          cable: "",
          lawn: "",
          pool: "",
          pest: "",
          propane: "",
          other: "",
        },
        disposition: "",
        realtorEstimate: "",
        futureUse: "",
        transferNotes: "",
        completed: false,
        notes: "",
      },
    ]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave({ step9: { properties } });
    }, 1000);
    return () => clearTimeout(timer);
  }, [properties]);

  const addProperty = () => {
    setProperties([
      ...properties,
      {
        id: crypto.randomUUID(),
        address: "",
        mortgage: "",
        taxInfo: "",
        insurance: "",
        utilities: {
          water: "",
          electric: "",
          gas: "",
          phone: "",
          internet: "",
          cable: "",
          lawn: "",
          pool: "",
          pest: "",
          propane: "",
          other: "",
        },
        disposition: "",
        realtorEstimate: "",
        futureUse: "",
        transferNotes: "",
        completed: false,
        notes: "",
      },
    ]);
  };

  const removeProperty = (id: string) => {
    setProperties(properties.filter((p) => p.id !== id));
  };

  const updateProperty = (id: string, field: string, value: any) => {
    setProperties(
      properties.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const updateUtility = (propertyId: string, utility: string, value: string) => {
    setProperties(
      properties.map((p) =>
        p.id === propertyId
          ? { ...p, utilities: { ...p.utilities, [utility]: value } }
          : p
      )
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground mb-4">
        Document real estate properties, utilities, and disposition plans. Track who provides each utility and how to manage or transfer payments.
      </p>

      {properties.map((property, index) => (
        <div key={property.id} className="border rounded-lg p-6 space-y-4 relative">
          {properties.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeProperty(property.id)}
              className="absolute top-2 right-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          <h3 className="font-semibold text-lg">Property {index + 1}</h3>

          <div className="space-y-2">
            <Label htmlFor={`address-${property.id}`}>Property Address</Label>
            <Input
              id={`address-${property.id}`}
              placeholder="Full property address"
              value={property.address}
              onChange={(e) => updateProperty(property.id, "address", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`mortgage-${property.id}`}>Mortgage Company & Account</Label>
              <Input
                id={`mortgage-${property.id}`}
                placeholder="e.g., Wells Fargo #123456"
                value={property.mortgage}
                onChange={(e) => updateProperty(property.id, "mortgage", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`tax-${property.id}`}>Tax Information</Label>
              <Input
                id={`tax-${property.id}`}
                placeholder="Property tax details"
                value={property.taxInfo}
                onChange={(e) => updateProperty(property.id, "taxInfo", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`insurance-${property.id}`}>Property Insurance</Label>
              <Input
                id={`insurance-${property.id}`}
                placeholder="Insurance company & policy #"
                value={property.insurance}
                onChange={(e) => updateProperty(property.id, "insurance", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Utilities & Service Providers</Label>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utility / Service</TableHead>
                    <TableHead>Provider & Account Info</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { key: "water", label: "Water" },
                    { key: "electric", label: "Electric" },
                    { key: "gas", label: "Gas" },
                    { key: "phone", label: "Phone" },
                    { key: "internet", label: "Internet" },
                    { key: "cable", label: "Cable/TV" },
                    { key: "lawn", label: "Lawn Service" },
                    { key: "pool", label: "Pool Service" },
                    { key: "pest", label: "Pest Control" },
                    { key: "propane", label: "Propane" },
                    { key: "other", label: "Other Services" },
                  ].map((util) => (
                    <TableRow key={util.key}>
                      <TableCell className="font-medium">{util.label}</TableCell>
                      <TableCell>
                        <Input
                          placeholder="Provider & account info"
                          value={property.utilities[util.key as keyof typeof property.utilities]}
                          onChange={(e) => updateUtility(property.id, util.key, e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold">Disposition & Transfer Plans</Label>
            
            <div className="space-y-2">
              <Label htmlFor={`realtor-${property.id}`}>Realtor Estimate</Label>
              <Input
                id={`realtor-${property.id}`}
                placeholder="Market value estimate and realtor contact"
                value={property.realtorEstimate}
                onChange={(e) => updateProperty(property.id, "realtorEstimate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`future-${property.id}`}>Future Use</Label>
              <Input
                id={`future-${property.id}`}
                placeholder="Will it be sold, rented, or transferred? Who will own it?"
                value={property.futureUse}
                onChange={(e) => updateProperty(property.id, "futureUse", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`transfer-${property.id}`}>Transfer Notes</Label>
              <Textarea
                id={`transfer-${property.id}`}
                placeholder="Details about title company, attorney, beneficiaries, or transfer timeline"
                value={property.transferNotes}
                onChange={(e) => updateProperty(property.id, "transferNotes", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`completed-${property.id}`}
                checked={property.completed}
                onCheckedChange={(checked) => updateProperty(property.id, "completed", !!checked)}
              />
              <Label htmlFor={`completed-${property.id}`} className="cursor-pointer font-medium">
                Property handling completed
              </Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`notes-${property.id}`}>Additional Notes</Label>
              <Textarea
                id={`notes-${property.id}`}
                placeholder="Any additional notes about this property"
                value={property.notes}
                onChange={(e) => updateProperty(property.id, "notes", e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>
      ))}

      <Button onClick={addProperty} variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Another Property
      </Button>
    </div>
  );
}
