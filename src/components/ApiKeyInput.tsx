
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound } from "lucide-react";

interface ApiKeyInputProps {
  onSave: (apiKey: string) => void;
}

const ApiKeyInput = ({ onSave }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError("Por favor ingresa tu Google Gemini API key");
      return;
    }
    
    // Basic format validation - Gemini API keys are typically longer
    if (apiKey.trim().length < 20) {
      setError("API key muy corta. Verifica e intenta nuevamente.");
      return;
    }
    
    setError(null);
    onSave(apiKey.trim());
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound size={20} className="text-primary" />
          Ingresa tu API Key
        </CardTitle>
        <CardDescription>
          Pity usa Google Gemini API para su poder conversacional. Ingresa tu API key para iniciar.
          Tu key solo se usa en tu sesión actual y no se almacena.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Google Gemini API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <div className="text-sm text-muted-foreground">
              <p>¿No tienes un API key?</p>
              <a 
                href="https://ai.google.dev/tutorials/setup" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Obtén una desde Google AI Studio
              </a>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Empieza a conversar con Pity
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ApiKeyInput;
