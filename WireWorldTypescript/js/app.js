System.register("WireWorld", [], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var StatePosition, Program, Board, WireState, BoardState;
    return {
        setters:[],
        execute: function() {
            StatePosition = (function () {
                function StatePosition(x, y) {
                    this.x = x;
                    this.y = y;
                    this.stateIndex = this.x + this.y * Board.boardWidth;
                }
                StatePosition.getY = function (z) {
                    return (z / Board.boardWidth) | 0;
                };
                StatePosition.getX = function (z) {
                    return (z % Board.boardWidth);
                };
                return StatePosition;
            }());
            exports_1("StatePosition", StatePosition);
            Program = (function () {
                function Program() {
                    this.magnify = 2;
                }
                Program.prototype.start = function () {
                    var _this = this;
                    var boardState = null;
                    var canvasBack = document.getElementById("canvasBack");
                    var contextBack = canvasBack.getContext("2d");
                    var canvasFront = document.getElementById("canvasFront");
                    var contextFront = canvasFront.getContext("2d");
                    /*
                     var lastPoint = null;
                     var down = false;
                     var updatedCoppers = false;
                     jQuery.FromElement(canvasFront).MouseDown(a =>
                     {
                     lastPoint = new StatePosition(a.OffsetX / magnify, a.OffsetY / magnify);
                     down = true;
                     a.PreventDefault();
                     });
                     jQuery.FromElement(canvasFront).MouseUp(a =>
                     {
                     lastPoint = null;
                     down = false;
                     if (updatedCoppers)
                     {
                     buildCoppers();
                     updatedCoppers = false;
                     }
                     a.PreventDefault();
                     });
                     jQuery.FromElement(canvasFront).On("contextmenu", a =>
                     {
                     a.PreventDefault();
                     });
            
                     jQuery.FromElement(canvasFront).MouseMove(@event =>
                     {
                     @event.PreventDefault();
                     if (boardState != null && down)
                     {
                     var x = @event.OffsetX / magnify;
                     var y = @event.OffsetY / magnify;
                     JsDictionary<int, bool> points = new JsDictionary<int, bool>();
            
                     foreach (var position in GetPointsOnLine(lastPoint.X, lastPoint.Y, x, y))
                     {
                     updateSpot(position, @event.Which == 3, @event.CtrlKey, boardState);
                     points[position.stateIndex]=true;
                     }
                     if (@event.CtrlKey)
                     {
                     updatedCoppers = true;
                     redrawBack(contextBack,points);
                     }
            
            
                     lastPoint = new StatePosition(x, y);
                     }
                     });
                     */
                    $.get("js/wireworld.txt").complete(function (request) {
                        var board = new Board(request.responseText);
                        canvasBack.width = canvasFront.width = Board.boardWidth * _this.magnify;
                        canvasBack.height = canvasFront.height = Board.boardHeight * _this.magnify;
                        //                ele.Html(board.ToString());
                        boardState = _this.generateInitialBoardState();
                        setInterval(function () {
                            // if (down) return;
                            for (var i = 0; i < 1; i++) {
                                boardState = _this.tickBoard(boardState);
                                _this.iterations++;
                            }
                        }, 1);
                        _this.drawBack(contextBack);
                        _this.drawFront(contextFront, boardState);
                        setInterval(function () {
                            _this.drawFront(contextFront, boardState);
                        }, 1000 / 60);
                    });
                };
                // getPointsOnLine(x0: number, y0: number, x1: number, y1: number): IEnumerable<StatePosition>;
                // updateSpot(statePosition: StatePosition, rightClick: boolean, control: boolean, boardState: BoardState): void;
                Program.prototype.drawBack = function (context) {
                    context.fillStyle = "#000000";
                    context.fillRect(0, 0, Board.boardWidth * this.magnify, Board.boardHeight * this.magnify);
                    for (var y = 0; y < Board.boardHeight; y++) {
                        for (var x = 0; x < Board.boardWidth; x++) {
                            if (Board.copperGrid[x + y * Board.boardWidth]) {
                                context.fillStyle = "#1000A8";
                                context.fillRect(x * this.magnify, y * this.magnify, this.magnify, this.magnify);
                            }
                        }
                    }
                };
                Program.prototype.redrawBack = function (context, updates) {
                    for (var y = 0; y < Board.boardHeight; y++) {
                        for (var x = 0; x < Board.boardWidth; x++) {
                            var stateIndex = x + y * Board.boardWidth;
                            if (updates[stateIndex]) {
                                if (Board.copperGrid[stateIndex]) {
                                    context.fillStyle = "#1000A8";
                                    context.fillRect(x * this.magnify, y * this.magnify, this.magnify, this.magnify);
                                }
                                else {
                                    context.fillStyle = "#000000";
                                    context.fillRect(x * this.magnify, y * this.magnify, this.magnify, this.magnify);
                                }
                            }
                        }
                    }
                };
                Program.prototype.drawFront = function (context, boardState) {
                    context.clearRect(0, 0, Board.boardWidth * this.magnify, Board.boardHeight * this.magnify);
                    var heads = boardState.headsArray;
                    var tails = boardState.tailsArray;
                    context.save();
                    context.fillStyle = "#FFF59B";
                    for (var index = 0, headLength = heads.length; index < headLength; index++) {
                        context.fillRect(StatePosition.getX(heads[index]) * this.magnify, StatePosition.getY(heads[index]) * this.magnify, this.magnify, this.magnify);
                    }
                    context.fillStyle = "#89D2FF";
                    for (var index = 0, tailLength = tails.length; index < tailLength; index++) {
                        context.fillRect(StatePosition.getX(tails[index]) * this.magnify, StatePosition.getY(tails[index]) * this.magnify, this.magnify, this.magnify);
                    }
                    context.restore();
                };
                Program.prototype.generateInitialBoardState = function () {
                    var boardState = new BoardState();
                    var boardWidth = Board.boardWidth;
                    var boardHeight = Board.boardHeight;
                    boardState.tailsGrid = new Array(boardWidth * boardHeight);
                    boardState.tailsArray = [];
                    Program.neighbors = [
                        new StatePosition(-1, -1),
                        new StatePosition(-1, 0),
                        new StatePosition(-1, 1),
                        new StatePosition(0, -1),
                        new StatePosition(0, 1),
                        new StatePosition(1, -1),
                        new StatePosition(1, 0),
                        new StatePosition(1, 1)
                    ];
                    Board.copperGrid = new Array(boardWidth * boardHeight);
                    Board.coppers = new Array(boardWidth * boardHeight);
                    for (var y = 0; y < boardHeight; y++) {
                        for (var x = 0; x < boardWidth; x++) {
                            var statePos = new StatePosition(x, y);
                            switch (Board.initialStates[statePos.stateIndex]) {
                                case WireState.Head:
                                    Board.copperGrid[statePos.stateIndex] = true;
                                    boardState.headsArray.push(statePos.stateIndex);
                                    boardState.headsGrid[statePos.stateIndex] = true;
                                    break;
                                case WireState.Tail:
                                    Board.copperGrid[statePos.stateIndex] = true;
                                    boardState.tailsArray.push(statePos.stateIndex);
                                    boardState.tailsGrid[statePos.stateIndex] = true;
                                    break;
                                case WireState.Copper:
                                    Board.copperGrid[statePos.stateIndex] = true;
                                    break;
                            }
                        }
                    }
                    this.buildCoppers();
                    return boardState;
                };
                Program.prototype.buildCoppers = function () {
                    var boardHeight = Board.boardHeight;
                    var boardWidth = Board.boardWidth;
                    for (var y = 0; y < boardHeight; y++) {
                        for (var x = 0; x < boardWidth; x++) {
                            var stateIndex = x + y * boardWidth;
                            if (Board.copperGrid[stateIndex]) {
                                Board.coppers[stateIndex] = this.getNeighborStates(x, y);
                            }
                        }
                    }
                };
                Program.prototype.getNeighborStates = function (x, y) {
                    var boardWidth = Board.boardWidth;
                    var statePositions = [];
                    for (var index = 0; index < Program.neighbors.length; index++) {
                        var statePosition = Program.neighbors[index];
                        var stateIndex = (x + statePosition.x) + (y + statePosition.y) * boardWidth;
                        if (Board.copperGrid[stateIndex]) {
                            statePositions.push(new StatePosition(x + statePosition.x, y + statePosition.y).stateIndex);
                        }
                    }
                    return statePositions;
                };
                Program.prototype.tickBoard = function (boardState) {
                    var newBoardState = new BoardState();
                    var headsGrid = boardState.headsGrid;
                    var tailsGrid = boardState.tailsGrid;
                    var newHeadsGrid = newBoardState.headsGrid;
                    var coppers = Board.coppers;
                    var collection = boardState.headsArray;
                    for (var index = 0, colLen = collection.length; index < colLen; index++) {
                        var key = collection[index];
                        var positions = coppers[key];
                        for (var i = 0, posLength = positions.length; i < posLength; i++) {
                            var copperStateIndex = positions[i];
                            if (!tailsGrid[copperStateIndex] && !headsGrid[copperStateIndex] && !newHeadsGrid[copperStateIndex]) {
                                var states = coppers[copperStateIndex];
                                var headNeighbors = 0;
                                for (var ind2 = 0, statesLen = states.length; ind2 < statesLen; ind2++) {
                                    var stateIndex = states[ind2];
                                    if (headsGrid[stateIndex]) {
                                        headNeighbors++;
                                        if (headNeighbors == 3) {
                                            headNeighbors = 0;
                                            break;
                                        }
                                    }
                                }
                                if (headNeighbors > 0) {
                                    newBoardState.headsArray.push(copperStateIndex);
                                    newHeadsGrid[copperStateIndex] = true;
                                }
                            }
                        }
                    }
                    newBoardState.tailsArray = collection;
                    newBoardState.tailsGrid = headsGrid;
                    return newBoardState;
                };
                return Program;
            }());
            exports_1("Program", Program);
            Board = (function () {
                /*    constructor(width: number, height: number) {
                        Board.initialStates = new Array(width * height);
                        Board.boardWidth = width;
                        Board.boardHeight = height;
                    }*/
                function Board(starting) {
                    var rows = starting.replace(new RegExp("\r", 'g'), "").split('\n');
                    Board.boardWidth = rows[0].length;
                    Board.boardHeight = rows.length;
                    BoardState.setupArraySwitch();
                    Board.initialStates = new Array(Board.boardWidth * Board.boardHeight);
                    for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                        var row = rows[rowIndex];
                        for (var characterIndex = 0; characterIndex < row.length; characterIndex++) {
                            var character = row[characterIndex];
                            Board.initialStates[characterIndex + rowIndex * Board.boardWidth] = this.charToState(character);
                        }
                    }
                }
                Board.prototype.charToState = function (character) {
                    switch (character) {
                        case '#':
                            return WireState.Copper;
                        case '@':
                            return WireState.Head;
                        case '~':
                            return WireState.Tail;
                        default:
                            return WireState.Empty;
                    }
                };
                return Board;
            }());
            exports_1("Board", Board);
            (function (WireState) {
                WireState[WireState["Empty"] = 0] = "Empty";
                WireState[WireState["Head"] = 1] = "Head";
                WireState[WireState["Tail"] = 2] = "Tail";
                WireState[WireState["Copper"] = 3] = "Copper";
            })(WireState || (WireState = {}));
            exports_1("WireState", WireState);
            BoardState = (function () {
                function BoardState() {
                    switch (BoardState.switchArray) {
                        case 0:
                            BoardState.switchArray = 1;
                            this.headsGrid = BoardState.switchArray1;
                            break;
                        case 1:
                            BoardState.switchArray = 2;
                            this.headsGrid = BoardState.switchArray2;
                            break;
                        case 2:
                            BoardState.switchArray = 0;
                            this.headsGrid = BoardState.switchArray3;
                            break;
                    }
                    var l = this.headsGrid.length;
                    this.headsGrid.length = 0;
                    this.headsGrid.length = l;
                    this.headsArray = new Array(BoardState.educatedHeadsArraySize);
                }
                BoardState.setupArraySwitch = function () {
                    this.switchArray1 = new Array(Board.boardWidth * Board.boardHeight);
                    this.switchArray2 = new Array(Board.boardWidth * Board.boardHeight);
                    this.switchArray3 = new Array(Board.boardWidth * Board.boardHeight);
                };
                BoardState.switchArray = 0;
                BoardState.educatedHeadsArraySize = 0;
                return BoardState;
            }());
            exports_1("BoardState", BoardState);
            new Program().start();
        }
    }
});
//# sourceMappingURL=app.js.map