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
        settings = settings || {};
        settings.image = settings.image || "player";
        settings.spritewidth = settings.spritewidth || 96
        settings.spriteheight = settings.spriteheight || 96

        this.parent( x, y, settings );

        this.gravity = 0.0;
        this.origVelocity = new me.Vector2d( 7.0, 7.0 );
        this.setVelocity( this.origVelocity.x, this.origVelocity.y );
        this.setFriction( 0.35, 0.35 );
        this.direction = new me.Vector2d( 0.0, 1.0 );
        this.directionString = "down";

        this.dashTimer = 0;
        this.dashTimerMax = 40;
        this.dashCooldown = 20;

        this.weakAttackTimer = 0;
        this.weakAttackType = 0;
        this.strongAttackTimer = 0;

        this.updateColRect( 22, 52, 10, 76 );

        var directions = [ "down", "left", "up", "right" ];
        for ( var i = 0; i < 4; i++ )
        {
            var index = i * 7;
            this.addAnimation( directions[ i ] + "idle", [ index ] );
            this.addAnimation( directions[ i ] + "run",
                [ index, index + 1, index, index + 2 ] );
            this.addAnimation( directions[ i ] + "dash", [ index + 3 ] );
            this.addAnimation( directions[ i ] + "weakAttack0",
                [ index + 4 ] );
            this.addAnimation( directions[ i ] + "weakAttack1",
                [ index + 5 ] );
            this.addAnimation( directions[ i ] + "strongAttack",
                [ index + 6 ] );
        }

        this.setCurrentAnimation( "downidle" );
        this.animationspeed = 5;

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

        me.game.player = this;
    },

    isDashing: function()
    {
        return this.dashTimer > this.dashCooldown;
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
        if ( !this.isDashing() && this.weakAttackTimer == 0 &&
            this.strongAttackTimer < 30 )
        {
            if ( me.input.isKeyPressed( "left" ) )
            {
                tempDir.x = -1.0;
                this.directionString = "left";
            }
            if ( me.input.isKeyPressed( "right" ) )
            {
                tempDir.x = 1.0;
                this.directionString = "right";
            }
            if ( me.input.isKeyPressed( "up" ) )
            {
                tempDir.y = -1.0;
                this.directionString = "up";
            }
            if ( me.input.isKeyPressed( "down" ) )
            {
                tempDir.y = 1.0;
                this.directionString = "down";
            }

            if ( tempDir.x != 0.0 || tempDir.y != 0.0 )
            {
                this.vel.x += tempDir.x * this.accel.x * me.timer.tick;
                this.vel.y += tempDir.y * this.accel.y * me.timer.tick;
                this.direction = tempDir;
            }
        }

        // all attacks have to be on cooldown
        if ( this.weakAttackTimer == 0 && this.strongAttackTimer == 0 )
        {
            if ( me.input.isKeyPressed( "weakAttack" ) )
            {
                this.weakAttackTimer = 15;
                this.weakAttackType = ++this.weakAttackType % 2;
                this.attack( "weakAttack" );
            }
            else if ( me.input.isKeyPressed( "strongAttack" ) )
            {
                this.strongAttackTimer = 45;
                this.attack( "strongAttack" );
            }
        }

        // dash also has to be on cooldown
        if ( me.input.isKeyPressed( "dash" ) && this.dashTimer == 0 )
        {
            this.setMaxVelocity( this.origVelocity.x * 2.5,
                                 this.origVelocity.y * 2.5 );
            this.dashTimer = this.dashTimerMax;
        }
    },

    updateAnimation: function()
    {
        if ( this.isDashing() )
        {
            this.setCurrentAnimation( this.directionString + "dash" );
        }
        else if ( this.weakAttackTimer > 5 )
        {
            this.setCurrentAnimation( this.directionString + "weakAttack" +
                this.weakAttackType );
        }
        else if ( this.strongAttackTimer > 30 )
        {
            this.setCurrentAnimation( this.directionString + "strongAttack" );
        }
        else if ( this.vel.x != 0.0 || this.vel.y != 0.0 )
        {
            this.setCurrentAnimation( this.directionString + "run" );
        }
        else
        {
            this.setCurrentAnimation( this.directionString + "idle" );
        }
    },

    update: function()
    {
        this.checkInput();

        this.updateAnimation();

        if ( this.dashTimer > 0 )
        {
            this.dashTimer--;
            if ( this.isDashing() )
            {
                this.vel.x += this.direction.x * this.accel.x * me.timer.tick;
                this.vel.y += this.direction.y * this.accel.y * me.timer.tick;
            }
            // only need to do this once
            else if ( this.dashTimer == this.dashCooldown )
                this.setMaxVelocity( this.origVelocity.x, this.origVelocity.y );
        }

        if ( this.weakAttackTimer > 0 )
            this.weakAttackTimer--;
        if ( this.strongAttackTimer > 0 )
            this.strongAttackTimer--;

        // stupid hack to make diagonal movement obey max velocity
        // (we can just use x since both components are the same)
        if ( this.vel.x != 0.0 && this.vel.y != 0.0 && this.vel.length() > this.maxVel.x )
        {
            var ratio = this.maxVel.x / this.vel.length();
            this.vel.x = this.vel.x * ratio;
            this.vel.y  = this.vel.y * ratio;
        }

        this.updateMovement();

        this.parent( this );
        return true;
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
