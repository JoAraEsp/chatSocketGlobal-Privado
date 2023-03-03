import express from "express";
import http from 'http';
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server)


const port = 3000;
const dir = process.cwd() 

const users = {}
const clients = {}

app.get("/style.css", (req, res) => {
    res.sendFile(dir + "/style.css")
})

app.get("/socketClient.js", (req, res) => {
    res.sendFile(dir + "/socketClient.js")
})

app.get("/", (req, res) => {
    res.sendFile(dir + "/")
})

io.on('connection', (socket) => {
    console.log("Un usuario se ha conectado");

    socket.emit('users', users)

    socket.on("message", (msg) => {
        if (msg.room == "general") {
            socket.broadcast.emit("message", {
                message: msg.message,
                date: msg.date,
                img: msg.img,
                user: users[socket.id].username,
                room: msg.room
            })
            return
        }
        clients[users[msg.room].username].emit("private", {
            message: msg.message,
            date: msg.date,
            img: msg.img,
            user: users[socket.id].username,
            room: socket.id
        })
    })

    socket.on('register', (username) => {

        let last = `Envía mensajes a ${username}`;

        if (users[socket.id]) {
            last = users[socket.id].lastMessage
        }

        users[socket.id] = {
            socket: socket.id,
            status: 1,
            lastMessage: last,
            username: username,
            room: undefined
        }

        clients[username] = socket;
        socket.broadcast.emit("register", users[socket.id])
    })

    socket.on("disconnect", () => {
        if (users[socket.id]) {
            socket.broadcast.emit("left", users[socket.id])
            delete clients[users[socket.id].username]
            delete users[socket.id]
        }
    })

    socket.on('loadchat', (room) => {
        if (room == "general") {
            console.log(room)
        } else {
            console.log(users[room].username)
        }
    })

})


server.listen(port, (req, res) => {
    console.log("Ingrese: http://localhost:" + port)
})