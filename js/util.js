window.util = {
	random: function(minOrMax, maxOrUndefined, dontFloor) {
		dontFloor = dontFloor || false;

		var min = typeof maxOrUndefined === "number" ? minOrMax : 0;
		var max = typeof maxOrUndefined === "number" ? maxOrUndefined : minOrMax;

		var range = max - min;

		var result = Math.random() * range + min;

		if (min === (min | 0) && max === (max | 0) && !dontFloor) {
			return Math.floor(result);
		} else {
			return result;
		}
	},

	isString: function(obj) {
		return toString.call(obj) === "[object String]"
	},

	random11: function() {
		return this.random(-1, 1, true);
	},

	recursiveExtend: function(obj, config, exceptions) {
		exceptions = exceptions || [];
		for (var prop in config) {
			if (config.hasOwnProperty(prop)) {
				if (exceptions.indexOf(prop) > -1) {
					obj[prop] = config[prop];
				} else {
					if (typeof config[prop] === 'object') {
						this.recursiveExtend(obj[prop], config[prop], exceptions);
					} else {
						obj[prop] = config[prop];
					}
				}
			}
		}
	},

	colorArrayToString: function(array, overrideAlpha) {
		var r = array[0] | 0;
		var g = array[1] | 0;
		var b = array[2] | 0;
		var a = overrideAlpha || array[3];

		return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
	}
}