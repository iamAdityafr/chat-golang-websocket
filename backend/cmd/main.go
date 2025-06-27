package main

import (
	"fmt"
	"log"
	"net/http"

	"chat-golang-websocket/internal/handler"
	"chat-golang-websocket/services"
)

func main() {
	fmt.Println("Started...")

	room := services.NewRoom()

	go room.Run()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handler.Wspage(w, r, room)
	})

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Println("Server closed: ", err)
	}
}
