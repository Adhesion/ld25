/*
 * enemy.js
 *
 * Defines basic enemy type.
 *
 * @author Adhesion
 */

var Enemy = me.ObjectEntity.extend({
    init: function( x, y, settings )
    {
        settings.image        = settings.image        || 'testenemy';
        settings.spritewidth  = settings.spritewidth  || 48;
        settings.spriteheight = settings.spriteheight || 48;

        this.parent( x, y, settings );
        this.gravity = 0;
        this.type = me.game.ENEMY_TYPE;
        this.collidable = true;
        this.playerCollidable = true;

        this.origVelocity = 6;
        this.setMaxVelocity( this.origVelocity, this.origVelocity );

        this.hp = 3;

        this.directionString = "down";
    },

    updateDirectionString: function()
    {
        if ( this.vel.y > 0.0 )
            this.directionString = "down";
        if ( this.vel.y < 0.0 )
            this.directionString = "up";
        if ( this.vel.x > 0.0 )
            this.directionString = "right";
        if ( this.vel.x < 0.0 )
            this.directionString = "left";
    },

    /** Get a vector to the player. */
    toPlayer: function()
    {
        if( me.game.player ) {
            return new me.Vector2d(
                me.game.player.pos.x
                    + me.game.player.width / 2
                    - this.pos.x - this.width / 2,
                me.game.player.pos.y
                    + me.game.player.height / 2
                    - this.pos.y - this.height / 2
            );
        }
        return;
    },

    onCollision: function( res, obj )
    {
        if( obj.type == "weakAttack" || obj.type == "strongAttack" ||
            ( obj == me.game.player && me.game.player.isDashing() ) )
        {
            this.knockback( obj );
        }
    },

    knockback: function( obj )
    {
        this.hp -= 1;
        var knockback = 3.0;
        if ( obj.type == "strongAttack" )
            knockback = 12.0;

        this.setMaxVelocity( knockback, knockback );
        this.collidable = false;
        this.flicker( 60, function()
        { this.setMaxVelocity( this.origVelocity, this.origVelocity );
            this.collidable = true; } );

        this.vel.x += this.toPlayer().x * knockback * -0.5;
        this.vel.y += this.toPlayer().y * knockback * -0.5;
    },

    fireBullet: function()
    {
        // note collide is false as the player checks its own collision, bullet will be recipient
        var bPosX = this.pos.x + ( this.width / 2 ) + 24;
        var bPosY = this.pos.y + ( this.height / 2 ) + 24;
        var bullet = new EnemyBullet( bPosX, bPosY, "shooterBullet", 48, 5, [ 0 ], "shooterBullet", false, 48 );
        var dir = this.toPlayer();
        dir.normalize();
        bullet.vel.x = dir.x * 5.0;
        bullet.vel.y = dir.y * 5.0;
        me.game.add( bullet, this.z + 1 );
        me.game.sort();
    }
});

var Hugger = Enemy.extend({
    init: function( x, y, settings )
    {
        this.range = settings.range || 200;
        this.speed = settings.speed || .6;
        settings.image = "hugger";
        this.parent( x, y, settings );

        this.setFriction( 0.35, 0.35 );

        this.isAttached = false;

        this.posDiffX = 0;
        this.posDiffY = 0;

        console.log( "hugger init" );

        var directions = [ "down", "left", "up", "right" ];
        for ( var i = 0; i < directions.length; i++ )
        {
            var index = i * 4;
            this.addAnimation( directions[ i ] + "run",
                [ index, index + 1, index, index + 2 ] );
            this.addAnimation( directions[ i ] + "grab", [ index + 3 ] );
        }
    },

    onCollision: function( res, obj )
    {
        this.parent( res, obj );

        // attach if player collision
        if ( obj == me.game.player && !me.game.player.isDashing() )
        {
            console.log( "attachment" );
            this.isAttached = true;
            this.posDiffX = me.game.player.pos.x - this.pos.x;
            this.posDiffY = me.game.player.pos.y - this.pos.y;
            this.collidable = false;
            obj.addAttached( this );
        }
    },

    shakeOff: function()
    {
        this.isAttached = false;
        this.flicker( 60, function() { this.collidable = true } );
    },

    /** Run towards the player when it's in range. */
    update: function()
    {
        //this.parent( this );
        this.updateDirectionString();

        if ( this.isAttached )
        {
            this.setCurrentAnimation( this.directionString + "grab" );
            this.pos.x = me.game.player.pos.x - this.posDiffX;
            this.pos.y = me.game.player.pos.y - this.posDiffY;
            this.vel.x = 0;
            this.vel.y = 0;
        }
        else if ( this.collidable )
        {
            var direction = this.toPlayer();
            var move = false;
            if( direction ) {
                var dist = direction.length();
                if( dist < this.range && dist > 0) {
                    this.setCurrentAnimation( this.directionString + "run" );
                    direction.normalize();
                    this.vel.x += direction.x * this.speed;
                    this.vel.y += direction.y * this.speed;
                    this.direction = direction;
                    move = true;
                }
            }

            // disabling this for now
            if( ! move ) {
                //this.vel.x = 0;
                //this.vel.y = 0;
            }
        }

        this.updateMovement();

        // need to check collidable to finish flicker?
        if ( move || !this.collidable )
            this.parent( this );
        return move;
    }
});

var Pusher = Enemy.extend({
    init: function( x, y, settings ) {
        this.range = settings.range || 200;
        this.speed = settings.speed || .6;
        settings.image = "pusher";
        settings.spritewidth = 96;
        settings.spriteheight = 96;

        this.animationspeed = 3;

        this.pushTimer = 0;

        this.parent( x, y, settings );

        this.updateColRect( 32, 32, 10, 86 );

        if( settings.direction == 'left' ) {
            this.direction = new me.Vector2d( -1, 0 );
        }
        else if( settings.direction == 'right' ) {
            this.direction = new me.Vector2d( 1, 0 );
        }
        else if( settings.direction == 'up' ) {
            this.direction = new me.Vector2d( 0, -1 );
        }
        else if( settings.direction == 'down' ) {
            this.direction = new me.Vector2d( 0, 1 );
        }
        else {
            throw "Pusher needs a direction.";
        }

        var directions = [ "down", "left", "up", "right" ];
        for ( var i = 0; i < directions.length; i++ )
        {
            var index = i * 4;
            this.addAnimation( directions[ i ] + "idle", [ index ] );
            this.addAnimation( directions[ i ] + "run",
                [ index, index + 1, index, index + 2 ] );
            this.addAnimation( directions[ i ] + "push", [ index + 3 ] );
        }
    },

    onCollision: function( res, obj )
    {
        this.parent( res, obj );
        if ( obj == me.game.player && !me.game.player.isDashing() )
        {
            me.game.player.vel.x += this.direction.x * 10.0;
            me.game.player.vel.y += this.direction.y * 10.0;
            this.pushTimer = 10;
        }
    },

    /* When the player gets close, move in a straight line */
    update: function() {
        this.updateDirectionString();
        this.parent( this );

        if ( this.pushTimer > 0 )
            this.pushTimer--;

        var direction = this.toPlayer();
        var move = false;
        if( direction ) {
            var dist = direction.length();
            if( dist < this.range && dist > 0) {
                this.vel.x += this.speed * this.direction.x;
                this.vel.y += this.speed * this.direction.y;
            }
        }

        if ( this.pushTimer > 0 )
        {
            this.setCurrentAnimation( this.directionString + "push" );
        }
        else if ( this.vel.x || this.vel.y )
        {
            this.setCurrentAnimation( this.directionString + "run" );
        }
        else
        {
            this.setCurrentAnimation( this.directionString + "idle" );
        }

        this.updateMovement();
        return ( this.vel.x || this.vel.y );
    }
});

var Shooter = Enemy.extend(
{
    init: function( x, y, settings )
    {
        this.range = settings.range || 400;
        this.speed = settings.speed || .3;
        settings.image = "shooter";
        settings.spritewidth = 96;
        settings.spriteheight = 96;
        this.parent( x, y, settings );
        console.log( "shooter init" );

        this.setMaxVelocity( 3.0, 3.0 );

        this.shootTimer = 0;

        var directions = [ "down", "left", "up", "right" ];
        for ( var i = 0; i < directions.length; i++ )
        {
            var index = i * 4;
            this.addAnimation( directions[ i ] + "idle", [ index ] );
            this.addAnimation( directions[ i ] + "run",
                [ index, index + 1, index, index + 2 ] );
            this.addAnimation( directions[ i ] + "shoot", [ index + 3 ] );
        }
    },

    update: function()
    {
        this.updateDirectionString();

        var direction = this.toPlayer();
        var move = false;
        if( direction ) {
            var dist = direction.length();
            if( dist < this.range && dist > 150 )
            {
                direction.normalize();
                this.vel.x += direction.x * this.speed;
                this.vel.y += direction.y * this.speed;
                this.direction = direction;
                move = true;

                if ( this.shootTimer == 0 && dist > 50 )
                {
                    this.fireBullet();
                    this.shootTimer = 180;
                }
            }
        }

        if ( this.shootTimer > 0 )
            this.shootTimer--;

        if ( this.shootTimer > 135 )
        {
            this.setCurrentAnimation( this.directionString + "shoot" );
        }
        else if ( this.vel.x || this.vel.y )
        {
            this.setCurrentAnimation( this.directionString + "run" );
        }
        else
        {
            this.setCurrentAnimation( this.directionString + "idle" );
        }

        this.updateMovement();
        var move = ( this.vel.x || this.vel.y );
        if ( move )
            this.parent( this );
        return move;
    }
});

var Doctor = Hugger.extend(
{

});

var Boss = Enemy.extend(
{

});

var EnemyBullet = PlayerParticle.extend(
{
    init: function( x, y, sprite, spritewidth, speed, frames, type, collide, spriteheight )
    {
        this.parent( x, y, sprite, spritewidth, speed, frames, type, collide, spriteheight );
        this.gravity = 0;
        this.timer = 100;
        this.collidable = true;
        this.updateColRect( 12, 24, 12, 24 );
    },

    onCollision: function( res, obj )
    {
        console.log( "enemy bullet collision" );
        if ( obj == me.game.player )
            me.game.player.hit();
        me.game.remove( this );
    },

    update: function()
    {
        this.timer--;
        if ( this.timer == 0 ) me.game.remove( this );
        this.updateMovement();
        return this.parent( this );
    }
});
