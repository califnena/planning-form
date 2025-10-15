import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Save, Mic, Video, Play, Pause, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";

interface Message {
  recipients: string;
  text_message: string;
  audio_url?: string;
  video_url?: string;
}

interface SectionMessagesProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionMessages = ({ data, onChange }: SectionMessagesProps) => {
  const messages = data.messages || [];
  const { toast } = useToast();
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
  const [recordingType, setRecordingType] = useState<'audio' | 'video' | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const addMessage = () => {
    onChange({
      ...data,
      messages: [...messages, { recipients: "", text_message: "" }]
    });
  };

  const updateMessage = (index: number, field: string, value: any) => {
    const updated = [...messages];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, messages: updated });
  };

  const removeMessage = (index: number) => {
    onChange({ ...data, messages: messages.filter((_: any, i: number) => i !== index) });
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
        updateMessage(index, type === 'audio' ? 'audio_url' : 'video_url', url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordingIndex(index);
      setRecordingType(type);

      // Auto-stop after 3 minutes
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
    updateMessage(index, type === 'audio' ? 'audio_url' : 'video_url', undefined);
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
          <h2 className="text-2xl font-bold mb-2">❤️ Messages</h2>
          <p className="text-muted-foreground">
            Leave heartfelt messages for your loved ones that will be cherished forever.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={addMessage} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Message
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {messages.map((message: Message, index: number) => (
          <Card key={index} className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg">Message {index + 1}</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addMessage}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMessage(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>To (Recipients)</Label>
              <p className="text-xs text-muted-foreground">Who this message is for (can be one person or multiple people)</p>
              <Input
                value={message.recipients || ""}
                onChange={(e) => updateMessage(index, "recipients", e.target.value)}
                placeholder="e.g., My children, Sarah and Michael, My spouse"
              />
            </div>

            <div className="space-y-2">
              <Label>Written Message</Label>
              <p className="text-xs text-muted-foreground">Share your love, memories, wisdom, and hopes for their future (max 5000 characters)</p>
              <Textarea
                value={message.text_message || ""}
                onChange={(e) => updateMessage(index, "text_message", e.target.value)}
                placeholder="Write your message here... Share your love, memories, wisdom, and hopes for their future."
                rows={6}
                maxLength={5000}
              />
              {message.text_message && (
                <p className="text-xs text-muted-foreground text-right">
                  {message.text_message.length}/5000 characters
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
                  <div className="flex gap-2 items-center">
                    <audio controls src={message.audio_url} className="max-w-xs" />
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
          </Card>
        ))}

        {messages.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No messages added yet</p>
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
    </div>
  );
};