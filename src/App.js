import logo from './logo.svg';
import './App.css';

import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { TextField, Button, List, ListItem, Typography } from "@mui/material";

const App = () => {
    const [nickname, setNickname] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [client, setClient] = useState(null);

    useEffect(() => {
        const socket = new SockJS("http://localhost:8080/ws");  // Connect to the WebSocket server
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                stompClient.subscribe("/topic/messages", (msg) => {
                    setMessages((prevMessages) => [...prevMessages, JSON.parse(msg.body)]);
                });
            },
        });

        stompClient.activate();  // Activate the WebSocket connection
        setClient(stompClient);

        return () => {
            stompClient.deactivate();  // Clean up when the component unmounts
        };
    }, []);

    const sendMessage = () => {
        if (client && message.trim() && nickname.trim()) {
            const chatMessage = { nickname, message };
            client.publish({ destination: "/app/chat", body: JSON.stringify(chatMessage) });
            console.log("THE CHAT MESSAGE:" + JSON.stringify(chatMessage));
            setMessage("");  // Clear the input field
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
            <Typography variant="h4" gutterBottom>
                Web Chat
            </Typography>
            <List>
                {messages.map((msg, index) => (
                    <ListItem key={index}>
                        <Typography variant="body1">
                            <strong>{msg.nickname}:</strong> {msg.message} ({msg.timestamp})
                        </Typography>
                    </ListItem>
                ))}
            </List>
            <TextField
                label="Nickname"
                fullWidth
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                margin="normal"
            />
            <TextField
                label="Message"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                margin="normal"
            />
            <Button variant="contained" color="primary" onClick={sendMessage} fullWidth>
                Send
            </Button>
        </div>
    );
};

export default App;