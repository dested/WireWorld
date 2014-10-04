(function() {
	'use strict';
	var $asm = {};
	global.Wireworld = global.Wireworld || {};
	ss.initAssembly($asm, 'WireWorldWeb');
	////////////////////////////////////////////////////////////////////////////////
	// Wireworld.Program
	var $Wireworld_$Program = function() {
		$(ss.mkdel(this, this.$start));
	};
	$Wireworld_$Program.__typeName = 'Wireworld.$Program';
	$Wireworld_$Program.$getPointsOnLine = function(x0, y0, x1, y1) {
		return new ss.IteratorBlockEnumerable(function() {
			return (function(x0, y0, x1, y1) {
				var $result, $state = 0, steep, t, t1, dx, dy, error, ystep, y, x;
				return new ss.IteratorBlockEnumerator(function() {
					$sm1:
					for (;;) {
						switch ($state) {
							case 0: {
								$state = -1;
								steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
								if (steep) {
									t = x0;
									// swap x0 and y0
									x0 = y0;
									y0 = t;
									t = x1;
									// swap x1 and y1
									x1 = y1;
									y1 = t;
								}
								if (x0 > x1) {
									t1 = x0;
									// swap x0 and x1
									x0 = x1;
									x1 = t1;
									t1 = y0;
									// swap y0 and y1
									y0 = y1;
									y1 = t1;
								}
								dx = x1 - x0;
								dy = Math.abs(y1 - y0);
								error = ss.Int32.div(dx, 2);
								ystep = ((y0 < y1) ? 1 : -1);
								y = y0;
								x = x0;
								$state = 1;
								continue $sm1;
							}
							case 1: {
								$state = -1;
								if (!(x <= x1)) {
									$state = 3;
									continue $sm1;
								}
								$result = new $Wireworld_StatePosition((steep ? y : x), (steep ? x : y));
								$state = 4;
								return true;
							}
							case 4: {
								$state = -1;
								error = error - dy;
								if (error < 0) {
									y += ystep;
									error += dx;
								}
								$state = 2;
								continue $sm1;
							}
							case 2: {
								$state = -1;
								x++;
								$state = 1;
								continue $sm1;
							}
							case 3: {
								$state = -1;
								break $sm1;
							}
							default: {
								break $sm1;
							}
						}
					}
					return false;
				}, function() {
					return $result;
				}, null, this);
			}).call(this, x0, y0, x1, y1);
		}, this);
	};
	$Wireworld_$Program.$updateSpot = function(statePosition, rightClick, control, boardState) {
		if (control) {
			if (!rightClick) {
				$Wireworld_Board.coppers = new Array($Wireworld_Board.boardWidth * $Wireworld_Board.boardHeight);
				$Wireworld_Board.copperGrid[statePosition.stateIndex] = true;
			}
			else {
				$Wireworld_Board.coppers = new Array($Wireworld_Board.boardWidth * $Wireworld_Board.boardHeight);
				$Wireworld_Board.copperGrid[statePosition.stateIndex] = false;
				boardState.headsGrid[statePosition.stateIndex] = false;
				boardState.tailsGrid[statePosition.stateIndex] = false;
				ss.remove(boardState.headsArray, statePosition.stateIndex);
			}
		}
		else if ($Wireworld_Board.copperGrid[statePosition.stateIndex]) {
			if (!rightClick) {
				ss.add(boardState.headsArray, statePosition.stateIndex);
				boardState.headsGrid[statePosition.stateIndex] = true;
			}
			else {
				for (var index = boardState.headsArray.length - 1; index >= 0; index--) {
					var position = boardState.headsArray[index];
					if (position === statePosition.stateIndex) {
						ss.remove(boardState.headsArray, position);
						boardState.headsGrid[position] = false;
						break;
					}
				}
				for (var index1 = boardState.tailsArray.length - 1; index1 >= 0; index1--) {
					var position1 = boardState.tailsArray[index1];
					if (position1 === statePosition.stateIndex) {
						ss.remove(boardState.tailsArray, position1);
						boardState.tailsGrid[position1] = false;
						break;
					}
				}
			}
		}
	};
	$Wireworld_$Program.$main = function() {
		new $Wireworld_$Program();
	};
	$Wireworld_$Program.$generateInitialBoardState = function() {
		var boardState = new $Wireworld_BoardState();
		var boardWidth = $Wireworld_Board.boardWidth;
		var boardHeight = $Wireworld_Board.boardHeight;
		boardState.tailsGrid = new Array(boardWidth * boardHeight);
		boardState.tailsArray = [];
		$Wireworld_Board.copperGrid = new Array(boardWidth * boardHeight);
		$Wireworld_Board.coppers = new Array(boardWidth * boardHeight);
		for (var y = 0; y < boardHeight; y++) {
			for (var x = 0; x < boardWidth; x++) {
				var statePos = new $Wireworld_StatePosition(x, y);
				switch ($Wireworld_Board.initialStates[statePos.stateIndex]) {
					case 1: {
						$Wireworld_Board.copperGrid[statePos.stateIndex] = true;
						ss.add(boardState.headsArray, statePos.stateIndex);
						boardState.headsGrid[statePos.stateIndex] = true;
						break;
					}
					case 2: {
						$Wireworld_Board.copperGrid[statePos.stateIndex] = true;
						ss.add(boardState.tailsArray, statePos.stateIndex);
						boardState.tailsGrid[statePos.stateIndex] = true;
						break;
					}
					case 3: {
						$Wireworld_Board.copperGrid[statePos.stateIndex] = true;
						break;
					}
				}
			}
		}
		$Wireworld_$Program.$buildCoppers();
		return boardState;
	};
	$Wireworld_$Program.$buildCoppers = function() {
		var boardHeight = $Wireworld_Board.boardHeight;
		var boardWidth = $Wireworld_Board.boardWidth;
		for (var y = 0; y < boardHeight; y++) {
			for (var x = 0; x < boardWidth; x++) {
				var stateIndex = x + y * boardWidth;
				if ($Wireworld_Board.copperGrid[stateIndex]) {
					$Wireworld_Board.coppers[stateIndex] = $Wireworld_$Program.$getNeighborStates(x, y);
				}
			}
		}
	};
	$Wireworld_$Program.$getNeighborStates = function(x, y) {
		var boardWidth = $Wireworld_Board.boardWidth;
		var statePositions = [];
		for (var index = 0; index < $Wireworld_$Program.$neighbors.length; index++) {
			var statePosition = $Wireworld_$Program.$neighbors[index];
			var stateIndex = x + statePosition.x + (y + statePosition.y) * boardWidth;
			if ($Wireworld_Board.copperGrid[stateIndex]) {
				ss.add(statePositions, (new $Wireworld_StatePosition(x + statePosition.x, y + statePosition.y)).stateIndex);
			}
		}
		return Array.prototype.slice.call(statePositions);
	};
	$Wireworld_$Program.$tickBoard = function(boardState) {
		var newBoardState = new $Wireworld_BoardState();
		var headsGrid = boardState.headsGrid;
		var tailsGrid = boardState.tailsGrid;
		var newHeadsGrid = newBoardState.headsGrid;
		var coppers = $Wireworld_Board.coppers;
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
							if (headNeighbors === 3) {
								headNeighbors = 0;
								break;
							}
						}
					}
					if (headNeighbors > 0) {
						ss.add(newBoardState.headsArray, copperStateIndex);
						newHeadsGrid[copperStateIndex] = true;
					}
				}
			}
		}
		newBoardState.tailsArray = collection;
		newBoardState.tailsGrid = headsGrid;
		return newBoardState;
	};
	////////////////////////////////////////////////////////////////////////////////
	// Wireworld.Board
	var $Wireworld_Board = function() {
	};
	$Wireworld_Board.__typeName = 'Wireworld.Board';
	$Wireworld_Board.$ctor2 = function(width, height) {
		$Wireworld_Board.initialStates = new Array(width * height);
		$Wireworld_Board.boardWidth = width;
		$Wireworld_Board.boardHeight = height;
	};
	$Wireworld_Board.$ctor1 = function(starting) {
		var rows = ss.replaceAllString(starting, '\r', '').split(String.fromCharCode(10));
		$Wireworld_Board.boardWidth = rows[0].length;
		$Wireworld_Board.boardHeight = rows.length;
		$Wireworld_BoardState.setupArraySwitch();
		$Wireworld_StatePosition.boardWidth = $Wireworld_Board.boardWidth;
		$Wireworld_Board.initialStates = new Array($Wireworld_Board.boardWidth * $Wireworld_Board.boardHeight);
		for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
			var row = rows[rowIndex];
			for (var characterIndex = 0; characterIndex < row.length; characterIndex++) {
				var character = row.charCodeAt(characterIndex);
				$Wireworld_Board.initialStates[characterIndex + rowIndex * $Wireworld_Board.boardWidth] = $Wireworld_Board.$charToState(character);
			}
		}
	};
	$Wireworld_Board.toString = function(state) {
		var sb = new ss.StringBuilder();
		for (var y = 0; y < $Wireworld_Board.boardHeight; y++) {
			for (var x = 0; x < $Wireworld_Board.boardWidth; x++) {
				var statePos = x + y * $Wireworld_Board.boardWidth;
				var isCopper = $Wireworld_Board.copperGrid[statePos];
				if (isCopper) {
					if (state.headsGrid[statePos]) {
						sb.appendChar($Wireworld_Board.$stateToChar(1));
					}
					else if (state.tailsGrid[statePos]) {
						sb.appendChar($Wireworld_Board.$stateToChar(2));
					}
					else {
						sb.appendChar($Wireworld_Board.$stateToChar(3));
					}
				}
				else {
					sb.append(' ');
				}
			}
			sb.appendLine();
		}
		return sb.toString();
		return '';
	};
	$Wireworld_Board.$charToState = function(character) {
		switch (character) {
			case 35: {
				return 3;
			}
			case 64: {
				return 1;
			}
			case 126: {
				return 2;
			}
			default: {
				return 0;
			}
		}
	};
	$Wireworld_Board.$stateToChar = function(state) {
		switch (state) {
			case 1: {
				return 64;
			}
			case 2: {
				return 126;
			}
			case 3: {
				return 35;
			}
			default: {
				return 32;
			}
		}
	};
	global.Wireworld.Board = $Wireworld_Board;
	////////////////////////////////////////////////////////////////////////////////
	// Wireworld.BoardState
	var $Wireworld_BoardState = function() {
		this.headsArray = null;
		this.tailsArray = null;
		this.headsGrid = null;
		this.tailsGrid = null;
		switch ($Wireworld_BoardState.$switchArray) {
			case 0: {
				$Wireworld_BoardState.$switchArray = 1;
				this.headsGrid = $Wireworld_BoardState.$switchArray1;
				break;
			}
			case 1: {
				$Wireworld_BoardState.$switchArray = 2;
				this.headsGrid = $Wireworld_BoardState.$switchArray2;
				break;
			}
			case 2: {
				$Wireworld_BoardState.$switchArray = 0;
				this.headsGrid = $Wireworld_BoardState.$switchArray3;
				break;
			}
		}
		var l = this.headsGrid.length;
		this.headsGrid.length = 0;
		this.headsGrid.length = l;
		this.headsArray = [];
	};
	$Wireworld_BoardState.__typeName = 'Wireworld.BoardState';
	$Wireworld_BoardState.setupArraySwitch = function() {
		$Wireworld_BoardState.$switchArray1 = new Array($Wireworld_Board.boardWidth * $Wireworld_Board.boardHeight);
		$Wireworld_BoardState.$switchArray2 = new Array($Wireworld_Board.boardWidth * $Wireworld_Board.boardHeight);
		$Wireworld_BoardState.$switchArray3 = new Array($Wireworld_Board.boardWidth * $Wireworld_Board.boardHeight);
	};
	global.Wireworld.BoardState = $Wireworld_BoardState;
	////////////////////////////////////////////////////////////////////////////////
	// Wireworld.StatePosition
	var $Wireworld_StatePosition = function(x, y) {
		this.stateIndex = 0;
		this.x = 0;
		this.y = 0;
		this.x = x;
		this.y = y;
		this.stateIndex = this.x + this.y * $Wireworld_StatePosition.boardWidth;
	};
	$Wireworld_StatePosition.__typeName = 'Wireworld.StatePosition';
	$Wireworld_StatePosition.getY = function(z) {
		return ss.Int32.div(z, $Wireworld_StatePosition.boardWidth);
	};
	$Wireworld_StatePosition.getX = function(z) {
		return z % $Wireworld_StatePosition.boardWidth;
	};
	global.Wireworld.StatePosition = $Wireworld_StatePosition;
	////////////////////////////////////////////////////////////////////////////////
	// Wireworld.WireState
	var $Wireworld_WireState = function() {
	};
	$Wireworld_WireState.__typeName = 'Wireworld.WireState';
	global.Wireworld.WireState = $Wireworld_WireState;
	ss.initClass($Wireworld_$Program, $asm, {
		$start: function() {
			var boardState = null;
			var $t1 = document.getElementById('canvasBack');
			var canvasBack = ss.cast($t1, ss.isValue($t1) && (ss.isInstanceOfType($t1, Element) && $t1.tagName === 'CANVAS'));
			var contextBack = ss.cast(canvasBack.getContext('2d'), CanvasRenderingContext2D);
			var $t2 = document.getElementById('canvasFront');
			var canvasFront = ss.cast($t2, ss.isValue($t2) && (ss.isInstanceOfType($t2, Element) && $t2.tagName === 'CANVAS'));
			var contextFront = ss.cast(canvasFront.getContext('2d'), CanvasRenderingContext2D);
			var lastPoint = null;
			var down = false;
			var updatedCoppers = false;
			$(canvasFront).mousedown(function(a) {
				lastPoint = new $Wireworld_StatePosition(ss.Int32.div(a.offsetX, $Wireworld_$Program.$magnify), ss.Int32.div(a.offsetY, $Wireworld_$Program.$magnify));
				down = true;
				a.preventDefault();
			});
			$(canvasFront).mouseup(function(a1) {
				lastPoint = null;
				down = false;
				if (updatedCoppers) {
					$Wireworld_$Program.$buildCoppers();
					updatedCoppers = false;
				}
				a1.preventDefault();
			});
			$(canvasFront).on('contextmenu', function(a2) {
				a2.preventDefault();
			});
			$(canvasFront).mousemove(ss.mkdel(this, function(event) {
				event.preventDefault();
				if (ss.isValue(boardState) && down) {
					var x = ss.Int32.div(event.offsetX, $Wireworld_$Program.$magnify);
					var y = ss.Int32.div(event.offsetY, $Wireworld_$Program.$magnify);
					var points = {};
					var $t3 = ss.getEnumerator($Wireworld_$Program.$getPointsOnLine(lastPoint.x, lastPoint.y, x, y));
					try {
						while ($t3.moveNext()) {
							var position = $t3.current();
							$Wireworld_$Program.$updateSpot(position, event.which === 3, event.ctrlKey, boardState);
							points[position.stateIndex] = true;
						}
					}
					finally {
						$t3.dispose();
					}
					if (event.ctrlKey) {
						updatedCoppers = true;
						this.$redrawBack(contextBack, points);
					}
					lastPoint = new $Wireworld_StatePosition(x, y);
				}
			}));
			var starting = $.get('shoes 37.txt');
			starting.complete(ss.mkdel(this, function(request, status) {
				var board = new $Wireworld_Board.$ctor1(request.responseText);
				canvasBack.width = canvasFront.width = $Wireworld_Board.boardWidth * $Wireworld_$Program.$magnify;
				canvasBack.height = canvasFront.height = $Wireworld_Board.boardHeight * $Wireworld_$Program.$magnify;
				//                ele.Html(board.ToString());
				boardState = $Wireworld_$Program.$generateInitialBoardState();
				var sw = new ss.Stopwatch();
				var iterations = 0;
				var ticks = 0;
				var totalms = 0;
				window.setInterval(function() {
					if (down) {
						return;
					}
					sw.restart();
					for (var i = 0; i < 2304; i++) {
						boardState = $Wireworld_$Program.$tickBoard(boardState);
						iterations++;
					}
					sw.stop();
					totalms += sw.milliseconds();
					ticks++;
				//	if (ticks % 500 === 0) {
						console.log(ss.formatString('MS Per Run: {0}', totalms / ticks));
					//}
				}, 1);
				this.$drawBack(contextBack);
				this.$drawFront(contextFront, boardState);
				window.setInterval(ss.mkdel(this, function() {
					this.$drawFront(contextFront, boardState);
				}), 16);
			}));
		},
		$drawBack: function(context) {
			context.fillStyle = '#000000';
			context.fillRect(0, 0, $Wireworld_Board.boardWidth * $Wireworld_$Program.$magnify, $Wireworld_Board.boardHeight * $Wireworld_$Program.$magnify);
			for (var y = 0; y < $Wireworld_Board.boardHeight; y++) {
				for (var x = 0; x < $Wireworld_Board.boardWidth; x++) {
					if ($Wireworld_Board.copperGrid[x + y * $Wireworld_Board.boardWidth]) {
						context.fillStyle = '#1000A8';
						context.fillRect(x * $Wireworld_$Program.$magnify, y * $Wireworld_$Program.$magnify, $Wireworld_$Program.$magnify, $Wireworld_$Program.$magnify);
					}
				}
			}
		},
		$redrawBack: function(context, updates) {
			for (var y = 0; y < $Wireworld_Board.boardHeight; y++) {
				for (var x = 0; x < $Wireworld_Board.boardWidth; x++) {
					var stateIndex = x + y * $Wireworld_Board.boardWidth;
					if (updates[stateIndex]) {
						if ($Wireworld_Board.copperGrid[stateIndex]) {
							context.fillStyle = '#1000A8';
							context.fillRect(x * $Wireworld_$Program.$magnify, y * $Wireworld_$Program.$magnify, $Wireworld_$Program.$magnify, $Wireworld_$Program.$magnify);
						}
						else {
							context.fillStyle = '#000000';
							context.fillRect(x * $Wireworld_$Program.$magnify, y * $Wireworld_$Program.$magnify, $Wireworld_$Program.$magnify, $Wireworld_$Program.$magnify);
						}
					}
				}
			}
		},
		$drawFront: function(context, boardState) {
			context.clearRect(0, 0, $Wireworld_Board.boardWidth * $Wireworld_$Program.$magnify, $Wireworld_Board.boardHeight * $Wireworld_$Program.$magnify);
			var heads = boardState.headsArray;
			var tails = boardState.tailsArray;
			context.save();
			context.fillStyle = '#FFF59B';
			for (var index = 0, headLength = heads.length; index < headLength; index++) {
				context.fillRect($Wireworld_StatePosition.getX(heads[index]) * $Wireworld_$Program.$magnify, $Wireworld_StatePosition.getY(heads[index]) * $Wireworld_$Program.$magnify, $Wireworld_$Program.$magnify, $Wireworld_$Program.$magnify);
			}
			context.fillStyle = '#89D2FF';
			for (var index1 = 0, tailLength = tails.length; index1 < tailLength; index1++) {
				context.fillRect($Wireworld_StatePosition.getX(tails[index1]) * $Wireworld_$Program.$magnify, $Wireworld_StatePosition.getY(tails[index1]) * $Wireworld_$Program.$magnify, $Wireworld_$Program.$magnify, $Wireworld_$Program.$magnify);
			}
			context.restore();
		}
	});
	ss.initClass($Wireworld_Board, $asm, {});
	$Wireworld_Board.$ctor2.prototype = $Wireworld_Board.$ctor1.prototype = $Wireworld_Board.prototype;
	ss.initClass($Wireworld_BoardState, $asm, {});
	ss.initClass($Wireworld_StatePosition, $asm, {});
	ss.initEnum($Wireworld_WireState, $asm, { empty: 0, head: 1, tail: 2, copper: 3 });
	$Wireworld_StatePosition.boardWidth = 0;
	$Wireworld_Board.initialStates = null;
	$Wireworld_Board.boardWidth = 0;
	$Wireworld_Board.boardHeight = 0;
	$Wireworld_Board.coppers = null;
	$Wireworld_Board.copperGrid = null;
	$Wireworld_BoardState.$switchArray = 0;
	$Wireworld_BoardState.$switchArray1 = null;
	$Wireworld_BoardState.$switchArray2 = null;
	$Wireworld_BoardState.$switchArray3 = null;
	$Wireworld_BoardState.educatedHeadsArraySize = 0;
	$Wireworld_$Program.$magnify = 2;
	$Wireworld_$Program.$neighbors = [new $Wireworld_StatePosition(-1, -1), new $Wireworld_StatePosition(-1, 0), new $Wireworld_StatePosition(-1, 1), new $Wireworld_StatePosition(0, -1), new $Wireworld_StatePosition(0, 1), new $Wireworld_StatePosition(1, -1), new $Wireworld_StatePosition(1, 0), new $Wireworld_StatePosition(1, 1)];
	$Wireworld_$Program.$main();
})();
