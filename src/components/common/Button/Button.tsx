import React from 'react'
import styles from './Button.module.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  variant?: 'primary' | 'secondary'
}

const Button: React.FC<ButtonProps> = ({ label, variant = 'primary', className = '', ...props }) => {
  return (
    <button
      className={`${styles.button} ${variant === 'secondary' ? styles.secondary : styles.primary} ${className}`}
      {...props}
    >
      {label}
    </button>
  )
}

export default Button
