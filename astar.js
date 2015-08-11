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

// world grid size
var worldWidth = 54;
var worldHeight = 30;

// size of the tiles in pixels
var tileWidth = 32;
var tileHeight = 32;

// start and end of path
var pathStart = [worldWidth, worldHeight];
var pathEnd = [0,0];
var currentPath = [];

// Pathfinging algorithm
var distanceFunction = function(){};
var findNeighbours = function(){};

// some console.log fixes
if (typeof console == "undefined") {
    var console = {
        log: function() {}
    };
}

function onload() {
    console.log('Page loaded.');
    canvas = document.getElementById('gameCanvas');
    canvas.width = worldWidth * tileWidth;
    canvas.height = worldHeight * tileHeight;
    canvas.addEventListener('click', canvasClick, false);
    if(!canvas)
        alert ("Browser doesn't support Canvas.");
    ctx = canvas.getContext('2d');
    if(!ctx)
        alert("Mmm...");
    spritemap = new Image();
    //spritemap.src = 'spritemap.png';
    spritemap.src = 'data:image/png;base64,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';
    spritemap.onload = loaded;
}

function loaded() {
    console.log('Spritemap loaded:');
    spritemapLoaded = true;
    createWorld();
}

function createWorld() {
    console.log('Creating world ...');

    // create grid array
    for (var x=0; x < worldWidth; x++) {
        world[x] = [];
        for (var y=0; y < worldHeight; y++) {
            world[x][y] = 0;
        }
    }

    // generate random walls
    // where world[][] array set to 1 is wall
    for (x=0; x < worldWidth; x++) {
        for (y=0; y < worldHeight; y++) {
            if (Math.random() > 0.75)
                world[x][y] = 1;
        }
    }

    // calculate initial possible path
    // note: unlikely but possible to never find one...
    currentPath = [];
    while (currentPath.length == 0) {
        // set random path start and end positions
        pathStart = [Math.floor(Math.random()*worldWidth), Math.floor(Math.random()*worldHeight)];
        pathEnd = [Math.floor(Math.random()*worldWidth), Math.floor(Math.random()*worldHeight)];

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

    for (var x=0; x < worldWidth; x++) {
        for (var y=0; y < worldHeight; y++) {
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
    var x,y;

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

    console.log('X:' + cell[0] + '   Y: ' + cell[1]);

    pathStart = pathEnd;
    pathEnd = cell;

    // calulate path
    currentPath = findPath(world, pathStart, pathEnd);
    redraw();
}

function findPath(world, pathStart, pathEnd) {
    var abs = Math.abs;
    var max = Math.max;
    var pow = Math.pow;
    var sqrt = Math.sqrt;

    // the world data are integers
    // anything higher than this number is number is considered blocked
    // this is handy if you use numbered sprites, more than one
    // of which is walkable road, grass, mud, etc.
    var maxWalkableTileNum = 0;
    
    // keep track out of world dimensions
    // Note that this A* implementation expects the world array to be square:
    // it must hvae equal height and width. If your game world is rectengular,
    // just fill the array with dummy values to pad the empty space.
    var worldWidth = world[0].length;
    var worldHeight = world.length;
    var worldSize = worldWidth * worldHeight;

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

        var myN = N>-1 && canWalkHere(x,N);
        var myS = S<worldHeight && canWalkHere(x,S);
        var myE = E<worldWidth && canWalkHere(E,y);
        var myW = W>-1 && canWalkHere(W,y);

        var result = [];

        if(myN)
            result.push({x:x, y:N});
        if(myS)
            result.push({x:x, y:S});
        if(myE)
            result.push({x:E, y:y});
        if(myW)
            result.push({x:W, y:y});
        
        findNeighbours(myN, myS, myE, myE, N, S, E, W, result);
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
        myN = N>-1;
        myS = S<worldHeight;
        myE = E<worldWidth;
        myW = W>-1;
        
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
            value:Point.x+Point.y*worldWidth, // array index of the Node in the linear array
            x:Point.x, // x location
            y:Point.y, //y location
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

        // interate through the opne list until none are left
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

onload();
