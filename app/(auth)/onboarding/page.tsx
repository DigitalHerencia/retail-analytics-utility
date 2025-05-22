"use client";

import Head from "next/head";
import { OnboardingForm } from "@/features/onboarding-form";

export default function OnboardingPage() {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <OnboardingForm />
      </div>
    </>
  );
}