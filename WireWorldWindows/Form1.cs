using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Windows.Forms.VisualStyles;

namespace WireWorldWindows
{
    public partial class Form1 : Form
    {
        private Programa p;

        public Form1()
        {
            this.SetStyle(
         ControlStyles.UserPaint |
         ControlStyles.AllPaintingInWmPaint |
         ControlStyles.DoubleBuffer, true);

            InitializeComponent();
            this.p = new Programa();
            p.Start(picFront);
            picFront.Paint += PicFront_Paint;

            Timer t = new Timer();
            t.Interval = 16;
            t.Tick += (a, b) =>
            {
                picFront.Refresh();
            };
            t.Start();
        }

        private void PicFront_Paint(object sender, PaintEventArgs e)
        {
            label1.Text = Programa.ticker + " nanoseconds per iteration";
            this.p.drawFront(e.Graphics, Programa.boardState);
        }

    }



    class Programa
    {


        public static int magnify = 1;
        public static BoardState boardState = null;
        public static string ticker = "";
        public void Start(PictureBox picFront)
        {
            StatePosition lastPoint = null;


            var file = File.ReadAllText("shoes 37.txt");
            new Board(file);
            BoardState.EducatedHeadCount = Board.BoardWidth * Board.BoardHeight;
            BoardState.SetupArraySwitch();
            boardState = generateInitialBoardState();
            BoardState.SetupArraySwitch();

            Stopwatch sw = new Stopwatch();
            long iterations = 0;

            Task.Factory.StartNew(() =>
            {
                while (true)
                {
                    sw.Restart();
                    boardState = tickBoard(boardState);
                    sw.Stop();
                    iterations++;

                    if (iterations % 5000 == 0)
                    {
                        ticker = ((sw.ElapsedTicks / (double)(Stopwatch.Frequency / (double)1000 / 1000 / 1000)) / (double)iterations).ToString("F10");
                        Debug.WriteLine($"MS Per Run: {ticker}");
                    }
                    if (iterations % 500 == 0)
                    {
                        sw.Reset();
                    }

                }
            });
        }





        public void drawBack(Graphics context)
        {
            context.FillRectangle(new SolidBrush(Color.Black), new Rectangle(0, 0, Board.BoardWidth * magnify, Board.BoardHeight * magnify));
            for (int y = 0; y < Board.BoardHeight; y++)
            {
                for (int x = 0; x < Board.BoardWidth; x++)
                {
                    if (Board.CopperGrid[x + y * Board.BoardWidth])
                    {
                        context.FillRectangle(copper, new Rectangle(x * magnify, y * magnify, magnify, magnify));
                    }
                }
            }
        }
        private static SolidBrush copper = new SolidBrush(Color.FromArgb(16, 0, 168));
        private static SolidBrush head = new SolidBrush(Color.FromArgb(255, 245, 155));
        private static SolidBrush tail = new SolidBrush(Color.FromArgb(137, 210, 255));

        public void drawFront(Graphics context, BoardState boardState)
        {
            drawBack(context);
            var heads = boardState.HeadsArray;
            var tails = boardState.TailsArray;

            for (int index = 0, headLength = boardState.HeadsArrayLength; index < headLength; index++)
            {
                context.FillRectangle(head, new Rectangle(StatePosition.GetX(heads[index]) * magnify, StatePosition.GetY(heads[index]) * magnify, magnify, magnify));
            }
            for (int index = 0, tailLength = boardState.TailsArrayLength; index < tailLength; index++)
            {
                context.FillRectangle(tail, new Rectangle(StatePosition.GetX(tails[index]) * magnify, StatePosition.GetY(tails[index]) * magnify, magnify, magnify));
            }
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
            boardState.TailsArray = new int[boardWidth * boardHeight];

            Board.CopperGrid = new bool[boardWidth * boardHeight];
            Board.Coppers = new int[boardWidth * boardHeight][];
            BoardState.EducatedHeadCount = 0;

            for (int i = 0; i < boardWidth * boardHeight; i++)
            {
                Board.Coppers[i] = new int[0];
            }

            for (int y = 0; y < boardHeight; y++)
            {
                for (int x = 0; x < boardWidth; x++)
                {
                    var statePos = new StatePosition(x, y);
                    switch (Board.InitialStates[statePos.StateIndex])
                    {
                        case WireState.Head:
                            Board.CopperGrid[statePos.StateIndex] = true;
                            boardState.HeadsArray[boardState.HeadsArrayLength++] = (statePos.StateIndex);
                            boardState.HeadsGrid[statePos.StateIndex] = true;
                            BoardState.EducatedHeadCount++;
                            break;
                        case WireState.Tail:
                            Board.CopperGrid[statePos.StateIndex] = true;
                            boardState.TailsArray[boardState.TailsArrayLength++] = (statePos.StateIndex);
                            boardState.TailsGrid[statePos.StateIndex] = true;
                            break;
                        case WireState.Copper:
                            Board.CopperGrid[statePos.StateIndex] = true;
                            break;
                    }
                }
            }
            BoardState.EducatedHeadCount = (int)(BoardState.EducatedHeadCount * 1.5);

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

//            unchecked
            {

                var coppers = Board.Coppers;

                var collection = boardState.HeadsArray;
                for (int index = 0, colLen = boardState.HeadsArrayLength; index < colLen; index++)
                {
                    int[] positions = coppers[collection[index]];
                    for (int i = 0, posLength = positions.Length; i < posLength; i++)
                    {
                        int copperStateIndex = positions[i];
                        if (!tailsGrid[copperStateIndex] && !headsGrid[copperStateIndex] && !newHeadsGrid[copperStateIndex])
                        {
                            int[] states = coppers[copperStateIndex];
                            int headNeighbors = 0;
                            for (int ind2 = 0, statesLen = states.Length; ind2 < statesLen; ind2++)
                            {
                                if (headsGrid[states[ind2]])
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
                                newBoardState.HeadsArray[newBoardState.HeadsArrayLength++] = copperStateIndex;
                                newHeadsGrid[copperStateIndex] = true;
                            }
                        }
                    }
                }

                newBoardState.TailsArray = collection;
                newBoardState.TailsArrayLength = boardState.HeadsArrayLength;
                newBoardState.TailsGrid = headsGrid;
            }

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
        public int[] HeadsArray;
        public int HeadsArrayLength;
        public int[] TailsArray;
        public int TailsArrayLength;

        public bool[] HeadsGrid;
        public bool[] TailsGrid;

        private static int SwitchArray = 0;
        private static bool[] SwitchArray1;
        private static bool[] SwitchArray2;
        private static bool[] SwitchArray3;

        private static int[] SwitchArrayHead1;
        private static int[] SwitchArrayHead2;
        private static int[] SwitchArrayHead3;
        public static int EducatedHeadCount { get; set; }

        public static void SetupArraySwitch()
        {
            SwitchArray1 = new bool[Board.BoardWidth * Board.BoardHeight];
            SwitchArray2 = new bool[Board.BoardWidth * Board.BoardHeight];
            SwitchArray3 = new bool[Board.BoardWidth * Board.BoardHeight];
            SwitchArrayHead1 = new int[EducatedHeadCount];
            SwitchArrayHead2 = new int[EducatedHeadCount];
            SwitchArrayHead3 = new int[EducatedHeadCount];
        }
        public BoardState()
        {

            switch (SwitchArray)
            {
                case 0:
                    SwitchArray = 1;
                    HeadsGrid = SwitchArray1;
                    HeadsArray = SwitchArrayHead1;
                    break;
                case 1:
                    SwitchArray = 2;
                    HeadsGrid = SwitchArray2;
                    HeadsArray = SwitchArrayHead2;
                    break;
                case 2:
                    SwitchArray = 0;
                    HeadsGrid = SwitchArray3;
                    HeadsArray = SwitchArrayHead3;
                    break;
            }

            Array.Clear(HeadsGrid, 0, HeadsGrid.Length);
            //            Array.Clear(HeadsArray, 0, Board.BoardWidth * Board.BoardHeight);
            HeadsArrayLength = 0;
        }
    }
}
