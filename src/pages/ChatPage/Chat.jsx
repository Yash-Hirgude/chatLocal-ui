import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
// import { useSocket } from "../context/SocketContext";
import {useSocket} from "../../context/SocketContext";
import "./Chat.css"

function Chat() {
  const { groupId } = useParams();
  const socketRef = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const enteredFromHome = location.state?.enteredFromHome;
  const groupName = location.state?.groupName || "Group Chat";

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleIncomingMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  useEffect(() => {
    if (!enteredFromHome) navigate("/", { replace: true });
  }, [enteredFromHome, navigate]);

  useEffect(() => {
    if (!socketRef?.current) return;

    const socket = socketRef.current;

    socket.emit("joinGroupRoom", groupId);
    socket.on("groupMessage", handleIncomingMessage);

    return () => {
      socket.emit("leaveGroupRoom", groupId);
      socket.off("groupMessage", handleIncomingMessage);
    };
  }, [groupId, socketRef]);

  // send message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socketRef?.current) return;

    const socket = socketRef.current;

    const msg = {
      groupId,
      text: message.trim(),
      sender: socket.id,
      timestamp: Date.now(),
    };

    socket.emit("groupMessage", msg);
    setMessages((prev) => [...prev, msg]); // optimistic update
    setMessage("");
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">{groupName}</h2>

      <div className="chat-messages">
        {messages.map((msg, index) => {
          const isOwn = msg.sender === socketRef?.current?.id;

          return (
            <div
              key={index}
              className={`message ${isOwn ? "message--own" : ""}`}
            >
              <span className="message-author">
                {isOwn ? "You" : msg.username || "User"}:
              </span>
              <span className="message-text">{msg.text}</span>
            </div>
          );
        })}
      </div>

      <form className="chat-input-form" onSubmit={sendMessage}>
        <input
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="chat-send-btn" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
