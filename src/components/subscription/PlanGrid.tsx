
import React from 'react';
import { Plan } from './types';
import { PlanCard } from './PlanCard';

interface PlanGridProps {
  plans: Plan[];
  processingPlanId: string | null;
  hasMpCredentials: boolean;
  onSubscribe: (planId: string, planName: string) => void;
}

export const PlanGrid = ({ plans, processingPlanId, hasMpCredentials, onSubscribe }: PlanGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isProcessing={processingPlanId === plan.id}
          disabled={!hasMpCredentials}
          onSubscribe={onSubscribe}
        />
      ))}
    </div>
  );
};
