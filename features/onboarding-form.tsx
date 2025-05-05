// features/onboarding-form.tsx
"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SetupTab, { RISK_MODE_DEFAULTS } from "./setup-tab";
import { saveOnboarding } from "@/lib/actions/onboarding";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { BusinessData } from "@/types";

const STEPS = ["Wholesale Price", "Hustle Style", "Weight", "Hustler's Code"] as const;

export function OnboardingForm() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<keyof typeof RISK_MODE_DEFAULTS>("moderate");
  const [businessData, setBusinessData] = useState<BusinessData>({
    ...RISK_MODE_DEFAULTS[mode],
    markupPercentage: 100,
    retailPricePerGram: RISK_MODE_DEFAULTS[mode].wholesalePricePerOz / 28.35,
    inventoryQty: 0,
    wholesalePricePerOz: 800, // Set default to $800
  });
  const [secretCode, setSecretCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation per step
  const isStepValid = () => {
    if (step === 0) return businessData.wholesalePricePerOz > 0;
    if (step === 1) return !!mode;
    if (step === 2) return businessData.inventoryQty >= 0;
    if (step === 3) return !!secretCode;
    return false;
  };

  const handleNext = () => {
    if (isStepValid() && step < STEPS.length - 1) setStep(step + 1);
  };
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSelectRisk = (newMode: keyof typeof RISK_MODE_DEFAULTS) => {
    setMode(newMode);
    setBusinessData({
      ...businessData,
      ...RISK_MODE_DEFAULTS[newMode],
      retailPricePerGram: RISK_MODE_DEFAULTS[newMode].wholesalePricePerOz / 28.35,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    if (!user?.id || !user?.username) {
      setError("User not authenticated or missing username.");
      setSubmitting(false);
      return;
    }
    if (!secretCode) {
      setError("Hustler's code is required.");
      setSubmitting(false);
      return;
    }
    const result = await saveOnboarding({
      clerkUserId: user.id,
      username: user.username,
      secretCode,
      mode,
      inventoryQty: businessData.inventoryQty,
      wholesalePricePerOz: businessData.wholesalePricePerOz,
    });
    setSubmitting(false);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(
        result.fallback
          ? "Could not connect to the database. Fallback defaults applied. Please try again later."
          : result.error || "Onboarding failed. Please contact support."
      );
    }
  };

  // Progress bar (dots)
  const Stepper = () => (
    <div className="flex justify-center items-center gap-2 mb-6">
      {STEPS.map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-2 w-2 rounded-full transition-all",
            i === step
              ? "bg-white scale-125 shadow-lg border-2 border-white"
              : "bg-white/30 border border-white/30"
          )}
        />
      ))}
    </div>
  );

  return (
    <Dialog open modal>
      <DialogContent
        className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl px-4 bg-black border-white border card-sharp rounded-2xl shadow-2xl animate-fade-in text-white"
        style={{ minHeight: 420 }}
      >
        {/* Header with left arrow for back navigation */}
        <div className="relative flex items-center justify-center mb-2">
          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 focus:outline-none"
              aria-label="Back"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
          )}
          <DialogTitle className="text-3xl font-bold text-center graffiti-font text-white mb-1 tracking-tight drop-shadow-lg w-full">
            Set Up Shop
          </DialogTitle>
        </div>
        <Stepper />
        <DialogDescription className="text-center text-white/70 mb-2 text-base font-medium">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </DialogDescription>
        {/* Stepper content */}
        <form onSubmit={handleSubmit} className="container flex flex-col min-h-[420px] justify-between px-2 py-4">
          <div className="flex-1 flex flex-col justify-center animate-fade-in">
            {step === 0 && (
              <div className="space-y-5 mt-4 mb-4">
                <Label htmlFor="wholesalePrice" className="gangster-font text-white text-xl mb-1 block">
                  What do you get it for?
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-white">$</span>
                  </div>
                  <Input
                    id="wholesalePrice"
                    type="number"
                    min={0.00}
                    step={0.01}
                    value={businessData.wholesalePricePerOz}
                    onChange={e => setBusinessData({ ...businessData, wholesalePricePerOz: parseFloat(e.target.value) || 0 })}
                    className="input-sharp text-lg pl-8 pr-4 py-3 bg-black border-white/60 text-white placeholder-white/40 focus:ring-2 focus:ring-white focus:border-white rounded-xl mt-2 mb-2"
                    autoFocus
                    required
                    placeholder="800.00"
                  />
                </div>
                <div className="text-xs text-white/60 pl-1">Enter your wholesale price per ounce.</div>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-5">
                <Label className="gangster-font text-white text-xl mb-1 block">Choose Your Hustle Style</Label>
                <div className="text-white/80 text-sm mb-2">Your hustle style determines your risk and reward profile. Pick the one that matches your approach to the game.</div>
                {/* Use shadcn/ui Select for hustle style */}
                <div className="w-full">
                  <Select value={mode} onValueChange={val => handleSelectRisk(val as keyof typeof RISK_MODE_DEFAULTS)}>
                    <SelectTrigger className="w-full bg-black border-white text-white rounded-xl gangster-font text-lg py-3">
                      <SelectValue placeholder="Select your hustle style" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white text-white rounded-xl">
                      <SelectItem value="conservative" className="focus:bg-white/10 focus:text-white">Under the Radar</SelectItem>
                      <SelectItem value="moderate" className="focus:bg-white/10 focus:text-white">Get It How I Live It</SelectItem>
                      <SelectItem value="high" className="focus:bg-white/10 focus:text-white">Take Over</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-5 mt-4 mb-4">
                <Label htmlFor="inventoryQty" className="gangster-font text-white text-xl mb-1 block">
                  How much weight do you have?
                </Label>
                <div className="relative">
                  <Input
                    id="inventoryQty"
                    type="number"
                    min={0}
                    step={1}
                    value={businessData.inventoryQty}
                    onChange={e => setBusinessData({ ...businessData, inventoryQty: Number(e.target.value) })}
                    className="input-sharp text-lg px-4 py-3 bg-black border-white/60 text-white placeholder-white/40 focus:ring-2 focus:ring-white focus:border-white rounded-xl mt-2 mb-2 pr-10"
                    required
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 font-bold text-lg pointer-events-none">g</span>
                </div>
                <div className="text-xs text-white/60 pl-1">Enter your starting weight in grams.</div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-5 mt-4 mb-4">
                <Label htmlFor="hustlersCode" className="gangster-font text-white text-xl mb-1 block">
                  Set a Hustler's Code
                </Label>
                <Input
                  id="hustlersCode"
                  name="hustlersCode"
                  type="text"
                  value={secretCode}
                  onChange={e => setSecretCode(e.target.value)}
                  className="input-sharp text-lg px-4 py-3 bg-black/80 border-white/60 text-white placeholder-white/40 focus:ring-2 focus:ring-white focus:border-white rounded-xl mt-2 mb-2"
                  required
                  placeholder="Enter a code for password reset"
                />
                <div className="text-xs text-white/60 pl-1">This code is used for password reset. Don’t forget it!</div>
              </div>
            )}
            {error && <div className="text-red-400 text-center text-base mt-6 font-bold">{error}</div>}
          </div>
          <DialogFooter className="mt-10">
            <div className="flex w-full justify-end gap-2">
              {step < STEPS.length - 1 && (
                <Button
                  type="button"
                  className="w-full button-sharp bg-white text-black font-bold rounded-xl py-3 text-lg shadow-md hover:bg-white/90 transition mb-2"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                >
                  Next
                </Button>
              )}
              {step === STEPS.length - 1 && (
                <Button
                  type="submit"
                  className="w-full button-sharp bg-white text-black font-bold rounded-xl py-3 text-lg shadow-md hover:bg-white/90 transition mb-2"
                  disabled={submitting || !isStepValid()}
                >
                  {submitting ? "Setting Up..." : "Start Hustling"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}