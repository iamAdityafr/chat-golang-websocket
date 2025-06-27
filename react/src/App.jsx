import React, { useState, useEffect, useRef } from "react";
import image from "./assets/Mountain.png";

const App = () => {
  const [nameInput, setNameInput] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!name) return;

    ws.current = new WebSocket(
      `ws://localhost:8080/ws?name=${encodeURIComponent(name)}`
    );

    ws.current.onopen = () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages((prev) => [
        ...prev,
        { sender: msg.sender, content: msg.content, timestamp },
      ]);
    };

    ws.current.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [name]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && ws.current && isConnected) {
      ws.current.send(message);
      setMessage("");
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setName(nameInput.trim());
    }
  };

  const handleLogout = () => {
    if (ws.current) {
      ws.current.close();
    }

    setName("");
    setNameInput("");
    setMessage("");
    setMessages([]);
    setIsConnected(false);
  };

  const handleNameKeyPress = (e) => {
    if (e.key === "Enter") {
      handleNameSubmit(e);
    }
  };

  const handleMessageKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage(e);
    }
  };

  return (
    <>
      {!name ? (
        <div
          className="h-screen bg-cover bg-center w-screen flex items-center justify-center"
          style={{ backgroundImage: `url(${image})` }}
        >
          <div className="bg-white/70 p-8 rounded-lg shadow-xl flex flex-col items-center w-[90%] max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Enter your username
            </h2>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={handleNameKeyPress}
              className="p-2 border border-b-4 border-gray-400 bg-transparent focus:outline-none  rounded w-full text-black mb-4 transition"
              placeholder="Your name"
            />
            <button
              onClick={handleNameSubmit}
              className="py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 w-full shadow-md"
            >
              Enter
            </button>
          </div>
        </div>
      ) : (
        <div
          className="h-screen bg-cover bg-center w-screen bg-cyan-400 flex items-center justify-center"
          style={{ backgroundImage: `url(${image})` }}
        >
          <div className="bg-white/40 p-4 w-[80%] h-[80%] rounded-lg shadow-3xl flex flex-col">
            <div className="py-4 px-4 my-3 bg-gradient-to-r from-purple-500 to-blue-500 w-full rounded-lg shadow-md flex items-center text-white">
              <h2 className="text-xl font-bold">This is Chat Page 🚀</h2>

              <div className="flex-1 flex justify-center">
                <span>
                  Status:
                  <span
                    className={
                      isConnected
                        ? "text-green-400 font-bold"
                        : "text-red-400 font-bold"
                    }
                  >
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="font-medium">
                  You're logged in as :{" "}
                  <span className="text-white font-bold">{name}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-transparent border-b-blue-300 shadow-cyan-500 rounded-2xl">
              {messages.map((msg, index) => {
                const isSender = msg.sender === name;
                return (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      isSender ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-1/3 break-words ${
                        isSender
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      {!isSender && (
                        <div className="text-sm font-semibold text-blue-700 mb-1">
                          {msg.sender}
                        </div>
                      )}
                      {msg.content}
                    </div>
                    <div className="font-bold text-gray-600 text-xs mt-1">
                      {msg.timestamp}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-2 flex gap-2 items-center bg-transparent rounded-b-lg shadow-inner">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleMessageKeyPress}
                placeholder="Type your message..."
                className="flex-grow px-4 py-2 rounded-lg bg-purple-100 text-black placeholder-gray-600 focus:outline-none shadow-md"
              />
              <button
                onClick={handleSendMessage}
                className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
