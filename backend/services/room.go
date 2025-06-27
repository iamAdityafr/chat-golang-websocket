package services

type Room struct {
	Users      map[*User]string
	Broadcast  chan []byte
	Register   chan *User
	Unregister chan *User
}

func NewRoom() *Room {
	return &Room{
		Users:      make(map[*User]string),
		Broadcast:  make(chan []byte),
		Register:   make(chan *User),
		Unregister: make(chan *User),
	}
}

func (r *Room) Run() {
	for {
		select {
		case user := <-r.Register:
			r.Users[user] = user.Name
		case user := <-r.Unregister:
			if _, ok := r.Users[user]; ok {
				delete(r.Users, user)
				close(user.Send)
			}
		case message := <-r.Broadcast:
			for user := range r.Users {
				select {
				case user.Send <- message:
				default:
					close(user.Send)
					delete(r.Users, user)
				}
			}
		}
	}
}
