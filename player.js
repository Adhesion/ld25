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
        settings.collidable = true;

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

        this.headParticleTimer = 50;

        this.stunned = false;
        this.attachedList = new Array();

        this.updateColRect( 22, 52, 10, 76 );

        var directions = [ "down", "left", "up", "right" ];
        for ( var i = 0; i < directions.length; i++ )
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
        var particleXPos = 0;
        var particleYPos = 0;
        var attackSprite = type;
        var frames = [];
        var spriteWidth = 0;
        var spriteHeight = 0;
        var flipX = false;
        var flipY = false;

        if ( type == "weakAttack" )
        {
            spriteWidth = 96;
            spriteHeight = 96;

            if ( this.direction.y != 0.0 )
            {
                particleXPos = this.pos.x;
                particleYPos = this.pos.y + ( this.direction.y * 96 );

                if ( this.direction.y > 0.0 )
                    frames = [ 0, 1, 2, 3 ];
                else
                    frames = [ 8, 9, 10, 11 ];
            }
            else
            {
                particleXPos = this.pos.x + ( this.direction.x * 96 );
                particleYPos = this.pos.y;

                if ( this.direction.x > 0.0 )
                    frames = [ 12, 13, 14, 15 ];
                else
                    frames = [ 4, 5, 6, 7 ];
            }
        }
        else if ( type == "strongAttack" )
        {
            frames = [ 0, 1, 2, 3 ];

            if ( this.direction.y != 0.0 )
            {
                particleXPos = this.pos.x - 48;
                particleYPos = this.pos.y + ( this.direction.y * 96 );

                attackSprite += "_front";

                spriteWidth = 192;
                spriteHeight = 96;

                if ( this.direction.y < 0.0 )
                    flipY = true;
            }
            else
            {
                particleXPos = this.pos.x + ( this.direction.x * 96 );
                particleYPos = this.pos.y - 48;

                attackSprite += "_side";

                spriteWidth = 96;
                spriteHeight = 192;

                if ( this.direction.x < 0.0 )
                    flipX = true;
            }
        }
        else
        {
            return;
        }

        var attackParticle = new PlayerParticle( particleXPos, particleYPos, attackSprite, spriteWidth, 3, frames, type, true, spriteHeight );
        attackParticle.flipX( flipX );
        attackParticle.flipY( flipY );
        me.game.add( attackParticle, 5 );
        me.game.sort();
    },

    hit: function()
    {
        this.stunned = true;
        this.flicker( 90, function() { this.stunned = false; } );
    },

    addAttached: function( enemy )
    {
        this.attachedList[ this.attachedList.length ] = enemy;
    },

    checkInput: function()
    {
        if ( this.stunned )
            return;

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

        // dash
        // dash also has to be on cooldown
        if ( me.input.isKeyPressed( "dash" ) && this.dashTimer == 0 )
        {
            this.setMaxVelocity( this.origVelocity.x * 2.5,
                                 this.origVelocity.y * 2.5 );
            this.dashTimer = this.dashTimerMax;

            this.spawnDashParticle();

            for ( var i = 0; i < this.attachedList.length; i++ )
            {
                this.attachedList[i].shakeOff();
            }
            this.attachedList.length = 0;
        }
    },

    spawnDashParticle: function()
    {
        var dashParticle = new PlayerParticle( this.pos.x, this.pos.y,
            "dash", 96, 6, [], "", false, 96  );
        dashParticle.addAnimation( "down", [ 0, 1, 2 ] );
        dashParticle.addAnimation( "left", [ 3, 4, 5 ] );
        dashParticle.addAnimation( "up", [ 6, 7, 8 ] );
        dashParticle.addAnimation( "right", [ 9, 10, 11 ] );
        dashParticle.setCurrentAnimation( this.directionString,
            function() { me.game.remove( this ) } );
        me.game.add( dashParticle, this.z - 1 );
        me.game.sort();
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

    checkCollision: function( obj ) {
        if( obj.door ) {
            return this.parent( obj );
        }
        console.log( "player checkcol" );
        return null;
    },

    update: function()
    {
        // check for collision with other objects
        var colres = me.game.collide(this);

        this.checkInput();

        if ( this.attachedList.length > 0 )
        {
            var slowVelX = this.origVelocity.x - ( this.attachedList.length );
            var slowVelY = this.origVelocity.y - ( this.attachedList.length );
            this.setMaxVelocity( slowVelX, slowVelY );
        }

        this.updateAnimation();

        if ( this.dashTimer > 0 )
        {
            this.dashTimer--;
            if ( this.isDashing() )
            {
                this.vel.x += this.direction.x * this.accel.x * me.timer.tick;
                this.vel.y += this.direction.y * this.accel.y * me.timer.tick;

                if ( this.dashTimer % 5 == 0 )
                {
                    this.spawnDashParticle();
                }
            }
            // only need to do this once
            else if ( this.dashTimer == this.dashCooldown )
                this.setMaxVelocity( this.origVelocity.x, this.origVelocity.y );
        }

        if ( this.weakAttackTimer > 0 )
            this.weakAttackTimer--;
        if ( this.strongAttackTimer > 0 )
            this.strongAttackTimer--;

        this.headParticleTimer--;
        if ( this.headParticleTimer == 0 )
        {
            this.headParticleTimer = 30;
            var headP = new PlayerParticle( this.pos.x, this.pos.y - 64,
                "headparticle", 96, 6, [ 0, 1, 2, 3, 4, 5, 6 ], "", false );
            //me.game.add( headP, 5 );
            //me.game.sort();
        }

        // stupid hack to make diagonal movement obey max velocity
        // (we can just use x since both components are the same)
        if ( this.vel.x != 0.0 && this.vel.y != 0.0 && this.vel.length() > this.maxVel.x )
        {
            var ratio = this.maxVel.x / this.vel.length();
            this.vel.x = this.vel.x * ratio;
            this.vel.y  = this.vel.y * ratio;
        }

        // check if we collide with a door.
        if( colres && colres.obj.door ) {
            this.vel.x = colres.x ? 0 : this.vel.x;
            this.vel.y = colres.y ? 0 : this.vel.y;
            this.pos.x -= colres.x;
            this.pos.y -= colres.y;
        }

        this.updateMovement();

        this.parent( this );
        return true;
    }
});

var PlayerParticle = me.ObjectEntity.extend(
{
    init: function( x, y, sprite, spritewidth, speed, frames, type, collide, spriteheight )
    {
        var settings = new Object();
        settings.image = sprite;
        settings.spritewidth = spritewidth;
        settings.spriteheight = spriteheight;

        this.parent( x, y, settings );

        this.animationspeed = speed;
        this.addAnimation( "play", frames );
        this.setCurrentAnimation( "play",
            function() { me.game.remove( this ) } );
        this.type = type;
        this.collide = collide;
    },

    update: function()
    {
        if ( this.collide )
            me.game.collide( this );
        this.parent();
        return true;
    }
});
