"use client";

import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import styles from "./OnboardingSteps.module.css";
import Link from "next/link";
import { useState } from "react";

interface Step {
  id: string;
  title: string;
  description: string;
  link: string;
  isCompleted: boolean;
}

export default function OnboardingSteps({ steps, onComplete }: { steps: Step[], onComplete: () => void }) {
  const [activeStep, setActiveStep] = useState(0);
  const completedCount = steps.filter(s => s.isCompleted).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className={styles.onboardingCard}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Welcome to ChatBiz! 🚀</h2>
          <p className={styles.subtitle}>Complete these steps to start receiving orders on WhatsApp.</p>
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressText}>{Math.round(progress)}% Complete</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className={styles.stepsList}>
        {steps.map((step, index) => (
          <div key={step.id} className={`${styles.stepItem} ${step.isCompleted ? styles.completed : ""}`}>
            <div className={styles.stepIcon}>
              {step.isCompleted ? (
                <CheckCircle2 className={styles.checkIcon} />
              ) : (
                <Circle className={styles.circleIcon} />
              )}
            </div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
              {!step.isCompleted && (
                <Link href={step.link} className={styles.stepLink}>
                  Start Step <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {progress === 100 && (
        <button className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }} onClick={onComplete}>
          Dismiss Onboarding
        </button>
      )}
    </div>
  );
}
