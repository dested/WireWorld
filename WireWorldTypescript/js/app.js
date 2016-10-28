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
                    this.magnify = 1;
                }
                Program.prototype.start = function (draw) {
                    var _this = this;
                    var boardState = null;
                    if (draw) {
                        var canvasBack = document.getElementById("canvasBack");
                        var contextBack = canvasBack.getContext("2d");
                        var canvasFront = document.getElementById("canvasFront");
                        var contextFront = canvasFront.getContext("2d");
                        var lastPoint = null;
                        var down = false;
                        var updatedCoppers = false;
                        $(canvasFront).mousedown(function (a) {
                            lastPoint = new StatePosition(a.offsetX / _this.magnify, a.offsetY / _this.magnify);
                            down = true;
                            a.preventDefault();
                        });
                        $(canvasFront).mouseup(function (a) {
                            lastPoint = null;
                            down = false;
                            if (updatedCoppers) {
                                _this.buildCoppers();
                                updatedCoppers = false;
                            }
                            a.preventDefault();
                        });
                        $(canvasFront).on("contextmenu", function (a) {
                            a.preventDefault();
                        });
                        $(canvasFront).mousemove(function (event) {
                            event.preventDefault();
                            if (boardState != null && down) {
                                var x = event.offsetX / _this.magnify;
                                var y = event.offsetY / _this.magnify;
                                var points = {};
                                for (var _i = 0, _a = _this.getPointsOnLine(lastPoint.x, lastPoint.y, x, y); _i < _a.length; _i++) {
                                    var position = _a[_i];
                                    _this.updateSpot(position, event.which == 3, event.ctrlKey, boardState);
                                    points[position.stateIndex] = true;
                                }
                                if (event.ctrlKey) {
                                    updatedCoppers = true;
                                    _this.redrawBack(contextBack, points);
                                }
                                lastPoint = new StatePosition(x, y);
                            }
                        });
                    }
                    $.get("js/wireworld.txt").complete(function (request) {
                        var board = new Board(request.responseText);
                        //                ele.Html(board.ToString());
                        boardState = _this.generateInitialBoardState();
                        var iterations = 0;
                        var ticks = 0;
                        var totalMs = 0;
                        setInterval(function () {
                            if (down)
                                return;
                            var perf = performance.now();
                            for (var i = 0; i < 1; i++) {
                                boardState = _this.tickBoard(boardState);
                                _this.iterations++;
                            }
                            var res = performance.now() - perf;
                            totalMs += res;
                            ticks++;
                            if (ticks % 500 == 0) {
                                console.log("MS Per Run: " + totalMs / ticks);
                            }
                        }, 1);
                        if (draw) {
                            canvasBack.width = canvasFront.width = Board.boardWidth * _this.magnify;
                            canvasBack.height = canvasFront.height = Board.boardHeight * _this.magnify;
                            _this.drawBack(contextBack);
                            _this.drawFront(contextFront, boardState);
                            setInterval(function () {
                                _this.drawFront(contextFront, boardState);
                            }, 1000 / 60);
                        }
                    });
                };
                Program.prototype.getPointsOnLine = function (x0, y0, x1, y1) {
                    var steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
                    if (steep) {
                        var t = void 0;
                        t = x0; // swap x0 and y0
                        x0 = y0;
                        y0 = t;
                        t = x1; // swap x1 and y1
                        x1 = y1;
                        y1 = t;
                    }
                    if (x0 > x1) {
                        var t = void 0;
                        t = x0; // swap x0 and x1
                        x0 = x1;
                        x1 = t;
                        t = y0; // swap y0 and y1
                        y0 = y1;
                        y1 = t;
                    }
                    var dx = x1 - x0;
                    var dy = Math.abs(y1 - y0);
                    var error = dx / 2;
                    var ystep = (y0 < y1) ? 1 : -1;
                    var y = y0;
                    var points = [];
                    for (var x = x0; x <= x1; x++) {
                        points.push(new StatePosition((steep ? y : x), (steep ? x : y)));
                        error = error - dy;
                        if (error < 0) {
                            y += ystep;
                            error += dx;
                        }
                    }
                    return points;
                };
                Program.prototype.updateSpot = function (statePosition, rightClick, control, boardState) {
                    if (control) {
                        if (!rightClick) {
                            Board.coppers = new Array(Board.boardWidth * Board.boardHeight);
                            Board.copperGrid[statePosition.stateIndex] = true;
                        }
                        else {
                            Board.coppers = new Array(Board.boardWidth * Board.boardHeight);
                            Board.copperGrid[statePosition.stateIndex] = false;
                            boardState.headsGrid[statePosition.stateIndex] = false;
                            boardState.tailsGrid[statePosition.stateIndex] = false;
                            boardState.headsArray.splice(boardState.headsArray.indexOf(statePosition.stateIndex), 1);
                        }
                    }
                    else {
                        if (Board.copperGrid[statePosition.stateIndex]) {
                            if (!rightClick) {
                                boardState.headsArray.push(statePosition.stateIndex);
                                boardState.headsGrid[statePosition.stateIndex] = true;
                            }
                            else {
                                for (var index = boardState.headsArray.length - 1; index >= 0; index--) {
                                    var position = boardState.headsArray[index];
                                    if (position == statePosition.stateIndex) {
                                        boardState.headsArray.splice(boardState.headsArray.indexOf(position), 1);
                                        boardState.headsGrid[position] = false;
                                        break;
                                    }
                                }
                                for (var index = boardState.tailsArray.length - 1; index >= 0; index--) {
                                    var position = boardState.tailsArray[index];
                                    if (position == statePosition.stateIndex) {
                                        boardState.tailsArray.splice(boardState.tailsArray.indexOf(position), 1);
                                        boardState.tailsGrid[position] = false;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                };
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
                    this.headsGrid = new Array(BoardState.totalItems);
                    this.headsArray = [];
                }
                BoardState.setupArraySwitch = function () {
                    this.totalItems = Board.boardWidth * Board.boardHeight;
                };
                return BoardState;
            }());
            exports_1("BoardState", BoardState);
            new Program().start(true);
        }
    }
});
//# sourceMappingURL=app.js.map