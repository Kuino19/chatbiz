"use client";

import OnboardingSteps from "./OnboardingSteps";
import { completeOnboarding } from "../actions";
import { useRouter } from "next/navigation";

export default function OnboardingWrapper({ businessId, steps }: { businessId: string, steps: any[] }) {
  const router = useRouter();

  const handleComplete = async () => {
    await completeOnboarding(businessId);
    router.refresh();
  };

  return <OnboardingSteps steps={steps} onComplete={handleComplete} />;
}
