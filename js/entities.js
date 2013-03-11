/*************************/
/*						 */
/*		a player entity	 */
/*						 */
/*************************/
var PlayerEntity = me.ObjectEntity.extend({
	init: function(x, y, settings) {
		settings.image = "gripe_run_right";
		settings.spritewidth = 64;
		// call the constructor
		this.parent(x, y, settings);

		// set the default horizontal & vertical speed (accel vector)
		this.setVelocity(1, 1);

		// player's path.
		this.path = [];
		// register the mousedown event on map
		me.input.registerMouseEvent("mousedown", new me.Rect(new me.Vector2d(0, 0), me.game.collisionMap.realwidth, me.game.collisionMap.realheight), this.mouseDown.bind(this));

		// adjust the bounding box
		this.updateColRect(8, 48, -1, 0);

		// set the display to follow our position on both axis
		me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

		this._initGraph();

		this.__defineGetter__("curX", function() {
			return this.pos.x + 32;
		});
		this.__defineGetter__("curY", function() {
			return this.pos.y + 64;
		});

		this.tileLayer = me.game.currentLevel.getLayerByName("Tile Layer 1");
		this.layerRenderer = this.tileLayer.renderer;
	},

	/**
	 * 初始化寻路矩阵
	 */
	_initGraph: function() {
		var layerData = me.game.collisionMap.layerData,
			rowCount = layerData.length,
			colCount = layerData[0].length;
		var matrix = [];

		for (var row = 0; row < rowCount; row++) {
			matrix[row] = [];
			for (var col = 0; col < colCount; col++) {
				matrix[row][col] = layerData[row][col] ? 1 : 0;
				layerData[row][col] = null;
			}
		}

		// this.graph = new PF.Grid(colCount, rowCount, matrix);
		// this.pathFinder = new PF.AStarFinder({
		// 	allowDiagonal: true,
		// 	dontCrossCorners: false
		// });
		this.graph = new Graph(matrix);
	},
	/**
	 * 寻路
	 */
	_findPath: function(dest) {
		var start = this._getTileCoords(this.curX, this.curY);
		var end = this._getTileCoords(dest.x, dest.y);

		if (end.x < 0 || end.y < 0) {
			return;
		}

		// var graphBackup = this.graph.clone(),
		// that = this;
		// var path = this.pathFinder.findPath(start.x, start.y, end.x, end.y, graphBackup);
		// if (path.length) {
		// 	graphBackup = this.graph.clone();
		// 	path = PF.Util.smoothenPath(graphBackup, path);
		// }
		console.log(this.graph);
		var path = astar.search(this.graph.nodes, this.graph.nodes[start.x][start.y], this.graph.nodes[end.x][end.y], true);

		if (!path.length && end.x == start.x && end.y == start.y) {
			path = [{
				pos: {
					x: end.x,
					y: end.y
				}
			}];
		}

		var len = path.length,
			that = this;
		this.path = path.map(function(gn, index) {
			var node = {
				x: gn.pos.x,
				y: gn.pos.y
			}
			if (index == len - 1) {
				node.pos = new me.Vector2d(dest.x, dest.y);
			} else {
				node.pos = that._getPosition(node.x, node.y);
				node.pos.add({
					x: 32,
					y: 32
				});
			}
			return node;
		});
	},
	/**
	 * 转换为画布像素坐标
	 */
	_getPosition: function(x, y) {
		return this.layerRenderer.tileToPixelCoords(x, y).floorSelf();
	},
	/**
	 * 转换为砖块坐标
	 */
	_getTileCoords: function(x, y) {
		return this.layerRenderer.pixelToTileCoords(x, y).floorSelf();
	},
	/**
	 * 获取路径上的下一个结点
	 */
	_getNextNode: function() {
		if (!this.path.length) {
			return null;
		}

		var node = this.path[0];
		if (this.curX == node.pos.x && this.curY == node.pos.y) {
			this.path.shift();
			node = this.path[0];
		}

		return node;
	},

	/**
	 * 鼠标事件响应函数
	 */
	mouseDown: function(ev) {
		var x, y;
		// Get the mouse position relative to the canvas element.
		if (ev.layerX || ev.layerX == 0) { // Firefox
			x = ev.layerX;
			y = ev.layerY;
		} else if (ev.offsetX || ev.offsetX == 0) { // Opera
			x = ev.offsetX;
			y = ev.offsetY;
		}

		// 启动寻路
		this._findPath({
			x: x + me.game.viewport.pos.x,
			y: y + me.game.viewport.pos.y
		})
	},

	/* -----

		update the player pos
		
	  ------			*/
	update: function() {
		var node = this._getNextNode();

		if (node) {
			if (this.curX > node.pos.x) {
				this.flipX(true);
				this.vel.x -= this.accel.x * me.timer.tick;
			} else if (this.curX < node.pos.x) {
				this.flipX(false);
				this.vel.x += this.accel.x * me.timer.tick;
			} else {
				this.vel.x = 0;
			}

			if (this.curY > node.pos.y) {
				this.vel.y -= this.accel.y * me.timer.tick;
			} else if (this.curY < node.pos.y) {
				this.vel.y += this.accel.y * me.timer.tick;
			} else {
				this.vel.y = 0;
			}
		} else {
			this.vel.x = 0;
			this.vel.y = 0;
		}

		// check & update player movement
		this.updateMovement();

		// update animation
		if (this.vel.x != 0 || this.vel.y != 0 || this.path.length) {
			// update object animation
			this.parent();
			return true;
		}

		// else inform the engine we did not perform
		// any update (e.g. position, animation)
		return false;
	}
});

/**
 * 可以移动物体
 */
var MoveableEntity = me.AnimationSheet.extend({
	init: function(x, y, image, spritewidth, spriteheight) {
		if (util.isString(image)) {
			image = me.loader.getImage(image);
		}

		this.parent(x, y, image, spritewidth, spriteheight);

		me.input.registerMouseEvent('mousedown', this, this.mouseDown.bind(this));
		me.input.registerMouseEvent('mouseup', this, this.mouseUp.bind(this));
		me.input.registerMouseEvent('mousemove', null, this.mouseMove.bind(this));
	},
	mouseUp: function(e) {
		this.mDown = false;
		// force out on touchend
		if (me.sys.touch) this.mouseout();
	},
	mouseDown: function(e) {
		this.mDown = true;
		if (me.sys.touch) {
			mX = me.input.mouse.pos.x;
			mY = me.input.mouse.pos.y;
		}
		this.v = new me.Vector2d(mX - this.left, mY - this.top);
		// stop propagating event
		return false;
	},
	mouseMove: function(e) {
		mX = me.input.mouse.pos.x;
		mY = me.input.mouse.pos.y;

		if (this.mDown) {
			this.pos.x = mX - this.v.x;
			this.pos.y = mY - this.v.y;
			return false;
		}
		return true;
	}
});

/**
 * 金币
 */
var CoinEntity = MoveableEntity.extend({
	init: function(x, y, dests) {
		this.parent(x, y, "coin", 32, 32);

		this.tileLayer = me.game.currentLevel.getLayerByName("Tile Layer 1");
		this.layerRenderer = this.tileLayer.renderer;
		this.dests = dests.map(function(dest) {
			dest.tileId = this.tileLayer.layerData[dest.x][dest.y].tileId;
			dest.pos = this._getPosition(dest.x, dest.y);
			dest.rect = new me.Rect(new me.Vector2d(dest.pos.x - 32, dest.pos.y), 64, 32);
			return dest;
		}, this);

		this.sourcePos = {
			x: x,
			y: y
		};

		this.addAnimation("static", [0]);
		this.addAnimation("active", [0, 1, 2, 3, 4, 5, 6, 7]);
		this.setCurrentAnimation("active");
	},
	mouseUp: function() {
		this.setCurrentAnimation("active");
		this.restoreDests();
		this.adjust();
		return this.parent.apply(this, arguments);
	},
	mouseDown: function() {
		this.setCurrentAnimation("static");
		this.highlightDests();
		return this.parent.apply(this, arguments);
	},
	highlightDests: function() {
		this.dests.forEach(function(dest) {
			this.tileLayer.setTile(dest.x, dest.y, 23);
		}, this);
	},
	restoreDests: function() {
		this.dests.forEach(function(dest) {
			this.tileLayer.setTile(dest.x, dest.y, dest.tileId);
		}, this);
	},
	adjust: function() {
		var curCoords = this._getTileCoords(this.pos.x, this.pos.y);
		var dest;
		this.dests.forEach(function(d) {
			var res = this.collisionBox.collideVsAABB(d.rect);
			if(res.x != 0 || res.y != 0) {
				dest = d;
				return false;
			}
		}, this);

		if(dest) {
			this.pos.x = this.sourcePos.x = dest.pos.x - 16;
			this.pos.y = this.sourcePos.y = dest.pos.y - 16;
		} else {
			this.moveBack();
		}
	},
	moveBack: function() {
		var tween = new me.Tween(this.pos).to(this.sourcePos, 1000);
		tween.easing(me.Tween.Easing.Quadratic.EaseInOut);
		tween.start();
	},
	/**
	 * 转换为画布像素坐标
	 */
	_getPosition: function(x, y) {
		return this.layerRenderer.tileToPixelCoords(x, y).floorSelf();
	},
	/**
	 * 转换为砖块坐标
	 */
	_getTileCoords: function(x, y) {
		return this.layerRenderer.pixelToTileCoords(x, y).floorSelf();
	},
})