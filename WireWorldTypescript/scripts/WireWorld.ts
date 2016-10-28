declare var $;
export class StatePosition {
    stateIndex;

    static getY(z: number): number {
        return (z / Board.boardWidth) | 0;
    }

    static getX(z: number): number {
        return (z % Board.boardWidth);
    }

    constructor(public x: number, public y: number) {
        this.stateIndex = this.x + this.y * Board.boardWidth;

    }
}

export class Program {
    magnify = 2;
    private iterations;

    start() {
        var boardState = null;


        var canvasBack = <HTMLCanvasElement>document.getElementById("canvasBack");
        var contextBack = <CanvasRenderingContext2D>canvasBack.getContext("2d");

        var canvasFront = <HTMLCanvasElement>document.getElementById("canvasFront");
        var contextFront = <CanvasRenderingContext2D>canvasFront.getContext("2d");

        var lastPoint = null;
        var down = false;
        var updatedCoppers = false;
        $(canvasFront).mousedown(a => {
            lastPoint = new StatePosition(a.offsetX / this.magnify, a.offsetY / this.magnify);
            down = true;
            a.preventDefault();
        });
        $(canvasFront).mouseup(a => {
            lastPoint = null;
            down = false;
            if (updatedCoppers) {
                this.buildCoppers();
                updatedCoppers = false;
            }
            a.preventDefault();
        });
        $(canvasFront).on("contextmenu", a => {
            a.preventDefault();
        });

        $(canvasFront).mousemove(event => {
            event.preventDefault();
            if (boardState != null && down) {
                var x = event.offsetX / this.magnify;
                var y = event.offsetY / this.magnify;
                var points: {[key: number]: boolean} = {};

                for (var position of this.getPointsOnLine(lastPoint.x, lastPoint.y, x, y)) {
                    this.updateSpot(position, event.which == 3, event.ctrlKey, boardState);
                    points[position.stateIndex] = true;
                }
                if (event.ctrlKey) {
                    updatedCoppers = true;
                    this.redrawBack(contextBack, points);
                }

                lastPoint = new StatePosition(x, y);
            }
        });

        $.get("js/wireworld.txt").complete(request=> {
            var board = new Board(request.responseText);

            canvasBack.width = canvasFront.width = Board.boardWidth * this.magnify;
            canvasBack.height = canvasFront.height = Board.boardHeight * this.magnify;

            //                ele.Html(board.ToString());
            boardState = this.generateInitialBoardState();
            var iterations = 0;
            var ticks = 0;
            var totalMs = 0;

            setInterval(() => {
                if (down) return;
                var perf = performance.now();
                for (var i = 0; i < 1; i++) {
                    boardState = this.tickBoard(boardState);
                    this.iterations++;
                }
                var res = performance.now() - perf;
                totalMs += res;
                ticks++;

                if (ticks%500 == 0)
                {
                    console.log(`MS Per Run: ${totalMs / ticks}`);
                }

            }, 1);

            this.drawBack(contextBack);
            this.drawFront(contextFront, boardState);
            setInterval(() => {
                this.drawFront(contextFront, boardState);
            }, 1000 / 60);


        });

    }

    getPointsOnLine(x0: number, y0: number, x1: number, y1: number): StatePosition[] {
        var steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
        if (steep) {
            let t;
            t = x0; // swap x0 and y0
            x0 = y0;
            y0 = t;
            t = x1; // swap x1 and y1
            x1 = y1;
            y1 = t;
        }
        if (x0 > x1) {
            let t;
            t = x0; // swap x0 and x1
            x0 = x1;
            x1 = t;
            t = y0; // swap y0 and y1
            y0 = y1;
            y1 = t;
        }
        let dx = x1 - x0;
        let dy = Math.abs(y1 - y0);
        let error = dx / 2;
        let ystep = (y0 < y1) ? 1 : -1;
        let y = y0;
        let points: StatePosition[] = [];
        for (let x = x0; x <= x1; x++) {
            points.push(new StatePosition((steep ? y : x), (steep ? x : y)));
            error = error - dy;
            if (error < 0) {
                y += ystep;
                error += dx;
            }
        }
        return points;
    }

    updateSpot(statePosition: StatePosition, rightClick: boolean, control: boolean, boardState: BoardState): void {
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

    }

    drawBack(context: CanvasRenderingContext2D): void {
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

    }

    redrawBack(context: CanvasRenderingContext2D, updates: {[key: number]: boolean}): void {
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

    }

    drawFront(context: CanvasRenderingContext2D, boardState: BoardState): void {

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
    }

    private static neighbors: StatePosition[];


    generateInitialBoardState(): BoardState {
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
    }

    buildCoppers(): void {
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

    }

    getNeighborStates(x: number, y: number): number[] {
        var boardWidth = Board.boardWidth;

        var statePositions: number[] = [];

        for (var index = 0; index < Program.neighbors.length; index++) {
            var statePosition = Program.neighbors[index];
            var stateIndex = (x + statePosition.x) + (y + statePosition.y) * boardWidth;
            if (Board.copperGrid[stateIndex]) {
                statePositions.push(new StatePosition(x + statePosition.x, y + statePosition.y).stateIndex);
            }
        }
        return statePositions;
    }

    tickBoard(boardState: BoardState): BoardState {
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
    }
}
export class Board {
    static boardHeight;
    static boardWidth;
    public static initialStates: WireState[];
    public static coppers: number[][];
    public static copperGrid: boolean[];

    /*    constructor(width: number, height: number) {
     Board.initialStates = new Array(width * height);
     Board.boardWidth = width;
     Board.boardHeight = height;
     }*/

    constructor(starting: string) {
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

    charToState(character: string): WireState {
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
    }


    /*
     toString(state: BoardState): string;


     stateToChar(state: WireState): string;
     */
}
export enum WireState {
    Empty = 0,

    Head = 1,

    Tail = 2,

    Copper = 3
}
export class BoardState {
    public headsArray: number[];
    public tailsArray: number[];

    public headsGrid: boolean[];
    public tailsGrid: boolean[];

    private static switchArray = 0;
    private static switchArray1: boolean[];
    private static switchArray2: boolean[];
    private static switchArray3: boolean[];
    public static educatedHeadsArraySize: number = 0;

    public static setupArraySwitch() {
        this.switchArray1 = new Array(Board.boardWidth * Board.boardHeight);
        this.switchArray2 = new Array(Board.boardWidth * Board.boardHeight);
        this.switchArray3 = new Array(Board.boardWidth * Board.boardHeight);
    }

    constructor() {
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
}


new Program().start();