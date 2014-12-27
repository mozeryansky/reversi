/*
    This file sets up the Reversi game
    and hooks in a human player
*/

var options = [];

// game options
options['computerMoveWait'] = 500;
options['blackIsHuman'] = true;
options['whiteIsHuman'] = false;

// display options
var displayEveryBoardChange = true;
var displayBoardPossibility = true;
var fadeInNewMoves = true;
var fadeInMessages = true;
var displayMessages = true;

var game;

// initialize game
function init()
{
    game = new Reversi(options);
    
    // draw divs
    initGameHTML();
    
    // set external functions
    game.drawBoard = drawBoard;
    game.drawPossibleBoard = drawPossibleBoard;
    game.message = message;
    
    // reset
    game.reset();
    
    // player names
    game.playerNames[game.playerType.white] = 'Computer';
    game.playerNames[game.playerType.black] = 'Human';
        
    // tell who is who
    message(game.getPlayerName(game.playerType.white)+' is White');
    message(game.getPlayerName(game.playerType.black)+' is Black');
    
    // start game
    game.start();
}

// on click cell handler
function onCellClick()
{
    // verify it is a user's turn
    if(game.isComputerPlayer(game.currPlayer)){
        // not user's turn
        message('It is not your turn');
        return;
    }
    
    var cell = $(this);
    var col = parseInt(cell.attr('col'));
    var row = parseInt(cell.attr('row'));
    
    if(!game.isValidMove(game.board, game.currPlayer, col, row)){
        // invalid move
        message('Invalid move');
        return;
    }
    
    // valid move
    game.playMove(col, row)
}

// draws the given board object onto the canvas
function drawBoard(board)
{
    if(!displayEveryBoardChange){
        return;
    }
    
    // hide markers
    $('.marker').hide(); 

    for(c = 0; c < game.width; c++){
        for(r = 0; r < game.height; r++){
            var color = 'none'; 
            
            if(board[c][r] == game.playerType.white){
                color = 'white'; 
            } else if(board[c][r] == game.playerType.black){
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
    
    for(c = 0; c < game.width; c++){
        for(r = 0; r < game.height; r++){
            // show possible moves, and make sure to hide others
            if(possibleBoard[c][r] == true){
                $('#cell_'+c+'_'+r+' .marker').show();   
            } else {
                $('#cell_'+c+'_'+r+' .marker').hide();   
            }
        }
    }
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

// draw the divs and setup the click handler
function initGameHTML()
{
    // insert divs
    
    for(r = 0; r < game.height; r++){
        for(c = 0; c < game.width; c++){
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

