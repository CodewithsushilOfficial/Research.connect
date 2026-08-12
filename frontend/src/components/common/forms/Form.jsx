import React from 'react';

const Form = ({
  children,
  onSubmit,
  className = '',
  id,
  noValidate = true,
  ...props
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (onSubmit) {
      try {
        await onSubmit(e);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
  };

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className={['space-y-4', className].filter(Boolean).join(' ')}
      noValidate={noValidate}
      {...props}
    >
      {children}
    </form>
  );
};

export default Form;
