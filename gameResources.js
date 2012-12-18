/*
 * gameResources.js
 *
 * Defines game resources (maps, images, sounds) for the game.
 *
 * @author Adhesion
 */

var gameResources = [
	{ name: "intro", type: "image", src: "data/intro.png" },
    { name: "introcta", type: "image", src: "data/introcta.png" },
    { name: "gameover", type: "image", src: "data/gameover.png" },
	
	{ name: "intro_bg", type: "image", src: "data/intro_bg.png" },
    { name: "intro_glasses1", type: "image", src: "data/intro_glasses1.png" },
    { name: "intro_glasses2", type: "image", src: "data/intro_glasses2.png" },
    { name: "intro_glasses3", type: "image", src: "data/intro_glasses3.png" },
    { name: "intro_glasses4", type: "image", src: "data/intro_glasses4.png" },
    { name: "intro_mars", type: "image", src: "data/intro_mars.png" },
    { name: "intro_radmars1", type: "image", src: "data/intro_radmars1.png" },
    { name: "intro_radmars2", type: "image", src: "data/intro_radmars2.png" },

    { name: "testenemy", type: "image", src: "data/tempenemy.png" },
    { name: "hugger", type: "image", src: "data/hugger.png" },
    { name: "pusher", type: "image", src: "data/pusher.png" },
    { name: "shooter", type: "image", src: "data/shooter.png" },
    { name: "doctor", type: "image", src: "data/doc.png" },
    { name: "boss", type: "image", src: "data/boss.png" },

    { name: "player", type: "image", src: "data/avatar.png" },
    { name: "enemy", type: "image", src: "data/tempenemy.png" },
    { name: "weakAttack", type: "image", src: "data/weakAttack.png" },
    { name: "strongAttack_front", type: "image", src: "data/strongAttack_front.png" },
    { name: "strongAttack_side", type: "image", src: "data/strongAttack_side.png" },
    { name: "tempAttack", type: "image", src: "data/tempattack.png" },
    { name: "headparticle", type: "image", src: "data/headParticle.png" },
    { name: "dash", type: "image", src: "data/dash.png" },
    { name: "shooterbullet", type: "image", src: "data/shooterBullet.png" },
    { name: "bossbullet", type: "image", src: "data/bossBullet.png" },
    { name: "die", type: "image", src: "data/die.png" },

    { name: "orb", type: "image", src: "data/orb.png" },
    { name: "lastorb", type: "image", src: "data/lastorb.png" },
    { name: "orblock", type: "image", src: "data/orblock.png" },

    { name: 'hdoor', type: 'image', src: 'data/door_horz.png' },
    { name: 'vdoor', type: 'image', src: 'data/door_vert.png' },

    { name: "collision_tiles", type: "image", src: "data/collision_tiles.png" },
    { name: "maptile", type: "image", src: "data/maptile.png" },
    { name: "maptile2", type: "image", src: "data/maptile2.png" },
    { name: "maptile3", type: "image", src: "data/maptile3.png" },
    { name: "corruption", type: "image", src: "data/corruption.png" },
    { name: "bg1", type: "image", src: "data/bg1.png" },
	{ name: "bg2", type: "image", src: "data/bg2.png" },
	{ name: "bg3", type: "image", src: "data/bg3.png" },

    { name: "level1", type: "tmx", src: "data/level1.tmx" },
    { name: "level2", type: "tmx", src: "data/level2.tmx" },
    { name: "level3", type: "tmx", src: "data/level3.tmx" },
    { name: "boxyrooms", type: "tmx", src: "data/boxyrooms.tmx" },
    { name: "testlevel", type: "tmx", src: "data/testlevel.tmx" },

    { name: "16x16_font", type: "image", src: "data/16x16_font.png" },
    { name: "32x32_font", type: "image", src: "data/32x32_font.png" },
    { name: "64x64_font", type: "image", src: "data/64x64_font.png" },

    { name: "bossdeath", type: "audio", src: "data/", channels : 2 },
    { name: "bullethit", type: "audio", src: "data/", channels : 2 },
    { name: "dash", type: "audio", src: "data/", channels : 2 },
    { name: "death", type: "audio", src: "data/", channels : 2 },
    { name: "door", type: "audio", src: "data/", channels : 2 },
    { name: "grab", type: "audio", src: "data/", channels : 2 },
    { name: "hit", type: "audio", src: "data/", channels : 2 },
    { name: "hugdeath", type: "audio", src: "data/", channels : 2 },
    { name: "orbdeath", type: "audio", src: "data/", channels : 2 },
    { name: "ping", type: "audio", src: "data/", channels : 2 },
    { name: "push", type: "audio", src: "data/", channels : 2 },
    { name: "pushdeath", type: "audio", src: "data/", channels : 2 },
    { name: "shoot", type: "audio", src: "data/", channels : 2 },
    { name: "shootdeath", type: "audio", src: "data/", channels : 2 },
    { name: "strongattack", type: "audio", src: "data/", channels : 2 },
    { name: "weakattack0", type: "audio", src: "data/", channels : 2 },
    { name: "weakattack1", type: "audio", src: "data/", channels : 2 },
    { name: "doctor", type: "audio", src: "data/", channels : 2 },
    { name: "bosshit", type: "audio", src: "data/", channels : 2 },
	
	{ name: "radmarslogo", type: "audio", src: "data/", channels : 2 },

    { name: "level1", type: "audio", src: "data/", channels : 2 },
    { name: "level2", type: "audio", src: "data/", channels : 2 },
    { name: "level3", type: "audio", src: "data/", channels : 2 },
    { name: "brinkintro", type: "audio", src: "data/", channels : 2 },
    { name: "gameover", type: "audio", src: "data/", channels : 2 }
];
