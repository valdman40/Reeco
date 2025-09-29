import React from 'react';
import { motion, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

const Button = ({ children, onClick, variant = "primary", disabled, className = "", ...props }: ButtonProps) => {
  const baseClassName = `action-button-${variant}`;
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";
  const finalClassName = `${baseClassName} ${disabledStyles} ${className}`;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={finalClassName}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;