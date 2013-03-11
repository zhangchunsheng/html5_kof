/**
 * 传送门
 */
var Portal = me.Rect.extend({
	init: function(pos, width, height) {
		this.parent(pos, width, height);

		this.emitter = new ParticleEmitter({
			totalParticles: 400,
			emissionRate: 180,
			active: true,
			duration: Infinity,
			pos: {
				x: pos.x + width / 2,
				y: pos.y + height / 2
			},
			posVar: {
				x: 180,
				y: 20
			},
			angle: 90,
			angleVar: 10,
			life: 1,
			lifeVar: 1,
			radius: 10,
			radiusVar: 1,
			textureEnabled: true,
			textureAdditive: true,
			startScale: 0.5,
			startScaleVar: 0,
			endScale: 0.5,
			endScaleVar: 0,
			startColor: [30.6, 63.75, 193.8, 1],
			endColor: [30.6, 63.75, 193.8, 0],
			gravity: {
				x: 0,
				y: 0
			},
			radialAccel: -20,
			radialAccelVar: 0,
			tangentialAccel: 20,
			tangentialAccelVar: 0,
			speed: 0,
			speedVar: 0,
			posVarTransformFn: function(value) {
				var r = value.x.degToRad();
				return {
					x: Math.cos(r) * width / 2,
					y: Math.sin(r) * height / 2
				};
			}
		}, me.loader.getImage("texture"));

		this.renderer = new ParticleRenderer();

		this.lastTimestamp = null;
		this.visible = true;
	},
	update: function() {
		return true;
	},
	draw: function(context) {
		var timestamp = (new Date()).getTime();
		var delta = timestamp - (this.lastTimestamp || timestamp);
		this.lastTimestamp = timestamp;

		delta /= 1000;
		this.emitter.update(delta);

		context.save();
		context.translate(-me.game.viewport.pos.x, -me.game.viewport.pos.y)
		this.renderer.render(context, this.emitter.particles);
		context.restore();
		
		if (me.debug.renderHitBox) {
			this.parent(context, "blue");
		}
	}
});