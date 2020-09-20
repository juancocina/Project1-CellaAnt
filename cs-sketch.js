// Juan Cocina
// The majority, if not all of this code, is borrowed from professor Siska

// cs-sketch.js; P5 key animation fcns.  // CF p5js.org/reference
// Time-stamp: <2020-02-02 15:58:23 Chuck Siska>

// Make global g_canvas JS 'object': a key-value 'dictionary'.
const g_canvas = { cell_size:10, wid:41, hgt:41 }; // JS Global var, w canvas size info.
let g_frame_cnt = 0; // Setup a P5 display-frame counter, to do anim
const g_frame_mod = 24; // Update ever 'mod' frames.
let g_stop = 0; // Go by default.

let colors;

function setup() // P5 Setup Fcn
{
    // Reduce colors to the sums of their RGB values. Note: -255 to remove the alpha value.
    // Note: Moving colors initialization to global will result in error bc p5.js isn't visible at that time.
    // idk why but this doesn't throw an error.
    colors = { BLACK:  color( 0 , 0 , 0 , 255),
               RED:    color(255, 0 , 0 ),
               YELLOW: color(255,255, 0 ),
               BLUE:   color( 0 , 0 ,255),
               GREEN:  color( 0 ,255, 0 ),
             };

    let size = g_canvas.cell_size;
    let width = size * g_canvas.wid;  // Our 'canvas' uses cells of given size, not 1x1 pixels.
    let height = size * g_canvas.hgt;
    createCanvas( width, height );  // Make a P5 canvas.
    draw_grid( 10, 50, 'white', 'yellow' );
}

var g_bot = { dir:0, x:20, y:20, color:100 }; // Default direction is north
var g_box = { t:1, hgt:40, l:1, wid:40 }; // Box in which bot can move.

function move_bot( )
{
    // Step 1a:
    // get current cell color and determine which color to update it to.
    // Step 1b:
    // check to see if the ant should move left or right based on the color before the update.
    let currentCellColor = getCurrentCellColor();
    let reducedCellColor = currentCellColor.reduce((a,b) => a+b, 0) - 255;
    let color = null;
    let turnRight = false;
    stroke('white')
    switch(reducedCellColor) {
        case 0:
        case -255: // Black
            color = colors.RED;
            break;
        case 255:
            if (currentCellColor[0] === 255) { // Red
                turnRight = true;
                color = colors.YELLOW
            }
            else if (currentCellColor[1] === 255) { // Green
                stroke(0);
                color = colors.BLACK;
            }
            else { // Blue
                turnRight = true;
                color = colors.GREEN;
            }
            break;
        case 510: // Yellow (yellow = rgb(255,255,0) => 255+255 = 510)
            color = colors.BLUE;
            break;
        default:
            stroke(0);
            color = colors.BLACK;
            break;
    }
    // Step 2: Draw the cell with the new color
    fill(color);
    let currentCellTopLeftCords = getCurrentCellTopLeftCords()
    let rectWidth = g_canvas.cell_size - 2;
    rect(currentCellTopLeftCords[0], currentCellTopLeftCords[1], rectWidth, rectWidth);

//      0       Counter Clockwise.
//    3   1
//      2
// 0 => (dx,dy) = (0, -1)
// 1 => (dx,dy) = (1, 0)
// 2 => (dx,dy) = (0, 1)
// 3 => (dx,dy) = (-1,0)

    // Step 3: Update direction of ant.
    let dx = 0;
    let dy = 0;
    switch (g_bot.dir) { // depending on the direction we were facing and if we should turn right or not, update dir.
        case 0:
            g_bot.dir = turnRight ? 1 : 3;
            break;
        case 1:
            g_bot.dir = turnRight ? 2 : 0;
            break;
        case 2:
            g_bot.dir = turnRight ? 3 : 1;
            break;
        case 3:
            g_bot.dir = turnRight ? 0 : 2;
    }

    switch (g_bot.dir) { // Convert dir to x,y deltas: dir = clock w 0=Up,1=Rt,2=Dn,3=Left.
        // once we know where we need to move, move the ant in that direction.
        case 0:
            dy = -1;
            break;
        case 1:
            dx = 1;
            break;
        case 2:
            dy = 1;
            break;
        case 3:
            dx = -1;
            break;
    }
    // Step 4: Move ant
    // Math to move ant
    let x = (dx + g_bot.x + g_box.wid) % g_box.wid; // Move-x.  Ensure positive b4 mod.
    let y = (dy + g_bot.y + g_box.hgt) % g_box.hgt; // Ditto y.

    g_bot.x = x; // Update bot x.
    g_bot.y = y; // Update bot y.
    g_bot.color = color; // Update color.
}

function draw_bot( ) // Convert bot pox to grid pos & draw bot.
{
    // (TODO) Step 5: Move ant using the direction it should face.

    let sz = g_canvas.cell_size;
    let sz2 = sz / 2;
    let x = 1+ g_bot.x*sz; // Set x one pixel inside the sz-by-sz cell.
    let y = 1+ g_bot.y*sz;
    let big = sz -2; // Stay inside cell walls.
    //  fill( g_bot.color ); // Concat string, auto-convert the number to string.
    let acolors = get( x + sz2, y + sz2 ); // Get cell interior pixel color [RGBA] array.
    let pix = acolors.reduce((a,b) => a + b, 0);
    // (*) Here is how to detect what's at the pixel location.  See P5 docs for fancier...
//    if (0 != pix) { fill( 0 ); stroke( 0 ); } // Turn off color of prior bot-visited cell.
//    else { stroke( 'white' ); } // Else Bot visiting this cell, so color it.

    // Paint the cell.
    //rect( x, y, big, big );
}

// Helper function
function getCurrentCellColor() {
    let currentCellTopLeftCords = getCurrentCellTopLeftCords();
    let currentCellMidPointX = currentCellTopLeftCords[0] + (g_canvas.cell_size / 2);
    let currentCellMidPointY = currentCellTopLeftCords[1] + (g_canvas.cell_size / 2);

    return get(currentCellMidPointX, currentCellMidPointY);
}

// Helper Function
function getCurrentCellTopLeftCords() {
    let currentX = 1 + (g_bot.x * g_canvas.cell_size);
    let currentY = 1 + (g_bot.y * g_canvas.cell_size);

    return [currentX, currentY];
}

function draw_update()  // Update our display.
{
    move_bot( );
    draw_bot( );
}

function draw()  // P5 Frame Re-draw Fcn, Called for Every Frame.
{
    ++g_frame_cnt;
    if (0 == g_frame_cnt % g_frame_mod)
    {
        if (!g_stop) draw_update();
    }
}

function keyPressed( )
{
    g_stop = ! g_stop;
}

function mousePressed( )
{
    let x = mouseX;
    let y = mouseY;
    let sz = g_canvas.cell_size;
    let gridx = round( (x-0.5) / sz );
    let gridy = round( (y-0.5) / sz );
    g_bot.x = gridx + g_box.wid; // Ensure its positive.

    g_bot.x %= g_box.wid; // Wrap to fit box.
    g_bot.y = gridy + g_box.hgt;
    g_bot.y %= g_box.hgt;
    draw_bot( );
}