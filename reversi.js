
function Reversi(options)
{
    // options
    this.computerMoveWait = options['computerMoveWait'] || 500;
    var blackIsHuman = options['blackIsHuman'] === true;
    var whiteIsHuman = options['whiteIsHuman'] !== false;

    // player type
    this.playerType = {none: 0, white: 1, black: 2};

    // standard board size
    this.width = 8;
    this.height = 8;
    
    this.board = [];
    this.currPlayer = this.playerType.none;
    this.computerPlayers = [];
    this.playerNames = [];
    
    //
    this.directions = this.getMoveDirections();
    
    // computer is white
    // add playerType.black to have cpu vs cpu
    this.computerPlayers[this.playerType.black] = !blackIsHuman;
    this.computerPlayers[this.playerType.white] = !whiteIsHuman;
    
    // must be set outside of the Reversi game
    this.drawBoard = function(board){};
    this.drawPossibleBoard = function(possibleBoard){};
    this.message = function(text){};
}

Reversi.prototype.reset = function()
{
    // create empty board
    this.board = this.getEmptyBoard();
    
    // place starting pieces
    this.placeInitPieces(this.board);
    
    // black starts
    this.currPlayer = this.playerType.black;
}

Reversi.prototype.start = function()
{
    // draw initial board
    this.drawBoard(this.board);
    
    // play first turn
    this.playNextTurn();
}

// play current players move onto col,row
Reversi.prototype.playMove = function(col, row)
{
    // place move
    this.placePlayerMove(col, row);
    
    // update board
    this.drawBoard(this.board);
    
    // set next player
    this.currPlayer = this.nextPlayer(this.currPlayer);
    
    // initiate next players turn
    this.playNextTurn();
}

// initiate next players turn
Reversi.prototype.playNextTurn = function()
{
    // get successors
    var successors = this.getSuccessors(this.board, this.currPlayer);
    
    // if current player can't make a move
    if(successors.length == 0){
        // if other player can't make a move
        var otherPlayer = this.nextPlayer(this.currPlayer);
        var otherSuccessors = this.getSuccessors(this.board, otherPlayer);
        if(otherSuccessors.length == 0){
            // neither player has a possible move
            this.message('Neither player can make a move. Game over.');
            
            if(!displayEveryBoardChange){
                // draw final board
                displayEveryBoardChange = true;
                this.drawBoard(this.gameBoard);
                displayEveryBoardChange = false;
            }
            
            return;
            
        } else {
            // current player has no move
            this.message(this.getPlayerName(this.currPlayer)+' has no possible moves.');
            
            // switch players
            this.currPlayer = this.nextPlayer(this.currPlayer);
            this.playNextTurn(this.currPlayer);
            
            return;
        }
    }
    
    // update scores
    var scores = this.getScores(this.board);
    message('Score: Black='+scores[this.playerType.black]+' White='+scores[this.playerType.white]);
    
    message('It is '+this.getPlayerName(this.currPlayer)+'\'s turn');

    if(this.isComputerPlayer(this.currPlayer)){
        // computer
        
        // dispay possible moves
        this.drawPossibleBoard(this.getSuccessorBoard(this.board, this.currPlayer));
        
        // wait
        var _this = this;
        setTimeout(function(){
            // choose random successor
            var successors = _this.getSuccessors(_this.board, _this.currPlayer);
            var position = successors[Math.floor(Math.random()*successors.length)];
            
            var col = position[0];
            var row = position[1];
            _this.playMove(col, row);
        
        }, this.computerMoveWait);
        
    } else {
        // human
        
        // dispay possible moves
        this.drawPossibleBoard(this.getSuccessorBoard(this.board, this.currPlayer));
    }
}

Reversi.prototype.getScores = function(board)
{
    var scores = [];
    
    scores[this.playerType.black] = 0;
    scores[this.playerType.white] = 0;
    
    for(c = 0; c < this.width; c++){
        for(r = 0; r < this.height; r++){
            if(this.board[c][r] == this.playerType.black){
                scores[this.playerType.black]++;
                
            } else if(this.board[c][r] == this.playerType.white){
                scores[this.playerType.white]++;
            }
        }
    }
    
    return scores;
}

// returns true if the player is a computer
Reversi.prototype.isComputerPlayer = function(player)
{
    return (this.computerPlayers[player] === true);
}

// places player piece on board and updates other cells
// assumes this position is valid
Reversi.prototype.placePlayerMove = function(col, row)
{ 
    //
    // helper function
    //
    
    // searches from a move back to one of the players pieces
    function getPossiblePathInDirection(direction, fromCol, fromRow)
    {
        var path = [];
        var otherPlayer = this.nextPlayer(this.currPlayer);

        // search until we find our own piece
        for(i in direction){
            var pos = direction[i];
            var checkCol = fromCol + pos[0];
            var checkRow = fromRow + pos[1];
            
            // add current position to the path
            path.push([checkCol, checkRow]);
            
            if(!this.isValidBoardPosition(checkCol, checkRow)){
                return false;
            }
            // can't pass over none piece
            if(this.board[checkCol][checkRow] == this.playerType.none){
                return false;
            }
            
            // stop at current player's piece
            if(this.board[checkCol][checkRow] == this.currPlayer){
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
    this.board[col][row] = this.currPlayer;
    
    // find all paths this move is valid for
    var validMove = false;
    for(d in this.directions){
        var direction = this.directions[d];
        
        // check if the direction is possible
        path = getPossiblePathInDirection.call(this, direction, col, row);
        if(path !== false){
            validMove = true;
            // change pieces for entire path
            for(i in path){
                pos = path[i];
                this.board[pos[0]][pos[1]] = this.currPlayer;
            } 
        }
    }

    if(!validMove){
        console.log('No valid paths found for placePlayerMove');
    }
}

// verifies that the player can make that move
Reversi.prototype.isValidMove = function(board, player, col, row)
{
    var successorBoard = this.getSuccessorBoard(board, player);
    
    if(successorBoard[col][row] == true){
        return true;
    }
    
    return false;
}

// get all successor moves in a binary board format
Reversi.prototype.getSuccessorBoard = function(board, player)
{
    // get successors in a the binary format
    return this.getSuccessors(board, player, true);
}

// get all successors, set last param to true for binary board format
Reversi.prototype.getSuccessors = function(board, currPlayer, boardFormat)
{
    //
    // helper function
    //
    
    // searches from a players piece to a possible successor
    function getPossibleMoveInDirection(direction, fromCol, fromRow)
    {
        var otherPlayer = this.nextPlayer(this.currPlayer);

        // search until we find a none position
        for(i in direction){
            var pos = direction[i];
            var checkCol = fromCol + pos[0];
            var checkRow = fromRow + pos[1];
            
            if(!this.isValidBoardPosition(checkCol, checkRow)){
                return false;
            }
            // can't pass over current piece
            if(this.board[checkCol][checkRow] == this.currPlayer){
                return false;
            }
            
            // if an none place is found
            if(this.board[checkCol][checkRow] == this.playerType.none){
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
    var successorBoard = this.getEmptyBoard();
    var successors = [];
    
    // search for successors
    for(c = 0; c < this.width; c++){
        for(r = 0; r < this.height; r++){
            // make sure position is boolean false, if not already boolean true
            if(successorBoard[c][r] !== true){
                successorBoard[c][r] = false;
            }
            
            // only start search from current player
            if(this.board[c][r] != this.currPlayer){
                continue;
            }
            
            // find all possible moves from this starting position, in each direction
            for(d in this.directions){
                var direction = this.directions[d];
                
                // check if the direction is possible
                pos = getPossibleMoveInDirection.call(this, direction, c, r);
                if(pos !== false){
                    successorBoard[pos[0]][pos[1]] = true;
                    successors.push(pos);
                }
            }
        }
    }
    
    if(boardFormat === true){
        return successorBoard;
    }
    
    return successors;
}

// return all the direction path differences
// adding these to a position will give all paths in each direction
Reversi.prototype.getMoveDirections = function()
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
Reversi.prototype.isValidBoardPosition = function(col, row)
{
    if(col < 0 || row < 0 || col >= this.width || row >= this.height){
        return false;
    }
    
    return true;
}

// returns player for next turn
Reversi.prototype.nextPlayer = function(player)
{
    if(player == this.playerType.black){
        return this.playerType.white;
    } else {
        return this.playerType.black;
    }
}

// returns an empty board object
Reversi.prototype.getEmptyBoard = function()
{
    // create empty matrix
    var board = [];
    for(c = 0; c < this.width; c++){
        board[c] = [];
        for(r = 0; r < this.height; r++){
            board[c][r] = this.playerType.none;   
        }
    }
    
    return board;
}

// setup initial game pieces
Reversi.prototype.placeInitPieces = function(board)
{
    var left = Math.floor(this.width / 2) - 1;
    var top  = Math.floor(this.height / 2) - 1;

    // middle 4
    this.board[left  ][top  ] = this.playerType.white;
    this.board[left+1][top  ] = this.playerType.black;
    this.board[left  ][top+1] = this.playerType.black;
    this.board[left+1][top+1] = this.playerType.white;
}

// convert player to player name
Reversi.prototype.getPlayerName = function(player)
{
    if(player == this.playerType.none){
        return 'None';
    }
    
    return this.playerNames[player];
}


