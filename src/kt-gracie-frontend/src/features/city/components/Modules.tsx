import { modules } from '../constants';
import { Module } from '../types';

interface Props {
	onClickModule?: (id: number) => void;
}

const Modules = ({ onClickModule }: Props) => {
	return (
		<div className="absolute inset-0 z-40 w-full h-full pointer-events-none">
			{modules.map((module: Module) => {
				const Icon = module.icon;
				return (
					<button
						key={module.id}
						onClick={() => onClickModule?.(module.id)}
						className="pointer-events-auto bg-white/80 group backdrop-blur-sm hover:backdrop-blur-lg rounded-xl shadow-lg shadow-brand-500/20 hover:bg-brand-500/50 hover:text-white hover:shadow-brand-600 active:scale-95 px-4 py-2 flex items-center gap-1 absolute transition-all duration-150"
						style={{
							top: module.position.top ? `${module.position.top}%` : undefined,
							left: module.position.left
								? `${module.position.left}%`
								: undefined,
							right: module.position.right
								? `${module.position.right}%`
								: undefined,
							bottom: module.position.bottom
								? `${module.position.bottom}%`
								: undefined,
						}}
					>
						<Icon className="w-6 h-6 md:size-8 text-brand-600 p-1 rounded-md group-hover:text-white group-hover:bg-brand-300/50" />
						<span className="font-medium text-lg text-ink-deep group-hover:text-white">
							{module.name}
						</span>
					</button>
				);
			})}
		</div>
	);
};

export default Modules;
