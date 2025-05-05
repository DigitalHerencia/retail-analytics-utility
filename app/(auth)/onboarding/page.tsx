"use client";

import Head from "next/head";
import { Card, CardContent } from "@/components/ui/card";
import { OnboardingForm } from "@/features/onboarding-form";

export default function OnboardingPage() {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="fixed inset-0 flex items-center justify-between bg-black">
        <div className="flex flex-col items-center ">
              <OnboardingForm />
        </div>
      </div>
    </>
  );
}