(function ($) {
    // Plugin Definition.
    $.fn.circleFactory = function (methodOrOptions) {

        var method = (typeof methodOrOptions === 'string') ? methodOrOptions : undefined;
        var $canvas;
        var element = $(this);

        var Circle = function (x = 0, y = 0, xc = false, yc = false, a = 0.01) {
            var _ = this;
            _.x = x;
            _.y = y;
            _.radius = 3;
            _.alpha = a;
            _.xcenter = xc;
            _.ycenter = yc;
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
            _.pathCrawler = 0;
            _.currentDirection = '';
            _.xCenter = false;
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

            window.addEventListener('resize', function () {
                _.canvas.attr('width', _.canvas.parent().outerWidth());
                _.canvas.attr('height', _.canvas.parent().outerHeight());
                _.clearCanvas();
                _.resizeDrawCircles();
            }, false);
        };

        /**
         * Add a new circle object to the circle array.
         *
         * @param int x new circle x axis.
         * @param int y new circle y axis.
         */
        CircleFactory.prototype.addCircle = function (x, y, xc, yc, a) {
            var _ = this;
            _.circleArray[_.circleArray.length] = new Circle(x, y, xc, yc, a);
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
                    var newX = _.circleArray[_.circleArray.length - 1].x;
                    var newY = _.circleArray[_.circleArray.length - 1].y;
                    var xCenter = false;
                    // Dont add if we reach to end of totalCount;
                    if (_.circleArray.length === _.totalCount) {
                        continue;
                    }
                    _.currentDirection = _._options.path[_.pathCrawler].direction;
                    _.xCenter = _._options.path[_.pathCrawler].xCenter;
                    _.directionCount = _._options.path[_.pathCrawler].count;
                    // Determine the direction.
                    if (_.pathCounter === _.directionCount) {
                        _.pathCrawler++;
                        if (_.pathCrawler === _._options.path.length) {
                            _.pathCrawler = _._options.path.length - 1;
                        }
                        // Change Particle Direction.
                        _.currentDirection = _._options.path[_.pathCrawler].direction;
                        _.xCenter = _._options.path[_.pathCrawler].xCenter;
                        _.pathCounter = 0;
                    }

                    // Get the direction to use here.
                    switch (_.currentDirection) {
                        case 'bottom':
                            newY = _.circleArray[_.circleArray.length - 1].y + _.gap;
                            break;
                        case 'top':
                            newY = _.circleArray[_.circleArray.length - 1].y - _.gap;
                            break;
                        case 'left':
                            newX = _.circleArray[_.circleArray.length - 1].x - _.gap;
                            break;
                        case 'right':
                            newX = _.circleArray[_.circleArray.length - 1].x + _.gap;
                            break;
                    }

                    if (_.xCenter === true) {
                        newX = _.canvas.width() / 2;
                        xCenter = true;
                    }

                    _.addCircle(newX, newY, xCenter);
                    _.pathCounter++;
                }
            }
        };

        /**
         *  Draw Final circle resulat upon resize
         */
        CircleFactory.prototype.resizeDrawCircles = function () {
            var _ = this;
            var pathCounter = 0;
            var pathCrawler = 0;
            var arcX = _._options.x;
            var arcY = _._options.y;
            
            if ( 'center' === arcX ) {
                arcX = _.canvas.width() / 2;
            }
            
            _.ctx.save();
            for (var i = 0; i < _.circleArray.length; i++) {
                _.ctx.globalAlpha = 1;
                _.ctx.fillStyle = _._options.color;
                _.ctx.beginPath();

                // Variables
                var currentDirection = _._options.path[pathCrawler].direction;
                // var xCenter = _._options.path[pathCrawler].xCenter;
                var directionCount = _._options.path[pathCrawler].count;

                // Determine the direction.
                if (pathCounter === directionCount) {
                    pathCrawler++;
                    if (pathCrawler === _._options.path.length) {
                        pathCrawler = _._options.path.length - 1;
                    }

                    // Change Particle Direction.
                    currentDirection = _._options.path[pathCrawler].direction;

                    // Reset Path Counter.
                    pathCounter = 0;
                }

                // Get the direction to use here.
                switch (currentDirection) {
                    case 'bottom':
                        arcY += _.gap;
                        break;
                    case 'top':
                        arcY -= _.gap;
                        break;
                    case 'left':
                        arcX -= _.gap;
                        break;
                    case 'right':
                        arcX += _.gap;
                        break;
                }

                if (true === _.circleArray[i].xcenter) {
                    arcX = _.canvas.width() / 2;
                }

                _.ctx.arc(arcX, arcY, _.circleArray[i].radius, 0, Math.PI * 2, true);

                _.ctx.fill();
                _.ctx.closePath();
                pathCounter++;

            }
            _.ctx.restore();
        }

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
            var circleX = 0;

            if ('center' === _._options.x) {
                circleX = $canvas.width() / 2;
                _.addCircle(circleX, _._options.y, true);
            } else {
                _.addCircle(_._options.x, _._options.y);
            }

            _.getTotalCount();

            window.requestAnimationFrame(animateCircles);
        };

        // Animating function
        function animateCircles() {
            var _ = element.data('circleFactory');
            if (_._options.path.length > 0) {
                _.clearCanvas();
                _.updateCircles();
                _.drawCircles();
                if (_.circleArray.length !== _.totalCount || _.circleArray[_.circleArray.length - 1].alpha < 1) {
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
                $canvas = insertCanvas($(this));
                $canvas = $($canvas);
                var circleFactory = new CircleFactory($canvas, options);
                circleFactory.resizeCanvas();
                $(this).data('circleFactory', circleFactory);
            }
            return this.each(init);
        }
    };
})(jQuery);