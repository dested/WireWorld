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

        $.get("js/wireworld.txt").complete(request=> {
            var board = new Board(request.responseText);

            canvasBack.width = canvasFront.width = Board.boardWidth * this.magnify;
            canvasBack.height = canvasFront.height = Board.boardHeight * this.magnify;

            //                ele.Html(board.ToString());
            boardState = this.generateInitialBoardState();
            setInterval(() => {
                // if (down) return;
                for (var i = 0; i < 1; i++) {
                    boardState = this.tickBoard(boardState);
                    this.iterations++;
                }
            }, 1);

            this.drawBack(contextBack);
            this.drawFront(contextFront, boardState);
            setInterval(() => {
                this.drawFront(contextFront, boardState);
            }, 1000 / 60);


        });

    }

    // getPointsOnLine(x0: number, y0: number, x1: number, y1: number): IEnumerable<StatePosition>;

    // updateSpot(statePosition: StatePosition, rightClick: boolean, control: boolean, boardState: BoardState): void;

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

        Program.neighbors=[
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

        for (var y = 0; y < boardHeight; y++)
        {
            for (var x = 0; x < boardWidth; x++)
            {
                var statePos = new StatePosition(x, y);
                switch (Board.initialStates[statePos.stateIndex])
                {
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
        for (var y = 0; y < boardHeight; y++)
        {
            for (var x = 0; x < boardWidth; x++)
            {
                var stateIndex = x + y * boardWidth;
                if (Board.copperGrid[stateIndex])
                {
                    Board.coppers[stateIndex] = this.getNeighborStates(x, y);
                }
            }
        }

    }

    getNeighborStates(x: number, y: number): number[] {
        var boardWidth = Board.boardWidth;

        var statePositions :number[]= [];

        for (var index = 0; index < Program.neighbors.length; index++)
        {
            var statePosition = Program.neighbors[index];
            var stateIndex = (x + statePosition.x) + (y + statePosition.y) * boardWidth;
            if (Board.copperGrid[stateIndex])
            {
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
        for (var index = 0, colLen = collection.length; index < colLen; index++)
        {
            var key = collection[index];
            var positions = coppers[key];

            for (var i = 0, posLength = positions.length; i < posLength; i++)
            {
                var copperStateIndex = positions[i];
                if (!tailsGrid[copperStateIndex] && !headsGrid[copperStateIndex] && !newHeadsGrid[copperStateIndex])
                {
                    var states = coppers[copperStateIndex];
                    var headNeighbors = 0;
                    for (var ind2 = 0, statesLen = states.length; ind2 < statesLen; ind2++)
                    {
                        var stateIndex = states[ind2];
                        if (headsGrid[stateIndex])
                        {
                            headNeighbors++;
                            if (headNeighbors == 3)
                            {
                                headNeighbors = 0;
                                break;
                            }
                        }
                    }
                    if (headNeighbors > 0)
                    {

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

        for (var rowIndex = 0;rowIndex < rows.length;rowIndex++)
        {
            var row = rows[rowIndex];

            for (var characterIndex = 0;characterIndex < row.length;characterIndex++)
            {
                var character = row[characterIndex];
                Board.initialStates[characterIndex + rowIndex * Board.boardWidth] = this.charToState(character);
            }
        }
    }

    charToState(character: string): WireState{
        switch (character)
        {
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