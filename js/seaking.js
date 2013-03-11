/**
 * seaking
 * author: Peter Zhang
 * date: 2013-01-23
 */
var seaking = {
	onload: function() {
		//btg.calculateScreen();
		if (!me.video.init('jsapp', 800, 480)) {
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
		// start the game
		me.state.change(me.state.PLAY);
	}
};

/**
 * 游戏场景
 */
var PlayScreen = me.ScreenObject.extend({
	onResetEvent: function() {
		// load a level
		me.levelDirector.loadLevel("isometric");

		// add Objects to map
		me.game.add(new PlayerEntity(320, 220, {}), 4);
		me.game.add(new CoinEntity(400, 220, [{x: 8, y: 14}, {x: 5, y: 15}]), 5);
		//me.game.add(new Portal(new me.Vector2d(450, 200), 60, 80), 3)

		// make sure everyhting is in the right order
		me.game.sort();
	},

	onDestroyEvent: function() {}
});