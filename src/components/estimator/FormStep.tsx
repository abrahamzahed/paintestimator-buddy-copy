import { ReactNode } from 'react';

interface FormStepProps {
  title: string;
  children: ReactNode;
  isActive: boolean;
}

const FormStep = ({ title, children, isActive }: FormStepProps) => {
  return (
    <div 
      className={`space-y-6 transition-all duration-300 ${
        isActive 
          ? "opacity-100 animate-fade-up" 
          : "opacity-0 absolute pointer-events-none h-0 overflow-hidden"
      }`}
    >
      <h3 className="text-xl font-semibold">{title}</h3>
      {children}
    </div>
  );
};

export default FormStep;
