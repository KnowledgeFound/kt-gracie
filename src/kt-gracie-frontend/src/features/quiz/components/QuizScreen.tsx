import { motion, type Variants } from 'framer-motion';
import classnames from 'classnames';
import type { Question, UserAnswer } from '../types';
import { BackMenu, Button } from '@/components/ui';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuizScreenProps {
	question: Question;
	currentIndex: number;
	totalQuestions: number;
	selectedAnswer: UserAnswer;
	onSelectOption: (value: UserAnswer) => void;
	onPrevious: () => void;
	onNext: () => void;
	canGoPrevious: boolean;
	score: number;
}

const containerVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, staggerChildren: 0.1, delayChildren: 0.2 },
	},
	exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const itemVariants: Variants = {
	hidden: { opacity: 0, x: -20 },
	visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

const optionVariants: Variants = {
	hidden: { opacity: 0, x: -10 },
	visible: { opacity: 1, x: 0 },
};

const QuizScreen = ({
	question,
	currentIndex,
	totalQuestions,
	selectedAnswer,
	onSelectOption,
	onPrevious,
	onNext,
	canGoPrevious,
	score,
}: QuizScreenProps) => {
	const typeIsMCQ = question.type === 'mcq';
	const optionsList = typeIsMCQ ? question.options : ['True', 'False'];
	const progress = ((currentIndex + 1) / totalQuestions) * 100;
	const navigate = useNavigate();

	const getOptionValue = (index: number): UserAnswer =>
		typeIsMCQ ? String.fromCharCode(65 + index) : index === 0;

	return (
		<motion.div
			className="min-h-screen h-full flex  justify-between items-center pb-10"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
		>
			<motion.div className="w-full max-w-3xl mx-auto p-4 md:p-6 gap-4 bg-white rounded-xl shadow-lg">
				{/* Progress header */}
				<motion.div
					className="w-full mx-auto px-4 py-2"
					variants={itemVariants}
				>
					<div className="flex justify-between items-center">
						<BackMenu to="/" />
						<Button
							variant="ghost"
							size="sm"
							className="p-2"
							onClick={() => navigate('/city')}
						>
							<Home className="size-5" />
						</Button>
					</div>
					<div className="flex gap-2 items-center  text-sm md:text-base my-2">
						<div className="h-2 bg-gray-200 rounded-full overflow-hidden w-full ">
							<motion.div
								className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full"
								initial={{ width: 0 }}
								animate={{ width: `${progress}%` }}
								transition={{ duration: 0.5, ease: 'easeOut' }}
								style={{ boxShadow: '0 0 10px rgba(99,102,241,0.5)' }}
							/>
						</div>
						<span className="text-gray-600 font-semibold whitespace-nowrap">
							{currentIndex + 1}/{totalQuestions}
						</span>
					</div>
				</motion.div>

				{/* Question card */}
				<motion.div className="w-full mx-auto px-4 flex-1 flex flex-col justify-center">
					<motion.div className="" variants={itemVariants}>
						<motion.div
							className="inline-block px-4 py-2 bg-gradient-to-r from-brand-500 to-indigo-700 text-white rounded-full text-xs md:text-sm font-bold mb-6 uppercase tracking-wide"
							variants={optionVariants}
						>
							{typeIsMCQ ? 'Multiple Choice' : 'True / False'}
						</motion.div>

						<motion.h2
							className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight"
							variants={optionVariants}
							transition={{ delay: 0.1 }}
						>
							{question.question}
						</motion.h2>

						<motion.div
							className="space-y-4 md:space-y-5"
							variants={containerVariants}
							initial="hidden"
							animate="visible"
						>
							{optionsList.map((option, index) => {
								const optionValue = getOptionValue(index);
								const isSelected = selectedAnswer === optionValue;
								return (
									<motion.button
										key={index}
										onClick={() => onSelectOption(optionValue)}
										className={classnames(
											'w-full p-3 md:p-4 text-left rounded-lg font-medium text-base md:text-lg transition-all duration-300 cursor-pointer',
											{
												'bg-indigo-50 border-2 border-brand-500 text-indigo-700 shadow-md':
													isSelected,
												'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-400 hover:bg-gray-50':
													!isSelected,
											},
										)}
										variants={optionVariants}
										transition={{ delay: index * 0.1 }}
										whileHover={{ x: 5 }}
										whileTap={{ scale: 0.98 }}
									>
										<span className="font-bold mr-4">
											{typeIsMCQ
												? String.fromCharCode(65 + index)
												: index === 0
													? 'T'
													: 'F'}
										</span>
										<span>{option}</span>
										{isSelected && (
											<span className="float-right text-xl">✓</span>
										)}
									</motion.button>
								);
							})}
						</motion.div>
					</motion.div>
				</motion.div>

				{/* Navigation */}
				<motion.div
					className="w-full mx-auto px-4 mt-4 md:mt-6"
					variants={itemVariants}
				>
					<div className="flex gap-4 md:gap-6">
						<motion.button
							onClick={onPrevious}
							disabled={!canGoPrevious}
							className={classnames(
								'flex-1 py-3 md:py-4 px-6 font-bold text-lg rounded-lg transition-all duration-300 uppercase tracking-wide',
								{
									'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50':
										!canGoPrevious,
									'bg-gray-100 text-indigo-600 hover:bg-gray-200':
										canGoPrevious,
								},
							)}
							whileHover={canGoPrevious ? { scale: 1.02 } : {}}
							whileTap={canGoPrevious ? { scale: 0.98 } : {}}
						>
							← Previous
						</motion.button>

						<motion.button
							onClick={onNext}
							disabled={selectedAnswer === null}
							className={classnames(
								'flex-1 py-3 md:py-4 px-6 font-bold text-lg rounded-lg transition-all duration-300 uppercase tracking-wide text-white',
								{
									'bg-gradient-to-r from-brand-500 to-indigo-700 hover:shadow-lg':
										selectedAnswer !== null,
									'bg-gray-300 cursor-not-allowed opacity-50':
										selectedAnswer === null,
								},
							)}
							whileHover={selectedAnswer !== null ? { scale: 1.02, y: -3 } : {}}
							whileTap={selectedAnswer !== null ? { scale: 0.98 } : {}}
						>
							{currentIndex === totalQuestions - 1 ? 'Submit Quiz →' : 'Next →'}
						</motion.button>
					</div>
				</motion.div>
			</motion.div>
		</motion.div>
	);
};

export default QuizScreen;
