import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Save, Mic, Video, Play, Pause, RotateCcw, Download, ChevronDown, ChevronUp, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { EmailPlanDialog } from "@/components/EmailPlanDialog";
import { useTranslation } from "react-i18next";

interface IndividualMessage {
  to: string;
  message: string;
  audio_url?: string;
  video_url?: string;
}

interface MessagesToLovedOnes {
  main_message: string;
  individual: IndividualMessage[];
}

interface SectionMessagesProps {
  data: any;
  onChange: (data: any) => void;
}

/**
 * SectionMessages
 * 
 * CANONICAL KEY: messages_to_loved_ones (object in plan_payload)
 * Structure: { main_message: string, individual: [{ to: string, message: string, ... }] }
 * 
 * SAVE: data.messages_to_loved_ones → plan_payload.messages_to_loved_ones
 * READ: data.messages_to_loved_ones from plan_payload
 * COMPLETION: main_message non-empty OR any individual[].message non-empty
 */
export const SectionMessages = ({ data, onChange }: SectionMessagesProps) => {
  // CANONICAL: Read from messages_to_loved_ones
  // Migrate from old 'messages' array if needed
  const getMessagesData = (): MessagesToLovedOnes => {
    if (data.messages_to_loved_ones) {
      return data.messages_to_loved_ones;
    }
    // Migrate from old format
    if (Array.isArray(data.messages) && data.messages.length > 0) {
      const migrated: MessagesToLovedOnes = {
        main_message: "",
        individual: data.messages.map((m: any) => ({
          to: m.recipients || m.to || "",
          message: m.text_message || m.message || m.body || "",
          audio_url: m.audio_url,
          video_url: m.video_url,
        }))
      };
      if (import.meta.env.DEV) {
        console.log("[SectionMessages] Migrated from old messages format:", migrated);
      }
      return migrated;
    }
    return { main_message: "", individual: [] };
  };

  const messagesData = getMessagesData();
  const mainMessage = messagesData.main_message || "";
  const individualMessages = messagesData.individual || [];

  const { toast } = useToast();
  const { t } = useTranslation();
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
  const [recordingType, setRecordingType] = useState<'audio' | 'video' | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set([0]));
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const updateMessagesData = (newData: Partial<MessagesToLovedOnes>) => {
    // CANONICAL: Write to messages_to_loved_ones
    const updated = {
      ...data,
      messages_to_loved_ones: {
        ...messagesData,
        ...newData
      }
    };
    
    if (import.meta.env.DEV) {
      console.log("[SectionMessages] updateMessagesData → messages_to_loved_ones:", newData);
    }
    
    onChange(updated);
  };

  const updateMainMessage = (value: string) => {
    updateMessagesData({ main_message: value });
  };

  const addMessage = () => {
    updateMessagesData({
      individual: [...individualMessages, { to: "", message: "" }]
    });
  };

  const updateIndividualMessage = (index: number, field: keyof IndividualMessage, value: any) => {
    const updated = [...individualMessages];
    updated[index] = { ...updated[index], [field]: value };
    updateMessagesData({ individual: updated });
  };

  const removeMessage = (index: number) => {
    updateMessagesData({
      individual: individualMessages.filter((_: any, i: number) => i !== index)
    });
  };

  const startRecording = async (index: number, type: 'audio' | 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: type === 'audio' ? 'audio/webm' : 'video/webm'
        });
        const url = URL.createObjectURL(blob);
        updateIndividualMessage(index, type === 'audio' ? 'audio_url' : 'video_url', url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordingIndex(index);
      setRecordingType(type);

      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          stopRecording();
        }
      }, 180000);

      toast({
        title: "Recording started",
        description: `Recording ${type}... (max 3 minutes)`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone/camera",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingIndex(null);
      setRecordingType(null);
      toast({
        title: "Recording stopped",
        description: "Your recording has been saved",
      });
    }
  };

  const deleteRecording = (index: number, type: 'audio' | 'video') => {
    updateIndividualMessage(index, type === 'audio' ? 'audio_url' : 'video_url', undefined);
  };

  const downloadRecording = (url: string, type: 'audio' | 'video', index: number) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-${index + 1}-${type}-recording.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Download started",
      description: `Your ${type} recording is downloading`,
    });
  };

  const toggleMessageExpanded = (index: number) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Messages have been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">❤️ Messages to Loved Ones</h2>
          <p className="text-muted-foreground">
            Leave heartfelt messages for your loved ones that will be cherished forever.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setEmailDialogOpen(true)} size="sm" variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Email Plan
          </Button>
          <Button onClick={handleSave} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Message */}
      <div className="space-y-2 p-4 border rounded-lg bg-muted/20">
        <Label htmlFor="main_message" className="text-base font-semibold">Main Message to All Loved Ones</Label>
        <p className="text-sm text-muted-foreground">
          Write a general message that applies to everyone you love. This will appear at the top of your Messages section.
        </p>
        <Textarea
          id="main_message"
          value={mainMessage}
          onChange={(e) => updateMainMessage(e.target.value)}
          placeholder="Write your main message here... This message is for all your loved ones."
          rows={6}
          maxLength={5000}
        />
        {mainMessage && (
          <p className="text-xs text-muted-foreground text-right">
            {mainMessage.length}/5000 characters
          </p>
        )}
      </div>

      {/* Individual Messages */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Individual Messages</Label>
          <Button onClick={addMessage} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Message
          </Button>
        </div>

        {individualMessages.map((message: IndividualMessage, index: number) => {
          const isExpanded = expandedMessages.has(index);
          
          return (
            <Card key={index} className="overflow-hidden">
              <div className="p-4 bg-muted/30 flex justify-between items-center cursor-pointer hover:bg-muted/50 transition-colors"
                   onClick={() => toggleMessageExpanded(index)}>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Message {index + 1}
                  {message.to && <span className="text-sm text-muted-foreground font-normal">- {message.to}</span>}
                </h3>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      addMessage();
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMessage(index);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label>To (Recipients)</Label>
                    <p className="text-xs text-muted-foreground">Who this message is for (can be one person or multiple people)</p>
                    <Input
                      value={message.to || ""}
                      onChange={(e) => updateIndividualMessage(index, "to", e.target.value)}
                      placeholder="e.g., My children, Sarah and Michael, My spouse"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Written Message</Label>
                    <p className="text-xs text-muted-foreground">Share your love, memories, wisdom, and hopes for their future (max 5000 characters)</p>
                    <Textarea
                      value={message.message || ""}
                      onChange={(e) => updateIndividualMessage(index, "message", e.target.value)}
                      placeholder="Write your message here... Share your love, memories, wisdom, and hopes for their future."
                      rows={6}
                      maxLength={5000}
                    />
                    {message.message && (
                      <p className="text-xs text-muted-foreground text-right">
                        {message.message.length}/5000 characters
                      </p>
                    )}
                  </div>

                  {/* Audio Recording */}
                  <div className="space-y-2">
                    <Label>Voice Message (optional, max 3 minutes)</Label>
                    <div className="flex gap-2 items-center">
                      {!message.audio_url ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startRecording(index, 'audio')}
                          disabled={recordingIndex === index && recordingType === 'audio'}
                        >
                          {recordingIndex === index && recordingType === 'audio' ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Recording...
                            </>
                          ) : (
                            <>
                              <Mic className="h-4 w-4 mr-2" />
                              Record Audio
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="flex gap-2 items-center flex-wrap">
                          <audio controls src={message.audio_url} className="max-w-xs" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadRecording(message.audio_url!, 'audio', index)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRecording(index, 'audio')}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Re-record
                          </Button>
                        </div>
                      )}
                      {recordingIndex === index && recordingType === 'audio' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={stopRecording}
                        >
                          Stop Recording
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Video Recording */}
                  <div className="space-y-2">
                    <Label>Video Message (optional, max 3 minutes)</Label>
                    <div className="flex gap-2 items-center flex-wrap">
                      {!message.video_url ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startRecording(index, 'video')}
                          disabled={recordingIndex === index && recordingType === 'video'}
                        >
                          {recordingIndex === index && recordingType === 'video' ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Recording...
                            </>
                          ) : (
                            <>
                              <Video className="h-4 w-4 mr-2" />
                              Record Video
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="flex gap-2 items-center flex-wrap">
                          <video controls src={message.video_url} className="max-w-md rounded" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadRecording(message.video_url!, 'video', index)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRecording(index, 'video')}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Re-record
                          </Button>
                        </div>
                      )}
                      {recordingIndex === index && recordingType === 'video' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={stopRecording}
                        >
                          Stop Recording
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {individualMessages.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No individual messages added yet</p>
            <Button onClick={addMessage} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Message
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">💝 Message Suggestions:</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Be authentic and speak from the heart</li>
          <li>Share specific memories that were meaningful to you</li>
          <li>Express gratitude for the time you shared together</li>
          <li>Include humor and lightness where appropriate</li>
          <li>Share life lessons and wisdom you've learned</li>
          <li>Remind them to take care of themselves and each other</li>
        </ul>
      </div>

      <EmailPlanDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        planData={data}
        preparedBy={data.about?.full_name || data.personal_profile?.full_name || ""}
      />
    </div>
  );
};