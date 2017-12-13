/*
 @module jquery.gentlyScrollTo.js
 jQuery plugin, designed to gently scroll the page to a certain element
 */
(function( $ ){
    var S_PLUGIN_NAME = 'gentlyScrollTo';
    $.fn[S_PLUGIN_NAME] = function(oOptions) {
        /* note that this plugin behavior differs from others
         this is because we want this plugin to operate like a single-atomic function,
         not like an object with several functions.
         */
        return this.each(function(){
            var $this = $(this);

            /* this block ensures that only only scroll animation present in the document */
            var $document = $(document);
            var oGlobalData = $document.data(S_PLUGIN_NAME);
            var oData = null;
            if (oGlobalData && oGlobalData.$currentlyAnimated) {
                oData = oGlobalData.$currentlyAnimated.data(S_PLUGIN_NAME);
                oData.cancelAnimation();
            }
            oGlobalData = {
                $currentlyAnimated : $this
            };
            $document.data(S_PLUGIN_NAME, oGlobalData);

            oData = $this.data(S_PLUGIN_NAME);
            if ( oData && oData.bAnimationInProgress ) {
                return;
            }

            var oSettings = {};
            if ( oOptions ) {
                $.extend( oSettings, oOptions );
            }

            oData = {
                oSettings                : oSettings,
                bAnimationInProgress     : true,
                $target                  : $this,
                iAnimationTimeoutId      : 0,

                /* methods */
                animationStep            : null,
                cancelAnimation          : null
            };
            $this.data(S_PLUGIN_NAME, oData);

            oData.animationStep = function () {
                var oData = this;
                if (!oData.bAnimationInProgress) {
                    return;
                }
                var iCurrentPosition = $document.scrollTop();
                var iTargetPosition = oData.$target.offset().top;
                var $header = $(".header:not(.ghost)");
                if ($header.css('position') === 'fixed') {
                    iTargetPosition -= $header.height();
                }
                var iDelta = iTargetPosition - iCurrentPosition;
                if ((iDelta < 2) && (iDelta > -2)) {
                    /*$document.scrollTop(iTargetPosition);*/
                    oData.bAnimationInProgress = false;
                } else {
                    iDelta = iDelta/8;
                    if ((iDelta > 0) && (iDelta < 1)) {
                        iDelta = 1;
                    } else if ((iDelta < 0) && (iDelta > -1)) {
                        iDelta = -1;
                    }
                    var iNewPosition = iCurrentPosition + iDelta;
                    $document.scrollTop(iNewPosition);
                    oData.iAnimationTimeoutId = setTimeout(
                        function () {
                            oData.animationStep();
                        },
                        50
                    );
                }
            };

            oData.userInputHandler = function () {
                oData.cancelAnimation();
            };

            oData.cancelAnimation = function () {
                var oData = this;
                oData.bAnimationInProgress = false;
                clearTimeout(oData.iAnimationTimeoutId);
                $(window).off('mousedown DOMMouseScroll mousewheel keyup gesturestart touchstart touchend', oData.userInputHandler);
                $(document).off('mousewheel keyup gesturestart touchend', oData.userInputHandler);
            };

            var iDelta = oData.$target.offset().top - $document.scrollTop();
            if (iDelta > 0 && iDelta < $(window).height()/3) {
                /* object is already visible - no sense in animation */
                return;
            }

            /* we don't want user to "fight" with scroll animation */
            $(window).on('mousedown DOMMouseScroll mousewheel keyup gesturestart touchstart touchend', oData.userInputHandler);
            /* document listeners for IE8 */
            $(document).on('mousewheel keyup gesturestart touchend', oData.userInputHandler);

            /* launch animation */
            oData.iAnimationTimeoutId = setTimeout(
                function () {
                    oData.animationStep();
                },
                50
            );
        });
    };
})( jQuery );
