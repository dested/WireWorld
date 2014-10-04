using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Html;
using System.Html.Media.Graphics;
using System.IO;
using System.Text;
using jQueryApi;

namespace Wireworld
{
    class Program
    {
        public Program()
        {
            jQuery.OnDocumentReady(Start);

        }

        public static int magnify = 2;
        private void Start()
        {
            BoardState boardState = null;


            var canvasBack = (CanvasElement)Document.GetElementById("canvasBack");
            var contextBack = (CanvasRenderingContext2D)canvasBack.GetContext(CanvasContextId.Render2D);

            var canvasFront = (CanvasElement)Document.GetElementById("canvasFront");
            var contextFront = (CanvasRenderingContext2D)canvasFront.GetContext(CanvasContextId.Render2D);

            StatePosition lastPoint = null;
            bool down = false;
            bool updatedCoppers = false;
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
                        points[position.StateIndex]=true;
                    }
                    if (@event.CtrlKey)
                    {
                        updatedCoppers = true;
                        redrawBack(contextBack,points);
                    }


                    lastPoint = new StatePosition(x, y);
                }
            });


            jQueryDataHttpRequest<string> starting = jQuery.GetData<string>("shoes 37.txt");

            starting.Complete((request, status) =>
            {

                Board board = new Board(request.ResponseText);

                canvasBack.Width = canvasFront.Width = Board.BoardWidth * magnify;
                canvasBack.Height = canvasFront.Height = Board.BoardHeight * magnify;

                //                ele.Html(board.ToString());
                boardState = generateInitialBoardState();
                Stopwatch sw = new Stopwatch();
                long iterations = 0;
                int ticks = 0;
                long totalms = 0;
                Window.SetInterval(() =>
                {
                    if (down) return;
                    sw.Restart();
                    for (int i = 0; i < 1; i++)
                    {
                        boardState = tickBoard(boardState);
                        iterations++;
                    }
                    sw.Stop();
                    totalms += sw.ElapsedMilliseconds;
                    ticks++;

                    if (ticks%500 == 0)
                    {
                        Console.WriteLine(string.Format("MS Per Run: {0}", (totalms / (double)ticks)));
                    }

                }, 1);

                drawBack(contextBack);
                drawFront(contextFront, boardState);
                Window.SetInterval(() =>
                {
                    drawFront(contextFront, boardState);
                }, 1000 / 60);


            });

        }
        public static IEnumerable<StatePosition> GetPointsOnLine(int x0, int y0, int x1, int y1)
        {
            bool steep = Math.Abs(y1 - y0) > Math.Abs(x1 - x0);
            if (steep)
            {
                int t;
                t = x0; // swap x0 and y0
                x0 = y0;
                y0 = t;
                t = x1; // swap x1 and y1
                x1 = y1;
                y1 = t;
            }
            if (x0 > x1)
            {
                int t;
                t = x0; // swap x0 and x1
                x0 = x1;
                x1 = t;
                t = y0; // swap y0 and y1
                y0 = y1;
                y1 = t;
            }
            int dx = x1 - x0;
            int dy = Math.Abs(y1 - y0);
            int error = dx / 2;
            int ystep = (y0 < y1) ? 1 : -1;
            int y = y0;
            for (int x = x0; x <= x1; x++)
            {
                yield return new StatePosition((steep ? y : x), (steep ? x : y));
                error = error - dy;
                if (error < 0)
                {
                    y += ystep;
                    error += dx;
                }
            }
            yield break;
        }
        private static void updateSpot(StatePosition statePosition, bool rightClick, bool control, BoardState boardState)
        {

            if (control)
            {
                if (!rightClick)
                {
                    Board.Coppers = new int[Board.BoardWidth * Board.BoardHeight][];
                    Board.CopperGrid[statePosition.StateIndex] = true;
                }
                else
                {
                    Board.Coppers = new int[Board.BoardWidth * Board.BoardHeight][];
                    Board.CopperGrid[statePosition.StateIndex] = false;
                    boardState.HeadsGrid[statePosition.StateIndex] = false;
                    boardState.TailsGrid[statePosition.StateIndex] = false;
                    boardState.HeadsArray.Remove(statePosition.StateIndex);
                }
            }
            else
            {


                if (Board.CopperGrid[statePosition.StateIndex])
                {
                    if (!rightClick)
                    {
                        boardState.HeadsArray.Add(statePosition.StateIndex);
                        boardState.HeadsGrid[statePosition.StateIndex] = true;
                    }
                    else
                    {


                        for (int index = boardState.HeadsArray.Count - 1; index >= 0; index--)
                        {
                            var position = boardState.HeadsArray[index];
                            if (position == statePosition.StateIndex)
                            {
                                boardState.HeadsArray.Remove(position);
                                boardState.HeadsGrid[position] = false;
                                break;
                            }
                        }
                        for (int index = boardState.TailsArray.Count - 1; index >= 0; index--)
                        {
                            var position = boardState.TailsArray[index];
                            if (position == statePosition.StateIndex)
                            {
                                boardState.TailsArray.Remove(position);
                                boardState.TailsGrid[position] = false;
                                break;
                            }
                        }


                    }
                }
            }
        }

        private void drawBack(CanvasRenderingContext2D context)
        {
            context.FillStyle = "#000000";
            context.FillRect(0, 0, Board.BoardWidth * magnify, Board.BoardHeight * magnify);

            for (int y = 0; y < Board.BoardHeight; y++)
            {
                for (int x = 0; x < Board.BoardWidth; x++)
                {
                    if (Board.CopperGrid[x + y * Board.BoardWidth])
                    {
                        context.FillStyle = "#1000A8";
                        context.FillRect(x * magnify, y * magnify, magnify, magnify);
                    }
                }
            }




        }
        private void redrawBack(CanvasRenderingContext2D context,JsDictionary<int,bool> updates )
        {
            for (int y = 0; y < Board.BoardHeight; y++)
            {
                for (int x = 0; x < Board.BoardWidth; x++)
                {
                    var stateIndex = x + y*Board.BoardWidth;
                    if (updates[stateIndex])
                    {
                        if (Board.CopperGrid[stateIndex])
                        {
                            context.FillStyle = "#1000A8";
                            context.FillRect(x*magnify, y*magnify, magnify, magnify);
                        }
                        else
                        {
                            context.FillStyle = "#000000";
                            context.FillRect(x*magnify, y*magnify, magnify, magnify);
                        }
                    }
                }
            }

        }
        private void drawFront(CanvasRenderingContext2D context, BoardState boardState)
        {
            context.ClearRect(0, 0, Board.BoardWidth * magnify, Board.BoardHeight * magnify);


            var heads = boardState.HeadsArray;
            var tails = boardState.TailsArray;
            context.Save();
            context.FillStyle = "#FFF59B";
            for (int index = 0, headLength = heads.Count; index < headLength; index++)
            {

                context.FillRect(StatePosition.GetX(heads[index]) * magnify, StatePosition.GetY(heads[index]) * magnify, magnify, magnify);
            }
            context.FillStyle = "#89D2FF";
            for (int index = 0, tailLength = tails.Count; index < tailLength; index++)
            {
                context.FillRect(StatePosition.GetX(tails[index]) * magnify, StatePosition.GetY(tails[index]) * magnify, magnify, magnify);
            }
            context.Restore();
        }

        static void Main()
        {
            new Program();

        }
        private static readonly StatePosition[] neighbors =
        {
            new StatePosition(-1, -1),
            new StatePosition(-1, 0),
            new StatePosition(-1, 1),
            new StatePosition(0, -1),
            new StatePosition(0, 1),
            new StatePosition(1, -1),
            new StatePosition(1, 0),
            new StatePosition(1, 1)
        };

        private static BoardState generateInitialBoardState()
        {
            var boardState = new BoardState();
            int boardWidth = Board.BoardWidth;
            int boardHeight = Board.BoardHeight;
            boardState.TailsGrid = new bool[boardWidth * boardHeight];
            boardState.TailsArray = new List<int>();

            Board.CopperGrid = new bool[boardWidth * boardHeight];
            Board.Coppers = new int[boardWidth * boardHeight][];

            for (int y = 0; y < boardHeight; y++)
            {
                for (int x = 0; x < boardWidth; x++)
                {
                    var statePos = new StatePosition(x, y);
                    switch (Board.InitialStates[statePos.StateIndex])
                    {
                        case WireState.Head:
                            Board.CopperGrid[statePos.StateIndex] = true;
                            boardState.HeadsArray.Add(statePos.StateIndex);
                            boardState.HeadsGrid[statePos.StateIndex] = true;
                            break;
                        case WireState.Tail:
                            Board.CopperGrid[statePos.StateIndex] = true;
                            boardState.TailsArray.Add(statePos.StateIndex);
                            boardState.TailsGrid[statePos.StateIndex] = true;
                            break;
                        case WireState.Copper:
                            Board.CopperGrid[statePos.StateIndex] = true;
                            break;
                    }
                }
            }


            buildCoppers();
            return boardState;
        }

        private static void buildCoppers()
        {
            int boardHeight = Board.BoardHeight;
            int boardWidth = Board.BoardWidth;
            for (int y = 0; y < boardHeight; y++)
            {
                for (int x = 0; x < boardWidth; x++)
                {
                    int stateIndex = x + y * boardWidth;
                    if (Board.CopperGrid[stateIndex])
                    {
                        Board.Coppers[stateIndex] = getNeighborStates(x, y);
                    }
                }
            }
        }

        private static int[] getNeighborStates(int x, int y)
        {
            int boardWidth = Board.BoardWidth;

            var statePositions = new List<int>();

            for (int index = 0; index < neighbors.Length; index++)
            {
                StatePosition statePosition = neighbors[index];
                int stateIndex = (x + statePosition.X) + (y + statePosition.Y) * boardWidth;
                if (Board.CopperGrid[stateIndex])
                {
                    statePositions.Add(new StatePosition(x + statePosition.X, y + statePosition.Y).StateIndex);
                }
            }
            return statePositions.ToArray();
        }

        private static BoardState tickBoard(BoardState boardState)
        {
            var newBoardState = new BoardState();


            var headsGrid = boardState.HeadsGrid;
            var tailsGrid = boardState.TailsGrid;
            var newHeadsGrid = newBoardState.HeadsGrid;


            var coppers = Board.Coppers;

            var collection = boardState.HeadsArray;
            for (int index = 0, colLen = collection.Count; index < colLen; index++)
            {
                int key = collection[index];
                int[] positions = coppers[key];

                for (int i = 0, posLength = positions.Length; i < posLength; i++)
                {
                    int copperStateIndex = positions[i];
                    if (!tailsGrid[copperStateIndex] && !headsGrid[copperStateIndex] && !newHeadsGrid[copperStateIndex])
                    {
                        int[] states = coppers[copperStateIndex];
                        int headNeighbors = 0;
                        for (int ind2 = 0, statesLen = states.Length; ind2 < statesLen; ind2++)
                        {
                            int stateIndex = states[ind2];
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

                            newBoardState.HeadsArray.Add(copperStateIndex);
                            newHeadsGrid[copperStateIndex] = true;
                        }

                    }
                }
            }

            newBoardState.TailsArray = collection;
            newBoardState.TailsGrid = headsGrid;

            return newBoardState;
        }

    }
    public class Board
    {
        public static WireState[] InitialStates;
        public static int BoardWidth;
        public static int BoardHeight;
        public static int[][] Coppers;
        public static bool[] CopperGrid;

        public Board(int width, int height)
        {
            InitialStates = new WireState[width * height];
            BoardWidth = width;
            BoardHeight = height;
        }

        public Board(string starting)
        {
            string[] rows = starting.Replace("\r", "").Split('\n');
            BoardWidth = rows[0].Length;
            BoardHeight = rows.Length;
            BoardState.SetupArraySwitch();

            StatePosition.BoardWidth = BoardWidth;

            InitialStates = new WireState[BoardWidth * BoardHeight];
            for (int rowIndex = 0; rowIndex < rows.Length; rowIndex++)
            {
                string row = rows[rowIndex];

                for (int characterIndex = 0; characterIndex < row.Length; characterIndex++)
                {
                    char character = row[characterIndex];

                    InitialStates[characterIndex + rowIndex * BoardWidth] = charToState(character);
                }
            }
        }

        public Board()
        {
        }

        public static string ToString(BoardState state)
        {
            var sb = new StringBuilder();
            for (int y = 0; y < BoardHeight; y++)
            {
                for (int x = 0; x < BoardWidth; x++)
                {
                    int statePos = x + y * BoardWidth;
                    bool isCopper = CopperGrid[statePos];

                    if (isCopper)
                    {
                        if (state.HeadsGrid[statePos])
                        {
                            sb.Append(stateToChar(WireState.Head));
                        }
                        else if (state.TailsGrid[statePos])
                        {
                            sb.Append(stateToChar(WireState.Tail));
                        }
                        else
                        {
                            sb.Append(stateToChar(WireState.Copper));
                        }
                    }
                    else
                    {
                        sb.Append(" ");
                    }
                }
                sb.AppendLine();
            }
            return sb.ToString();
            return "";
        }

        private static WireState charToState(char character)
        {
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

        private static char stateToChar(WireState state)
        {
            switch (state)
            {
                case WireState.Head:
                    return '@';
                case WireState.Tail:
                    return '~';
                case WireState.Copper:
                    return '#';
                default:
                    return ' ';
            }
        }
    }

    public enum WireState
    {
        Empty = 0,
        Head = 1,
        Tail = 2,
        Copper = 3
    }

    public class StatePosition
    {
        public StatePosition(int x, int y)
        {
            X = x;
            Y = y;
            StateIndex = X + Y * BoardWidth;
        }

        public static int GetY(int z)
        {
            return z / BoardWidth;
        }
        public static int GetX(int z)
        {
            return z % BoardWidth;
        }

        public int StateIndex;

        public static int BoardWidth;
        public int X;
        public int Y;
    }

    public class BoardState
    {
        public List<int> HeadsArray;
        public List<int> TailsArray;

        public bool[] HeadsGrid;
        public bool[] TailsGrid;

        private static int SwitchArray = 0;
        private static bool[] SwitchArray1;
        private static bool[] SwitchArray2;
        private static bool[] SwitchArray3;
        public static int EducatedHeadsArraySize = 0;

        public static void SetupArraySwitch()
        {
            SwitchArray1 = new bool[Board.BoardWidth * Board.BoardHeight];
            SwitchArray2 = new bool[Board.BoardWidth * Board.BoardHeight];
            SwitchArray3 = new bool[Board.BoardWidth * Board.BoardHeight];
        }
        public BoardState()
        {

            switch (SwitchArray)
            {
                case 0:
                    SwitchArray = 1;
                    HeadsGrid = SwitchArray1;
                    break;
                case 1:
                    SwitchArray = 2;
                    HeadsGrid = SwitchArray2;
                    break;
                case 2:
                    SwitchArray = 0;
                    HeadsGrid = SwitchArray3;
                    break;
            }

            var l = HeadsGrid.Length;
            ((dynamic)HeadsGrid).length = 0;
            ((dynamic)HeadsGrid).length = l;
            HeadsArray = new List<int>(EducatedHeadsArraySize);
        }
    }

}
