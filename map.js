const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 3100
canvas.height = 1540

canvas.style.width = "1550px"
canvas.style.height = "770px"
ctx.translate(3, 3)

const a = 2 * Math.PI / 6;
const r = 30;
const d = 60

const offsetY = r * Math.sin(a)
const offsetX = r * Math.cos(a)

const hypotenuse = offsetX / offsetY

let isDown = false
let findingPath = false
let button = ""
let key = ""

let popup = true


const pathfinding = new PathFinding()

function init() {
    drawGrid(canvas.width, canvas.height)
}
init();

/*

    got this from "https://eperezcosano.github.io/hex-grid" (thank you)

*/
function drawGrid(width, height) {
    for (let y = d, i = 0; y + d * Math.sin(a) < height; y += d * Math.sin(a), i++) {
        pathfinding.walls.push([])
        for (let x = d, j = 0; x + d * (1 + Math.cos(a)) < width; x += d * (1 + Math.cos(a)), y += (-1) ** j++ * d * Math.sin(a)) { 
            pathfinding.walls[i][j] = 0
            fillHexagon(x, y, "", "", j, i);
        }
    }

    pathfinding.HEIGHT = pathfinding.walls.length - 1
    pathfinding.WIDTH = pathfinding.walls[0].length - 1
}

function isInside(x, y) {
    const left = r - offsetX
    const right = r + offsetX


    if (y >= 0 && y < offsetY) {

        const leftSide = left - (y * hypotenuse) - 1

        if (x < leftSide)
            return [-1, -1] // "Is Outside Upper Left"

        const rightSide = right + (y * hypotenuse) + 1
    
        if (rightSide < x)
            return [+1, -1] // "Is Outside Upper Right"

    }
    else if (y >= offsetY && y <= offsetY * 2) {

        y = y % offsetY

        const rightSideDown = d - (y * hypotenuse) + 1

        if (rightSideDown < x)
            return [+1, 0] // "Is Outside Down Right"

        const leftSideDown = y * hypotenuse - 1

        if (leftSideDown > x)
            return [-1, 0] // "Is Outside Down Left"
    }
    
    return [0, 0]
}

function getHexagonCoord(x, y) {
    let hexX = d + (d * x) * (1 + Math.cos(a))
    let hexY = d + ((d * Math.sin(a) * 2) * y) + ((x % 2 == 0) ? 0 : d * Math.sin(a))


    return [hexX, hexY]
}

function resetPreviousCoord(target, secondary, x, y) {
    const [ hexX, hexY ] = getHexagonCoord(target.x, target.y)

    const oldX = target.x
    const oldY = target.y
        
    if (target.x != x || target.y != y) {
        target.x = x
        target.y = y
    }

    if (target.x == secondary.x && target.y == secondary.y) {
        secondary.x = -1
        secondary.y = -1
    }

    if (oldX != -1 && oldY != -1)
        fillHexagon(hexX, hexY, "", "", oldX, oldY)    
}

function drawHexagonOutline(x, y) {
    ctx.beginPath();
    for (var j = 0; j < 6; j++) {
        ctx.lineTo(x + (d - 1) * Math.cos(a * j), y + (d - 1) * Math.sin(a * j) - (d - (d * Math.sin(a))));
    }

    ctx.closePath();
    ctx.lineWidth = 3
    ctx.strokeStyle = "#626262"
    ctx.stroke();
}


function fillHexagon(x, y, b, k, indexX, indexY) {

    drawHexagonOutline(x, y)

    if (findingPath) {
        ctx.fillStyle = "#FBC2EB"
        ctx.fill()

        return
    }
    
    if (indexX != -1 && indexY != -1)
        pathfinding.walls[indexY][indexX] = 0
    
    // pathfinding.walls
    if (b == "left" && !k) {
        ctx.fillStyle = "red"
        ctx.fill()

        pathfinding.walls[indexY][indexX] = 1
    } 
    // Start
    else if (b == "left" && k == "S"){ 
        ctx.fillStyle = "#80FF00"
        ctx.fill()

        return resetPreviousCoord(pathfinding.start, pathfinding.destination, indexX, indexY)
    }
    // Destination
    else if (b == "left" && k == "D"){ 
        ctx.fillStyle = "purple"
        ctx.fill()

        return resetPreviousCoord(pathfinding.destination, pathfinding.start, indexX, indexY)
    }
    else {
        let isEdge = indexX == 0 || indexX == 32 || indexY == 0 || indexY == 13
 
        if (isEdge)
            ctx.fillStyle = "#3FEEE6"
        else
            ctx.fillStyle = (indexX % 2 == 0 && indexY % 2 == 0) ? "#F7F7EF" : "white"
        
        ctx.fill();
    }
    

    // reset pathfinding.destination or pathfinding.start if they're the same as index
    if (indexX == pathfinding.destination.x && indexY == pathfinding.destination.y) {
        pathfinding.destination.x = -1
        pathfinding.destination.y = -1
    }

    if (indexX == pathfinding.start.x && indexY == pathfinding.start.y) {
        pathfinding.start.x = -1
        pathfinding.start.y = -1
    }
}


function checkCoordinates(clientX, clientY) {
    
    // if button is undefined or path finding has started, return
    if (!button || findingPath) return

    const rect = canvas.getBoundingClientRect()
    
    let clientOffsetX = clientX - rect.x - 1
    let clientOffsetY = clientY - rect.y - 1

    const xSeg = Math.floor(clientOffsetX / r) + 1
 
    // get index X
    let indexX = Math.floor(xSeg / 3) * 2 - (xSeg % 3 == 0 ? 1 : 0)
    
    // check if x is even, we need this for index Y and the coordinates inside the hexagon
    let even = indexX % 2 == 0
    const oddRowOffsetY = even ? 0 : offsetY
    
    // get index Y
    let indexY = Math.floor((clientOffsetY + oddRowOffsetY) / (offsetY * 2)) - (even ? 0 : 1)
    
    // translate x to values between 0 - 60 or 0 - 30
    let splitSum = Math.floor((indexX + 1) / 2)
    let hexagonOffset = (splitSum - (even ? 0 : 1)) * r + splitSum * d
    
    const x = clientOffsetX % (hexagonOffset || d) 
    const y = (clientOffsetY + oddRowOffsetY) % (offsetY * 2)
    
    // if even, check if cursor is inside hexagon, if not, change index to the correct hexagon
    if (even) {

        const coordinateOffset = isInside(x, y)

        indexX += coordinateOffset[0]
        indexY += coordinateOffset[1]
        even = indexX % 2 == 0

    }
     
    // check if index is within the correct ranges
    if ((indexX < 0 || indexX > 32) || (indexY < 0 || indexY > 13))
        return
 
    fillHexagon(d + (d * indexX) * (1 + Math.cos(a)), d + ((d * Math.sin(a) * 2) * indexY) + (even ? 0 : d * Math.sin(a)), button, key, indexX, indexY)
}

function mousedown(e) {
    if (popup) return

    switch (e.button)
        {
        case 0:
            button = "left"
            break
        case 2:
            button = "right"
            break
    }

    checkCoordinates(e.clientX, e.clientY) 
}

function mousemove(e) {
    if (key || popup) 
        return

    checkCoordinates(e.clientX, e.clientY)
}

function keydown(e) {
    if (popup) 
        return

    switch (e.key)
    {
        case "D":
            key = "D"
        break
        case "S":
            key = "S"
        break
    }

    document.querySelector("#key").innerText = `Key: ${key}`
}

function keyup() {

    key = ""
    document.querySelector("#key").innerText = `Key: ${key}`

}

async function startPathFinding() {

    if (pathfinding.start.x == -1 || pathfinding.start.y == -1)
        return
    if (pathfinding.destination.x == -1 || pathfinding.destination.y == -1)
        return

    if (findingPath)
        return
    
    findingPath = true

    const path = pathfinding.find()

    for (let i = path.length - 2; i > 0; i--) {

        const [hexX, hexY] = getHexagonCoord(path[i].c.x, path[i].c.y)


        fillHexagon(hexX, hexY, "", "", path[i].c.x, path[i].c.y)


        await new Promise(resolve => setTimeout(resolve, 50))
    }

    findingPath = false
}

document.addEventListener('mousedown', mousedown, false)
document.addEventListener('mousemove', mousemove, false)

// reset latest button pressed
document.addEventListener('mouseup', function(){ button = "" }, false)

document.addEventListener('keydown', keydown)
document.addEventListener('keyup', keyup)

document.querySelector('#start').addEventListener('click', startPathFinding)

// remove left click context menu
window.addEventListener("contextmenu", e => e.preventDefault());
