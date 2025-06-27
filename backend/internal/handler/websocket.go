package handler

import (
	"chat-golang-websocket/services"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func Wspage(w http.ResponseWriter, r *http.Request, room *services.Room) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "WebSocket upgrade failed", http.StatusBadRequest)
		return
	}

	name := r.URL.Query().Get("name")
	if name == "" {
		name = "Anonymous"
	}

	user := &services.User{
		Id:   uuid.New().String(),
		Name: name,
		Conn: conn,
		Room: room,
		Send: make(chan []byte, 256),
	}
	user.Room.Register <- user

	go user.Read()
	go user.Write()
}
