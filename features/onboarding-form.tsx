// features/onboarding-form.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import SetupTab, { RISK_MODE_DEFAULTS } from "./setup-tab";
import { saveOnboarding } from "@/lib/actions/onboarding";
import type { BusinessData } from "@/types";

const STEPS = ["Wholesale Price", "Hustle Style", "Weight", "Hustler's Code"] as const;

export function OnboardingForm() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<keyof typeof RISK_MODE_DEFAULTS>("moderate");
  const [secretCode, setSecretCode] = useState("");
  const [businessData, setBusinessData] = useState<BusinessData>({
    ...RISK_MODE_DEFAULTS[mode],
    markupPercentage: 100,
    retailPricePerGram: RISK_MODE_DEFAULTS[mode].wholesalePricePerOz / 28.35,
    inventoryQty: 0,
    wholesalePricePerOz: 800,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStepValid = () => {
    if (step === 0) return businessData.wholesalePricePerOz > 0;
    if (step === 1) return !!mode;
    if (step === 2) return businessData.inventoryQty >= 0;
    if (step === 3) return secretCode.length >= 4; // Require at least 4 characters for secret code
    return false;
  };

  const handleNext = () => {
    if (isStepValid() && step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
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
      router.push("/");
    } else {
      setError(result.error || "Onboarding failed. Please contact support.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center w-full max-w-md">
        <img src="/title-white.png" alt="Hustlers Code" className="w-64 mb-6" />
        <Card className="w-full bg-white/10 border-white text-white shadow-lg">
          <CardContent className="py-8">
            <h1 className="text-3xl font-bold mb-6 text-center font-graffiti">Set Up Shop</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 0 && (
                <div>
                  <Label htmlFor="wholesalePrice" className="text-white mb-1 block">Wholesale Price</Label>
                  <Input
                    id="wholesalePrice"
                    type="number"
                    value={businessData.wholesalePricePerOz}
                    onChange={(e) => setBusinessData({ ...businessData, wholesalePricePerOz: parseFloat(e.target.value) || 0 })}
                    className="bg-black/80 border-white text-white placeholder-white/60"
                    required
                  />
                </div>
              )}
              {step === 1 && (
                <div>
                  <Label className="text-white mb-1 block">Hustle Style</Label>
                  <Select value={mode} onValueChange={(val) => setMode(val as keyof typeof RISK_MODE_DEFAULTS)}>
                    <SelectTrigger className="bg-black/80 border-white text-white">
                      <SelectValue placeholder="Select your hustle style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {step === 2 && (
                <div>
                  <Label htmlFor="inventoryQty" className="text-white mb-1 block">Inventory Quantity</Label>
                  <Input
                    id="inventoryQty"
                    type="number"
                    value={businessData.inventoryQty}
                    onChange={(e) => setBusinessData({ ...businessData, inventoryQty: parseInt(e.target.value) || 0 })}
                    className="bg-black/80 border-white text-white placeholder-white/60"
                    required
                  />
                </div>
              )}
              {step === 3 && (
                <div>
                  <Label htmlFor="secretCode" className="text-white mb-1 block">Hustler's Code</Label>
                  <Input
                    id="secretCode"
                    type="text"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    className="bg-black/80 border-white text-white placeholder-white/60"
                    placeholder="Create your secret code for password resets"
                    autoComplete="off"
                    required
                  />
                  <p className="text-white/70 mt-2 text-sm">
                    Remember this code! You'll need it to reset your password if you forget it.
                  </p>
                </div>
              )}
              {error && <div className="text-red-400 text-sm">{error}</div>}
              <div className="flex justify-between">
                {step > 0 && (
                  <Button type="button" onClick={handleBack} className="bg-white text-black">Back</Button>
                )}
                {step < STEPS.length - 1 ? (
                  <Button type="button" onClick={handleNext} disabled={!isStepValid()} className="bg-white text-black">Next</Button>
                ) : (
                  <Button type="submit" disabled={submitting || !isStepValid()} className="bg-white text-black">
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}