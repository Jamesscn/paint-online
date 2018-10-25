var express = require("express")
var app = express()
var ejs = require("ejs")
var http = require("http").Server(app)
var io = require("socket.io")(http);

const port = 3000

app.use(express.static("client"))
app.set("view engine", "ejs")

var width = 1200
var height = 600
var users = []
var pixels = []

for (var i = 0; i < width * height * 4; i += 4) {
    pixels.push(36)
    pixels.push(36)
    pixels.push(36)
    pixels.push(255)
}

io.on("connection", function (socket) {
    var username = ""
    socket.on("enter", function (name) {
        users[socket.id] = {
            username: name
        }
        username = name
        socket.emit("canvas", pixels)
    })
    socket.on("draw", function (brush) {
        var stepSize = Math.abs(brush.x - brush.prevX)
        if (Math.abs(brush.y - brush.prevY) > stepSize) {
            stepSize = Math.abs(brush.y - brush.prevY)
        }
        for (var t = 0; t <= 1; t += 1 / stepSize) {
            var currX = Math.round(brush.prevX + (brush.x - brush.prevX) * t)
            var currY = Math.round(brush.prevY + (brush.y - brush.prevY) * t)
            for (var i = -brush.size; i <= brush.size; i++) {
                for (var j = -brush.size; j <= brush.size; j++) {
                    pixels[4 * ((currY + j) * width + currX + i)] = brush.colour[0]
                    pixels[4 * ((currY + j) * width + currX + i) + 1] = brush.colour[1]
                    pixels[4 * ((currY + j) * width + currX + i) + 2] = brush.colour[2]
                }
            }
        }
        brush.user = username
        socket.broadcast.emit("change", brush);
    })
    socket.on("disconnect", function () {
        delete users[socket.id]
    })
})

app.get("/", function (req, res) {
    res.render("index")
})

http.listen(port)