import { Coordinate, Node, INFINITY, WEIGHT } from "./utils.js"

class Dijkstra {

    constructor() {
        this.node = null
        this.nodes = []
        this.walls = []
 
        // start and destination coordinate
        this.start = new Coordinate()
        this.destination = new Coordinate()

        // width and height of the map
        this.WIDTH = 0
        this.HEIGHT = 0

        this.history = []
    }

    #isInside(x, y) {
        if ( (y < 0 || y > this.HEIGHT) || (x < 0 || x > this.WIDTH) )
            return false


        return true
    }

    /*
    * heuristic function that estimates the distance from neighbor to destination
    * @param {int} x
    * @param {int} y
    */
    #h(x, y) {

        const destinationY = this.destination.y * 2 + (this.destination.x % 2 == 0 ? 0 : 1)
        const neighborY =  y * 2 + (x % 2 == 0 ? 0 : 1)

        var dy = Math.abs(destinationY - neighborY)
        var dx = Math.abs(this.destination.x - x)

        return dx + Math.max(0, (dy - dx)/2)
    }
    
    /*
    * checks adjacent this.node and sets a new distance if smaller than the one already set
    * @param {int} x
    * @param {int} y
    **/
    #adjacentNodes(x, y) {

        if (!this.#isInside(x, y) || this.walls[y][x])
            return

        const nDistance = this.node.distance + WEIGHT

        if (nDistance > this.nodes[y][x].distance)
            return

 
        this.nodes[y][x].distance = nDistance
        this.nodes[y][x].highlight = this.#h(x, y)
        this.nodes[y][x].score = nDistance

        this.history.push(this.nodes[y][x])
    }

    #getNodes() {
        this.nodes = []
        for (let i = 0; i<=this.HEIGHT; i++) {
            this.nodes.push([])
            for (let j = 0; j <= this.WIDTH; j++) {
                this.nodes[i].push(new Node(j, i))
            }
        }
    }

    #checkPathAdjacent(x, y) {
        if (!this.#isInside(x, y) || this.nodes[y][x].distance > this.node.distance)
            return
        
        if (this.destination.x == x && this.destination.y == y)
            return

        this.node = this.nodes[y][x]
    }


    /*
    *   uses dijkstra's algorithm to get the shortest path between start and destination
    *   @returns {Node[]}
    *   @throws {Error} if width and height has not been set
    **/
    search() {

        if (!this.WIDTH || !this.HEIGHT)
            throw new Error("width and height has not been set")


        this.#getNodes()

        //get start this.node
        this.node = this.nodes[this.start.y][this.start.x]
        this.node.distance = 0

        while (this.node.distance != INFINITY && !this.nodes[this.destination.y][this.destination.x].visited) {

            const x = this.node.c.x
            const y = this.node.c.y

            /* 
            * Odd and even hexagons on the same row differs in y-axis, 
            * this gives me an offset for the y axis.
            */
            const evenOddoffset = 1 * (x % 2 == 0 ? 1 : -1)

            // up & down
            this.#adjacentNodes(x, y - 1)
            this.#adjacentNodes(x, y + 1)

            // left & right
            this.#adjacentNodes(x + 1, y)
            this.#adjacentNodes(x - 1, y) 
                                                                     
            // check diagonal down or upper right/left    
            this.#adjacentNodes(x + 1, y - evenOddoffset)
            this.#adjacentNodes(x - 1, y - evenOddoffset)
            

            // mark the this.node as visited
            this.node.visited = true

            let smallestNode = new Node()

            for (let i = 0; i <= this.HEIGHT; i++)
                for (let j = 0; j <= this.WIDTH; j++)
                    if (smallestNode.distance > this.nodes[i][j].distance && !this.nodes[i][j].visited)
                        smallestNode = this.nodes[i][j]


            this.node = smallestNode
        }

        this.node = this.nodes[this.destination.y][this.destination.x]
        const path = []

        // if destination node hasn't been visited, meaning the path from start to destination is blocked
        if (!this.node.visited)
            return path

        while (true) {

            path.unshift(this.node)

            let x = this.node.c.x
            let y = this.node.c.y

            if (x == this.start.x && y == this.start.y)
                break

            const evenOddoffset = 1 * (x % 2 == 0 ? 1 : -1)

            // up & down
            this.#checkPathAdjacent(x, y - 1)
            this.#checkPathAdjacent(x, y + 1)
            
            // right & left
            this.#checkPathAdjacent(x + 1, y)
            this.#checkPathAdjacent(x - 1, y)

            // check diagonal down or upper right/left    
            this.#checkPathAdjacent(x + 1, y - evenOddoffset)
            this.#checkPathAdjacent(x - 1, y - evenOddoffset)
        }


        return path
    }
}



export default Dijkstra
