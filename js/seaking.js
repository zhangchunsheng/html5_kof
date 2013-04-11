/**
 * seaking
 * author: Peter Zhang
 * date: 2013-01-23
 */
var seaking = {
	onload: function() {
		//btg.calculateScreen();
		if (!me.video.init('jsapp', 1000, 640)) {
			alert("Sorry but your browser does not support html 5 canvas.");
			return;
		}

		// set gravity to zero
		me.sys.gravity = 0;
		me.debug.renderHitBox = true;

		// initialize the "audio"
		me.audio.init("mp3,ogg");

		// set all resources to be loaded
		me.loader.onload = this.loaded.bind(this);

		// set all resources to be loaded
		me.loader.preload(g_resources);

		// load everything & display a loading screen
		// me.state.change(me.state.LOADING);
	},

	loaded: function() {
		// set the "Play/Ingame" Screen Object
		me.state.set(me.state.PLAY, new PlayScreen());
		me.state.set(me.state.FIGHT, new FightScreen());
		// start the game
		me.state.change(me.state.PLAY);
	}
};

/**
 * 游戏场景
 */
var PlayScreen = me.ScreenObject.extend({
	init: function() {
		this.parent(true);
	},
	onResetEvent: function() {
		// load a level
		me.levelDirector.loadLevel("averguard_complex");

		// add Objects to map
		me.game.add(new PlayerEntity(3392, 512, {}), 4);
		//me.game.add(new CoinEntity(400, 220, [{x: 8, y: 14}, {x: 5, y: 15}]), 5);
		//me.game.add(new Portal(new me.Vector2d(450, 200), 60, 80), 3)
		me.input.bindKey(me.input.KEY.F,		"fight", true);

		// make sure everyhting is in the right order
		me.game.sort();
	},

	// update : function()
	// {
	// 	// enter pressed ?
	// 	if (me.input.isKeyPressed('fight'))
	// 	{
	// 		me.state.change(me.state.FIGHT);
	// 	}
	// 	return true;
	// },

	onDestroyEvent: function() {
		me.input.unbindKey(me.input.KEY.F);
	}
});

var FightScreen = me.ScreenObject.extend({
	init: function() {
		this.parent(true);
	},
	onResetEvent: function() {
		// load a level
		me.levelDirector.loadLevel("fight_map");

		me.input.bindKey(me.input.KEY.B,		"back", true);

		// make sure everyhting is in the right order
		me.game.sort();
	},

	update : function()
	{
		// enter pressed ?
		if (me.input.isKeyPressed('back'))
		{
			me.state.change(me.state.PLAY);
		}
		return true;
	},

	onDestroyEvent: function() {
		me.input.unbindKey(me.input.KEY.B);
	}
});