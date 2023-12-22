const INFINITY = Math.min()

class Coordinate {

    constructor(x = -1, y = -1) {
        this.x = x
        this.y = y
    }

}

class Node {

    constructor(x = 0, y = 0) {
        this.c = new Coordinate(x, y)
        this.distance = INFINITY
        this.visited = false
    }

}

class PathFinding {

    constructor() {
        this.nodes = []
        this.walls = []
        
        // start and destination coordinate
        this.start = new Coordinate()
        this.destination = new Coordinate()

        // width and height of the map
        this.WIDTH = 0
        this.HEIGHT = 0
    }

    /*
    * get the distance from one coord to another and create an edge value
    * @param {int} x
    * @param {int} y
    * @returns {int} sum of the difference
    **/
    #getEdge(x, y) {
        let diffX = Math.abs(x - this.destination.x)
        let diffY = Math.abs(y - this.destination.y)


        return diffX + diffY
    }
    
    /*
    * checks adjacent node and sets a new distance if smaller than the one already set
    * @param {int} x
    * @param {int} y
    * @param {int} distance
    * @param {int} hexagonY
    **/
    #adjacentNodes(x, y, distance, hexagonY = y) {
        if ((y < 0 || y > this.HEIGHT) || (x < 0 || x > this.WIDTH))
            return

        if (this.walls[y][x]) 
            return

        const edge = this.#getEdge(x, hexagonY)
        const nDistance = distance + edge

        if (nDistance < this.nodes[y][x].distance)
            this.nodes[y][x].distance = nDistance
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


    #getPath() {

        node = this.nodes[this.destination.y][this.destination.x]
        const path = []

        // if destination node hasn't been visited it means that the path to destination is blocked
        if (!node.visited)
            return path

        while (true) {

            path.push(node)

            let x = node.c.x
            let y = node.c.y

            if (x == this.start.x && y == this.start.y)
                break

            const offset = 1 * (x % 2 == 0 ? 1 : -1)
            const yRange = ((y - offset) >= 0 && (y - offset) <= this.HEIGHT)

            // up
            if (y - 1 >= 0 && this.nodes[y - 1][x].distance <= node.distance)
                node = this.nodes[y - 1][x]

            // down
            if (y + 1 <= this.HEIGHT && this.nodes[y + 1][x].distance <= node.distance)
                node = this.nodes[y + 1][x]

            // right
            if (x + 1 <= this.WIDTH && this.nodes[y][x + 1].distance <= node.distance)
                node = this.nodes[y][x + 1]

            // left
            if (x - 1 >= 0 && this.nodes[y][x - 1].distance <= node.distance)
                node = this.nodes[y][x - 1]

            // upper or lower right
            if ((x + 1 <= this.WIDTH && yRange) && this.nodes[y - offset][x + 1].distance <= node.distance)
                node = this.nodes[y - offset][x + 1]

            // upper or lower left
            if ((x - 1 >= 0 && yRange) && this.nodes[y - offset][x - 1].distance <= node.distance)
                node = this.nodes[y - offset][x - 1]
        }


        return path
    }
    
    /*
    *   uses dijkstra's algorithm to get the fastest path between start coordinates and destination coordinates
    *   @returns {Node[]}
    *   @throws {Error} if width and height has not been set
    **/
    find() {

        if (!this.WIDTH || !this.HEIGHT)
            throw new Error("width and height has not been set")

        this.#getNodes()

        //get start node
        let node = this.nodes[this.start.y][this.start.x]
        node.distance = 0

        while (node.distance != INFINITY && !this.nodes[this.destination.y][this.destination.x].visited) {

            const x = node.c.x
            const y = node.c.y
            const distance = node.distance

            /* 
            * Odd and even hexagons on the same row differs in y-axis, 
            * this gives me an offset for the y axis.
            */
            const offset = 1 * (x % 2 == 0 ? 1 : -1)

            // up & down
            this.#adjacentNodes(x, y - 1, distance)
            this.#adjacentNodes(x, y + 1, distance)


            // check left and right but offset by hexagon placement (since odd hexagons are placed lower than even)
            this.#adjacentNodes(x + 1, y, distance, y + offset)
            this.#adjacentNodes(x - 1, y, distance, y + offset) 

            // check diagonal down or upper right/left 
            this.#adjacentNodes(x + 1, y - offset, distance)
            this.#adjacentNodes(x - 1, y - offset, distance) 


            // mark the node as visited
            node.visited = true

            let smallestNode = new Node()

            for (let i = 0; i <= this.HEIGHT; i++)
                for (let j = 0; j <= this.WIDTH; j++)
                    if (smallestNode.distance > this.nodes[i][j].distance && !this.nodes[i][j].visited)
                        smallestNode = this.nodes[i][j]


            node = smallestNode
        }



        return this.#getPath()
    }



    highlight() {

    }
}
