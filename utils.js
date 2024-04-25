export const INFINITY = Math.min()

// used instead of edges
export const WEIGHT = 1

export class Coordinate {

    constructor(x = -1, y = -1) {
        this.x = x
        this.y = y
    }

}

export class Node {

    constructor(x = 0, y = 0) {
        this.c = new Coordinate(x, y)
        this.distance = INFINITY
        this.visited = false

        this.hightlight = 0
        this.score = 0
    }
}

export class NodeTree {
    /*
    *   @param {int} x
    *   @param {int} y
    *   @param {NodeTree} prev
    */
    constructor(x, y, prev = null) {
        this.prev = prev

        this.c = new Coordinate(x, y)
        
        this.highlight = 0
        this.score = 0
    }
}


// tbh, probably faster to just use a set instead of a priority.
export class PriorityQueue { 
    constructor() {
        /*
        * @type {NodeTree[]}
        */
        this.queue = []
    }

    /*
    * Too hard to explain
    */
    IsEmpty() {
        return this.queue.length == 0
    }

    /*
    * Inserts an element into the priority queue
    * @param {NodeTree} element
    */
    Insert(element, score) {

        if (this.IsEmpty())
            this.queue.push(element)
        else {

            const x = element.c.x
            const y = element.c.y

            // index where we'll insert the new element
            let insertIndex = this.queue.length
            // index where we'll delete 
            let removeIndex = -1
        
            const elementDistance = score[y][x]

            for (let i = this.queue.length - 1; 0 <= i; i--) {

                const qx = this.queue[i].c.x
                const qy = this.queue[i].c.y

                if (elementDistance > score[qy][qx])
                    insertIndex = i
                
                if (qx == x && qy == y) {
                    removeIndex = i

                    // break since a duplicate element fscore can't be smaller than current element fscore,
                    // meaning we've already found the insert index
                    break
                }
            }

            let remOffset = 0            
            
            //remove duplicate
            if (removeIndex != -1) {
                this.queue.splice(removeIndex, 1)
                remOffset = 1
            }

            // insert element
            this.queue.splice(insertIndex - remOffset, 0, element)

        }
    }
    
    /*
    * Pulls the element with the lowest priority
    */
    Pull() {

        if (this.IsEmpty())
            return null

        // pull the element with the lowest priority (the last element)
        const lowest = this.queue[this.queue.length - 1]

        // remove the element
        this.queue.pop()

        return lowest
    }

    
    /*
    *   sort the queue, inspired by bubble sort. 
    *   my reasoning is that bubble sort is adaptive, meaning it takes advantage of existing order in its input therefore outperforms
    *   other algorithms in cases where there are only some minor inversions.
    *
    *   In my scenario, inversions only appears if another node that is shorter changes an already estimated node.
    */
    Sort() { 
        i = 0
        
        do {
            i++    
        }
        while (i < this.queue.length) {

            // current element is smaller than previous
            if (this.queue[i] < this.queue[i - 1]) {
            
                // swap
                const temp = this.queue[i]
                this.queue[i] = this.queue[i - 1]
                this.queue[i - 1] = temp

                // decrease to check if swapped element needs to be swapped further back
                i--

            }
        }
    }
}



