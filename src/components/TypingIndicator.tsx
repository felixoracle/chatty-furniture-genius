
const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-2 mb-4">
      <div className="h-8 w-8 shrink-0 rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden">
        <img src="/lovable-uploads/f08dc7af-8397-42a9-b61e-e34abb988be2.png" alt="Pity" className="h-8 w-8 object-contain" />
      </div>
      <div className="bg-secondary/50 p-3 rounded-t-2xl rounded-br-2xl rounded-bl-sm">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
