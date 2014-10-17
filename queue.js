// borrowed from http://jsfiddle.net/GRIFFnDOOR/r7tvg/

function Node (data, priority) {
    this.data = data;
    this.priority = priority;
}
Node.prototype.toString = function(){return this.priority}

// takes an array of objects with {data, priority}
function PriorityQueue (arr) {
    this.heap = [null];
    if (arr) for (i=0; i< arr.length; i++)
        this.push(arr[i].data, arr[i].priority);
}

PriorityQueue.prototype = {
    push: function(data, priority) {
        var node = new Node(data, priority);
        this.bubble(this.heap.push(node) -1);      
    },
    
    // removes and returns the data of highest priority
    pop: function() {
        var topNode = this.heap[1];
        this.heap[1] = this.heap.pop();
        this.sink(1); return topNode;
    },
    
    // bubbles node i up the binary tree based on
    // priority until heap conditions are restored
    bubble: function(i) {
        while (i > 1) { 
            var parentIndex = i >> 1; // <=> floor(i/2)
            
            // if equal, no bubble (maintains insertion order)
            if (!this.isHigherPriority(i, parentIndex)) break;
            
            this.swap(i, parentIndex);
            i = parentIndex;
    }   },
        
    // does the opposite of the bubble() function
    sink: function(i) {
        while (i*2 < this.heap.length) {
            // if equal, left bubbles (maintains insertion order)
            var leftHigher = !this.isHigherPriority(i*2 +1, i*2);
            var childIndex = leftHigher? i*2 : i*2 +1;
            
            // if equal, sink happens (maintains insertion order)
            if (this.isHigherPriority(i,childIndex)) break;
            
            this.swap(i, childIndex);
            i = childIndex;
    }   },
        
    // swaps the addresses of 2 nodes
    swap: function(i,j) {
        var temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    },
        
    // returns true if node i is higher priority than j
    isHigherPriority: function(i,j) {
        return this.heap[i].priority < this.heap[j].priority;
    }
}

///////////////////   Tests    /////////////////////////////

var queue = new PriorityQueue();
        
queue.push({p:'two'}, 2);
queue.push({p:'three'}, 3);
queue.push({p:'five'}, 5);
queue.push({p:'1st one'}, 1);
queue.push({p:'zero'}, 0);
queue.push({p:'nine'}, 9);
queue.push({p:'2nd one'}, 1);
        
console.log(queue.heap.toString()); // => 0,1,1,3,2,9,5 

console.log(queue.pop()); // => {p:'zero'}
console.log(queue.pop()); // => {p:'1st one'}
console.log(queue.heap.toString()); // => 1,2,9,3,5

queue.push({p:'one-half'}, 0.5);
console.log(queue.heap.toString()); // => 0.5,2,1,3,5,9

// TODO: test negative numbers
