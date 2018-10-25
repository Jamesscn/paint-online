var socket = io()
var drawColour = [255, 255, 255]
var imageData = null
var canvasElement = null
var canvas = null
var width = 0
var height = 0
var mouseX = 0
var mouseY = 0
var prevMouseX = 0
var prevMouseY = 0
var mouseDown = false
var canDraw = false
var pencilX = [0, 0.3, 1, 0.7, 0]
var pencilY = [0, 0, 0.7, 1, 0.3]

document.body.onmousedown = function () {
    mouseDown = true
}

document.body.onmouseup = function () {
    mouseDown = false
}

function draw() {
    var brushSize = params.data.brushSize
    if (mouseDown && mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
        socket.emit("draw", {
            x: mouseX,
            y: mouseY,
            prevX: prevMouseX,
            prevY: prevMouseY,
            size: brushSize,
            colour: drawColour
        })
        var pixels = imageData.data
        var stepSize = Math.abs(mouseX - prevMouseX)
        if (Math.abs(mouseY - prevMouseY) > stepSize) {
            stepSize = Math.abs(mouseY - prevMouseY)
        }
        for (var t = 0; t <= 1; t += 1 / stepSize) {
            var currX = Math.round(prevMouseX + (mouseX - prevMouseX) * t)
            var currY = Math.round(prevMouseY + (mouseY - prevMouseY) * t)
            for (var i = -brushSize; i <= brushSize; i++) {
                for (var j = -brushSize; j <= brushSize; j++) {
                    pixels[4 * ((currY + j) * width + currX + i)] = drawColour[0]
                    pixels[4 * ((currY + j) * width + currX + i) + 1] = drawColour[1]
                    pixels[4 * ((currY + j) * width + currX + i) + 2] = drawColour[2]
                }
            }
        }
        canvas.putImageData(imageData, 0, 0)
    }
    prevMouseX = mouseX
    prevMouseY = mouseY
    requestAnimationFrame(draw)
}

function drawPencil(x, y, size, colour, username) {
    size *= 30
    canvas.fillStyle = "rgb(255, 170, 109)"
    canvas.beginPath()
    canvas.moveTo(x + size * pencilX[0], y - size * pencilY[0])
    canvas.lineTo(x + size * pencilX[1], y - size * pencilY[1])
    canvas.lineTo(x + size * pencilX[4], y - size * pencilY[4])
    canvas.fill()

    canvas.fillStyle = "rgb(" + colour[0] + ", " + colour[1] + ", " + colour[2] + ")"
    canvas.beginPath()
    canvas.moveTo(x + size * pencilX[1], y - size * pencilY[1])
    canvas.lineTo(x + size * pencilX[2], y - size * pencilY[2])
    canvas.lineTo(x + size * pencilX[3], y - size * pencilY[3])
    canvas.lineTo(x + size * pencilX[4], y - size * pencilY[4])
    canvas.fill()

    canvas.font = "12px sans-serif"
    canvas.fillText(username, x + size, y - size)

    size *= 0.4
    canvas.fillStyle = "rgb(0, 0, 0)"
    canvas.beginPath()
    canvas.moveTo(x + size * pencilX[0], y - size * pencilY[0])
    canvas.lineTo(x + size * pencilX[1], y - size * pencilY[1])
    canvas.lineTo(x + size * pencilX[4], y - size * pencilY[4])
    canvas.fill()
}

socket.on("change", function (brush) {
    var pixels = imageData.data
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
    canvas.putImageData(imageData, 0, 0)
    drawPencil(brush.x, brush.y, brush.size, brush.colour, brush.user)
})

socket.on("canvas", function (pixels) {
    imageData = new ImageData(new Uint8ClampedArray(pixels), width, height)
    canvas.putImageData(imageData, 0, 0)
})

function onLoadCanvas() {
    var eraser = document.getElementById("eraser")
    var whiteCol = document.getElementById("white")
    var redCol = document.getElementById("red")
    var orangeCol = document.getElementById("orange")
    var yellowCol = document.getElementById("yellow")
    var greenCol = document.getElementById("green")
    var cyanCol = document.getElementById("cyan")
    var blueCol = document.getElementById("blue")
    var purpleCol = document.getElementById("purple")
    var pinkCol = document.getElementById("pink")
    var downloadBtn = document.getElementById("download")
    canvasElement = document.getElementById("drawspace")
    canvas = canvasElement.getContext("2d")
    width = canvasElement.width
    height = canvasElement.height
    downloadBtn.addEventListener("click", function (event) {
        var dataURL = canvasElement.toDataURL('image/png');
        downloadBtn.href = dataURL;
    })
    window.addEventListener("mousemove", function (event) {
        var rect = canvasElement.getBoundingClientRect()
        mouseX = Math.floor(event.clientX - rect.left)
        mouseY = Math.floor(event.clientY - rect.top)
    })
    imageData = canvas.getImageData(0, 0, width, height)

    eraser.onclick = function () {
        drawColour = [36, 36, 36]
    }

    whiteCol.onclick = function () {
        drawColour = [255, 255, 255]
    }

    redCol.onclick = function () {
        drawColour = [255, 0, 0]
    }

    orangeCol.onclick = function () {
        drawColour = [255, 127, 0]
    }

    yellowCol.onclick = function () {
        drawColour = [255, 255, 0]
    }

    greenCol.onclick = function () {
        drawColour = [0, 255, 0]
    }

    cyanCol.onclick = function () {
        drawColour = [0, 255, 255]
    }

    blueCol.onclick = function () {
        drawColour = [0, 0, 255]
    }

    purpleCol.onclick = function () {
        drawColour = [255, 0, 255]
    }

    pinkCol.onclick = function () {
        drawColour = [255, 0, 128]
    }
}

var params = {
    el: "#app",
    data: {
        menu: true,
        username: "",
        brushSize: 1
    },
    methods: {
        enter() {
            this.menu = false
            onLoadCanvas()
            draw()
            socket.emit("enter", this.username)
        }
    }
}

new Vue(params)