/**
 * 粒子
 */
var Particle = Object.extend({
	init: function() {
		this.pos = {
			x: 0,
			y: 0
		};
		this.setVelocity(0, 0);
		this.life = 0;
	},
	setVelocity: function(angle, speed) {
		this.vel = {
			x: Math.cos(angle.degToRad()) * speed,
			y: -Math.sin(angle.degToRad()) * speed
		};
	}
});