/*
 * player.js
 *
 * Defines the main player.
 *
 * @author Adhesion
 */

var Player = me.ObjectEntity.extend(
{
    init: function( x, y, settings )
    {
        this.parent( x, y, settings );

        this.gravity = 0.0;
        this.origVelocity = new me.Vector2d( 7.0, 7.0 );
        this.setVelocity( this.origVelocity.x, this.origVelocity.y );
        this.setFriction( 0.35, 0.35 );
        this.direction = new me.Vector2d( 0.0, 0.0 );

        this.dashTimer = 0;

        this.updateColRect( 22, 52, 10, 76 );

        me.input.bindKey( me.input.KEY.LEFT, "left" );
        me.input.bindKey( me.input.KEY.RIGHT, "right" );
        me.input.bindKey( me.input.KEY.UP, "up" );
        me.input.bindKey( me.input.KEY.DOWN, "down" );
        me.input.bindKey( me.input.KEY.X, "weakAttack", true );
        me.input.bindKey( me.input.KEY.C, "strongAttack", true );
        me.input.bindKey( me.input.KEY.V, "dash", true );

        me.game.viewport.follow( this.pos, me.game.viewport.AXIS.BOTH );
        me.game.viewport.setDeadzone( me.game.viewport.width / 10,
                                      me.game.viewport.height / 10 );
    },

    attack: function( type )
    {

    },

    // fix for multiple collision - if attack sprites are checking collision,
    // don't collide against player (would break out of loop and miss enemies)
    checkCollision: function( obj )
    {
        if ( obj.type == "weakAttack" || obj.type == "strongAttack" )
        {
            return null;
        }
        return this.parent( obj );
    },

    checkInput: function()
    {
        var tempDir = new me.Vector2d( 0.0, 0.0 );
        if ( me.input.isKeyPressed( "left" ) )
        {
            tempDir.x = -1.0;
        }
        if ( me.input.isKeyPressed( "right" ) )
        {
            tempDir.x = 1.0;
        }
        if ( me.input.isKeyPressed( "up" ) )
        {
            tempDir.y = -1.0;
        }
        if ( me.input.isKeyPressed( "down" ) )
        {
            tempDir.y = 1.0;
        }

        if ( tempDir.x != 0.0 || tempDir.y != 0.0 )
        {
            this.vel.x += tempDir.x * this.accel.x * me.timer.tick;
            this.vel.y += tempDir.y * this.accel.y * me.timer.tick;
            this.direction = tempDir;
        }

        if ( me.input.isKeyPressed( "weakAttack") )
        {
            console.log( "weak attack" );
        }
        else if ( me.input.isKeyPressed( "strongAttack" ) )
        {
            console.log( "strong attack" );
        }

        if ( me.input.isKeyPressed( "dash" ) && this.dashTimer == 0 )
        {
            this.setMaxVelocity( this.origVelocity.x * 2.5,
                                 this.origVelocity.y * 2.5 );
            this.dashTimer = 40;
        }
    },

    update: function()
    {
        this.checkInput();

        if ( this.dashTimer > 0 )
        {
            this.dashTimer--;
            if ( this.dashTimer > 20 )
            {
                this.vel.x += this.direction.x * this.accel.x * me.timer.tick;
                this.vel.y += this.direction.y * this.accel.y * me.timer.tick;
            }
            else if ( this.dashTimer == 20 )
                this.setMaxVelocity( this.origVelocity.x, this.origVelocity.y );
        }

        // stupid hack to make diagonal movement obey max velocity
        // (we can just use x since both components are the same)
        if ( this.vel.x != 0.0 && this.vel.y != 0.0 && this.vel.length() > this.maxVel.x )
        {
            var ratio = this.maxVel.x / this.vel.length();
            this.vel.x = this.vel.x * ratio;
            this.vel.y  = this.vel.y * ratio;
        }

        this.updateMovement();

        if ( this.vel.x != 0 || this.vel.y != 0 )
        {
            this.parent( this );
            return true;
        }
        return false;
    }
});

var PlayerAttack = me.ObjectEntity.extend(
{
    init: function( x, y, sprite, spritewidth, speed, frames, type )
    {
        var settings = new Object();
        settings.image = sprite;
        settings.spritewidth = spritewidth;

        this.parent( x, y, settings );

        this.animationspeed = speed;
        this.addAnimation( "play", frames );
        this.setCurrentAnimation( "play", function() { me.game.remove( this ) } );
        this.type = type;
    },

    update: function()
    {
        me.game.collide( this );
        this.parent();
        return true;
    }
});
