
import Chat from "../components/Chat";
import { TooltipProvider } from "@/components/ui/tooltip";

const Index = () => {
  return (
    <TooltipProvider>
      <Chat />
    </TooltipProvider>
  );
};

export default Index;
