
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedSecurityService } from '@/services/EnhancedSecurityService';
import { SecurityAlert } from '@/components/security/SecurityAlert';
import { cn } from '@/lib/utils';

interface SecureInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  validateEmail?: boolean;
  validatePassword?: boolean;
  maxLength?: number;
}

export function SecureInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className,
  validateEmail = false,
  validatePassword = false,
  maxLength = 1000
}: SecureInputProps) {
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setError(null);
    
    // Basic length check
    if (newValue.length > maxLength) {
      setError(`Máximo ${maxLength} caracteres`);
      return;
    }
    
    // Security validation
    const validation = EnhancedSecurityService.validateSecureInput(newValue, name);
    if (!validation.isValid) {
      setError(validation.error || 'Entrada inválida');
      return;
    }
    
    // Email validation
    if (validateEmail && newValue) {
      const emailValidation = EnhancedSecurityService.validateSecureEmail(newValue);
      if (!emailValidation.isValid) {
        setError(emailValidation.error || 'Email inválido');
        return;
      }
    }
    
    // Password validation
    if (validatePassword && newValue) {
      const passwordValidation = EnhancedSecurityService.validateSecurePassword(newValue);
      setPasswordStrength(passwordValidation.strength);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.error || 'Senha inválida');
        return;
      }
    }
    
    // Sanitize input
    const sanitized = EnhancedSecurityService.sanitizeHtmlAdvanced(newValue);
    onChange(sanitized);
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'strong':
        return 'text-green-500';
      default:
        return '';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'Fraca';
      case 'medium':
        return 'Média';
      case 'strong':
        return 'Forte';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={cn(
          "transition-colors",
          error ? "border-red-500 focus:border-red-500" : "",
          className
        )}
        maxLength={maxLength}
      />
      
      {validatePassword && passwordStrength && (
        <div className={cn("text-xs", getStrengthColor())}>
          Força da senha: {getStrengthText()}
        </div>
      )}
      
      {error && (
        <SecurityAlert
          type="error"
          title="Erro de validação"
          message={error}
          autoClose
          duration={3000}
          onDismiss={() => setError(null)}
        />
      )}
    </div>
  );
}
