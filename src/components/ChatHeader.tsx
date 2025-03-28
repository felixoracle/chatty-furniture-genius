
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SettingsIcon, Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChatHeaderProps {
  onReset: () => void;
  onChangeApiKey: () => void;
}

const ChatHeader = ({ onReset, onChangeApiKey }: ChatHeaderProps) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  return (
    <div className="bg-card shadow-sm p-3 flex items-center justify-between rounded-t-lg">
      <div className="flex items-center gap-2">
        <img 
          src="/lovable-uploads/f08dc7af-8397-42a9-b61e-e34abb988be2.png" 
          alt="Pity" 
          className="w-8 h-8 object-contain" 
        />
        <div>
          <h2 className="font-medium">Pity</h2>
          <p className="text-xs text-muted-foreground">Your Furniture Assistant</p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onChangeApiKey}
          title="Change API Key"
        >
          <SettingsIcon size={18} />
        </Button>
        
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              title="Reset Conversation"
            >
              <Trash2 size={18} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Conversation</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear the current conversation history and product suggestions. 
                Are you sure you want to start over?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                onReset();
                setIsAlertOpen(false);
              }}>
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ChatHeader;
