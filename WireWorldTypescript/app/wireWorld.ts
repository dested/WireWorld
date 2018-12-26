import wireworldtxt from './wireworld.txt';

let instance: any;
(window as any).webasm = true;
const copperLen = 8;
const size = 605129;
const arrLen = 7000;
const coppersSize = size * copperLen;
const headsArrayOffset = coppersSize + size;
const headsGridOffset = headsArrayOffset + arrLen;
const tailsArrayOffset = headsGridOffset + size;
const tailsGridOffset = tailsArrayOffset + arrLen;

const newHeadsArrayOffset = tailsGridOffset + size;
const newHeadsGridOffset = newHeadsArrayOffset + arrLen;
const newTailsArrayOffset = newHeadsGridOffset + size;
const newTailsGridOffset = newTailsArrayOffset + arrLen;

export class StatePosition {
  stateIndex;

  static getY(z: number): number {
    return (z / Board.boardWidth) | 0;
  }

  static getX(z: number): number {
    return z % Board.boardWidth;
  }

  constructor(public x: number, public y: number) {
    this.stateIndex = this.x + this.y * Board.boardWidth;
  }
}

export class Program {
  magnify = 1;
  private iterations = 0;
  mem32: Uint32Array;

  start(draw: boolean) {
    let boardState: BoardState = null;
    const down = false;
    let canvasBack: HTMLCanvasElement;
    let contextBack: CanvasRenderingContext2D;
    let canvasFront: HTMLCanvasElement;
    let contextFront: CanvasRenderingContext2D;

    if (draw) {
      canvasBack = document.getElementById('canvasBack') as HTMLCanvasElement;
      contextBack = canvasBack.getContext('2d') as CanvasRenderingContext2D;

      canvasFront = document.getElementById('canvasFront') as HTMLCanvasElement;
      contextFront = canvasFront.getContext('2d') as CanvasRenderingContext2D;

      const lastPoint = null;
      const updatedCoppers = false;
      /*    canvasFront.onmousedown = a => {
        lastPoint = new StatePosition(a.offsetX / this.magnify, a.offsetY / this.magnify);
        down = true;
        a.preventDefault();
      };

      canvasFront.onmouseup = a => {
        lastPoint = null;
        down = false;
        if (updatedCoppers) {
          this.buildCoppers();
          updatedCoppers = false;
        }
        a.preventDefault();
      };
      canvasFront.oncontextmenu = a => a.preventDefault();

      canvasFront.onmousemove = event => {
        event.preventDefault();
        if (boardState != null && down) {
          const x = event.offsetX / this.magnify;
          const y = event.offsetY / this.magnify;
          const points: {[key: number]: boolean} = {};

          for (const position of this.getPointsOnLine(lastPoint.x, lastPoint.y, x, y)) {
            this.updateSpot(position, event.which === 3, event.ctrlKey, boardState);
            points[position.stateIndex] = true;
          }
          if (event.ctrlKey) {
            updatedCoppers = true;
            this.redrawBack(contextBack, points);
          }

          lastPoint = new StatePosition(x, y);
        }
      };*/
    }

    const board = new Board(wireworldtxt);
    //                ele.Html(board.ToString());
    boardState = this.generateInitialBoardState();
    let ticks = 0;
    let totalMs = 0;
    instance.init();
    this.mem32 = new Uint32Array(instance.memory.buffer);

    this.mem32[headsArrayOffset] = boardState.headsArray.length;
    this.mem32[tailsArrayOffset] = boardState.tailsArray.length;

    for (let i = 0; i < boardState.headsArray.length; i++) {
      this.mem32[headsArrayOffset + i + 1] = boardState.headsArray[i];
    }
    for (let i = 0; i < boardState.tailsArray.length; i++) {
      this.mem32[tailsArrayOffset + i + 1] = boardState.tailsArray[i];
    }

    for (let y = 0; y < Board.boardHeight; y++) {
      for (let x = 0; x < Board.boardWidth; x++) {
        const pos = y * Board.boardWidth + x;
        this.mem32[headsGridOffset + pos] = boardState.headsGrid[pos] ? 1 : 0;
        this.mem32[tailsGridOffset + pos] = boardState.tailsGrid[pos] ? 1 : 0;
      }
    }


    for (let y = 0; y < Board.boardHeight; y++) {
      for (let x = 0; x < Board.boardWidth; x++) {
        const pos = y * Board.boardWidth + x;
        if (!Board.coppers[pos]) {
          continue;
        }
        this.mem32[pos * copperLen] = Board.coppers[pos].length;
        for (let i = 0; i < Board.coppers[pos].length; i++) {
          this.mem32[pos * copperLen + i + 1] = Board.coppers[pos][i];
        }
      }
    }

    setInterval(() => {
      if (down) {
        return;
      }
      const crank = (window as any).crank === true ? 50 : 1;

      for (let i = 0; i < crank; i++) {
        const perf = performance.now();
        this.tickBoard();
        this.iterations++;
        const res = performance.now() - perf;
        totalMs += res;
        ticks++;
        if (ticks % 100 === 0) {
          document.getElementById('msper').innerText = `MS Per Run: ${(totalMs / ticks).toFixed(5)}`;
          totalMs = 0;
          ticks = 0;
        }
      }
    }, 1);
    if (draw) {
      canvasBack.width = canvasFront.width = Board.boardWidth * this.magnify;
      canvasBack.height = canvasFront.height = Board.boardHeight * this.magnify;

      this.drawBack(contextBack);
      this.drawFront(contextFront, boardState);
      setInterval(() => {
        const newBoardState = new BoardState();
        newBoardState.headsGrid = new Array(size);
        newBoardState.tailsGrid = new Array(size);
        newBoardState.headsArray = [];
        newBoardState.tailsArray = [];
        const hLen = this.mem32[headsArrayOffset];
        for (let i = 0; i < hLen; i++) {
          newBoardState.headsArray.push(this.mem32[headsArrayOffset + i + 1]);
        }
        const tLen = this.mem32[tailsArrayOffset];
        for (let i = 0; i < tLen; i++) {
          newBoardState.tailsArray.push(this.mem32[tailsArrayOffset + i + 1]);
        }

        for (let y = 0; y < Board.boardHeight; y++) {
          for (let x = 0; x < Board.boardWidth; x++) {
            const pos = y * Board.boardWidth + x;
            newBoardState.headsGrid[pos] = this.mem32[pos + headsGridOffset] === 1;
            newBoardState.tailsGrid[pos] = this.mem32[pos + tailsGridOffset] === 1;
          }
        }

        boardState = newBoardState;
        // console.log(boardState.headsArray.length, boardState.tailsArray.length);
        this.drawFront(contextFront, boardState);
      }, 1000 / 60);
    }
  }

  getPointsOnLine(x0: number, y0: number, x1: number, y1: number): StatePosition[] {
    const steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
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
    const dx = x1 - x0;
    const dy = Math.abs(y1 - y0);
    let error = dx / 2;
    const ystep = y0 < y1 ? 1 : -1;
    let y = y0;
    const points: StatePosition[] = [];
    for (let x = x0; x <= x1; x++) {
      points.push(new StatePosition(steep ? y : x, steep ? x : y));
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
      } else {
        Board.coppers = new Array(Board.boardWidth * Board.boardHeight);
        Board.copperGrid[statePosition.stateIndex] = false;
        boardState.headsGrid[statePosition.stateIndex] = false;
        boardState.tailsGrid[statePosition.stateIndex] = false;

        boardState.headsArray.splice(boardState.headsArray.indexOf(statePosition.stateIndex), 1);
      }
    } else {
      if (Board.copperGrid[statePosition.stateIndex]) {
        if (!rightClick) {
          boardState.headsArray.push(statePosition.stateIndex);
          boardState.headsGrid[statePosition.stateIndex] = true;
        } else {
          for (let index = boardState.headsArray.length - 1; index >= 0; index--) {
            const position = boardState.headsArray[index];
            if (position === statePosition.stateIndex) {
              boardState.headsArray.splice(boardState.headsArray.indexOf(position), 1);
              boardState.headsGrid[position] = false;
              break;
            }
          }
          for (let index = boardState.tailsArray.length - 1; index >= 0; index--) {
            const position = boardState.tailsArray[index];
            if (position === statePosition.stateIndex) {
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
    context.fillStyle = '#000000';
    context.fillRect(0, 0, Board.boardWidth * this.magnify, Board.boardHeight * this.magnify);

    for (let y = 0; y < Board.boardHeight; y++) {
      for (let x = 0; x < Board.boardWidth; x++) {
        if (Board.copperGrid[x + y * Board.boardWidth]) {
          context.fillStyle = '#1000A8';
          context.fillRect(x * this.magnify, y * this.magnify, this.magnify, this.magnify);
        }
      }
    }
  }

  redrawBack(context: CanvasRenderingContext2D, updates: {[key: number]: boolean}): void {
    for (let y = 0; y < Board.boardHeight; y++) {
      for (let x = 0; x < Board.boardWidth; x++) {
        const stateIndex = x + y * Board.boardWidth;
        if (updates[stateIndex]) {
          if (Board.copperGrid[stateIndex]) {
            context.fillStyle = '#1000A8';
            context.fillRect(x * this.magnify, y * this.magnify, this.magnify, this.magnify);
          } else {
            context.fillStyle = '#000000';
            context.fillRect(x * this.magnify, y * this.magnify, this.magnify, this.magnify);
          }
        }
      }
    }
  }

  drawFront(context: CanvasRenderingContext2D, boardState: BoardState): void {
    context.clearRect(0, 0, Board.boardWidth * this.magnify, Board.boardHeight * this.magnify);

    const heads = boardState.headsArray;
    const tails = boardState.tailsArray;
    context.save();
    context.fillStyle = '#FFF59B';
    for (let index = 0, headLength = heads.length; index < headLength; index++) {
      context.fillRect(
        StatePosition.getX(heads[index]) * this.magnify,
        StatePosition.getY(heads[index]) * this.magnify,
        this.magnify,
        this.magnify
      );
    }
    context.fillStyle = '#89D2FF';
    for (let index = 0, tailLength = tails.length; index < tailLength; index++) {
      context.fillRect(
        StatePosition.getX(tails[index]) * this.magnify,
        StatePosition.getY(tails[index]) * this.magnify,
        this.magnify,
        this.magnify
      );
    }
    context.restore();
  }

  private static neighbors: StatePosition[];

  generateInitialBoardState(): BoardState {
    const boardState = new BoardState();
    const boardWidth = Board.boardWidth;
    const boardHeight = Board.boardHeight;
    boardState.tailsGrid = new Array(boardWidth * boardHeight);
    boardState.tailsArray = new Array(boardWidth * boardHeight);

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

    for (let y = 0; y < boardHeight; y++) {
      for (let x = 0; x < boardWidth; x++) {
        const statePos = new StatePosition(x, y);
        switch (Board.initialStates[statePos.stateIndex]) {
          case WireState.Head:
            Board.copperGrid[statePos.stateIndex] = true;
            boardState.headsArray[boardState.headsArray.length] = statePos.stateIndex;
            boardState.headsGrid[statePos.stateIndex] = true;
            break;
          case WireState.Tail:
            Board.copperGrid[statePos.stateIndex] = true;
            boardState.tailsArray[boardState.tailsArray.length] = statePos.stateIndex;
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
    const boardHeight = Board.boardHeight;
    const boardWidth = Board.boardWidth;
    for (let y = 0; y < boardHeight; y++) {
      for (let x = 0; x < boardWidth; x++) {
        const stateIndex = x + y * boardWidth;
        if (Board.copperGrid[stateIndex]) {
          Board.coppers[stateIndex] = this.getNeighborStates(x, y);
        }
      }
    }
  }

  getNeighborStates(x: number, y: number): number[] {
    const boardWidth = Board.boardWidth;

    const statePositions: number[] = [];

    for (let index = 0; index < Program.neighbors.length; index++) {
      const statePosition = Program.neighbors[index];
      const stateIndex = x + statePosition.x + (y + statePosition.y) * boardWidth;
      if (Board.copperGrid[stateIndex]) {
        statePositions.push(new StatePosition(x + statePosition.x, y + statePosition.y).stateIndex);
      }
    }
    return statePositions;
  }

  tickBoard() {
    if ((window as any).webasm) {
      instance.tick();
    } else {
      const loadBit = (offset: number) => {
        return this.mem32[offset];
      };

      const storeBit = (offset: number, value: number) => {
        this.mem32[offset] = value;
      };

      const loadCopper = (offset: number, pos: number): number => {
        return loadBit(offset * copperLen + pos + 1);
      };
      let newHeadArrayIndex = 0;
      const hLen = loadBit(headsArrayOffset);
      for (let index = 1; index <= hLen; index++) {
        const headKey = loadBit(headsArrayOffset + index);
        const hCopperLen = loadBit(headKey * copperLen);
        for (let i = 0; i < hCopperLen; i++) {
          const copperStateIndex = loadCopper(headKey, i);
          if (
            loadBit(tailsGridOffset + copperStateIndex) === 0 &&
            loadBit(headsGridOffset + copperStateIndex) === 0 &&
            loadBit(newHeadsGridOffset + copperStateIndex) === 0
          ) {
            let headNeighbors = 0;
            const hnCopperLen = loadBit(copperStateIndex * copperLen);
            for (let ind2 = 0; ind2 < hnCopperLen; ind2++) {
              const stateIndex = loadCopper(copperStateIndex, ind2);
              if (loadBit(headsGridOffset + stateIndex) === 1) {
                headNeighbors++;
                if (headNeighbors === 3) {
                  headNeighbors = 0;
                  break;
                }
              }
            }
            if (headNeighbors > 0) {
              storeBit(newHeadsGridOffset + copperStateIndex, 1);
              storeBit(newHeadsArrayOffset + newHeadArrayIndex + 1, copperStateIndex);
              newHeadArrayIndex = newHeadArrayIndex + 1;
            }
          }
        }
      }
      storeBit(newHeadsArrayOffset, newHeadArrayIndex);
    }

    this.mem32.copyWithin(tailsArrayOffset, headsArrayOffset, tailsArrayOffset);
    this.mem32.copyWithin(headsArrayOffset, newHeadsArrayOffset, newTailsArrayOffset);
    this.mem32.fill(0, newHeadsArrayOffset, newTailsArrayOffset);
  }
}

export class Board {
  static boardHeight;
  static boardWidth;
  static initialStates: WireState[];
  static coppers: number[][];
  static copperGrid: boolean[];

  /*    constructor(width: number, height: number) {
   Board.initialStates = new Array(width * height);
   Board.boardWidth = width;
   Board.boardHeight = height;
   }*/

  constructor(starting: string) {
    const rows = starting.replace(new RegExp('\r', 'g'), '').split('\n');
    Board.boardWidth = rows[0].length;
    Board.boardHeight = rows.length;
    BoardState.setupArraySwitch();

    Board.initialStates = new Array(Board.boardWidth * Board.boardHeight);

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];

      for (let characterIndex = 0; characterIndex < row.length; characterIndex++) {
        const character = row[characterIndex];
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
  headsArray: number[];
  tailsArray: number[];

  headsGrid: boolean[];
  tailsGrid: boolean[];

  private static totalItems: number;

  static setupArraySwitch() {
    this.totalItems = Board.boardWidth * Board.boardHeight;
  }

  constructor() {
    this.headsGrid = new Array(BoardState.totalItems);
    this.headsArray = [];
  }
}

import('./asm/build/optimized.wasm')
  .then(result => {
    const module = new WebAssembly.Module(result.default);
    return new WebAssembly.Instance(module, {
      env: {
        memory: new WebAssembly.Memory({initial: 121}),
        abort() {
        }
      },
      console: {
        logger(arg) {
          console.log(arg);
        }
      },
      config: {}
    });
  })
  .then(module => {
    instance = module.exports;
    new Program().start(true);
  });
