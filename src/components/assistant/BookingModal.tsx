import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Download } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [icsData, setIcsData] = useState<string | null>(null);

  const handleNativeBooking = async () => {
    if (!date || !time) {
      toast({
        title: "Missing information",
        description: "Please select both date and time.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const starts_at = new Date(`${date}T${time}`).toISOString();
      const ends_at = new Date(new Date(starts_at).getTime() + 30 * 60000).toISOString(); // 30 min later

      const response = await supabase.functions.invoke('create-appointment', {
        body: { starts_at, ends_at, notes }
      });

      if (response.error) throw response.error;

      setIcsData(response.data.ics);

      toast({
        title: "Appointment booked!",
        description: "Your appointment has been scheduled successfully.",
      });

      setDate("");
      setTime("");
      setNotes("");
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking failed",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadICS = () => {
    if (!icsData) return;
    
    const blob = new Blob([icsData], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appointment.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book an Appointment</DialogTitle>
          <DialogDescription>
            Schedule a consultation with our team
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="native" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="native">Quick Booking</TabsTrigger>
            <TabsTrigger value="external">Cal.com</TabsTrigger>
          </TabsList>

          <TabsContent value="native" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any specific topics you'd like to discuss?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleNativeBooking} 
              disabled={isSubmitting}
              className="w-full"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>

            {icsData && (
              <Button
                onClick={downloadICS}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
            )}
          </TabsContent>

          <TabsContent value="external" className="mt-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Cal.com integration coming soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
