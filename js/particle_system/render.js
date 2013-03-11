var bufferCache = {};

function getBuffer(texture) {
	var size = '' + texture.width + 'x' + texture.height;

	var canvas = bufferCache[size];

	if (!canvas) {
		canvas = document.createElement('canvas');
		canvas.width = texture.width;
		canvas.height = texture.height;
		bufferCache[size] = canvas;
	}

	return canvas;
}

/**
 * 粒子渲染器
 */
var ParticleRenderer = Object.extend({
	render: function(context, particles) {
		for (var i = 0; i < particles.length; ++i) {
			var p = particles[i];
			if (p.life > 0 && p.color) {
				if (p.textureAdditive) {
					context.globalCompositeOperation = 'lighter';
				} else {
					context.globalCompositeOperation = 'source-over';
				}

				this._renderParticleTexture(context, p);
			}
		}
		context.globalCompositeOperation = 'source-over';
	},
	_renderParticleTexture: function(context, particle) {
		particle.buffer = particle.buffer || getBuffer(particle.texture);

		var bufferContext = particle.buffer.getContext('2d');
		var w = (particle.texture.width * particle.scale) | 0;
		var h = (particle.texture.height * particle.scale) | 0;
		var x = particle.pos.x - w / 2;
		var y = particle.pos.y - h / 2;

		bufferContext.clearRect(0, 0, particle.buffer.width, particle.buffer.height);
		bufferContext.globalAlpha = particle.color[3];
		bufferContext.drawImage(particle.texture, 0, 0);
		bufferContext.globalCompositeOperation = "source-atop";
		bufferContext.fillStyle = util.colorArrayToString(particle.color, 1);
		bufferContext.fillRect(0, 0, particle.buffer.width, particle.buffer.height);
		bufferContext.globalCompositeOperation = "source-over";
		bufferContext.globalAlpha = 1;
		context.drawImage(particle.buffer, 0, 0, particle.buffer.width, particle.buffer.height, x, y, w, h);
	}
});