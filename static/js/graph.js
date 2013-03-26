//Array.prototype.heapify = function() {
    //this.enqueue = function(item) {
        //this.push(item);
        //this.sort(); /[> TODO euuhmm... yes, but by what?
        //console.log(this);
    //};
//};

var graphit = new (function() {
    var g = this;

    /**
     * Graph
     */
    g.Graph = function(name) {
        this.name = name || "Weighted Directed Graph";
        this.nodes = [];
        this.edges = [];
        return this;
    };

    g.Graph.prototype.addEdge = function(a, b, weight) {
        if (a instanceof g.Edge) {
            this.edges.push(a);
            return a;
        }
        if (a === b) {
            console.log('Error : a and b are the same Node');
            return;
        }
        if (!(a instanceof g.Node) || !(b instanceof g.Node)) {
            console.log('Error : both a and b have to be instance of Node');
            return;
        }
        var edge = new g.Edge(a, b, weight);
        this.edges.push(edge);
        return edge;
    };

    g.Graph.prototype.addNode = function(node) {
        if (!(node instanceof g.Node))
            node = new g.Node(node);
        this.nodes.push(node);
        return node;
    };

    g.Graph.prototype.cleanAfterShortestPath = function() {
        //* clean up
        for (var i = 0; i < this.nodes.length; i++) {
            delete(this.nodes[i].path_weight);
            delete(this.nodes[i].path_visited);
            delete(this.nodes[i].path_previous_edge);
            delete(this.nodes[i].path_previous_node);
        };
    };

    g.Graph.prototype.getEdgesForNode = function(node) {
        var edges = [];
        for (var i = 0; i < this.edges.length; i++) {
            if (this.edges[i].a === node)
                edges.push(this.edges[i]);
        };
        return edges;
    };

    g.Graph.prototype.getNeighbours = function(node) {
        var neighbours = [];
        for (var i = 0; i < this.edges.length; i++) {
            if (this.edges[i].a === node)
                neighbours.push(this.edges[i].b);
        };
        return neighbours;
    };

    /**
     * Dijkstra's shortest path.
     */
    g.Graph.prototype.findShortestPath = function(start, target) {
        //* init
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].path_weight = Infinity;
            delete(this.nodes[i].path_visited);
            delete(this.nodes[i].path_previous_edge);
            delete(this.nodes[i].path_previous_node);
        };
        start.path_weight = 0;

        //var togo = [start];
        //togo.heapify();
        var togo = new BinaryHeap(function(x) { return x.path_weight; });
        togo.push(start);

        //var node = togo.shift();
        var node = togo.pop();
        while (node) {
            node.path_visited = true;
            var edges = this.getEdgesForNode(node);
            var edge = edges.pop();
            while (edge) {
                if (edge.b === target) {
                    //* finished!
                    edge.b.path_weight = node.path_weight + edge.weight;
                    edge.b.path_previous_node = node;
                    edge.b.path_previous_edge = edge;
                    //* return a WDG representing shortest path
                    var path = new g.Graph("Dijkstra's shortest path");
                    var node = edge.b;
                    while (node) {
                        path.addNode(node);
                        if (node === start) {
                            this.cleanAfterShortestPath();
                            path.path = { start: start, target: target };
                            return path;
                        }
                        path.addEdge(node.path_previous_edge);
                        node = node.path_previous_node;
                    }
                    feedback.error('I should be unreachable.');
                }
                //if (!edge.b.path_visited) togo.enqueue(edge.b);
                if (!edge.b.path_visited) togo.push(edge.b);
                if (node.path_weight + edge.weight < edge.b.path_weight) {
                    //* found shorter path
                    edge.b.path_weight = node.path_weight + edge.weight;
                    edge.b.path_previous_node = node;
                    edge.b.path_previous_edge = edge;
                }
                edge = edges.pop();
            }
            node = togo.pop();
        }
        this.cleanAfterShortestPath();
        return "You won't make it there.";
    };

    g.Graph.prototype.removeEdge = function(edge) {
        for (var i = this.edges.length-1; i >= 0; i--) {
            if (this.edges[i] === edge) {
                this.edges.splice(i, 1);
                return edge;
            }
        };
        return;
    };

    g.Graph.prototype.removeEdgesForNode = function(node) {
        var edges = [];
        for (var i = this.edges.length-1; i >= 0; i--) {
            if (this.edges[i].a === node || this.edges[i].b === node) {
                edges.push(this.edges[i]);
                this.edges.splice(i, 1);
            }
        };
        return edges;
    };

    g.Graph.prototype.removeNode = function(node) {
        for (var i = this.nodes.length-1; i >= 0; i--) {
            if (this.nodes[i] === node) {
                this.nodes.splice(i, 1);
                return { node: node, edges: this.removeEdgesForNode(node) };
            }
        };
        return;
    };

    /**
     * Edge
     */
    g.Edge = function(a, b, weight) {
        this.a = a;
        this.b = b;
        this.weight = weight || 1;
        return this;
    };

    /**
     * Node
     */
    g.Node = function(value) {
        this.value = value;
        return this;
    };

    return this;
})();

var log = function(o) {
    console.log(stringify_without_cycles(o));
};

var stringify_without_cycles = function(obj) {
    var seen = [];
    return JSON.stringify(obj, function(key, val) {
        if (typeof val === 'object' && val !== null) {
            if (seen.indexOf(val) >= 0) {
                return '!cyclic!';
            }
            seen.push(val);
        }
        return val;
    });
}

var paint = function(graph) {
    dust.render('graph', graph, function(err, out) {
        out = $(out);
        $('#graphs').append(out);
        sigtest(out.find('.graphic .sigma')[0]);
        //sigmafy(graph, out.find('.graphic .sigma')[0]);
        //graphx2ically(out);
    });
};

var sigtest = function(domElement) {
    var sigInst = sigma.init(domElement);
    sigInst.addNode('hello', {
          label: 'Hello',
          x: Math.random(),
          y: Math.random()
    }).addNode('world', {
          label: 'World!',
      x: Math.random(),
      y: Math.random()
    }).addEdge('hello','world');
};

var sigmafy = function(graph, canvas) {
    console.log(canvas);
    var sigger = sigma.init(canvas);
    sigger.addNode('a', { label: 'a', color: '#FF0000'
    }).addNode('b', { label: 'b', color: '#00FF00'
    }).addEdge('ab', 'a', 'b').draw();
};

var graphx2ically = function(graphElement) {
    var canvas = graphElement.find('.graphic canvas')[0];
    var context = canvas.getContext('2d');
    context.beginPath();
    context.moveTo(10, 10);
    context.lineTo(100, 100);
    context.closePath();
    context.stroke();
};

$(function() {
    var graph = new graphit.Graph();
    var nodeA = graph.addNode('node a');
    var nodeB = graph.addNode('node b');
    var nodeC = graph.addNode('node c');
    var nodeD = graph.addNode(new graphit.Node('node d'));
    var nodeE = graph.addNode('node e');
    var nodeF = graph.addNode('node f');
    var nodeG = graph.addNode('node g');
    var nodeH = graph.addNode('node h');
    var nodeI = graph.addNode('node i');
    var nodeJ = graph.addNode('node j');
    var nodeK = graph.addNode('node k');
    var nodeX = graph.addNode('node x');
    var edgeAB = graph.addEdge(nodeA, nodeB);
    var edgeAC = graph.addEdge(nodeA, nodeC);
    var edgeBD = graph.addEdge(nodeB, nodeD);
    var edgeCD = graph.addEdge(nodeC, nodeD);
    var edgeCE = graph.addEdge(nodeC, nodeE);
    var edgeDA = graph.addEdge(nodeD, nodeA);
    var edgeDC = graph.addEdge(nodeD, nodeC);
    var edgeDK = graph.addEdge(nodeD, nodeK);
    var edgeEC = graph.addEdge(nodeE, nodeC);
    var edgeEJ = graph.addEdge(nodeE, nodeJ);
    var edgeFD = graph.addEdge(nodeF, nodeD);
    var edgeFE = graph.addEdge(nodeF, nodeE);
    var edgeFG = graph.addEdge(nodeF, nodeG);
    var edgeGB = graph.addEdge(nodeG, nodeB);
    var edgeGK = graph.addEdge(nodeG, nodeK);
    var edgeHA = graph.addEdge(nodeH, nodeA);
    var edgeHI = graph.addEdge(nodeH, nodeI);
    var edgeHJ = graph.addEdge(nodeH, nodeJ);
    var edgeHK = graph.addEdge(nodeH, nodeK);
    var edgeIA = graph.addEdge(nodeI, nodeA);
    var edgeIC = graph.addEdge(nodeI, nodeC);
    var edgeIF = graph.addEdge(nodeI, nodeF);
    var edgeJB = graph.addEdge(nodeJ, nodeB);
    var edgeJD = graph.addEdge(nodeJ, nodeD);
    var edgeJE = graph.addEdge(nodeJ, nodeE);
    var edgeJK = graph.addEdge(nodeJ, nodeK);
    var edgeKG = graph.addEdge(nodeK, nodeG);
    var edgeKH = graph.addEdge(nodeK, nodeH);
    paint(graph);
    paint(graph.findShortestPath(nodeA, nodeB));
    paint(graph.findShortestPath(nodeB, nodeC));
    paint(graph.findShortestPath(nodeB, nodeJ));
    paint(graph.findShortestPath(nodeA, nodeX));
});
