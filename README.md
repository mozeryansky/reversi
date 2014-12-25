reversi
=======

Reversi game written in JavaScript for the purpose of experimenting with AI


This game is designed so the functions are independent of the game itself.
Doing this allows an AI to play the game using it's own board.
(Currently not tested for independent game play.)
All drawing code is separate from gameplay for possible extensibility.


At the top reverse.js, in the Settings section, you can adjust a few parameters:

computerMoveWait: Integer
- Milliseconds to wait before the computer performs his move
- Useful if you don't want to watch the game play

fadeInNewMoves: Boolean
- Set to true to see the placed move fadeIn
- Provides a more noticeable way to see new moves, most useful for computer moves 

fadeInMessages: Boolean
- Set to true to see the each message fadeIn
- Provides a more noticeable way to see new messages in the message pane

displayMessages: Boolean
- Display messages in the message pane

blackIsHuman: Boolean
- Set to true to have a human play the black pieces
- Set to false to have black played by a computer

whiteIsHuman: Boolean
- Set to true to have a human play the white pieces
- Set to false to have white played by a computer

displayEveryBoardChange: Boolean
- Set to true to allow the board to be redraw after each move
- Set to false to only see the final board at the end of the game

displayBoardPossibility: Boolean
- Set to true to have the possible positions for the current player displayed on the board


All the options above were created so I can disable these actions, without deleting the code, and have the game play faster.
If you set both blackIsHuman and whiteIsHuman to false, then a computer will play another computer.


Future Plans
- Make expensive and repetative functions cacheable
- MiniMax AI
- Neural Net AI (Just wondering if it will work at all, plus it can generate it's own datasets)
- Develop an AI, or tweak the above AI, to which will always tie itself (I assume this is the best AI)

Change Log

Version 1.0:
- Full reversi game
- No AI yet, computer will choose a valid random move. (Or just the simplest AI...)
