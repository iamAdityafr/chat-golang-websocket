package services

import (
	"chat-golang-websocket/model"
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

type User struct {
	Id   string
	Name string
	Conn *websocket.Conn
	Room *Room
	Send chan []byte
}

func (u *User) Write() {
	defer func() {
		err := u.Conn.Close()
		if err != nil {
			return
		}
	}()

	for {
		select {
		case message, ok := <-u.Send:
			if !ok {
				err := u.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				if err != nil {
					return
				}
				return
			}

			err := u.Conn.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				return
			}

		}
	}
}

func (u *User) Read() {
	defer func() {

		u.Room.Unregister <- u

		err := u.Conn.Close()
		if err != nil {
			log.Println("closing conn err:", err)
		}

	}()

	for {
		_, message, err := u.Conn.ReadMessage()
		if err != nil {
			u.Conn.Close()
			break
		}

		jsonMsg, err := json.Marshal(&model.Message{
			Sender:  u.Name,
			Content: string(message),
		})
		if err != nil {
			log.Println("marshal error: ", err)
			return
		}
		u.Room.Broadcast <- jsonMsg
	}

}
