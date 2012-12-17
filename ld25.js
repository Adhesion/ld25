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
		me.state.set( me.state.INTRO, new RadmarsScreen() );
		me.state.set( me.state.MENU, new TitleScreen() );
        me.state.set( me.state.PLAY, new PlayScreen() );
		me.state.set( me.state.GAMEOVER, new GameOverScreen() );

        me.entityPool.add( "player", Player );
        me.entityPool.add( "hugger", Hugger );
        me.entityPool.add( "pusher", Pusher );
        me.entityPool.add( "shooter", Shooter );
        me.entityPool.add( "doctor", Doctor );
        me.entityPool.add( "boss", Boss );
        me.entityPool.add( "door", Door);
        me.entityPool.add( "orb", Orb );
		
		me.state.change( me.state.INTRO);
        //me.state.change( me.state.MENU );
        //me.state.change( me.state.GAMEOVER );
        //me.state.change( me.state.PLAY );
        me.debug.renderHitBox = false;
    }
};

var RadmarsScreen = me.ScreenObject.extend({
    init: function() {
        this.parent( true );
        this.counter = 0;
    },

    onResetEvent: function() {
        if( ! this.title ) {
            this.bg= me.loader.getImage("intro_bg");
            this.glasses1 = me.loader.getImage("intro_glasses1"); // 249 229
            this.glasses2 = me.loader.getImage("intro_glasses2"); // 249 229
            this.glasses3 = me.loader.getImage("intro_glasses3"); // 249 229
            this.glasses4 = me.loader.getImage("intro_glasses4"); // 249 229
            this.text_mars = me.loader.getImage("intro_mars"); // 266 317
            this.text_radmars1 = me.loader.getImage("intro_radmars1"); // 224 317
            this.text_radmars2 = me.loader.getImage("intro_radmars2");
        }

        me.input.bindKey( me.input.KEY.ENTER, "enter", true );
        me.audio.playTrack( "radmarslogo" );
    },

    update: function() {
        if( me.input.isKeyPressed('enter')) {
            me.state.change(me.state.MENU);
        }
        if ( this.counter < 350 )
        {
            this.counter++;
        }else{
            me.state.change(me.state.MENU);
        }
        // have to force redraw :(
        me.game.repaint();
    },

    draw: function(context) {
        context.drawImage( this.bg, 0, 0 );
        if( this.counter < 130) context.drawImage( this.text_mars, 266+80, 317+60 );
        else if( this.counter < 135) context.drawImage( this.text_radmars2, 224+80, 317+60 );
        else if( this.counter < 140) context.drawImage( this.text_radmars1, 224+80, 317+60 );
        else if( this.counter < 145) context.drawImage( this.text_radmars2, 224+80, 317+60 );
        else if( this.counter < 150) context.drawImage( this.text_radmars1, 224+80, 317+60 );
        else if( this.counter < 155) context.drawImage( this.text_radmars2, 224+80, 317+60 );
        else if( this.counter < 160) context.drawImage( this.text_radmars1, 224+80, 317+60 );
        else if( this.counter < 165) context.drawImage( this.text_radmars2, 224+80, 317+60 );
        else context.drawImage( this.text_radmars1, 224+80, 317+60 );

        if( this.counter < 100) context.drawImage( this.glasses1, 249+80, 229*(this.counter/100)+60 );
        else if( this.counter < 105) context.drawImage( this.glasses2, 249+80, 229+60 );
        else if( this.counter < 110) context.drawImage( this.glasses3, 249+80, 229+60 );
        else if( this.counter < 115) context.drawImage( this.glasses4, 249+80, 229+60 );
        else context.drawImage( this.glasses1, 249+80, 229+60 );
    },

    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
        me.audio.stopTrack();
    }
});

var TitleScreen = me.ScreenObject.extend({
    init: function() {
        this.parent( true );
        this.ctaFlicker = 0; 
    },

    onResetEvent: function() {
        if( ! this.cta ) {
            this.background= me.loader.getImage("intro");
            this.cta = me.loader.getImage("introcta");
        }

        me.input.bindKey( me.input.KEY.ENTER, "enter", true );
        //me.audio.playTrack( "ld23-theme" );
    },

    update: function() {
        if( me.input.isKeyPressed('enter')) {
            me.state.change(me.state.PLAY);
        }
        
        // have to force redraw :(
        me.game.repaint();
    },

    draw: function(context) {
        context.drawImage( this.background, 0, 0 );
        this.ctaFlicker++;
		if( this.ctaFlicker > 20 ) 
		{
            context.drawImage( this.cta, 74*4, 138*4 );
			if( this.ctaFlicker > 40 ) this.ctaFlicker = 0;  
		}
    },

    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
        me.audio.stopTrack();
        //me.audio.play( "ready" );
    }
});

var GameOverScreen = me.ScreenObject.extend(
{
    init: function()
    {
        this.parent( true );
    },
    
    onResetEvent: function()
    {
        if ( !this.background )
        {
            this.background = me.loader.getImage( "gameover" );
        }
        //me.audio.playTrack( "ld23-theme" );
    },
    
    draw: function( context, x, y )
    {
        context.drawImage( this.background, 0, 0 );
    }
});

var PlayScreen = me.ScreenObject.extend({
    init: function()
    {
		this.startTime = 60.0; 
		
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
    
    resetTime: function( ){
        me.game.HUD.setItemValue( "timer" , 60.0 );
        this.timerStart = me.timer.getTime(); 
    },
    
    addTime: function(t){
        //me.game.HUD.setItemValue( "timer" , 60.0 );
        this.timerStart += t * 1000; 
        if(me.game.doctor.enabled) me.game.doctor.disable();
    },
    
    updateTimer: function() {
        
        var v = ( this.startTime * 1000 - ( me.timer.getTime() - this.timerStart ) ) / 1000;
        v = v.toFixed( 1 );
        
        if( v < 0 ) { 
            v = 0; 
            if(!me.game.doctor.enabled) me.game.doctor.enable();
        }
        
        me.game.HUD.setItemValue( "timer", v );
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
        
        this.resetTime();
    },

    getCurrentMusic: function()
    {
    },

    /**
     * Start the next level.
     */
    nextLevel: function( )
    {
        // TODO hack 3rd level is last, boss has gameover condition
        if ( this.getLevel() < 3 )
            this.startLevel( "level" + (1 + this.getLevel())  );
        else{
            me.state.change( me.state.GAMEOVER );
        }
},

    /**
     * Start the given level.
     */
    startLevel: function( level )
    {
        var fade = '#000000';
        var duration = 500;
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
