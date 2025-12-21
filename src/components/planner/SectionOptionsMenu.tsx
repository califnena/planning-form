import { useState } from "react";
import { MoreVertical, Archive, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SectionOptionsMenuProps {
  sectionId: string;
  sectionLabel: string;
  onArchive: (note?: string) => void;
  onReset: () => void;
}

export const SectionOptionsMenu = ({
  sectionId,
  sectionLabel,
  onArchive,
  onReset
}: SectionOptionsMenuProps) => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archiveNote, setArchiveNote] = useState("");

  const handleReset = () => {
    onReset();
    setShowResetDialog(false);
  };

  const handleArchive = () => {
    onArchive(archiveNote || undefined);
    setShowArchiveDialog(false);
    setArchiveNote("");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowArchiveDialog(true)}>
            <Archive className="h-4 w-4 mr-2" />
            Archive this section
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowResetDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset this section
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset this section?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears your answers for this section. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset Section
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive "{sectionLabel}"?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This saves a read-only snapshot of your current answers. 
                You can continue editing the active version.
              </p>
              <div className="pt-2">
                <label className="text-sm font-medium text-foreground">
                  Optional note:
                </label>
                <input
                  type="text"
                  value={archiveNote}
                  onChange={(e) => setArchiveNote(e.target.value)}
                  placeholder="e.g., 'Before updating contacts'"
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={100}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              Archive Section
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
