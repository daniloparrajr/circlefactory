(function ($) {
    // Plugin Definition.
    $.fn.circleFactory = function (methodOrOptions) {

        var method = (typeof methodOrOptions === 'string') ? methodOrOptions : undefined;
        var $canvas;
        var element = $(this);

        var Circle = function (x, y) {
            var _ = this;
            _.x = x;
            _.y = y;
            _.radius = 3;
            _.alpha = 0;
        };

        var CircleFactory = function ($el, options) {
            var _ = this;
            _.canvas = $el;
            _.ctx = $el[0].getContext('2d');
            _.delta = 0.3;
            _.circleArray = [];
            _.gap = 20;
            _.dpi = window.devicePixelRatio;
            _.totalCount = 0;
            _._defaults = {
                color: '#828487',
                x: 15,
                y: 15,
                path: [],
            };
            _.directionCrawler = 0;
            _.currentDirection = 0;
            _.directionCount = 0;
            _.pathCounter = 1;

            _._options = $.extend(true, {}, _._defaults, options);

            _.options = function (options) {
                return (options) ?
                    $.extend(true, _._options, options) :
                    _._options;
            };

        };

        CircleFactory.prototype.stop = function () {
            window.cancelAnimationFrame(this.animationFunc);
        };

        CircleFactory.prototype.resizeCanvas = function () {
            var _ = this;
            _.canvas.attr('width', _.canvas.parent().outerWidth());
            _.canvas.attr('height', _.canvas.parent().outerHeight());

            _.clearCanvas();
            _.drawCircles();

            window.addEventListener('resize', function () {
                _.canvas.attr('width', _.canvas.parent().outerWidth());
                _.canvas.attr('height', _.canvas.parent().outerHeight());
                _.clearCanvas();
                _.drawCircles();
            }, false);
            // _.fixCanvasDpi();
        };

        /**
         * Add a new circle object to the array.
         *
         * @param int x new circle x axis.
         * @param int y new circle y axis.
         */
        CircleFactory.prototype.addCircle = function (x, y) {
            var _ = this;
            _.circleArray[_.circleArray.length] = new Circle(x, y);
        };

        CircleFactory.prototype.fixCanvasDpi = function () {
            var _ = this;
            //get CSS height
            //the + prefix casts it to an integer
            //the slice method gets rid of "px"
            var style_height = +getComputedStyle(_.canvas[0]).getPropertyValue("height").slice(0, -2);
            //get CSS width
            var style_width = +getComputedStyle(_.canvas[0]).getPropertyValue("width").slice(0, -2);
            //scale the canvas
            _.canvas[0].setAttribute('height', style_height * _.dpi);
            _.canvas[0].setAttribute('width', style_width * this.dpi);
        };

        /**
         * Clear the canvas inserted to the DOM by the plugin.
         *
         * @param object el DOM element were the plugin is initialized.
         */
        CircleFactory.prototype.clearCanvas = function () {
            var _ = this;
            _.ctx.clearRect(0, 0, $(_.canvas).width(), $(_.canvas).height());
        };

        /**
         * Updates the circle's opacity within the CircleArray.
         */
        CircleFactory.prototype.updateCircles = function () {
            var _ = this;
            for (var i = 0; i < _.circleArray.length; i++) {
                // Increase circle opacity if aplha is less than 1
                if (_.circleArray[i].alpha < 1) {
                    _.circleArray[i].alpha += _.delta;
                }
                if (_.circleArray[_.circleArray.length - 1].alpha >= 1) {
                    // Dont add if we reach to end of totalCount;
                    if (_.circleArray.length === _.totalCount) {
                        continue;
                    }
                    _.currentDirection = _._options.path[_.directionCrawler].direction;
                    _.directionCount = _._options.path[_.directionCrawler].count;
                    // Determine the direction.
                    if (_.pathCounter === _.directionCount) {
                            _.directionCrawler++;
                        if ( _.directionCrawler === _._options.path.length) {
                            _.directionCrawler = _._options.path.length - 1;
                        }
                        // Change Particle Direction.
                        _.currentDirection = _._options.path[_.directionCrawler].direction;
                        _.pathCounter = 0;
                    }

                    _.addCircle(_.circleArray[_.circleArray.length - 1].x, _.circleArray[_.circleArray.length - 1].y);

                    // Get the direction to use here.
                    switch (_.currentDirection) {
                        case 'bottom':
                            _.circleArray[_.circleArray.length - 1].y += _.gap;
                            break;
                        case 'top':
                            _.circleArray[_.circleArray.length - 1].y -= _.gap;
                            break;
                        case 'left':
                            _.circleArray[_.circleArray.length - 1].x -= _.gap;
                            break;
                        case 'right':
                            _.circleArray[_.circleArray.length - 1].x += _.gap;
                            break;
                    }
                    _.pathCounter++;
                }
            }
        };

        /**
         * Draw all the circles within the circleArray to the canvas.
         */
        CircleFactory.prototype.drawCircles = function () {
            var _ = this;
            _.ctx.save();
            for (var i = 0; i < _.circleArray.length; i++) {
                _.ctx.globalAlpha = _.circleArray[i].alpha;
                _.ctx.fillStyle = _._options.color;
                _.ctx.beginPath();
                _.ctx.arc(_.circleArray[i].x, _.circleArray[i].y, _.circleArray[i].radius, 0, Math.PI * 2, true);
                _.ctx.fill();
                _.ctx.closePath();
            }
            _.ctx.restore();
        };

        CircleFactory.prototype.getTotalCount = function () {
            var _ = this;
            for (var i = 0; i < _._options.path.length; i++) {
                _.totalCount += _._options.path[i].count;
            }
        };

        CircleFactory.prototype.animate = function () {
            var _ = this;
            _.getTotalCount();
            _.addCircle(_._options.x, _._options.y);
            window.requestAnimationFrame(animateCircles);
        };

        // Animating function
        function animateCircles() {
            var _ = element.data('circleFactory');
            if (_._options.path.length > 0) {
                _.clearCanvas();
                _.updateCircles();
                _.drawCircles();
                if (_.circleArray.length !== _.totalCount || _.circleArray[_.circleArray.length - 1 ].alpha < 1) {
                    window.requestAnimationFrame(animateCircles);
                }
            }
        }

        /**
         * Inserts canvas element to the dom element specified.
         *
         * @param string $el canvas id inserted in the dom element.
         */
        function insertCanvas($el) {
            $($el).append('<canvas id="' + $($el).attr('id') + '-canvas" class="section-canvas">Your browser does not support canvas!</canvas>');
            return '#' + $($el).attr('id') + '-canvas';
        }

        if (method) {
            var circleFactorys = [];

            function getCircleFactory() {
                var $el = $(this);
                var circleFactory = $el.data('circleFactory');

                circleFactorys.push(circleFactory);
            }

            this.each(getCircleFactory);

            var args = (arguments.length > 1) ? Array.prototype.slice.call(arguments, 1) : undefined;
            var results = [];

            function applyMethod(index) {
                var circleFactory = circleFactorys[index];

                if (!circleFactory) {
                    console.warn('$.circleFactory not instantiated yet');
                    console.info(this);
                    results.push(undefined);
                    return;
                }

                if (typeof circleFactory[method] === 'function') {
                    var result = circleFactory[method].apply(circleFactory, args);
                    results.push(result);
                } else {
                    console.warn('Method \'' + method + '\' not defined in $.circleFactory');
                }
            }

            this.each(applyMethod);

            return (results.length > 1) ? results : results[0];
        } else {
            var options = (typeof methodOrOptions === 'object') ? methodOrOptions : undefined;

            function init() {
                $canvas = insertCanvas( $(this) );
                $canvas = $( $canvas );
                var circleFactory = new CircleFactory($canvas, options);
                circleFactory.resizeCanvas();
                $(this).data('circleFactory', circleFactory);
            }
            return this.each(init);
        }
    };
})(jQuery);