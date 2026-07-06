"use client";

export default function ReplyButtonClient({ authorName }: { authorName: string }) {
  const handleReplyClick = () => {
    // Bắn một sự kiện cục bộ trong trình duyệt để form Trả lời (SubmitAnswerClient) bắt được
    const event = new CustomEvent("replyTo", { detail: authorName });
    window.dispatchEvent(event);
  };

  return (
    <button 
      onClick={handleReplyClick}
      className="text-xs font-medium text-slate-400 hover:text-blue-500 transition-colors mr-3"
      title={`Trả lời ${authorName}`}
    >
      💬 Trả lời
    </button>
  );
}
