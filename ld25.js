/*
* ld25.js
*
* Main file for LD25 entry.
*/


var jsApp = {
    onload: function()
    {
        if ( !me.video.init( 'game', 800, 600) )
        {
            alert( "Sorry, it appears your browser does not support HTML5." );
            return;
        }

        me.audio.init( "mp3,ogg" );

        me.loader.onload = this.loaded.bind( this );
        me.loader.preload( gameResources );

        me.state.change( me.state.LOADING );
    },

    loaded: function()
    {
        me.state.set( me.state.PLAY, new PlayScreen() );

        me.entityPool.add( "player", Player );
        me.entityPool.add( "hugger", Hugger );
        me.entityPool.add( "pusher", Pusher );
        me.entityPool.add( "door", Door);
        me.entityPool.add( "orb", Orb );

        me.state.change( me.state.PLAY );
        me.debug.renderHitBox = false;
    }
};

var PlayScreen = me.ScreenObject.extend({
    init: function()
    {
        this.parent( true, true );
    },

    getLevel: function()
    {
        return this.parseLevel( me.levelDirector.getCurrentLevelId() );
    },

    parseLevel: function( input )
    {
        var re = /level(\d+)/;
        var results = re.exec( input );
        return parseInt(results[1]);
    },

    updateTimer: function() {
        if( me.game.HUD.getItemValue( "timer" ) <= 0 ) {
            this.timerStart = me.timer.getTime();
            me.game.HUD.setItemValue( "timer" , 60.0 );
        }
        else {
            var v = ( 60000 - ( me.timer.getTime() - this.timerStart ) ) / 1000;
            v = v.toFixed( 1 );

            if( v < 0 ) { v = 0; }
            me.game.HUD.setItemValue( "timer", v );
        }
    },

    update: function()
    {
        this.updateTimer();
    },

    /** 
     * Actually load the level and sort things out before finally bringing the
     * screen up.
     */
    changeLevel: function( level )
    {
        var fade = '#000000';
        var duration = 1000;

        me.levelDirector.loadLevel( level );
        var layer = me.game.currentLevel.getLayerByName('corrupted background');
        layer.visible = false;
        me.game.sort();
        me.game.viewport.fadeOut( fade, duration, function() {
            me.game.HUD.addItem( "timer", new CountDown());
        });
    },

    getCurrentMusic: function()
    {
    },

    /**
     * Start the next level.
     */
    nextLevel: function( )
    {
        // TODO: victory?
        this.startLevel( "level" + (1 + this.getLevel())  );
    },

    /**
     * Start the given level.
     */
    startLevel: function( level )
    {
        var fade = '#000000';
        var duration = 1000;
        this.doors = [];
        this.orbs = [];
        me.game.HUD.removeItem( "timer" );

        me.game.viewport.fadeIn(
            fade,
            duration,
            this.changeLevel.bind(this, level)
        );
    },

    // this will be called on state change -> this
    onResetEvent: function()
    {
        me.game.addHUD( 0, 0, me.video.getWidth(), me.video.getHeight() );
        this.startLevel( location.hash.substr(1) || "level1" );
    },

    onDestroyEvent: function()
    {
        me.game.disableHUD();
    }
});

window.onReady( function()
{
    jsApp.onload();
});
