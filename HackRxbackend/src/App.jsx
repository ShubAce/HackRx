import React, { useState, useEffect, useRef } from "react";
import {
	FileText,
	MessageSquare,
	PlusCircle,
	Send,
	Loader,
	Trash2,
	CheckCircle,
	XCircle,
	AlertCircle,
	HelpCircle,
	PanelLeft,
	UploadCloud,
	File as FileIcon,
	Paperclip,
	X,
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const LeftPanel = ({ chatHistory, activeChatId, onSelectChat, onNewChat, onDeleteChat, onClose }) => {
	const [deletingChatId, setDeletingChatId] = useState(null);

	const getStatusIcon = (chat) => {
		const lastDecisionMsg = [...chat.messages].reverse().find((m) => m.role === "ai" && m.decision);
		if (!lastDecisionMsg) return null;
		const decision = lastDecisionMsg.decision.toLowerCase();
		if (decision.includes("approved"))
			return (
				<CheckCircle
					className="text-green-500 flex-shrink-0"
					size={14}
				/>
			);
		if (decision.includes("denied"))
			return (
				<XCircle
					className="text-red-500 flex-shrink-0"
					size={14}
				/>
			);
		if (decision.includes("information"))
			return (
				<AlertCircle
					className="text-yellow-500 flex-shrink-0"
					size={14}
				/>
			);
		return null;
	};

	const handleSelectChat = (id) => {
		onSelectChat(id);
		if (window.innerWidth < 1024) {
			onClose();
		}
	};

	const handleDeleteChat = async (chatId, e) => {
		e.stopPropagation();
		setDeletingChatId(chatId);
		// Add a small delay for the animation
		setTimeout(() => {
			onDeleteChat(chatId);
			setDeletingChatId(null);
		}, 200);
	};

	return (
		<div className="w-full bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200 flex flex-col h-full">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="p-4 border-b border-slate-200 flex items-center justify-between bg-white/50 backdrop-blur-sm"
			>
				<h1 className="text-lg font-bold text-slate-800 lg:hidden">Chat History</h1>
				<button
					onClick={onClose}
					className="p-2 rounded-lg hover:bg-slate-200 transition-colors lg:hidden"
				>
					<X size={20} />
				</button>
			</motion.div>

			{/* New Chat Button */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="p-4 border-b border-slate-200"
			>
				<motion.button
					onClick={onNewChat}
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
				>
					<PlusCircle size={18} />
					New Claim Chat
				</motion.button>
			</motion.div>

			{/* Chat List */}
			<div className="flex-grow overflow-y-auto p-3">
				<motion.h2
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
					className="text-xs font-bold text-slate-500 uppercase px-3 mb-3 tracking-wider"
				>
					Recent Chats
				</motion.h2>

				<AnimatePresence mode="popLayout">
					{chatHistory.map((chat, index) => (
						<motion.div
							key={chat.id}
							layout
							initial={{ opacity: 0, x: -20, scale: 0.95 }}
							animate={{
								opacity: deletingChatId === chat.id ? 0.5 : 1,
								x: 0,
								scale: deletingChatId === chat.id ? 0.95 : 1,
							}}
							exit={{
								opacity: 0,
								x: -50,
								scale: 0.9,
								transition: { duration: 0.3 },
							}}
							transition={{
								delay: index * 0.05,
								type: "spring",
								duration: 0.5,
							}}
							className="relative group mb-2"
						>
							<motion.button
								onClick={() => handleSelectChat(chat.id)}
								whileHover={{ scale: 1.02, x: 4 }}
								whileTap={{ scale: 0.98 }}
								className={`w-full text-left text-sm p-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
									activeChatId === chat.id
										? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
										: "text-slate-700 hover:bg-white hover:shadow-md"
								}`}
							>
								{getStatusIcon(chat) && (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ delay: 0.3 + index * 0.05 }}
									>
										{getStatusIcon(chat)}
									</motion.div>
								)}
								<span className="truncate flex-grow pr-8 font-medium">{chat.title}</span>
								{chat.uploadedFiles && chat.uploadedFiles.length > 0 && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.4 + index * 0.05 }}
										className={`flex items-center gap-1 text-xs ${activeChatId === chat.id ? "text-blue-100" : "text-slate-500"}`}
									>
										<FileIcon size={12} />
										{chat.uploadedFiles.length}
									</motion.div>
								)}
							</motion.button>

							<motion.button
								onClick={(e) => handleDeleteChat(chat.id, e)}
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-600 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 rounded-lg hover:bg-red-50"
								disabled={deletingChatId === chat.id}
							>
								<Trash2 size={14} />
							</motion.button>
						</motion.div>
					))}
				</AnimatePresence>

				{chatHistory.length === 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="text-center py-8"
					>
						<MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-3" />
						<p className="text-slate-500 text-sm">No chats yet</p>
						<p className="text-slate-400 text-xs mt-1">Start a new conversation</p>
					</motion.div>
				)}
			</div>
		</div>
	);
};

const MiddlePanel = ({ messages, onSendMessage, isLoading, activeChatId, draft, onDraftChange, onUploadClick, uploadedFiles }) => {
	const messagesEndRef = useRef(null);
	const [showFiles, setShowFiles] = useState(true);
	const [isFocused, setIsFocused] = useState(false);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSend = () => {
		if (draft.trim() && !isLoading) {
			onSendMessage(draft.trim());
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="flex-grow flex flex-col h-full bg-white">
			{/* Messages Area */}
			<div className="flex-grow p-4 sm:p-6 overflow-y-auto">
				<div className="space-y-4 sm:space-y-6">
					<AnimatePresence initial={false}>
						{(messages || []).map((msg, index) => (
							<motion.div
								key={`${activeChatId}-${index}`}
								layout
								initial={{ opacity: 0, y: 20, scale: 0.95 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: -20, scale: 0.95 }}
								transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
								className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
							>
								{msg.role === "ai" && (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ delay: 0.2, type: "spring", duration: 0.5 }}
										className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg"
									>
										<MessageSquare
											size={16}
											className="text-white"
										/>
									</motion.div>
								)}
								<motion.div
									initial={{ scale: 0.9 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.1 }}
									className={`max-w-xs sm:max-w-md md:max-w-lg p-3 sm:p-4 rounded-2xl shadow-sm ${
										msg.role === "user"
											? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md"
											: "bg-slate-50 text-slate-800 rounded-bl-md border"
									}`}
								>
									<p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
									{msg.decision && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.3 }}
											className="mt-2 text-xs font-medium opacity-75"
										>
											Decision: {msg.decision}
										</motion.div>
									)}
								</motion.div>
								{msg.role === "user" && (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ delay: 0.2, type: "spring", duration: 0.5 }}
										className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center flex-shrink-0 shadow-lg"
									>
										<span className="text-white text-sm font-medium">U</span>
									</motion.div>
								)}
							</motion.div>
						))}
						{isLoading && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className="flex gap-3 justify-start"
							>
								<motion.div
									animate={{ rotate: 360 }}
									transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
									className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg"
								>
									<MessageSquare
										size={16}
										className="text-white"
									/>
								</motion.div>
								<div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border rounded-bl-md">
									<motion.div
										animate={{ opacity: [0.4, 1, 0.4] }}
										transition={{ duration: 1.5, repeat: Infinity }}
										className="flex items-center gap-1"
									>
										<Loader
											size={16}
											className="animate-spin text-slate-500"
										/>
										<span className="text-sm text-slate-600">Analyzing...</span>
									</motion.div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
					<div ref={messagesEndRef} />
				</div>
			</div>

			{/* Uploaded Files Banner */}
			<AnimatePresence>
				{uploadedFiles && uploadedFiles.length > 0 && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.3 }}
						className="overflow-hidden"
					>
						<div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
							<div className="flex justify-between items-center">
								<div className="flex items-center gap-2">
									<FileIcon
										size={16}
										className="text-blue-600"
									/>
									<p className="text-sm font-semibold text-slate-700">
										{uploadedFiles.length} document{uploadedFiles.length > 1 ? "s" : ""} uploaded
									</p>
								</div>
								<button
									onClick={() => setShowFiles(!showFiles)}
									className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
								>
									{showFiles ? "Hide" : "Show"}
								</button>
							</div>
							<AnimatePresence>
								{showFiles && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										className="overflow-hidden"
									>
										<div className="flex flex-wrap gap-2 mt-3">
											{uploadedFiles.map((file, i) => (
												<motion.div
													key={i}
													initial={{ opacity: 0, scale: 0.8 }}
													animate={{ opacity: 1, scale: 1 }}
													transition={{ delay: i * 0.1 }}
													className="flex items-center gap-2 bg-white border border-blue-200 text-blue-700 text-xs px-3 py-1.5 rounded-full shadow-sm"
												>
													<FileIcon size={12} />
													<span className="font-medium">{file}</span>
												</motion.div>
											))}
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Input Area */}
			<div className="p-4 border-t border-slate-200 bg-white">
				<motion.div
					animate={{
						scale: isFocused ? 1.02 : 1,
						boxShadow: isFocused
							? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
							: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
					}}
					transition={{ duration: 0.2 }}
					className="relative flex items-end bg-white border border-slate-300 rounded-xl overflow-hidden"
				>
					<textarea
						value={draft}
						onChange={(e) => onDraftChange(e.target.value)}
						onKeyDown={handleKeyDown}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						placeholder="Ask about a claim, policy coverage, or upload documents..."
						className="w-full p-3 pr-20 min-h-[48px] max-h-32 resize-none focus:outline-none text-slate-700 placeholder-slate-400"
						rows={1}
						style={{
							height: "auto",
							minHeight: "48px",
						}}
						onInput={(e) => {
							e.target.style.height = "auto";
							e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
						}}
					/>
					<div className="absolute right-2 bottom-2 flex items-center gap-1">
						<motion.button
							onClick={onUploadClick}
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							className="p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
							title="Upload documents"
						>
							<Paperclip size={20} />
						</motion.button>
						<motion.button
							onClick={handleSend}
							disabled={isLoading || !draft.trim()}
							whileHover={{ scale: isLoading || !draft.trim() ? 1 : 1.1 }}
							whileTap={{ scale: 0.9 }}
							className={`p-2 rounded-lg transition-all ${
								isLoading || !draft.trim() ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:text-white hover:bg-blue-600"
							}`}
							title="Send message"
						>
							<Send size={20} />
						</motion.button>
					</div>
				</motion.div>
				<div className="flex items-center justify-between mt-2">
					<p className="text-xs text-slate-500">Press Enter to send, Shift+Enter for new line</p>
					{uploadedFiles && uploadedFiles.length === 0 && (
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="text-xs text-blue-600 flex items-center gap-1"
						>
							<UploadCloud size={12} />
							Upload documents to get started
						</motion.p>
					)}
				</div>
			</div>
		</div>
	);
};

const RightPanel = ({ evidenceCompartments, uploadedFiles, onClose, isLargeScreen }) => {
	const compartments = evidenceCompartments || {};
	const [expandedCompartments, setExpandedCompartments] = useState({});

	const toggleCompartment = (index) => {
		setExpandedCompartments((prev) => ({
			...prev,
			[index]: !prev[index],
		}));
	};

	const StatusHeader = ({ status }) => {
		const s = status.toLowerCase();
		let Icon = HelpCircle;
		let colorClass = "text-slate-700 bg-slate-100 border-slate-200";

		if (s.includes("approved")) {
			Icon = CheckCircle;
			colorClass = "text-green-700 bg-green-50 border-green-200";
		}
		if (s.includes("denied")) {
			Icon = XCircle;
			colorClass = "text-red-700 bg-red-50 border-red-200";
		}
		if (s.includes("information")) {
			Icon = AlertCircle;
			colorClass = "text-yellow-700 bg-yellow-50 border-yellow-200";
		}

		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className={`flex items-center gap-2 text-sm font-bold p-3 rounded-lg border ${colorClass}`}
			>
				<motion.div
					initial={{ rotate: -180 }}
					animate={{ rotate: 0 }}
					transition={{ type: "spring", duration: 0.6 }}
				>
					<Icon size={16} />
				</motion.div>
				{status}
			</motion.div>
		);
	};

	return (
		<div
			className={`flex-shrink-0 w-full bg-gradient-to-b from-slate-50 to-slate-100 ${
				isLargeScreen ? "border-l" : "border-t"
			} border-slate-200 h-full flex flex-col overflow-hidden`}
		>
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="p-3 lg:p-4 border-b border-slate-200 flex items-center justify-between bg-white/50 backdrop-blur-sm flex-shrink-0"
			>
				<div className="flex items-center gap-2 min-w-0">
					<FileText
						className="text-blue-600 flex-shrink-0"
						size={18}
					/>
					<h2 className="text-base lg:text-lg font-semibold text-slate-800 truncate">Evidence Panel</h2>
				</div>
				<button
					onClick={onClose}
					className="p-1.5 lg:p-2 rounded-lg hover:bg-slate-100 transition-colors lg:hidden flex-shrink-0"
				>
					<X size={18} />
				</button>
			</motion.div>

			{/* Content */}
			<div className="overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4 flex-1 min-h-0">
				<AnimatePresence mode="wait">
					{Object.keys(compartments).length === 0 ? (
						<motion.div
							key="empty-state"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ delay: 0.2 }}
						>
							{!uploadedFiles || uploadedFiles.length === 0 ? (
								<div className="text-center py-8 px-4">
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ type: "spring", delay: 0.3, duration: 0.6 }}
									>
										<UploadCloud className="mx-auto h-16 w-16 text-slate-300 mb-4" />
									</motion.div>
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.5 }}
									>
										<p className="font-semibold text-slate-700 mb-2">Upload Documents to Begin</p>
										<p className="text-sm text-slate-500 leading-relaxed">
											Upload your policy documents, claims, or emails using the paperclip icon to start your analysis.
										</p>
									</motion.div>
								</div>
							) : (
								<div className="text-center py-8 px-4">
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ type: "spring", delay: 0.3, duration: 0.6 }}
									>
										<HelpCircle className="mx-auto h-16 w-16 text-slate-300 mb-4" />
									</motion.div>
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.5 }}
									>
										<p className="font-semibold text-slate-700 mb-2">Ready for Analysis</p>
										<p className="text-sm text-slate-500 leading-relaxed">
											Evidence based on your uploaded documents will appear here once you ask a relevant question.
										</p>
									</motion.div>
								</div>
							)}
						</motion.div>
					) : (
						<motion.div
							key="evidence-list"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							{Object.values(compartments).map((comp, index) => (
								<motion.div
									key={index}
									layout
									initial={{ opacity: 0, scale: 0.95, y: 20 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									transition={{
										delay: index * 0.1,
										type: "spring",
										duration: 0.6,
									}}
									className="bg-white p-3 lg:p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow mb-3 lg:mb-4"
								>
									<motion.h3
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.1 + 0.2 }}
										className="font-bold text-slate-700 mb-2 lg:mb-3 text-base lg:text-lg line-clamp-2"
									>
										{comp.topic}
									</motion.h3>

									{comp.decision && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.1 + 0.3 }}
											className="mb-3 lg:mb-4"
										>
											<StatusHeader status={comp.decision} />
										</motion.div>
									)}

									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 + 0.4 }}
										className="mb-3 lg:mb-4 p-3 lg:p-4 bg-slate-50 rounded-lg text-xs lg:text-sm text-slate-700 border-l-4 border-blue-400"
									>
										<p className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
											<MessageSquare
												size={12}
												className="lg:hidden"
											/>
											<MessageSquare
												size={14}
												className="hidden lg:block"
											/>
											<span className="text-xs lg:text-sm">Formal Justification:</span>
										</p>
										<p className="leading-relaxed text-xs lg:text-sm">{comp.justification}</p>
									</motion.div>

									{comp.calculation && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.1 + 0.5 }}
											className="mb-3 lg:mb-4 p-3 lg:p-4 bg-blue-50 rounded-lg text-xs lg:text-sm text-blue-800 border border-blue-200"
										>
											<p className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
												<FileText
													size={12}
													className="lg:hidden"
												/>
												<FileText
													size={14}
													className="hidden lg:block"
												/>
												<span className="text-xs lg:text-sm">Calculation:</span>
											</p>
											<p className="leading-relaxed text-xs lg:text-sm">{comp.calculation}</p>
										</motion.div>
									)}

									<div className="space-y-2 lg:space-y-3">
										<div className="flex items-center justify-between">
											<p className="text-xs lg:text-sm font-semibold text-slate-600 flex items-center gap-2">
												<FileIcon
													size={12}
													className="lg:hidden"
												/>
												<FileIcon
													size={14}
													className="hidden lg:block"
												/>
												<span>Cited Clauses ({(comp.clauses || []).length})</span>
											</p>
											{(comp.clauses || []).length > 2 && (
												<button
													onClick={() => toggleCompartment(index)}
													className="text-xs lg:text-sm text-blue-600 hover:text-blue-700 transition-colors flex-shrink-0"
												>
													{expandedCompartments[index] ? "Show Less" : "Show All"}
												</button>
											)}
										</div>

										<AnimatePresence>
											{(comp.clauses || []).slice(0, expandedCompartments[index] ? undefined : 2).map((clause, idx) => (
												<motion.div
													key={idx}
													initial={{ opacity: 0, x: -10 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.1 + 0.6 + idx * 0.1 }}
													className="p-2 lg:p-3 border-l-4 border-blue-300 bg-blue-50 rounded-r-lg"
												>
													<p className="text-xs lg:text-sm font-semibold text-blue-800 mb-1 break-words">
														<span className="inline-block">{clause.clause_id}</span>
														<span className="font-normal text-slate-500 ml-1 lg:ml-2 block lg:inline">
															{clause.source_document}
														</span>
													</p>
													<p className="text-xs lg:text-sm text-slate-700 leading-relaxed break-words">
														"{clause.clause_text}"
													</p>
												</motion.div>
											))}
										</AnimatePresence>
									</div>
								</motion.div>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

const UploadModal = ({ isOpen, onClose, onUploadSuccess, activeChatId }) => {
	const [files, setFiles] = useState([]);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [dragActive, setDragActive] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	// Reset state when modal opens
	useEffect(() => {
		if (isOpen) {
			setFiles([]);
			setError("");
			setSuccessMessage("");
			setUploadProgress(0);
		}
	}, [isOpen]);

	const handleFileChange = (e) => {
		const selectedFiles = Array.from(e.target.files);
		setFiles(selectedFiles);
		setError("");
	};

	const handleDrag = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			const droppedFiles = Array.from(e.dataTransfer.files);
			setFiles(droppedFiles);
			setError("");
		}
	};

	const removeFile = (index) => {
		setFiles(files.filter((_, i) => i !== index));
	};

	const handleUpload = async () => {
		if (files.length === 0) {
			setError("Please select at least one file.");
			return;
		}

		// Validate file types
		const validTypes = [".pdf", ".docx", ".eml"];
		const invalidFiles = files.filter((file) => !validTypes.some((type) => file.name.toLowerCase().endsWith(type)));

		if (invalidFiles.length > 0) {
			setError(`Invalid file types: ${invalidFiles.map((f) => f.name).join(", ")}. Only PDF, DOCX, and EML files are supported.`);
			return;
		}

		// Check file sizes (limit to 10MB each)
		const oversizedFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
		if (oversizedFiles.length > 0) {
			setError(`Files too large: ${oversizedFiles.map((f) => f.name).join(", ")}. Maximum size is 10MB per file.`);
			return;
		}

		setIsUploading(true);
		setError("");
		setSuccessMessage("");
		setUploadProgress(0);
		console.log("🔄 Upload state initialized - isUploading:", true, "uploadProgress:", 0);

		const formData = new FormData();
		files.forEach((file) => {
			formData.append("files", file);
		});
		formData.append("chat_id", activeChatId);

		try {
			console.log("🚀 Starting upload...");
			setUploadProgress(0); // Reset progress

			const response = await axios.post("http://127.0.0.1:8000/api/v1/upload", formData, {
				headers: { "Content-Type": "multipart/form-data" },
				timeout: 120000, // Increased to 2 minutes
				onUploadProgress: (progressEvent) => {
					if (progressEvent.total) {
						const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
						console.log(`📊 Upload progress: ${percentCompleted}%`);
						setUploadProgress(percentCompleted);
					}
				},
			});

			console.log("✅ Upload successful:", response.data);
			setSuccessMessage(`${response.data.processed_files.length} file(s) uploaded successfully!`);
			onUploadSuccess(response.data.processed_files);

			// Auto-close after success
			setTimeout(() => {
				onClose();
			}, 2000);
		} catch (err) {
			console.error("Upload error:", err);

			let errorMessage = "An error occurred during upload. Please try again.";

			if (err.code === "ECONNABORTED") {
				errorMessage = "Upload timed out. Please try uploading smaller files or check your internet connection.";
			} else if (err.response?.status === 413) {
				errorMessage = "Files are too large. Please upload smaller files.";
			} else if (err.response?.status === 500) {
				errorMessage = "Server error occurred. Please try again or contact support.";
			} else if (err.response?.data?.detail) {
				errorMessage = err.response.data.detail;
			} else if (err.message) {
				errorMessage = err.message;
			}

			setError(errorMessage);
		} finally {
			setIsUploading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="absolute inset-0 bg-black bg-opacity-50"
				onClick={onClose}
			/>
			<motion.div
				initial={{ opacity: 0, scale: 0.9, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.9, y: 20 }}
				transition={{ type: "spring", duration: 0.5 }}
				className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md z-10 max-h-[90vh] overflow-y-auto"
			>
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-slate-800">Upload Documents</h2>
					<button
						onClick={onClose}
						className="p-2 rounded-full hover:bg-slate-100 transition-colors"
					>
						<X
							size={20}
							className="text-slate-600"
						/>
					</button>
				</div>

				<p className="text-slate-600 mb-6">Upload policy documents, claims, or emails to get started with your analysis.</p>

				<div className="mb-6">
					<div
						className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
							dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
						}`}
						onDragEnter={handleDrag}
						onDragLeave={handleDrag}
						onDragOver={handleDrag}
						onDrop={handleDrop}
						onClick={() => document.getElementById("file-input").click()}
					>
						<input
							id="file-input"
							type="file"
							multiple
							onChange={handleFileChange}
							className="hidden"
							accept=".pdf,.docx,.eml"
						/>
						<motion.div
							animate={dragActive ? { scale: 1.05 } : { scale: 1 }}
							transition={{ duration: 0.2 }}
						>
							<UploadCloud className={`mx-auto h-12 w-12 mb-3 ${dragActive ? "text-blue-500" : "text-slate-400"}`} />
							<span className={`block text-sm font-semibold ${dragActive ? "text-blue-600" : "text-slate-600"}`}>
								{dragActive
									? "Drop files here"
									: files.length > 0
									? `${files.length} file(s) selected`
									: "Click to select files or drag & drop"}
							</span>
							<p className="text-xs text-slate-500 mt-2">PDF, DOCX, EML files only</p>
						</motion.div>
					</div>
				</div>

				<AnimatePresence>
					{files.length > 0 && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="mb-6 space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3 bg-slate-50"
						>
							{files.map((file, i) => (
								<motion.div
									key={i}
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: i * 0.1 }}
									className="flex items-center justify-between bg-white p-2 rounded border"
								>
									<div className="flex items-center gap-2 min-w-0 flex-1">
										<FileIcon
											size={16}
											className="text-slate-500 flex-shrink-0"
										/>
										<span className="text-sm text-slate-700 truncate">{file.name}</span>
										<span className="text-xs text-slate-500 flex-shrink-0">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
									</div>
									<button
										onClick={() => removeFile(i)}
										className="p-1 text-slate-400 hover:text-red-500 transition-colors"
									>
										<X size={14} />
									</button>
								</motion.div>
							))}
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence>
					{error && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
						>
							<p className="text-red-600 text-sm">{error}</p>
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence>
					{successMessage && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
						>
							<p className="text-green-600 text-sm flex items-center gap-2">
								<CheckCircle size={16} />
								{successMessage}
							</p>
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence>
					{isUploading && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="mb-4"
						>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium text-slate-700">Uploading files...</span>
								<span className="text-sm text-slate-600">{uploadProgress}%</span>
							</div>
							<div className="w-full bg-slate-200 rounded-full h-2">
								<motion.div
									className="bg-blue-600 h-2 rounded-full"
									initial={{ width: 0 }}
									animate={{ width: `${uploadProgress}%` }}
									transition={{ duration: 0.3 }}
								/>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				<div className="flex flex-col sm:flex-row justify-end gap-3">
					<button
						onClick={onClose}
						className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
						disabled={isUploading}
					>
						Cancel
					</button>
					<motion.button
						onClick={handleUpload}
						disabled={isUploading || files.length === 0}
						className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
						whileHover={{ scale: isUploading ? 1 : 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						{isUploading ? (
							<>
								<Loader
									size={16}
									className="animate-spin"
								/>
								Uploading...
							</>
						) : (
							<>
								<UploadCloud size={16} />
								Upload {files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""}` : ""}
							</>
						)}
					</motion.button>
				</div>
			</motion.div>
		</div>
	);
};

// --- App Component (Main logic is the same) ---
export default function App() {
	const [chatHistory, setChatHistory] = useState([]);
	const [activeChatId, setActiveChatId] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);
	const [isRightPanelVisible, setIsRightPanelVisible] = useState(false);
	// Track large screen to always show evidence panel in desktop/full screen
	const [isLargeScreen, setIsLargeScreen] = useState(() => (typeof window !== "undefined" ? window.innerWidth >= 1024 : false));
	const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 1024 : true));

	useEffect(() => {
		function handleResize() {
			const width = window.innerWidth;
			const large = width >= 1024; // lg breakpoint
			setIsLargeScreen(large);
			setIsMobile(width < 1024);
			if (large) {
				setIsRightPanelVisible(true); // always show on large
			}
		}
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// All handlers and useEffects remain the same
	// ... (pasting for completeness)
	useEffect(() => {
		setIsLeftPanelVisible(window.innerWidth >= 1024);
		const handleResize = () => {
			const large = window.innerWidth >= 1024;
			setIsLeftPanelVisible(large);
			if (large) {
				setIsRightPanelVisible(true); // ensure visible when entering large screen
			}
		};
		window.addEventListener("resize", handleResize);
		try {
			const savedHistory = localStorage.getItem("insuranceChatHistory");
			if (savedHistory) {
				const parsedHistory = JSON.parse(savedHistory);
				if (parsedHistory && parsedHistory.length > 0) {
					setChatHistory(parsedHistory);
					setActiveChatId(parsedHistory[0].id);
				} else {
					startNewChat();
				}
			} else {
				startNewChat();
			}
		} catch (error) {
			console.error("Failed to parse chat history", error);
			startNewChat();
		}
		return () => window.removeEventListener("resize", handleResize);
	}, []);
	useEffect(() => {
		if (chatHistory.length > 0) {
			localStorage.setItem("insuranceChatHistory", JSON.stringify(chatHistory));
		} else {
			localStorage.removeItem("insuranceChatHistory");
		}
	}, [chatHistory]);
	const startNewChat = () => {
		const newChat = {
			id: (Date.now() + Math.random()).toString(),
			title: "New Claim Inquiry",
			messages: [{ role: "ai", content: "Hello! Please upload your policy documents to get started." }],
			evidenceCompartments: {},
			draft: "",
			uploadedFiles: [],
		};
		setChatHistory((prev) => [newChat, ...prev]);
		setActiveChatId(newChat.id);
	};
	const deleteChat = (id) => {
		const updatedHistory = chatHistory.filter((chat) => chat.id !== id);
		setChatHistory(updatedHistory);
		if (activeChatId === id) {
			const newActiveId = updatedHistory.length > 0 ? updatedHistory[0].id : null;
			setActiveChatId(newActiveId);
			if (!newActiveId) {
				startNewChat();
			}
		}
	};
	const handleDraftChange = (newDraft) => {
		setChatHistory((prev) => prev.map((chat) => (chat.id === activeChatId ? { ...chat, draft: newDraft } : chat)));
	};
	const handleSendMessage = async (userInput) => {
		const activeChatIndex = chatHistory.findIndex((c) => c.id === activeChatId);
		if (activeChatIndex === -1) return;
		const currentChat = chatHistory[activeChatIndex];
		if (currentChat.uploadedFiles.length === 0) {
			const errorMsg = { role: "ai", content: "Please upload at least one document for this chat before asking a question." };
			setChatHistory((prev) => prev.map((c) => (c.id === activeChatId ? { ...c, messages: [...c.messages, errorMsg] } : c)));
			return;
		}
		const userMessage = { role: "user", content: userInput };
		setChatHistory((prev) => prev.map((c) => (c.id === activeChatId ? { ...c, messages: [...c.messages, userMessage], draft: "" } : c)));
		setIsLoading(true);
		const formData = new FormData();
		formData.append("query", userInput);
		formData.append("messages_json", JSON.stringify(currentChat.messages));
		formData.append("chat_id", activeChatId);
		try {
			const result = await axios.post("http://127.0.0.1:8000/api/v1/query", formData);
			const apiData = result.data;
			const aiMessage = { role: "ai", content: apiData.conversational_answer, decision: apiData.decision };
			setChatHistory((prev) =>
				prev.map((c) => {
					if (c.id === activeChatId) {
						const updatedChat = { ...c, messages: [...c.messages, aiMessage] };
						if (apiData.new_chat_title) {
							updatedChat.title = apiData.new_chat_title;
						}
						if (apiData.topic && apiData.supporting_clauses) {
							updatedChat.evidenceCompartments[apiData.topic] = {
								topic: apiData.topic,
								decision: apiData.decision,
								justification: apiData.justification,
								calculation: apiData.calculation_explanation,
								clauses: apiData.supporting_clauses,
							};
						}
						return updatedChat;
					}
					return c;
				})
			);
		} catch (error) {
			const errorMessage = { role: "ai", content: `Sorry, an error occurred: ${error.response?.data?.detail || error.message}` };
			setChatHistory((prev) => prev.map((c) => (c.id === activeChatId ? { ...c, messages: [...c.messages, errorMessage] } : c)));
		} finally {
			setIsLoading(false);
		}
	};
	const handleUploadSuccess = (uploadedFileNames) => {
		setChatHistory((prev) =>
			prev.map((chat) => {
				if (chat.id === activeChatId) {
					const newUploadedFiles = [...(chat.uploadedFiles || []), ...uploadedFileNames];
					return { ...chat, uploadedFiles: [...new Set(newUploadedFiles)] };
				}
				return chat;
			})
		);
	};
	const activeChat = chatHistory.find((c) => c.id === activeChatId);
	const closeAllPanels = () => {
		setIsLeftPanelVisible(false);
		setIsRightPanelVisible(false);
	};

	return (
		<>
			<AnimatePresence>
				{isUploadModalOpen && (
					<UploadModal
						isOpen={isUploadModalOpen}
						onClose={() => setIsUploadModalOpen(false)}
						onUploadSuccess={handleUploadSuccess}
						activeChatId={activeChatId}
					/>
				)}
			</AnimatePresence>

			<div className="h-screen w-screen bg-gradient-to-br from-slate-100 to-slate-200 font-sans text-slate-900 flex flex-col overflow-hidden">
				{/* Enhanced Header */}
				<motion.header
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex-shrink-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 shadow-sm"
				>
					<div className="flex items-center gap-3">
						<motion.button
							onClick={() => setIsLeftPanelVisible(!isLeftPanelVisible)}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-blue-600 lg:hidden transition-colors"
						>
							<PanelLeft size={20} />
						</motion.button>
						<div className="flex items-center gap-2">
							<motion.div
								initial={{ rotate: -180, scale: 0 }}
								animate={{ rotate: 0, scale: 1 }}
								transition={{ type: "spring", duration: 0.8 }}
								className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center"
							>
								<FileText
									className="text-white"
									size={16}
								/>
							</motion.div>
							<h1 className="text-lg font-bold text-slate-800">Insurance Claim Assistant</h1>
						</div>
					</div>

					<div className="flex items-center gap-2">
						{activeChat && Object.keys(activeChat.evidenceCompartments || {}).length > 0 && (
							<motion.button
								onClick={() => setIsRightPanelVisible(true)}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-blue-600 lg:hidden transition-colors"
								title="View evidence"
							>
								<FileText size={20} />
							</motion.button>
						)}

						{activeChat && (
							<motion.div
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg text-sm"
							>
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<span className="text-slate-600">{activeChat.uploadedFiles?.length || 0} documents</span>
							</motion.div>
						)}
					</div>
				</motion.header>

				{/* Main Content Area */}
				<div className="flex flex-grow overflow-hidden relative min-h-0">
					{/* Mobile Overlay */}
					<AnimatePresence>
						{(isLeftPanelVisible || isRightPanelVisible) && isMobile && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								onClick={closeAllPanels}
								className="fixed inset-0 bg-black/50 z-10 lg:hidden"
							/>
						)}
					</AnimatePresence>

					{/* Left Panel - Chat History */}
					<motion.div
						initial={false}
						animate={{
							x: isLeftPanelVisible ? 0 : -400,
						}}
						transition={{ type: "spring", damping: 30, stiffness: 300 }}
						className="absolute top-0 left-0 h-full z-20 w-80 sm:w-96 lg:w-1/4 lg:max-w-sm lg:static lg:translate-x-0"
					>
						<LeftPanel
							chatHistory={chatHistory}
							activeChatId={activeChatId}
							onSelectChat={setActiveChatId}
							onNewChat={startNewChat}
							onDeleteChat={deleteChat}
							onClose={() => setIsLeftPanelVisible(false)}
						/>
					</motion.div>

					{/* Middle Panel - Chat Interface */}
					<motion.main
						layout
						className="flex-grow h-full flex w-full"
					>
						{activeChat ? (
							<>
								<MiddlePanel
									messages={activeChat.messages}
									onSendMessage={handleSendMessage}
									isLoading={isLoading}
									activeChatId={activeChat.id}
									draft={activeChat.draft || ""}
									onDraftChange={handleDraftChange}
									onUploadClick={() => setIsUploadModalOpen(true)}
									uploadedFiles={activeChat.uploadedFiles}
								/>

								{/* Right Panel - Evidence (Right sidebar on large screens, bottom sheet on mobile) */}
								<motion.div
									initial={false}
									animate={isLargeScreen ? { x: 0 } : { y: isRightPanelVisible ? 0 : 500 }}
									transition={{ type: "spring", damping: 28, stiffness: 260 }}
									className={`absolute z-20 flex ${
										isLargeScreen
											? "top-0 right-0 h-full w-full sm:w-96 lg:w-1/3 xl:w-1/4 lg:max-w-md lg:static"
											: "left-0 right-0 bottom-0 h-[65%] w-full rounded-t-2xl shadow-2xl"
									} bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60`}
								>
									<RightPanel
										isLargeScreen={isLargeScreen}
										evidenceCompartments={activeChat.evidenceCompartments}
										uploadedFiles={activeChat.uploadedFiles || []}
										onClose={() => setIsRightPanelVisible(false)}
									/>
								</motion.div>
							</>
						) : (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="flex-grow flex items-center justify-center text-slate-500 p-8"
							>
								<div className="text-center">
									<MessageSquare className="mx-auto h-16 w-16 text-slate-300 mb-4" />
									<h3 className="text-xl font-semibold text-slate-700 mb-2">Welcome to Insurance Claims</h3>
									<p className="text-slate-500">Select a chat or start a new conversation to begin.</p>
								</div>
							</motion.div>
						)}
					</motion.main>
				</div>
			</div>
		</>
	);
}
