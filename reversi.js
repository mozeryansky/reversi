
// init when jQuery is loaded
$(function(){
   init(); 
});


//
// global variables
//

var player = {none: 0, white: 1, black: 2};

// standard board size
var width = 8;
var height = 8;

var gameBoard = [];
var currPlayer = player.none;
var computerPlayers = [];
var playerNames = [];
var directions = getMoveDirections();

//
//  settings
//

var computerMoveWait = 500;
var fadeInNewMoves = true;

var fadeInMessages = true;
var displayMessages = true;

var blackIsHuman = true;
var whiteIsHuman = false;

var displayEveryBoardChange = true;
var displayBoardPossibility = true;

//
//  functions
//


// initialize game
function init()
{
    // draw divs
    initGameHTML();
    
    reset();
    
    // draw
    drawBoard(gameBoard);
    
    // player names
    playerNames[player.white] = 'Computer';
    playerNames[player.black] = 'Human';
    
    // computer is white
    // add player.black to have cpu vs cpu
    if(!blackIsHuman){
        computerPlayers.push(player.black);
    }
    if(!whiteIsHuman){
        computerPlayers.push(player.white);
    }
    
    // tell who is who
    message(getPlayerName(player.white)+' is White');
    message(getPlayerName(player.black)+' is Black');
    
    // start game
    playNextTurn(currPlayer);
}

function reset()
{
    // create empty board
    gameBoard = getEmptyBoard();
    
    // place starting pieces
    placeInitPieces(gameBoard);
    
    // black starts
    currPlayer = player.black;
}

// on click cell handler
function onCellClick()
{
    // verify it is a user's turn
    if(isComputerPlayer(currPlayer)){
        // not user's turn
        message('It is not your turn');
        return;
    }
    
    var cell = $(this);
    var col = parseInt(cell.attr('col'));
    var row = parseInt(cell.attr('row'));
    
    if(!isValidMove(gameBoard, currPlayer, col, row)){
        // invalid move
        message('Invalid move');
        return;
    }
    // valid move
    
    doMove(gameBoard, currPlayer, col, row)
}

function doMove(gameBoard, currPlayer, col, row)
{
    // place move
    placePlayerMove(gameBoard, currPlayer, col, row);
    
    // next turn
    currPlayer = nextPlayer(currPlayer);
    
    // update board
    drawBoard(gameBoard);
    
    // initiate next players turn
    playNextTurn(currPlayer);
}

var time = 0;

// initiate next players turn
function playNextTurn(currPlayer)
{
    var successors = getSuccessors(gameBoard, currPlayer);
    // if current player can't make a move
    if(successors.length == 0){
        // if other player can't make a move
        var otherPlayer = nextPlayer(currPlayer);
        var otherSuccessors = getSuccessors(gameBoard, otherPlayer);
        if(otherSuccessors.length == 0){
            // neither player has a possible move
            message('Neither player can make a move. Game over.');
            
            if(!displayEveryBoardChange){
                // draw final board
                displayEveryBoardChange = true;
                drawBoard(gameBoard);
                displayEveryBoardChange = false;
            }
            
            return;
            
        } else {
            // current player has no move
            message(getPlayerName(currPlayer)+' has no possible moves.');
            
            // switch players
            currPlayer = nextPlayer(currPlayer);
            playNextTurn(currPlayer);
            
            return;
        }
    }
    
    // update scores
    scores = getScores(gameBoard);
    message('Score: Black='+scores[player.black]+' White='+scores[player.white]);
    
    message('It is '+getPlayerName(currPlayer)+'\'s turn');

    if(isComputerPlayer(currPlayer)){
        // computer
        
        // dispay possible moves
        drawPossibleBoard(getSuccessorBoard(gameBoard, currPlayer));
        
        // wait
        setTimeout(function () {
            // choose random successor
            var successors = getSuccessors(gameBoard, currPlayer);
            var position = successors[Math.floor(Math.random()*successors.length)];
            
            doMove(gameBoard, currPlayer, position[0], position[1]);
        
        }, computerMoveWait);
        
    } else {
        // human
        
        // dispay possible moves
        drawPossibleBoard(getSuccessorBoard(gameBoard, currPlayer));
    }
}

function getScores(board)
{
    var scores = [];
    
    scores[player.black] = 0;
    scores[player.white] = 0;
    
    for(c = 0; c < width; c++){
        for(r = 0; r < height; r++){
            if(board[c][r] == player.black){
                scores[player.black]++;
                
            } else if(board[c][r] == player.white){
                scores[player.white]++;
            }
        }
    }
    
    return scores;
}

// returns true if the player is a computer
function isComputerPlayer(currPlayer)
{
    for(i in computerPlayers){
        if(computerPlayers[i] == currPlayer){
            return true;
        }
    }
    
    return false;
}

// places player piece on board and updates other cells
// assumes this position is valid
function placePlayerMove(board, currPlayer, col, row)
{
    
    //
    // helper function
    //
    
    // searches from a move back to one of the players pieces
    function getPossiblePathInDirection(board, currPlayer, direction, fromCol, fromRow)
    {
        var path = [];
        var otherPlayer = nextPlayer(currPlayer);

        // search until we find our own piece
        for(i in direction){
            var pos = direction[i];
            var checkCol = fromCol + pos[0];
            var checkRow = fromRow + pos[1];
            
            // add current position to the path
            path.push([checkCol, checkRow]);
            
            if(!isValidBoardPosition(checkCol, checkRow)){
                return false;
            }
            // can't pass over none piece
            if(board[checkCol][checkRow] == player.none){
                return false;
            }
            
            // stop at current player's piece
            if(board[checkCol][checkRow] == currPlayer){
                // a valid move will never be adjacent
                if(i == 0){
                    return false;
                }
                // return the position
                return path;
            }
        }
        
        return false;
    }
    
    //
    // method
    //
    
    // place piece in selected position
    board[col][row] = currPlayer;
    
    // find all paths this move is valid for
    var validMove = false;
    for(d in directions){
        var direction = directions[d];
        
        // check if the direction is possible
        path = getPossiblePathInDirection(board, currPlayer, direction, col, row);
        if(path !== false){
            validMove = true;
            // change pieces for entire path
            for(i in path){
                pos = path[i];
                board[pos[0]][pos[1]] = currPlayer;
            } 
        }
    }

    if(!validMove){
        console.log('No valid paths found for placePlayerMove');
    }
}

// verifies that the player can make that move
function isValidMove(board, currPlayer, col, row)
{
    var successorBoard = getSuccessorBoard(board, currPlayer);
    
    if(successorBoard[col][row] == true){
        return true;
    }
    
    return false;
}

// get all successor moves in a binary board format
function getSuccessorBoard(board, currPlayer)
{
    // get successors in a the binary format
    return getSuccessors(board, currPlayer, true);
}

// get all successors, set last param to true for binary board format
function getSuccessors(board, currPlayer, boardFormat = false)
{
    //
    // helper function
    //
    
    // searches from a players piece to a possible successor
    function getPossibleMoveInDirection(board, currPlayer, direction, fromCol, fromRow)
    {
        var otherPlayer = nextPlayer(currPlayer);

        // search until we find a none position
        for(i in direction){
            var pos = direction[i];
            var checkCol = fromCol + pos[0];
            var checkRow = fromRow + pos[1];
            
            if(!isValidBoardPosition(checkCol, checkRow)){
                return false;
            }
            // can't pass over current piece
            if(board[checkCol][checkRow] == currPlayer){
                return false;
            }
            
            // if an none place is found
            if(board[checkCol][checkRow] == player.none){
                // can't be immediate location
                if(i == 0){
                    return false;
                }
                
                // return the position
                return [checkCol, checkRow];
            }
        }
        
        // no valid move found for this direction
        return false;
    }
    
    //
    // method
    //
    
    // create empty board, which will become the successor board
    var successorBoard = getEmptyBoard();
    var successors = [];
    
    // search for successors
    for(c = 0; c < width; c++){
        for(r = 0; r < height; r++){
            // make sure position is boolean false, if not already boolean true
            if(successorBoard[c][r] !== true){
                successorBoard[c][r] = false;
            }
            
            // only start search from current player
            if(board[c][r] != currPlayer){
                continue;
            }
            
            // find all possible moves from this starting position, in each direction
            for(d in directions){
                var direction = directions[d];
                
                // check if the direction is possible
                pos = getPossibleMoveInDirection(board, currPlayer, direction, c, r);
                if(pos !== false){
                    successorBoard[pos[0]][pos[1]] = true;
                    successors.push(pos);
                }
            }
        }
    }
    
    if(boardFormat){
        return successorBoard;
    }
    
    return successors;
}

function getMoveDirections()
{
    var N =  [[ 0, -1], [ 0, -2], [ 0, -3], [ 0, -4], [ 0, -5], [ 0, -6], [ 0, -7]];
    var S =  [[ 0,  1], [ 0,  2], [ 0,  3], [ 0,  4], [ 0,  5], [ 0,  6], [ 0,  7]];
    var E =  [[-1,  0], [-2,  0], [-3,  0], [-4,  0], [-5,  0], [-6,  0], [-7,  0]];
    var W =  [[ 1,  0], [ 2,  0], [ 3,  0], [ 4,  0], [ 5,  0], [ 6,  0], [ 7,  0]];
    var NE = [[-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -5], [-6, -6], [-7, -7]];
    var NW = [[ 1, -1], [ 2, -2], [ 3, -3], [ 4, -4], [ 5, -5], [ 6, -6], [ 7, -7]];
    var SE = [[-1,  1], [-2,  2], [-3,  3], [-4,  4], [-5,  5], [-6,  6], [-7,  7]];
    var SW = [[ 1,  1], [ 2,  2], [ 3,  3], [ 4,  4], [ 5,  5], [ 6,  6], [ 7,  7]];
    
    var directions = [N, S, E, W, NE, NW, SE, SW];
    
    return directions;
}

// checks if the position is on the board
function isValidBoardPosition(col, row)
{
    if(col < 0 || row < 0 || col >= width || row >= height){
        return false;
    }
    
    return true;
}

// returns player for next turn
function nextPlayer(currPlayer)
{
    if(currPlayer == player.black){
        return player.white;
    } else {
        return player.black;
    }
}

// draws the given board object onto the canvas
function drawBoard(board)
{
    if(!displayEveryBoardChange){
        return;
    }
    
    // hide markers
    $('.marker').hide(); 

    for(c = 0; c < width; c++){
        for(r = 0; r < height; r++){
            var color = 'none'; 
            
            if(board[c][r] == player.white){
                color = 'white'; 
            } else if(board[c][r] == player.black){
                color = 'black'; 
            }
            
            // if newly selected, fade in
            if(fadeInNewMoves){
                if($('#cell_'+c+'_'+r+' .disc').css('background-color') == 'transparent'){
                    $('#cell_'+c+'_'+r+' .disc').hide();
                    $('#cell_'+c+'_'+r+' .disc').fadeIn();
                }
            }
            
            $('#cell_'+c+'_'+r+' .disc').css('background-color', color);
        }
    }
}

// draw possible moves for a binary board
function drawPossibleBoard(possibleBoard)
{
    if(!displayBoardPossibility){
        return;
    }
    
    for(c = 0; c < width; c++){
        for(r = 0; r < height; r++){
            // show possible moves, and make sure to hide others
            if(possibleBoard[c][r] == true){
                $('#cell_'+c+'_'+r+' .marker').show();   
            } else {
                $('#cell_'+c+'_'+r+' .marker').hide();   
            }
        }
    }
}

// returns an empty board object
function getEmptyBoard()
{
    // create empty matrix
    var board = [];
    for(c = 0; c < width; c++){
        board[c] = [];
        for(r = 0; r < height; r++){
            board[c][r] = player.none;   
        }
    }
    
    return board;
}

// setup initial game pieces
function placeInitPieces(board)
{
    // middle 4
    board[3][3] = player.white;
    board[4][3] = player.black;
    board[3][4] = player.black;
    board[4][4] = player.white;
}

// clone the given board
function cloneBoard(board)
{
    var newBoard = [];
    
    for(c = 0; c < width; c++){
        newBoard[c] = [];
        for(r = 0; r < height; r++){
            newBoard[c][r] = board[c][r]; 
        }
    }
    
    return newBoard;
}

// draw the divs and setup the click handler
function initGameHTML()
{
    // insert divs
    
    for(r = 0; r < height; r++){
        for(c = 0; c < width; c++){
            var id = 'cell_'+c+'_'+r;
            $('#game').append(' \
                <div class="cell" id="'+id+'" col="'+c+'" row="'+r+'"> \
                    <div class="disc"> \
                        <div class="marker"></div> \
                    </div> \
                </div> \
            ');
        }
        $('#game').append('<div style="clear:both"></div>');
    }
    
    $('#game').css('border', 'thin solid black')
              .css('float', 'left')
              .css('background-color', 'grey');
              
    $('.cell').css('width', '50px')
              .css('height', '50px')
              .css('border', 'thin solid black')
              .css('float', 'left');
    
    $('.disc').css('width', '42px')
              .css('height', '42px')
              .css('position', 'relative')
              .css('left', '4px')
              .css('top', '4px')
              .css('border-radius', '100%');
    
    $('.marker').css('width', '16px')
                .css('height', '16px')
                .css('position', 'relative')
                .css('left', '13px')
                .css('top', '13px')
                .css('border-radius', '100%')
                .css('background-color', 'black')
                .hide();
               
    // setup on click
    
    $('.cell').click(onCellClick);
}

// convert player to player name
function getPlayerName(currPlayer)
{
    if(currPlayer == player.none){
        return 'None';
    }
    
    return playerNames[currPlayer];
}

// prepends message to the message box
function message(text)
{
    if(!displayMessages){
        return;
    }
    
    var message = $('<div style="border-bottom: thin solid lightgrey; padding: 5px">'+text+'</div>');
    
    $('#messages').prepend(message);
    
    if(fadeInMessages){
        message.hide();
        message.fadeIn();
    }
}


