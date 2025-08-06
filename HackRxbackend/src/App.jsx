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

	return (
		<div className="w-full bg-slate-100 border-r border-slate-200 flex flex-col h-full">
			<div className="p-4 border-b border-slate-200 flex items-center justify-between">
				<h1 className="text-lg font-bold text-slate-800 lg:hidden">Chat History</h1>
				<button
					onClick={onClose}
					className="p-2 rounded-md hover:bg-slate-200 transition-colors lg:hidden"
				>
					<X size={20} />
				</button>
			</div>
			<div className="p-4 border-b border-slate-200">
				<button
					onClick={onNewChat}
					className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
				>
					<PlusCircle size={18} /> New Claim Chat
				</button>
			</div>
			<div className="flex-grow overflow-y-auto p-2">
				<h2 className="text-xs font-bold text-slate-500 uppercase px-2 mb-2">Recent Chats</h2>
				{/* AnimatePresence handles the exit animation when a chat is deleted */}
				<AnimatePresence>
					{chatHistory.map((chat) => (
						<motion.div
							key={chat.id}
							layout // Magically animates reordering
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
							className="relative group"
						>
							<button
								onClick={() => handleSelectChat(chat.id)}
								className={`w-full text-left text-sm p-2 rounded-md flex items-center gap-2 transition-colors ${
									activeChatId === chat.id ? "bg-blue-200 text-blue-900" : "text-slate-700 hover:bg-slate-200"
								}`}
							>
								{getStatusIcon(chat)}
								<span className="truncate flex-grow pr-8">{chat.title}</span>
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation();
									onDeleteChat(chat.id);
								}}
								className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-600 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
							>
								<Trash2 size={14} />
							</button>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</div>
	);
};

const MiddlePanel = ({ messages, onSendMessage, isLoading, activeChatId, draft, onDraftChange, onUploadClick, uploadedFiles }) => {
	const messagesEndRef = useRef(null);
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);
	const handleSend = () => {
		if (draft.trim()) {
			onSendMessage(draft);
		}
	};
	const [showFiles, setShowFiles] = useState(true);

	return (
		<div className="flex-grow flex flex-col h-full bg-white">
			<div className="flex-grow p-4 sm:p-6 overflow-y-auto">
				<div className="space-y-6">
					<AnimatePresence initial={false}>
						{(messages || []).map((msg, index) => (
							<motion.div
								key={`${activeChatId}-${index}`}
								layout
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
							>
								{msg.role === "ai" && (
									<div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
										<MessageSquare
											size={16}
											className="text-slate-600"
										/>
									</div>
								)}
								<div
									className={`max-w-md md:max-w-lg p-3 rounded-2xl ${
										msg.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-slate-100 text-slate-800 rounded-bl-none"
									}`}
								>
									<p className="text-sm whitespace-pre-wrap">{msg.content}</p>
								</div>
							</motion.div>
						))}
						{isLoading && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="flex gap-3 justify-start"
							>
								<div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
									<MessageSquare
										size={16}
										className="text-slate-600"
									/>
								</div>
								<div className="p-3 rounded-2xl bg-slate-100">
									<Loader
										size={16}
										className="animate-spin text-slate-500"
									/>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
					<div ref={messagesEndRef} />
				</div>
			</div>
			<AnimatePresence>
				{uploadedFiles && uploadedFiles.length > 0 && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="overflow-hidden"
					>
						<div className="p-4 border-t border-slate-200 bg-slate-50">
							<div className="flex justify-between items-center">
								<p className="text-xs font-semibold text-slate-500">Chat Documents:</p>
								<button
									onClick={() => setShowFiles(!showFiles)}
									className="text-xs text-blue-600 hover:underline"
								>
									{" "}
									{showFiles ? "Hide" : "Show"}{" "}
								</button>
							</div>
							{showFiles && (
								<div className="flex flex-wrap gap-2 mt-2">
									{" "}
									{uploadedFiles.map((file, i) => (
										<div
											key={i}
											className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs px-2 py-1 rounded-md"
										>
											<FileIcon size={12} /> {file}
										</div>
									))}
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
			<div className="p-4 border-t border-slate-200 bg-white">
				<div className="relative flex items-center">
					<textarea
						value={draft}
						onChange={(e) => onDraftChange(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSend();
							}
						}}
						placeholder="Ask about a claim or policy..."
						className="w-full p-3 pr-24 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none transition"
					/>
					<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
						<button
							onClick={onUploadClick}
							className="p-2 text-slate-500 hover:text-blue-600 transition-colors"
						>
							<Paperclip size={20} />
						</button>
						<button
							onClick={handleSend}
							className="p-2 text-slate-500 hover:text-blue-600 disabled:text-slate-300 disabled:scale-100 transition-all"
							disabled={isLoading || !draft.trim()}
						>
							<Send size={20} />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

const RightPanel = ({ evidenceCompartments, uploadedFiles, onClose }) => {
	const compartments = evidenceCompartments || {};
	const StatusHeader = ({ status }) => {
		const s = status.toLowerCase();
		let Icon = HelpCircle;
		let color = "text-slate-700 bg-slate-200";
		if (s.includes("approved")) {
			Icon = CheckCircle;
			color = "text-green-700 bg-green-100";
		}
		if (s.includes("denied")) {
			Icon = XCircle;
			color = "text-red-700 bg-red-100";
		}
		if (s.includes("information")) {
			Icon = AlertCircle;
			color = "text-yellow-700 bg-yellow-100";
		}
		return (
			<div className={`flex items-center gap-2 text-sm font-bold p-2 rounded-md ${color}`}>
				<Icon size={16} /> {status}
			</div>
		);
	};
	return (
		<div className="flex-shrink-0 w-full bg-slate-50 border-l border-slate-200 h-full flex flex-col">
			<div className="p-4 border-b border-slate-200 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-slate-800">Evidence Panel</h2>
				<button
					onClick={onClose}
					className="p-2 rounded-md hover:bg-slate-100 transition-colors lg:hidden"
				>
					<X size={20} />
				</button>
			</div>
			<div className="overflow-y-auto p-4 space-y-6">
				<AnimatePresence>
					{Object.keys(compartments).length === 0 ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1, transition: { delay: 0.2 } }}
						>
							{uploadedFiles && uploadedFiles.length === 0 ? (
								<div className="text-center text-sm text-slate-500 mt-8 p-4 bg-slate-100 rounded-lg">
									<UploadCloud className="mx-auto h-10 w-10 text-slate-400 mb-3" />
									<p className="font-semibold text-slate-700 mb-1">Upload Documents to Begin</p>
									<p>To generate evidence, please first upload your policy or claim documents using the paperclip icon.</p>
								</div>
							) : (
								<div className="text-center text-sm text-slate-500 mt-8 p-4">
									<HelpCircle className="mx-auto h-10 w-10 text-slate-400 mb-3" />
									<p className="font-semibold text-slate-700 mb-1">Ready for Analysis</p>
									<p>Evidence based on your uploaded documents will appear here once you ask a relevant question.</p>
								</div>
							)}
						</motion.div>
					) : (
						Object.values(compartments).map((comp, index) => (
							<motion.div
								key={index}
								layout
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"
							>
								<h3 className="font-bold text-slate-700 mb-3">{comp.topic}</h3>
								{comp.decision && (
									<div className="mb-3">
										<StatusHeader status={comp.decision} />
									</div>
								)}
								<div className="mb-3 p-3 bg-slate-50 rounded-md text-sm text-slate-600">
									<p className="font-semibold text-slate-700">Formal Justification:</p>
									{comp.justification}
								</div>
								{comp.calculation && (
									<div className="mb-3 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
										<p className="font-semibold text-blue-800">Calculation:</p>
										{comp.calculation}
									</div>
								)}
								<p className="text-xs font-semibold text-slate-500 mb-2">Cited Clauses:</p>
								<div className="space-y-2">
									{(comp.clauses || []).map((clause, idx) => (
										<div
											key={idx}
											className="p-2 border-l-4 border-blue-300 bg-blue-50"
										>
											<p className="text-xs font-semibold text-blue-800">
												{clause.clause_id} - <span className="font-normal text-slate-500">{clause.source_document}</span>
											</p>
											<p className="text-sm text-slate-700 mt-1">"{clause.clause_text}"</p>
										</div>
									))}
								</div>
							</motion.div>
						))
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

	// Reset state when modal opens
	useEffect(() => {
		if (isOpen) {
			setFiles([]);
			setError("");
			setSuccessMessage("");
		}
	}, [isOpen]);

	const handleFileChange = (e) => {
		setFiles([...e.target.files]);
	};
	const handleUpload = async () => {
		if (files.length === 0) {
			setError("Please select at least one file.");
			return;
		}
		setIsUploading(true);
		setError("");
		setSuccessMessage("");
		const formData = new FormData();
		files.forEach((file) => {
			formData.append("files", file);
		});
		formData.append("chat_id", activeChatId);
		try {
			const response = await axios.post("https://hackrx-ai-backend.onrender.com/api/v1/upload", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			setSuccessMessage(`${response.data.processed_files.length} file(s) uploaded successfully!`);
			onUploadSuccess(response.data.processed_files);
			setFiles([]);
		} catch (err) {
			setError(err.response?.data?.detail || "An error occurred during upload.");
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="absolute inset-0 bg-black bg-opacity-50"
						onClick={onClose}
					/>
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md z-10"
					>
						<h2 className="text-2xl font-bold text-slate-800 mb-4">Upload to this Chat</h2>
						<p className="text-slate-600 mb-6">These documents will only be used for this conversation.</p>
						<div className="mb-4">
							<label className="block w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors">
								<UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
								<span className="mt-2 block text-sm font-semibold text-slate-600">
									{files.length > 0 ? `${files.length} file(s) selected` : "Click to select files"}
								</span>
								<input
									type="file"
									multiple
									onChange={handleFileChange}
									className="hidden"
									accept=".pdf,.docx,.eml"
								/>
							</label>
						</div>
						{files.length > 0 && (
							<div className="mb-4 space-y-2 max-h-32 overflow-y-auto">
								{files.map((file, i) => (
									<div
										key={i}
										className="flex items-center gap-2 text-sm text-slate-700"
									>
										<FileIcon
											size={16}
											className="text-slate-500"
										/>{" "}
										{file.name}
									</div>
								))}
							</div>
						)}
						{error && <p className="text-red-500 text-sm mb-4">{error}</p>}
						{successMessage && <p className="text-green-500 text-sm mb-4">{successMessage}</p>}
						<div className="flex flex-col sm:flex-row justify-end gap-4">
							<button
								onClick={onClose}
								className="px-4 py-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
							>
								Close
							</button>
							<button
								onClick={handleUpload}
								disabled={isUploading}
								className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-slate-400 flex items-center justify-center gap-2 transition-colors"
							>
								{isUploading ? (
									<>
										<Loader
											size={16}
											className="animate-spin"
										/>{" "}
										Uploading...
									</>
								) : (
									"Upload"
								)}
							</button>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
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

	// All handlers and useEffects remain the same
	// ... (pasting for completeness)
	useEffect(() => {
		setIsLeftPanelVisible(window.innerWidth >= 1024);
		const handleResize = () => {
			setIsLeftPanelVisible(window.innerWidth >= 1024);
			if (window.innerWidth >= 1024) {
				setIsRightPanelVisible(false);
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
			const result = await axios.post('https://hackrx-ai-backend.onrender.com/api/v1/query', formData);
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
			<UploadModal
				isOpen={isUploadModalOpen}
				onClose={() => setIsUploadModalOpen(false)}
				onUploadSuccess={handleUploadSuccess}
				activeChatId={activeChatId}
			/>
			<div className="h-screen w-screen bg-slate-200 font-sans text-slate-900 flex flex-col overflow-hidden">
				<header className="flex-shrink-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
					<div className="flex items-center gap-2">
						<button
							onClick={() => setIsLeftPanelVisible(!isLeftPanelVisible)}
							className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-blue-600 lg:hidden transition-colors"
						>
							<PanelLeft size={20} />
						</button>
						<h1 className="text-lg font-bold text-slate-800">Insurance Claim Assistant</h1>
					</div>
					<button
						onClick={() => setIsRightPanelVisible(true)}
						className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-blue-600 lg:hidden transition-colors"
					>
						<FileText size={20} />
					</button>
				</header>
				<div className="flex flex-grow overflow-hidden relative min-h-0">
					{(isLeftPanelVisible || isRightPanelVisible) && window.innerWidth < 1024 && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={closeAllPanels}
							className="fixed inset-0 bg-black/50 z-10 lg:hidden"
						/>
					)}
					<div
						className={`absolute top-0 left-0 h-full z-20 transition-transform duration-300 ease-in-out w-4/5 max-w-sm lg:w-1/4 lg:max-w-none lg:static lg:translate-x-0 ${
							isLeftPanelVisible ? "translate-x-0" : "-translate-x-full"
						}`}
					>
						<LeftPanel
							chatHistory={chatHistory}
							activeChatId={activeChatId}
							onSelectChat={setActiveChatId}
							onNewChat={startNewChat}
							onDeleteChat={deleteChat}
							onClose={() => setIsLeftPanelVisible(false)}
						/>
					</div>
					<main className="flex-grow h-full flex w-full">
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
								<div
									className={`absolute top-0 right-0 h-full z-20 transition-transform duration-300 ease-in-out w-4/5 max-w-md lg:w-1/3 lg:max-w-none lg:static lg:translate-x-0 ${
										isRightPanelVisible ? "translate-x-0" : "translate-x-full"
									} ${
										!activeChat.evidenceCompartments || Object.keys(activeChat.evidenceCompartments).length === 0
											? "hidden lg:flex"
											: "flex"
									}`}
								>
									<RightPanel
										evidenceCompartments={activeChat.evidenceCompartments}
										uploadedFiles={activeChat.uploadedFiles || []}
										onClose={() => setIsRightPanelVisible(false)}
									/>
								</div>
							</>
						) : (
							<div className="flex-grow flex items-center justify-center text-slate-500">Select a chat or start a new one.</div>
						)}
					</main>
				</div>
			</div>
		</>
	);
}
