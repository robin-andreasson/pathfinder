import { Coordinate, PriorityQueue, NodeTree, INFINITY, WEIGHT } from "./utils.js" 

export default class Astar {

    constructor() {
        this.WIDTH = 0
        this.HEIGHT = 0

        this.start = new Coordinate()
        this.destination = new Coordinate()

        this.fringe = new PriorityQueue()

        this.node = null

        this.gscore = []
        this.fscore = []

        this.walls = []
        this.history = []
    }


    /*
    * Get the cost of the path from start to neighbor
    * @param {int} x
    * @param {int} y
    */
    g(x, y) {
        return this.gscore[y][x] + WEIGHT
    }
    
    /*
    * heuristic function that estimates the distance from neighbor to destination
    * @param {int} x
    * @param {int} y
    */
    h(x, y) {
        const destinationY = this.destination.y * 2 + (this.destination.x % 2 == 0 ? 0 : 1)

        var dy = Math.abs(destinationY - y)
        var dx = Math.abs(this.destination.x - x)

        return dx + Math.max(0, (dy - dx)/2)
    }

    isInside(x, y) {
        if ( (y < 0 || y > this.HEIGHT) || (x < 0 || x > this.WIDTH) )
            return false

        return true
    }


    initializeScores() {

        this.gscore = []
        this.fscore = []
        this.fringe = new PriorityQueue() 

        for(let y = 0; y<=this.HEIGHT; y++) {
            this.gscore.push([])
            this.fscore.push([])

            for(let x = 0; x<=this.WIDTH; x++) {
                this.gscore[y].push(INFINITY)
                this.fscore[y].push(INFINITY)
            }

        }
    }

    /*
    *   Uses the formula:
    *
    *   f(n) = g(n) + h(n)
    *
    *   where n is the current node, g is the current cost from start to neighbor and h is a heuristic function (chebyshev distance in this case)
    */
    score(x, y, hexagonYOffset = y) {

        if (!this.isInside(x, y) || this.walls[y][x])
            return

        const distance = this.g(this.node.c.x, this.node.c.y)
 
        // return if the tentative distance is bigger or equal than the already set one
        if (distance >= this.gscore[y][x])
            return

        // since the new distance is smaller
        this.gscore[y][x] = distance


        const h = this.h(x, hexagonYOffset)

        /*
        *   add the heuristic function to the mix and get an estimate on the distance between
        *   the neighbor node and the destination
        */
        const fdistance = distance + h

        // get new node with estimated score
        const node = new NodeTree(x, y, this.node)
        
 
        // set new fscore
        this.fscore[y][x] = fdistance

        node.highlight = h
        node.score = fdistance

        // insert new node into priority queue
        this.fringe.Insert(node, this.fscore)

        // push node into history
        this.history.push(node)

    }


    isWall(x, y) {
        if (!this.isInside(x, y))
            return 0

        if (this.walls[y][x])
            return 2

        return 0
    }

    unwrapPath() {

        const path = []

        while (this.node) {
            path.unshift(this.node)

            this.node = this.node.prev
        }


        return path
    }


    search() {
         
        // check if start and destination has been set
        if ( (this.start.x == -1 || this.start.y == -1) || (this.destination.x == -1 || this.destination.y == -1) )
            return

        this.initializeScores()
        
        // set current node as start position with previous as null
        this.node = new NodeTree(this.start.x, this.start.y, null)

        this.gscore[this.start.y][this.start.x] = 0
        this.fscore[this.start.y][this.start.x] = 0

        // while current node isn't undefined, this occurs when the fringe is empty
        while (this.node) {  

            const x = this.node.c.x
            const y = this.node.c.y

            if (x == this.destination.x && y == this.destination.y)
                break

            /* 
            * Odd and even hexagons on the same row differs in y-axis, 
            * this gives me an offset for the y axis.
            */
            const offset = (x % 2 == 0 ? 1 : -1)
            const offsetY = y * 2 + (x % 2 == 0 ? 0 : 1)
             
            // up & down
            this.score(x, y - 1, offsetY - 2)
            this.score(x, y + 1, offsetY + 2)

            // check left and right but offset by hexagon placement (since odd hexagons are placed lower than even)
            this.score(x + 1, y, offsetY + offset)
            this.score(x - 1, y, offsetY + offset)

            // check diagonal down or upper /right/left
            this.score(x + 1, y - offset, offsetY - offset)
            this.score(x - 1, y - offset, offsetY - offset)

 
            this.node = this.fringe.Pull()
        }


        // get the path from start to destination
        const path = this.unwrapPath()
        
        return path
    }
}
