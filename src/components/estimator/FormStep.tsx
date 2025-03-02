
import { ReactNode } from 'react';

interface FormStepProps {
  title: string;
  children: ReactNode;
  isActive: boolean;
}

const FormStep = ({ title, children, isActive }: FormStepProps) => {
  if (!isActive) return null;
  
  return (
    <div className="space-y-6 animate-fade-up">
      <h3 className="text-xl font-semibold">{title}</h3>
      {children}
    </div>
  );
};

export default FormStep;
