package main

import (
	"fmt"
	"net/http"
	"sync"
	"encoding/json"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}
type Client struct{ conn *websocket.Conn; name string }
var clients = map[*Client]bool{}
var mu sync.Mutex
var board = map[string]int{}

func ws(w http.ResponseWriter, r *http.Request){
	c,err := upgrader.Upgrade(w,r,nil)
	if err!=nil{return}
	client := &Client{conn:c}
	mu.Lock();clients[client]=true;mu.Unlock()
	for{
		_,msg,err := c.ReadMessage()
		if err!=nil{break}
		var m map[string]interface{}
		json.Unmarshal(msg,&m)
		if m["type"]=="join"{client.name=m["name"].(string)}
		if m["type"]=="score"{
			s:=int(m["score"].(float64))
			mu.Lock();board[client.name]=s;mu.Unlock()
		}
	}
	mu.Lock();delete(clients,client);mu.Unlock()
	c.Close()
}

func broadcast(){
	for{
		time.Sleep(5*time.Second)
		mu.Lock()
		snap:=make(map[string]int)
		for k,v:=range board{snap[k]=v}
		data,_:=json.Marshal(map[string]interface{}{"type":"leaderboard","data":snap})
		for c:=range clients{c.conn.WriteMessage(websocket.TextMessage,data)}
		mu.Unlock()
	}
}

func main(){
	http.HandleFunc("/ws",ws)
	go broadcast()
	fmt.Println("Server run :8080")
	http.ListenAndServe(":8080",nil)
}
