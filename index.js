import Dijkstra from "./dijkstra.js"
import Astar from "./Astar.js"

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 3100
canvas.height = 1540

canvas.style.width = "1550px"
canvas.style.height = "760px"
ctx.translate(3, 3)

const a = 2 * Math.PI / 6
const r = 30
const d = 60

const halfHexagonY = 25.75
const halfHexagonX = 16

// hypotenuse x ratio per y
const hypotenuse = halfHexagonX / halfHexagonY

// states
let findingPath = false
let tutorial = false

let button = ""
let key = ""

// latest generated path
let path = null

let pathfinding = new Dijkstra()

function init() {
    drawGrid(canvas.width, canvas.height)
}

init();

function drawGrid(width, height) {

    pathfinding.WIDTH = Math.floor((width - d) / (d * (1 + Math.cos(a)))) - 1
    pathfinding.HEIGHT = Math.floor((height - d) / (d * Math.sin(a)) / 2) - 1
    pathfinding.walls = []

    for (let y = d, i = 0; y + d * Math.sin(a) < height; y += d * Math.sin(a), i++) {
        pathfinding.walls.push([])
        for (let x = d, j = 0; x + d * (1 + Math.cos(a)) < width; x += d * (1 + Math.cos(a)), y += (-1) ** j++ * d * Math.sin(a)) { 
            pathfinding.walls[i][j] = 0
            fillHexagon(x, y, "", "", j, i);
        }
    }

}

function switchAlgorithm(target) {

    const width_t = pathfinding.WIDTH
    const height_t = pathfinding.HEIGHT
    const walls_t = pathfinding.walls
    const nodes_t = pathfinding.nodes
    const node_t = pathfinding.node
    const start_t = pathfinding.start
    const destination_t = pathfinding.destination
    const history_t = pathfinding.history

    if (target == "dijkstra")
        pathfinding = new Dijkstra()
    else
        pathfinding = new Astar()

    pathfinding.WIDTH = width_t
    pathfinding.HEIGHT = height_t
    pathfinding.walls = walls_t
    pathfinding.nodes = nodes_t
    pathfinding.node = node_t
    pathfinding.start = start_t
    pathfinding.destination = destination_t
    pathfinding.history = history_t
}

function isInside(x, y) {
    const left = r - halfHexagonX
    const right = r + halfHexagonX


    if (y >= 0 && y < halfHexagonY) {

        const leftSide = left - (y * hypotenuse) - 1

        if (x < leftSide)
            return [-1, -1] // "Is Outside Upper Left"

        const rightSide = right + (y * hypotenuse) + 1
    
        if (rightSide < x)
            return [+1, -1] // "Is Outside Upper Right"

    }
    else if (y >= halfHexagonY && y <= halfHexagonY * 2) {

        y = y % halfHexagonY

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
 
    if (indexX != -1 && indexY != -1)
        pathfinding.walls[indexY][indexX] = 0
    
    // pathfinding.walls
    if (b == "left" && !k) {
        ctx.fillStyle = "black"
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
        ctx.fillStyle = "red"
        ctx.fill()

        return resetPreviousCoord(pathfinding.destination, pathfinding.start, indexX, indexY)
    }
    else {
        let isEdge = indexX == 0 || indexX == pathfinding.WIDTH || indexY == 0 || indexY == pathfinding.HEIGHT
 
        if (isEdge)
            ctx.fillStyle = "#f4edff"
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
    
    let clientOffsetX = clientX - rect.x
    let clientOffsetY = clientY - rect.y

    const xSeg = Math.floor(clientOffsetX / r) + 1
 
    // get index X
    let indexX = Math.floor(xSeg / 3) * 2 - (xSeg % 3 == 0 ? 1 : 0)
    
    // check if x is even, we need this for index Y and the coordinates inside the hexagon
    let even = indexX % 2 == 0
    const oddRowOffsetY = even ? 0 : halfHexagonY
 
    // get index Y
    let indexY = Math.floor((clientOffsetY + oddRowOffsetY) / (halfHexagonY * 2)) - (even ? 0 : 1)

    
    let splitSum = Math.floor((indexX + 1) / 2)
    let hexagonOffset = (splitSum - (even ? 0 : 1)) * r + splitSum * d
    
    const x = clientOffsetX % (hexagonOffset || d) 
    const y = (clientOffsetY + oddRowOffsetY) % (halfHexagonY * 2)
    
    // if even, check if cursor is inside hexagon, if not, change index to the correct hexagon
    if (even) {

        const coordinateOffset = isInside(x, y)

        indexX += coordinateOffset[0]
        indexY += coordinateOffset[1]
        even = indexX % 2 == 0

    }
     
    // check if index is within the correct ranges
    if ((indexX < 0 || indexX > pathfinding.WIDTH) || (indexY < 0 || indexY > pathfinding.HEIGHT))
        return

    const [hexX, hexY] = getHexagonCoord(indexX, indexY)
 
    fillHexagon(hexX, hexY, button, key, indexX, indexY)
}


async function wait(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms))
}

function mousedown(e) {
    if (tutorial) return

    if (path)
        clearPath()

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
    if (key || tutorial || path) 
        return

    checkCoordinates(e.clientX, e.clientY)
}

function keydown(e) {
    if (tutorial) 
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
}

function keyup() {
    key = ""
}

function removePopup(e) {
    e.target.classList.add("hidden")
    tutorial = false

    localStorage.setItem("tutorial", true)
}

async function startPathFinding() {

    if (findingPath)
        return 

    if (pathfinding.start.x == -1 || pathfinding.start.y == -1)
        return
    if (pathfinding.destination.x == -1 || pathfinding.destination.y == -1)
        return

    findingPath = true

    const fastestPath = pathfinding.search()
    
    let max = 0
    for (const node of pathfinding.history) {
        if (node.highlight > max)
            max = node.highlight
    }

    const ratio = 255 / max 

    for (const node of pathfinding.history) {

        if (node.c.x == pathfinding.destination.x && node.c.y == pathfinding.destination.y)
            continue

        if (node.c.x == pathfinding.start.x && node.c.y == pathfinding.start.y)
            continue

        const [hexX, hexY] = getHexagonCoord(node.c.x, node.c.y)


        fillHexagon(hexX, hexY, "", "", node.c.x, node.c.y)

        
        const red = node.highlight * Math.abs(ratio)
        const green = 255 / (node.highlight + 1) + 30
        const score = node.score.toString()
 

        ctx.fillStyle = `rgb(${red}, ${green}, 0)`
        ctx.fill()

        ctx.font = "30px Arial"
        ctx.fillStyle = "white"
        ctx.fillText(score, hexX - 10 - (score.length - 1) * 7.5, hexY)

 
        await wait(20)
    }

    // wait another 20 milliseconds
    await wait(20)

    for (let i = 1; i < fastestPath.length - 1; i++) {

        const [hexX, hexY] = getHexagonCoord(fastestPath[i].c.x, fastestPath[i].c.y)


        fillHexagon(hexX, hexY, "", "", fastestPath[i].c.x, fastestPath[i].c.y)

        const score = fastestPath[i].score.toString()

        ctx.fillStyle = `white`
        ctx.fill()

        ctx.font = "30px Arial"
        ctx.fillStyle = "black"
        ctx.fillText(score, hexX - 10 - (score.length - 1) * 7.5, hexY)

        await wait(50)
    }

    path = fastestPath
    findingPath = false
}

function clearPath() {
    if (!path) return


    for (const node of pathfinding.history) {

        if (node.c.x == pathfinding.destination.x && node.c.y == pathfinding.destination.y)
            continue

        if (node.c.x == pathfinding.start.x && node.c.y == pathfinding.start.y)
            continue

        const [hexX, hexY] = getHexagonCoord(node.c.x, node.c.y)


        fillHexagon(hexX, hexY, "", "", node.c.x, node.c.y)
    }


    for (let i = 1; i < path.length - 1; i++) {


        const [hexX, hexY] = getHexagonCoord(path[i].c.x, path[i].c.y)


        fillHexagon(hexX, hexY, "", "", path[i].c.x, path[i].c.y)
    }


    path = null
    pathfinding.history = []
}

function clear() {

    if (findingPath)
        return
    
    path = null
    ctx.clearRect(-3, -3, canvas.width + 3, canvas.height + 3)
    drawGrid(canvas.width, canvas.height)
}


document.querySelector('#clear').addEventListener('click', clear)
document.querySelector('#start').addEventListener('click', startPathFinding)

document.querySelector("#tutorial-bg").addEventListener('click', removePopup)
document.querySelector("#tutorial").addEventListener('click', (e) => e.stopPropagation())

document.querySelector("#dijkstra").addEventListener('change', ({target}) => {
    if (!target.checked) return

    if (findingPath)
        return document.querySelector("#Astar").checked = true
    
    switchAlgorithm("dijkstra")
})

document.querySelector("#Astar").addEventListener('change', ({target}) => {
    if (!target.checked) return

    if (findingPath)
        return document.querySelector("#dijkstra").checked = true
    
    switchAlgorithm("Astar")
})

document.addEventListener('DOMContentLoaded', () => {
    const seenTutorial = localStorage.getItem("tutorial")
    
    if (seenTutorial)
        return

    
    document.querySelector("#tutorial-bg").classList.remove("hidden")
    tutorial = true

})
document.addEventListener('mousedown', mousedown, false)
document.addEventListener('mousemove', mousemove, false)

// reset latest button pressed
document.addEventListener('mouseup', function(){ button = "" }, false)

document.addEventListener('keydown', keydown)
document.addEventListener('keyup', keyup)

// remove left click context menu
window.addEventListener("contextmenu", e => e.preventDefault());
