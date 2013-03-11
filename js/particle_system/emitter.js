/**
 * 粒子发生器
 */
var ParticleEmitter = Object.extend({
	init: function(config, texture) {
		this.configure(config);
		this.texture = texture;
	},
	configure: function(config) {
		this._totalParticles = 0;
		this.emissionRate = 0;

		this.active = false;
		this.duration = 0;

		this.pos = this.pos || {};
		this.pos.x = 0;
		this.pos.y = 0;

		this.posVar = this.posVar || {};
		this.posVar.x = 0;
		this.posVar.y = 0;
		this.posVarTransformFn = null;

		this.speed = 0;
		this.speedVar = 0;

		this.angle = 0;
		this.angleVar = 0;

		this.life = 0;
		this.lifeVar = 0;

		this.radius = 0;
		this.radiusVar = 0;

		this.textureEnabled = false;
		this.textureAdditive = false;

		this.startScale = 0;
		this.startScaleVar = 0;
		this.endScale = 0;
		this.endScaleVar = 0;

		this.startColor = this.startColor || [];
		this.startColor[0] = 0;
		this.startColor[1] = 0;
		this.startColor[2] = 0;
		this.startColor[3] = 0;

		this.startColorVar = this.startColorVar || [];
		this.startColorVar[0] = 0;
		this.startColorVar[1] = 0;
		this.startColorVar[2] = 0;
		this.startColorVar[3] = 0;

		this.endColor = this.endColor || [];
		this.endColor[0] = 0;
		this.endColor[1] = 0;
		this.endColor[2] = 0;
		this.endColor[3] = 0;

		this.endColorVar = this.endColorVar || [];
		this.endColorVar[0] = 0;
		this.endColorVar[1] = 0;
		this.endColorVar[2] = 0;
		this.endColorVar[3] = 0;

		this.gravity = this.gravity || {};
		this.gravity.x = 0;
		this.gravity.y = 0;

		this.radialAccel = 0;
		this.radialAccelVar = 0;
		this.tangentialAccel = 0;
		this.tangentialAccelVar = 0;

		util.recursiveExtend(this, config, ['texture']);
	},
	_isFull: function() {
		return this._particleCount === this.totalParticles;
	},
	_initParticlePool: function() {
		this._particlePool = [];

		for (var i = 0; i < this.totalParticles; ++i) {
			this._particlePool.push(new Particle());
		}

		this._particleCount = 0;
		this._particleIndex = 0;
		this._elapsed = 0;
		this._emitCounter = 0;
	},
	_addParticle: function() {
		if (this._isFull()) {
			return false;
		}

		var p = this._particlePool[this._particleCount];
		this._initParticle(p);
		++this._particleCount;

		return true;
	},
	_initParticle: function(particle) {
		particle.texture = this.texture;
		particle.textureEnabled = this.textureEnabled;
		particle.textureAdditive = this.textureAdditive;

		var b = {
			x: this.posVar.x * util.random11(),
			y: this.posVar.y * util.random11()
		};
		if (this.posVarTransformFn) {
			b = this.posVarTransformFn(b)
		}

		particle.pos.x = this.pos.x + b.x;
		particle.pos.y = this.pos.y + b.y;

		var angle = this.angle + this.angleVar * util.random11();
		var speed = this.speed + this.speedVar * util.random11();

		particle.setVelocity(angle, speed);

		particle.radialAccel = this.radialAccel + this.radialAccelVar * util.random11() || 0;
		particle.tangentialAccel = this.tangentialAccel + this.tangentialAccelVar * util.random11() || 0;

		var life = this.life + this.lifeVar * util.random11() || 0;
		particle.life = Math.max(0, life);

		particle.scale = typeof this.startScale === 'number' ? this.startScale : 1;
		particle.deltaScale = typeof this.endScale === 'number' ? (this.endScale - this.startScale) : 0;
		particle.deltaScale /= particle.life;

		particle.radius = typeof this.radius === 'number' ? this.radius + (this.radiusVar || 0) * util.random11() : 0;

		if (this.startColor) {
			var startColor = [
			this.startColor[0] + this.startColorVar[0] * util.random11(), this.startColor[1] + this.startColorVar[1] * util.random11(), this.startColor[2] + this.startColorVar[2] * util.random11(), this.startColor[3] + this.startColorVar[3] * util.random11()];

			var endColor = startColor;
			if (this.endColor) {
				endColor = [
				this.endColor[0] + this.endColorVar[0] * util.random11(), this.endColor[1] + this.endColorVar[1] * util.random11(), this.endColor[2] + this.endColorVar[2] * util.random11(), this.endColor[3] + this.endColorVar[3] * util.random11()];
			}

			particle.color = startColor;
			particle.deltaColor = [(endColor[0] - startColor[0]) / particle.life, (endColor[1] - startColor[1]) / particle.life, (endColor[2] - startColor[2]) / particle.life, (endColor[3] - startColor[3]) / particle.life];
		}
	},
	_updateParticle: function(p, delta, i) {
		if (p.life > 0) {

			// these vectors are stored on the particle so we can reuse them, avoids
			// generating lots of unnecessary objects each frame
			p.forces = p.forces || {
				x: 0,
				y: 0
			};
			p.forces.x = 0;
			p.forces.y = 0;

			p.radial = p.radial || {
				x: 0,
				y: 0
			};
			p.radial.x = 0;
			p.radial.y = 0;

			// dont apply radial forces until moved away from the emitter
			if ((p.pos.x !== this.pos.x || p.pos.y !== this.pos.y) && (p.radialAccel || p.tangentialAccel)) {
				p.radial.x = p.pos.x - this.pos.x;
				p.radial.y = p.pos.y - this.pos.y;

				var length = Math.sqrt(p.radial.x * p.radial.x + p.radial.y * p.radial.y);

				p.radial.x /= length;
				p.radial.y /= length;
			}

			p.tangential = p.tangential || {
				x: 0,
				y: 0
			};
			p.tangential.x = p.radial.x;
			p.tangential.y = p.radial.y;

			p.radial.x *= p.radialAccel;
			p.radial.y *= p.radialAccel;

			var newy = p.tangential.x;
			p.tangential.x = -p.tangential.y;
			p.tangential.y = newy;

			p.tangential.x *= p.tangentialAccel;
			p.tangential.y *= p.tangentialAccel;

			p.forces.x = p.radial.x + p.tangential.x + this.gravity.x;
			p.forces.y = p.radial.y + p.tangential.y + this.gravity.y;

			p.forces.x *= delta;
			p.forces.y *= delta;

			p.vel.x += p.forces.x;
			p.vel.y += p.forces.y;

			p.pos.x += p.vel.x * delta;
			p.pos.y += p.vel.y * delta;

			p.life -= delta;

			p.scale += p.deltaScale * delta;

			if (p.color) {
				p.color[0] += p.deltaColor[0] * delta;
				p.color[1] += p.deltaColor[1] * delta;
				p.color[2] += p.deltaColor[2] * delta;
				p.color[3] += p.deltaColor[3] * delta;
			}

			++this._particleIndex;
		} else {
			var temp = this._particlePool[i];
			this._particlePool[i] = this._particlePool[this._particleCount - 1];
			this._particlePool[this._particleCount - 1] = temp;

			--this._particleCount;
		}
	},
	update: function(delta) {
		this._elapsed += delta;
		this.active = this._elapsed < this.duration;

		if (!this.active) {
			return;
		}

		if (this.emissionRate) {
			// emit new particles based on how much time has passed and the emission rate
			var rate = 1.0 / this.emissionRate;
			this._emitCounter += delta;

			while (!this._isFull() && this._emitCounter > rate) {
				this._addParticle();
				this._emitCounter -= rate;
			}
		}

		this._particleIndex = 0;

		while (this._particleIndex < this._particleCount) {
			var p = this._particlePool[this._particleIndex];
			this._updateParticle(p, delta, this._particleIndex);
		}
	}
});

Object.defineProperty(ParticleEmitter.prototype, 'particles', {
	get: function() {
		return this._particlePool;
	}
});

Object.defineProperty(ParticleEmitter.prototype, 'totalParticles', {
	get: function() {
		return this._totalParticles;
	},
	set: function(tp) {
		tp = tp | 0;
		if (tp !== this._totalParticles) {
			this._totalParticles = tp;
			this._initParticlePool();
		}
	}
});