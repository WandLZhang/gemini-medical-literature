// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';
import { ArrowRight } from 'lucide-react';

const SpecialtySelectionView = ({ currentSpecialty, onSpecialtyChange, onConfirm, className }) => {
  const specialties = [
    { id: 'oncology', label: 'Pediatric Oncology' },
    { id: 'adult_oncology', label: 'Adult Oncology' },
    { id: 'neurology', label: 'Neurology' }
  ];

  const handleConfirm = () => {
    if (currentSpecialty) {
      onConfirm(currentSpecialty);
    }
  };

  const containerStyle = {
    position: 'relative',
    padding: 'var(--unit-5)',
    background: 'linear-gradient(135deg, var(--surface-container-low) 0%, var(--surface-container) 100%)',
    borderRadius: '16px',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.12)',
    width: '100%',
    maxWidth: 'clamp(300px, 90%, 450px)',
    margin: '0',
    ...((className && className.includes('hover')) ? {
      background: 'linear-gradient(135deg, var(--surface-container) 0%, var(--surface-container-high) 100%)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
      transform: 'translateY(-2px)'
    } : {})
  };

  const labelStyle = {
    display: 'inline-block',
    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
    fontWeight: '600',
    color: 'var(--primary)',
    marginBottom: 'var(--unit-2)',
    position: 'relative',
    padding: '0',
    top: '0',
    left: '0',
    background: 'transparent'
  };

  const descriptionStyle = {
    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
    color: 'var(--on-surface-variant)',
    marginBottom: 'var(--unit-3)',
    lineHeight: '1.5'
  };

  const selectContainerStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--unit-3)'
  };

  const selectStyle = {
    flex: '1',
    padding: 'clamp(12px, 3vw, 16px)',
    paddingRight: 'clamp(32px, 8vw, 40px)',
    border: '2px solid var(--outline-variant)',
    borderRadius: '12px',
    fontSize: '0.875rem',
    lineHeight: '1.6',
    background: 'var(--surface)',
    color: 'var(--on-surface)',
    transition: 'all 0.3s ease',
    fontFamily: 'var(--font)',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23444746' class='bi bi-chevron-down' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right var(--unit-4) center',
    cursor: 'pointer',
    outline: 'none'
  };

  const selectFocusStyle = currentSpecialty ? {
    borderColor: 'var(--primary)',
    boxShadow: '0 0 0 4px rgba(11, 87, 208, 0.1), 0 2px 8px rgba(11, 87, 208, 0.05)',
    background: 'var(--surface-bright)'
  } : {};

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'clamp(40px, 10vw, 48px)',
    height: 'clamp(40px, 10vw, 48px)',
    borderRadius: '12px',
    border: 'none',
    background: currentSpecialty 
      ? 'linear-gradient(135deg, var(--primary) 0%, #0842a0 100%)'
      : 'var(--surface-variant)',
    color: currentSpecialty ? 'var(--on-primary)' : 'var(--on-surface-variant)',
    cursor: currentSpecialty ? 'pointer' : 'not-allowed',
    transition: 'all 0.3s ease',
    boxShadow: currentSpecialty 
      ? '0 2px 8px rgba(11, 87, 208, 0.3), 0 1px 3px rgba(11, 87, 208, 0.2)'
      : 'none',
    outline: 'none'
  };

  const buttonHoverStyle = currentSpecialty ? {
    background: 'linear-gradient(135deg, #0842a0 0%, #062e6f 100%)',
    boxShadow: '0 4px 12px rgba(11, 87, 208, 0.4), 0 2px 4px rgba(11, 87, 208, 0.3)',
    transform: 'translateY(-1px)'
  } : {};

  const [isHovering, setIsHovering] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [isButtonHovering, setIsButtonHovering] = React.useState(false);

  return (
    <div 
      style={{
        ...containerStyle,
        ...(isHovering ? {
          background: 'linear-gradient(135deg, var(--surface-container) 0%, var(--surface-container-high) 100%)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
          transform: 'translateY(-2px)'
        } : {})
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={className}
    >
      <label style={labelStyle} htmlFor="specialty-select">
        Medical Specialty
      </label>
      <p style={descriptionStyle}>
        Select your specialty to continue
      </p>
      
      <div style={selectContainerStyle}>
        <select
          id="specialty-select"
          value={currentSpecialty}
          onChange={(e) => onSpecialtyChange(e.target.value)}
          style={{
            ...selectStyle,
            ...(isFocused ? selectFocusStyle : {})
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <option value="" disabled>
            Choose a specialty...
          </option>
          {specialties.map((specialty) => (
            <option key={specialty.id} value={specialty.id}>
              {specialty.label}
            </option>
          ))}
        </select>
        
        <button
          onClick={handleConfirm}
          disabled={!currentSpecialty}
          style={{
            ...buttonStyle,
            ...(isButtonHovering && currentSpecialty ? buttonHoverStyle : {})
          }}
          onMouseEnter={() => setIsButtonHovering(true)}
          onMouseLeave={() => setIsButtonHovering(false)}
          aria-label="Continue with selected specialty"
        >
          <ArrowRight style={{ width: 'clamp(18px, 4vw, 20px)', height: 'clamp(18px, 4vw, 20px)' }} />
        </button>
      </div>
    </div>
  );
};

export default SpecialtySelectionView;
