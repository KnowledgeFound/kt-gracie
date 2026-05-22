import { ButtonHTMLAttributes, forwardRef } from 'react';
import classnames from 'classnames';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
	size?: Size;
	isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
	primary:
		'bg-gradient-to-r from-indigo-500 to-indigo-700 text-white shadow-md hover:shadow-lg',
	secondary:
		'bg-gray-100 text-indigo-600 border-2 border-indigo-500 hover:bg-indigo-500 hover:text-white',
	ghost: 'bg-transparent text-indigo-600 hover:bg-indigo-50',
	danger: 'bg-red-400 text-white hover:bg-red-500',
};

const sizeClasses: Record<Size, string> = {
	sm: 'px-2 py text-sm',
	md: 'px-4 py-1 text-base',
	lg: 'px-6 py-2 text-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = 'primary',
			size = 'md',
			isLoading = false,
			disabled,
			className,
			children,
			...props
		},
		ref,
	) => (
		<button
			ref={ref}
			disabled={disabled || isLoading}
			className={classnames(
				'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
				variantClasses[variant],
				sizeClasses[size],
				className,
			)}
			{...props}
		>
			{isLoading ? (
				<span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
			) : null}
			{children}
		</button>
	),
);

Button.displayName = 'Button';

export default Button;
