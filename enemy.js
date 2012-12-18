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
        if( obj.type == "weakAttack" )
        {
            this.knockback( 1, 2.0, 30 );
        }
        else if ( obj.type == "strongAttack" )
        {
            this.knockback( 2, 10.0, 60 );
        }
        else if ( obj == me.game.player && me.game.player.isDashing() )
        {
            this.knockback( 0, 6.0, 0 );
        }
    },

    knockback: function( damage, amt, length )
    {
        this.hp -= damage;
        me.audio.play( "hit" );

        // death
        if ( this.hp <= 0 )
        {
            var dPosX = this.pos.x + ( this.width / 2 ) - 48;
            var dPosY = this.pos.y + ( this.height / 2 ) - 48;
            var deathPart = new PlayerParticle( dPosX, dPosY, "die", 96, 5, [ 0, 1, 2, 3, 4, 5 ], "", false );
            me.game.add( deathPart, this.z + 1 );
            me.game.remove( this );
            me.game.sort();
            me.audio.play( this.deathSound );
            return;
        }

        var knockback = amt;

        if ( length > 0 && amt > 0 )
        {
            this.setMaxVelocity( knockback, knockback );

            this.collidable = false;
            this.flicker( length, function()
            { this.setMaxVelocity( this.origVelocity, this.origVelocity );
                this.collidable = true; } );

            this.vel.x += this.toPlayer().x * knockback * -0.5;
            this.vel.y += this.toPlayer().y * knockback * -0.5;
        }
    },

    fireBullet: function( image, velMult )
    {
        // note collide is false as the player checks its own collision, bullet will be recipient & get oncollision call
        var bPosX = this.pos.x + ( this.width / 2 ) - 24;
        var bPosY = this.pos.y + ( this.height / 2 ) - 24;
        var bullet = new EnemyBullet( bPosX, bPosY, image || "shooterBullet", 48, 5, [ 0 ], "shooterBullet", false, 48 );
        var dir = this.toPlayer();
        dir.normalize();
        bullet.vel.x = dir.x * ( velMult || 5.0 );
        bullet.vel.y = dir.y * ( velMult || 5.0 );
        me.game.add( bullet, this.z + 1 );
        me.game.sort();
        me.audio.play( "shoot" );
    }
});

var Hugger = Enemy.extend({
    init: function( x, y, settings )
    {
        this.range = settings.range || 200;
        this.speed = settings.speed || .6;
        settings.image = settings.image || "hugger";
        this.parent( x, y, settings );

        this.hp = 3;

        this.setFriction( 0.35, 0.35 );

        this.isAttached = false;

        this.deathSound = "hugdeath";

        this.posDiffX = 0;
        this.posDiffY = 0;

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
            me.audio.play( "grab" );
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

        this.parent( x, y, settings );

        this.animationspeed = 3;

        this.pushTimer = 0;

        this.hp = 10;

        this.deathSound = "pushdeath";

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
            me.audio.play( "push" );
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

        this.hp = 7;

        this.setMaxVelocity( 3.0, 3.0 );

        this.deathSound = "shootdeath";

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

var Doctor = Enemy.extend(
{
    init: function( x, y, settings )
    {
		this.startX = x; 
		this.startY = y;
		
        this.range = settings.range || 20000;
        this.speed = settings.speed || 0.5;
        settings.spritewidth = settings.spritewidth || 144;
        settings.spriteheight = settings.spriteheight || 144;
        settings.image = settings.image || "doctor";
        this.parent( x, y, settings );

        this.setVelocity( 2.0, 2.0 );

        this.updateColRect( 36, 72, 10, 124 );

        this.soundTimer = 0;

        this.setFriction( 0.35, 0.35 );

        var directions = [ "down", "left", "up", "right" ];
        for ( var i = 0; i < directions.length; i++ )
        {
            var index = i * 3;
            this.addAnimation( directions[ i ] + "idle", [ index ] );
            this.addAnimation( directions[ i ] + "run",
                [ index, index + 1, index, index + 2 ] );
        }

        this.setCurrentAnimation( "downidle" );

        me.game.doctor = this;
        this.visible = false;
        this.collidable = false;
        this.enabled = false;
        //this.enable();
		
    },

    enable: function()
    {
        this.visible = true;
        this.enabled = true;
        this.flicker( 500, function() { this.collidable = true; } );
    },
	
	disable: function()
    {
		this.pos.x = this.startX;
		this.pos.y = this.startY;
        this.visible = false;
        this.enabled = false;
		
		var dPosX = this.pos.x + ( this.width / 2 ) - 48;
		var dPosY = this.pos.y + ( this.height / 2 ) - 48;
		var deathPart = new PlayerParticle( dPosX, dPosY, "die", 96, 5, [ 0, 1, 2, 3, 4, 5 ], "", false );
		me.game.add( deathPart, this.z + 1 );
		me.game.sort();
    },
	
    onCollision: function( res, obj )
    {
        if ( obj == me.game.player )
        {
            this.collidable = false;
            me.game.player.stunned = true;
            var duration = 2000;
            me.game.player.flicker( duration );
            var fade = '#000000';
            me.audio.play( "death" );
            me.game.viewport.fadeOut( fade, duration, function() {
                me.state.current().startLevel( me.levelDirector.getCurrentLevelId() );
            });
        }
        else if( obj.type == "weakAttack" )
        {
            this.knockback( 0, 0.7, 0 );
        }
        else if ( obj.type == "strongAttack" )
        {
            this.knockback( 0, 2.0, 10 );
        }
    },

    update: function()
    {
        this.updateDirectionString();

        if ( this.enabled )
        {
            if ( this.soundTimer == 0 )
            {
                me.audio.play( "doctor" );
                this.soundTimer = 90;
            }
            else
            {
                this.soundTimer--;
            }
        }

        if ( this.collidable )
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

var Boss = Enemy.extend(
{
    init: function( x, y, settings )
    {
        settings.image = "boss";
        settings.spritewidth = 192;
        settings.spriteheight = 240;
        this.parent( x, y, settings );

        this.hp = 30;

        this.gravity = 0;
		// frames to play expoding animation. 
		this.dieing = false;
		this.exploding = 250;

        this.deathSound = "bossdeath";

        this.shootTimer = 90;
        this.hitTimer = 0;

        this.addAnimation( "idle", [ 0, 0, 0, 1 ] );
        this.addAnimation( "shoot", [ 2 ] );
        this.addAnimation( "hit", [ 3 ] );
        this.addAnimation( "die", [ 0, 2, 3 ] );
    },

    onCollision: function( res, obj )
    {
        if ( obj.type == "weakAttack" || obj.type == "strongAttack" )
        {
            if( obj.type == "weakAttack" )
            {
                this.knockback( 1, 0.0, 0 );
            }
            else if ( obj.type == "strongAttack" )
            {
                this.knockback( 2, 0.0, 0 );
            }
            this.hitTimer = 10;
            this.collidable = false;

            me.audio.play( "bosshit" );
        }
    },

    knockback: function( damage, amt, length )
    {
        //this.parent( damage, amt, length );
        
		this.hp -= damage;
        me.audio.play( "hit" );

		if ( this.hp <= 0 && !this.dieing)
        {	
			me.audio.play( this.deathSound );
			this.dieing = true;
			this.setCurrentAnimation( "die" );
			this.hp = 1; 
			me.game.viewport.shake(10, this.exploding, me.game.viewport.AXIS.BOTH);
            // moved to 'update' --> see dieing part. 
			//console.log( "GAMEOVER" );
           // me.state.change( me.state.GAMEOVER );
        }
    },

    update: function()
    {
		if(this.dieing){
			this.exploding--;
			
			this.pos.x += Math.random()*2-1;
			this.pos.y += Math.random()*2-1;
			
			if(this.exploding % 5 == 0){
				var dPosX = this.pos.x + ( this.width / 2 ) - 48 + Math.random()* 200-100;
				var dPosY = this.pos.y + ( this.height / 2 ) - 48 + Math.random()* 200-100;
				var deathPart = new PlayerParticle( dPosX, dPosY, "die", 96, 5, [ 0, 1, 2, 3, 4, 5 ], "", false );
				me.game.add( deathPart, this.z + 1 );
				me.game.sort();
			}
			
			if(this.exploding <= 0){
				me.state.change( me.state.GAMEOVER );
			}
			
		}else{

			if ( this.shootTimer == 0 && this.toPlayer().length() < 1000 )
			{
				this.fireBullet( "bossBullet", 8.0 );
				this.shootTimer = 90;
			}
			else
				this.shootTimer--;

            if ( this.hitTimer > 0 )
            {
                this.setCurrentAnimation( "hit" );
                this.hitTimer--;
                if ( this.hitTimer == 0 )
                    this.collidable = true;
            }
			else if ( this.shootTimer > 40 )
			{
				this.setCurrentAnimation( "shoot" );
			}
			else
			{
				this.setCurrentAnimation( "idle" );
			}
		}

        return this.parent( this );
    }
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
        if ( obj == me.game.player )
        {
            me.game.player.hit();
            me.game.remove( this );
            me.audio.play( "bullethit" );
        }
    },

    update: function()
    {
        this.timer--;
        if ( this.timer == 0 ) me.game.remove( this );
        this.updateMovement();
        return this.parent( this );
    }
});
