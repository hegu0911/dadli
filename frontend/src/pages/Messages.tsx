import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Conversation, Message, User } from "../types";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import { ArrowLeftIcon, SendIcon, EmptyChatIcon, SearchIcon } from "../components/Icons";
import { showToast } from "../components/Premium";

interface FollowerTab {
  id: string;
  user: User;
}

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<{ id: string; username: string; displayName?: string; avatarUrl?: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFollowers, setShowFollowers] = useState(false);
  const [followers, setFollowers] = useState<FollowerTab[]>([]);
  const [followerSearch, setFollowerSearch] = useState("");

  useEffect(() => {
    api.get("/messages/conversations").then((res) => setConversations(res.data.conversations)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showFollowers && user?.id) {
      api.get(`/users/${user.id}/following`).then((res) => {
        // Get users that the current user follows (potential chat partners)
        setFollowers((res.data.following || []).map((u: any) => ({ id: u.id, user: u })));
      }).catch(() => {});
    }
  }, [showFollowers, user?.id]);

  const openChat = async (conv: Conversation) => {
    setActiveChat(conv.user.id);
    setActiveUser(conv.user);
    try {
      const res = await api.get(`/messages/${conv.user.id}`);
      setMessages(res.data.messages);
    } catch { showToast("Xeta", "error"); }
  };

  const startNewChat = async (targetUser: User) => {
    setActiveChat(targetUser.id);
    setActiveUser(targetUser);
    setMessages([]);
    setShowFollowers(false);
    try {
      const res = await api.get(`/messages/${targetUser.id}`);
      setMessages(res.data.messages);
    } catch { /* new chat, no messages yet */ }
  };

  const sendMessage = async () => {
    if (!text.trim() || !activeChat) return;
    try {
      const res = await api.post(`/messages/${activeChat}`, { content: text });
      setMessages((prev) => [...prev, res.data.message]);
      setText("");
    } catch (err: any) {
      showToast(err.response?.data?.error || "Xeta", "error");
    }
  };

  const filteredFollowers = followers.filter((f) =>
    f.user.username?.toLowerCase().includes(followerSearch.toLowerCase()) ||
    f.user.displayName?.toLowerCase().includes(followerSearch.toLowerCase())
  );

  // Conversations list view
  const renderConversationsList = () => (
    <div className="pb-16">
      <div className="flex items-center justify-between px-4 h-12 border-b border-gray-100">
        <h1 className="font-bold text-lg">{user?.displayName || user?.username}</h1>
        <button onClick={() => setShowFollowers(true)} className="text-sm text-primary font-semibold">Yeni mesaj</button>
      </div>
      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <EmptyChatIcon size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="font-semibold text-gray-600">Hale mesaj yoxdur</p>
          <p className="text-sm mt-1">Bir resept paylas ve sohbete basla</p>
          <button onClick={() => setShowFollowers(true)}
            className="mt-4 text-primary text-sm font-semibold">Yeni mesaj yaz</button>
        </div>
      ) : (
        <div>
          {conversations.map((conv) => (
            <button key={conv.user.id} onClick={() => openChat(conv)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 active:bg-gray-100">
              <Avatar src={conv.user.avatarUrl} name={conv.user.displayName || conv.user.username} size="md" />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold">{conv.user.displayName || conv.user.username}</p>
                <p className="text-xs text-gray-400 truncate">{conv.lastMessage.content}</p>
              </div>
              <span className="text-[10px] text-gray-400 whitespace-nowrap">
                {new Date(conv.lastMessage.createdAt).toLocaleDateString("az", { day: "numeric", month: "short" })}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Followers list for new chat
  if (showFollowers) {
    return (
      <div className="pb-16">
        <div className="flex items-center gap-3 px-4 h-12 border-b border-gray-100">
          <button onClick={() => setShowFollowers(false)} className="text-gray-600"><ArrowLeftIcon size={22} /></button>
          <h1 className="font-semibold text-base">Yeni mesaj</h1>
        </div>
        <div className="relative px-4 py-3">
          <SearchIcon size={16} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="ig-input pl-9" placeholder="Axtar..." value={followerSearch}
            onChange={(e) => setFollowerSearch(e.target.value)} />
        </div>
        <div className="px-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-1">Izlediklerin</p>
          {filteredFollowers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Istifadeci tapilmadi</p>
          ) : (
            filteredFollowers.map((f) => (
              <button key={f.id} onClick={() => startNewChat(f.user)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left">
                <Avatar src={f.user.avatarUrl} name={f.user.displayName || f.user.username} size="md" />
                <div>
                  <p className="text-sm font-semibold">{f.user.displayName || f.user.username}</p>
                  <p className="text-xs text-gray-400">@{f.user.username}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // Active chat view
  if (!activeChat) return renderConversationsList();

  return (
    <div className="pb-16 flex flex-col h-screen">
      <div className="flex items-center gap-3 px-3 h-12 border-b border-gray-100">
        <button onClick={() => setActiveChat(null)} className="text-gray-600 hover:text-gray-900"><ArrowLeftIcon size={22} /></button>
        <Avatar src={activeUser?.avatarUrl} name={activeUser?.displayName || activeUser?.username || ""} size="sm" />
        <span className="text-sm font-semibold">{activeUser?.displayName || activeUser?.username}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} fade-in`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                isMine ? "bg-primary text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"
              }`}>
                {msg.content.startsWith("http") || msg.content.includes("recipe/") ? (
                  <div>
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                ) : (
                  <p className="leading-relaxed">{msg.content}</p>
                )}
                <p className={`text-[10px] mt-0.5 ${isMine ? "text-white/60" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString("az", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:bg-white focus-within:border-gray-300 transition-all">
          <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            placeholder="Mesaj yaz..." value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
          <button onClick={sendMessage} disabled={!text.trim()} className="text-primary disabled:opacity-30 hover:text-rose-600 transition-colors">
            <SendIcon size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
