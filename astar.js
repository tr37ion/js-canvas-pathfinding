// the game's canvas element
var canvas = null;

// the canvas 2D context
var ctx = null;

// image map with all sprites
var spritemap = null;

// true: whene the sprite map was downloaded
var spritemapLoaded = false;

// the world grid: a 2d array of tiles
var world = [[]];
var worldSize;

// world grid size
var gridWidth;
var gridHeight;

// size of the tiles in pixels
var tileWidth = 32;
var tileHeight = 32;

// start and end of path
var pathStart;
var pathEnd;
var currentPath;

// Pathfinging algorithm
var distanceFunction = function(){};
var findNeighbours = function(){};

// anything higher than this number is number is considered blocked
var maxWalkableTileNum = 0;

// some console.log fixes
if (typeof console == "undefined") {
    var console = {
        log: function() {}
    };
}

function onload() {
    console.log('Page loaded.');
    initCanvas('gameCanvas', canvasClick);
    spritemap = new Image();
    spritemap.src = 'pixels.png';
    spritemap.onload = loaded;
}

function initCanvas(id, event) {
    canvas = document.getElementById(id);
    if (!canvas) alert("Element ID not found.");

    resizeCanvas();

    canvas.addEventListener('click', event, false);
    if (!canvas) alert("Browser doesn't support Canvas.");

    ctx = canvas.getContext('2d');
    if (!ctx) alert("Mmm... no 2D context?!");
}

// TODO: make canvas fit to actual window.innerW/H (without scrollbars)
function resizeCanvas() {
    var dx = 0;
    var dy = 0;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight-4;
    // NOTE: MOD may be faster with bit-shifting when tiles have 2^x size
    gridWidth = Math.floor(canvas.width/tileWidth);
    gridHeight = Math.floor(canvas.height/tileHeight);
    dx = canvas.width % tileWidth;
    dy = canvas.height % tileHeight;
    if (dx) gridWidth++;
    if (dy) gridHeight++;
    pathStart = [gridWidth, gridHeight];
    pathEnd = [0,0];
    currentPath = [];
    worldSize = gridWidth * gridHeight;
    //    canvas.style.border = "1px solid red";
}

function onresize() {
    resizeCanvas();
    createWorld();
}

function loaded() {
    console.log('Spritemap loaded:');
    spritemapLoaded = true;
    createWorld();
}

function createWorld() {
    console.log('Creating world ...');

    // create grid array
    for (var x=0; x < gridWidth; x++) {
        world[x] = [];
        for (var y=0; y < gridHeight; y++) {
            world[x][y] = 0;
        }
    }

    // generate random walls
    // where world[][] array set to 1 is wall
    for (x=0; x < gridWidth; x++) {
        for (y=0; y < gridHeight; y++) {
            if (Math.random() > 0.75)
                world[x][y] = 1;
        }
    }

    // calculate initial possible path
    // note: unlikely but possible to never find one...
    currentPath = [];
    while (currentPath.length == 0) {
        // set random path start and end positions
        pathStart = [Math.floor(Math.random()*gridWidth), Math.floor(Math.random()*gridHeight)];
        pathEnd = [Math.floor(Math.random()*gridWidth), Math.floor(Math.random()*gridHeight)];

        if (world[pathStart[0]][pathStart[1]] == 0)
            currentPath = findPath(world, pathStart, pathEnd);
        
        redraw();
    }
}

// rendering the world
function redraw() {
    if (!spritemapLoaded)
        return;

    console.log('... redrawing ...');

    var spriteNum = 0;

    //clear the screen
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.with, canvas.height);

    // draw map
    for (var x=0; x < gridWidth; x++) {
        for (var y=0; y < gridHeight; y++) {
            // choose a sprite to draw from spritemap
            switch(world[x][y]) {
            case 1:
                spriteNum = 1;
                break;
            default:
                spriteNum = 0;
            }
            // Draw it
            // ctx.drawImage(img, sx, sy, swidth, sheight, x, y, width, height);
            ctx.drawImage(spritemap,
                          spriteNum*tileWidth, 0,
                          tileWidth, tileHeight,
                          x*tileWidth, y*tileHeight,
                          tileWidth, tileHeight
                         );
        }
    }

    // Draw the path
    console.log('Current path length: ' + currentPath.length);
    for (var rp=0; rp<currentPath.length; rp++) {
        switch(rp) {
        case 0:
            spriteNum = 2; // start
            break;
        case currentPath.length-1:
            spriteNum = 3; // end
            break;
        default:
            spriteNum = 4; // path node
            break;
        }
        ctx.drawImage(spritemap,
                      spriteNum*tileWidth, 0,
                      tileWidth, tileHeight,
                      currentPath[rp][0]*tileWidth,
                      currentPath[rp][1]*tileHeight,
                      tileWidth, tileHeight
                     );
    }         
}

function canvasClick(event) {
    var x, y;

    // get page coordinates
    if (event.pageX != undefined && event.pageY != undefined) {
        x = event.pageX;
        y = event.pageY;
    } else {
        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    // calculate relative coords
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    var cell = [
        Math.floor(x/tileWidth),
        Math.floor(y/tileHeight)
    ];

    if (world[cell[0]][cell[1]] <= maxWalkableTileNum) {  
        console.log('X:' + cell[0] + '   Y: ' + cell[1]);
        pathStart = pathEnd;
        pathEnd = cell;
        // calulate path
        currentPath = findPath(world, pathStart, pathEnd);
        redraw();
    }
}

function findPath(world, pathStart, pathEnd) {
    var abs = Math.abs;
    var max = Math.max;
    var pow = Math.pow;
    var sqrt = Math.sqrt;

    // alternate heuristics, depending on your game:
    var distanceFunction = ManhattanDistance;
    var findNeighbours = function(){}; // empty
    
    // diagonals allowed but no squeezing through cracks:
    // var distanceFunction = DiagonalDistance;
    // var findNeighbours = DiagonalNeighbours;
    
    // diagonals and squeezing through cracks allowed:
    // var distanceFunction = DiagonalDistance;
    // var findNeighbours = DiagonalNeighboursFree;
    
    // euclidean but no squeezing through cracks:
    // var distanceFunction = EucledianDistance;
    // var findNeighbours = DiagonalNeighbours;
    
    // euclidean and squeezing through cracks allowed:
    // var distanceFunction = EucledianDistance;
    // var findNeighbours = DiagonalNeighboursFree;

    // calulate the A* path
    // this returns an array of coordinates
    // that is empty if no path is possible
    //return calulatePath();

    // linear movement - no doagonals - just cardinal directions (NSEW)
    function ManhattanDistance(Point, Goal) {
        return abs(Point.x - Goal.x)  + abs(Point.y - Goal.y);
    }

    // diagonal movement - assumes diagonal distance is 1, same as cardinals
    function DiagonalDistance(Point, Goal) {
        return max(abs(Point.x - Goal.x)), abs(Point.y - Goal.y);
    }

    // diagonal movement - assumes diagonal distance is (AC = sqrt(AB^2+BC^2))
    // where AB = x2 -x1 and BC = y2 -y1 and AC = [x3, y3]
    function EucledianDistance(Point, Goal) {
        return sqrt(pow(Point.x - Goal.x, 2) + pow(Point.y - Goal.y, 2));
    }

    function Neighbours(x, y) {
        var N = y-1;
        var S = y+1;
        var E = x+1;
        var W = x-1;

        var myN = N > -1 && canWalkHere(x,N);
        var myS = S < gridHeight && canWalkHere(x,S);
        var myE = E < gridWidth && canWalkHere(E,y);
        var myW = W > -1 && canWalkHere(W,y);

        var result = [];

        if(myN)
            result.push({x:x, y:N});
        if(myS)
            result.push({x:x, y:S});
        if(myE)
            result.push({x:E, y:y});
        if(myW)
            result.push({x:W, y:y});
        
        findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
        return result;
    }

   	// returns every available North East, South East,
	// South West or North West cell - no squeezing through
	// "cracks" between two diagonals
    function DiagonalNeighbours(myN, myS, myE, myW, N, S, E, W, result) {
        if(myN) {
            if(myE && canWalkHere(E,N))
                result.push({x:E, y:N});
            if(myW && canWalkHere(W,N))
                result.push({x:W, y:N});
        }
        if(myS) {
            if(myE && canWalkHere(E,S))
                result.push({x:E, y:S});
            if(myW && canWalkHere(W,S))
                result.push({x:W, y:S});
        }
    }

	// returns every available North East, South East,
	// South West or North West cell including the times that
	// you would be squeezing through a "crack"
    function DiagonalNeighboursFree(myN, myS, myE, myW, N, S, E, W, result) {
        myN = N > -1;
        myS = S < gridHeight;
        myE = E < gridWidth;
        myW = W > -1;
        
        if(myE) {
            if(myN && canWalkHere(E,N))
                result.push({x:E, y:N});
            if(myS && canWalkHere(E,S))
                result.push({x:E, y:S});
        }
        if(myW) {
            if(myN && canWalkHere(W,N))
                result.push({x:W, y:N});
            if(myS && canWalkHere(W,S))
                result.push({x:W, y:S});
        }    
    }

    // determine if defined cell is walkable
    function canWalkHere(x,y) {
        return ((world[x] != null) &&
                (world[x][y] != null) &&
                (world[x][y] <= maxWalkableTileNum));
    };

    // node function returs a new node world object
    // store route movement costs
    function Node(Parent, Point) {
        var newNode = {
            Parent:Parent, //pointer to another Node object
            value:Point.x+Point.y*gridWidth, // array index of the Node in the linear array
            x:Point.x, // x location
            y:Point.y, // y location
            s2n:0, //distance cost from Start to Node
            n2g:0  //distance cost from Node to Goal 
        };
        return newNode;
    }

    // Pathfinding function
    function calulatePath() {
        var mypathStart = Node(null, {x:pathStart[0], y:pathStart[1]});
        var mypathEnd = Node(null, {x:pathEnd[0], y:pathEnd[1]});
        var AStar = new Array(worldSize); // create an array with all worldcoordinates
        var Open = [mypathStart]; // list of currently open nodes
        var Closed = []; // list of closed nodes
        var result = []; // list of final output array
        var myNeighbours; // reference to a Node (that is nearby)
        var myNode; // reference to a Node (that we are considering now)
        var myPath; // reference to a Node (that starts a path in question)
        var length, max, min, i, j; // temp variables

        // interate through the open list until none are left
        while(length = Open.length) {
            max = worldSize;
            min = -1;

            for(i=0; i<length; i++) {
                if(Open[i].s2n < max) {
                    max = Open[i].s2n;
                    min = i;
                }
            }

            // grab the next Node and remove it from Open array
            myNode = Open.splice(min, 1)[0];

            // is it the destionation node?
            if(myNode.value === mypathEnd.value) {
                myPath = Closed[Closed.push(myNode)-1];
                do {
                    result.push([myPath.x, myPath.y]);
                } while(myPath = myPath.Parent);

                // clear the working arrays
                AStar = Closed = Open = [];

                // we want to return start to finish
                result.reverse();
            } else { // not the destination node
                // find which nearby nodes are walkable
                myNeighbours = Neighbours(myNode.x, myNode.y);
                // test each one that hasn't been treid already
                for(i=0,j=myNeighbours.length; i<j; i++) {
                    myPath = Node(myNode, myNeighbours[i]);
                    if(!AStar[myPath.value]) {
                        // estimated cost of thie particular route so far
                        myPath.n2g = myNode.n2g + distanceFunction(myNeighbours[i], myNode);
                        // estimated cost of entire guessed route to the destionation
                        myPath.s2n = myPath.n2g + distanceFunction(myNeighbours[i], mypathEnd);
                        // remember this new path for testing above
                        Open.push(myPath);
                        // mark this node in the world map as visited
                        AStar[myPath.value] = true;
                    }
                }
                // remember this route as having no more untested options
                Closed.push(myNode);
            }
        }
        return result;
    }
    return calulatePath();
}

//onload();

