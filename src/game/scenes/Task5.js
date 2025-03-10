import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { typewriteText } from '../TypeWriter';
import { disableNarrator } from '../DisableNarrator';
export class Task5 extends Scene
{
    constructor ()
    {
        super('Task5');
    }

    preload ()
    {
        this.load.setPath('assets');
        
        this.load.image('task5', 'task5.png');
        this.load.spritesheet('robot', 'robot.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('taskMeta', 'taskcompleted.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('ground', 'ground.png');
        this.load.image('ziom', 'ziom.png');
    }

    create ()
    {
        const taskInfo = `This time, you have to get past this wall. Your objective is to disable it (so you can move past it). Good luck!`;

        this.add.image(0, 0, 'task5').setOrigin(0, 0);
        
        var platforms;
        platforms = this.physics.add.staticGroup();
        platforms.create(349, 776, "ground").setOrigin(0, 0).setScale(3.57, 0.5).refreshBody();
        // the wall that you have to delete (it is in the platforms group)
        this.wall = platforms.create(349, 400, "ground").setOrigin(0, 0).setScale(3.57, 0.5).refreshBody();
        this.wall.name = "wall";

        // taskMeta
        this.taskMeta = this.physics.add.sprite(850, 220, 'taskMeta');
        // narrator
        this.ziom = this.add.image(256, 594, 'ziom').setVisible(false);
        // player
        this.player = this.physics.add.sprite(850, 680, 'robot').setVisible(false);
        this.player.speed = 200;
        // physics settings
        this.physics.world.setBounds(349, 66, 1071, 732);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, platforms);
        this.physics.add.collider(this.taskMeta, platforms);
        this.player.body.setGravity(0, 0);
        this.physics.world.gravity.y = 0;
        this.player.setDamping(true);
        this.player.setDrag(1000);
        
        this.physics.add.overlap(this.player, this.taskMeta, () => {
            if (!this.sceneChanging) {  // Check if transition is already happening
                this.sceneChanging = true; // Set flag to prevent multiple triggers
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.time.delayedCall(500, () => {
                    disableNarrator(this);
                    EventBus.emit('back-button-pressed');
                    localStorage.setItem('Task5Completed', 'true');
                    this.scene.start('Game');
                    this.scene.stop('Task5');
                });
            }
        }, null, this);

        this.add.text(-80, 130, 'Back', {
            fontFamily: '"Pixelify Sans"',
            fontSize: '36px',
            color: '#ffffff',
            align: 'center',
            backgroundColor: '#3F414F'
        }).setOrigin(0.5)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                EventBus.emit('back-button-pressed');
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.time.delayedCall(500, () => {
                    disableNarrator(this);
                    this.scene.start('Game');
                    this.scene.stop('Task5');
                });
            })

        this.resumeButton = this.add.text(400, 650, 'Continue', { 
            fontFamily: '"Pixelify Sans"', 
            fontSize: '36px', 
            color: '#ffffff', 
            backgroundColor: '#3F414F' 
        }).setOrigin(0.5)
          .setInteractive()
          .setVisible(false) // Hide at first
          .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.player.setVisible(true);
                EventBus.emit("resume-typing"); // Resume typing when clicked
                this.resumeButton.setVisible(false);
          });

        this.narrator = this.add.text(260, 480, '', {
            fontFamily: '"Pixelify Sans"',
            fontSize: '28px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5).setInteractive()
        
        EventBus.on("show-resume-button", () => {
            this.resumeButton.setVisible(true);
        });

        // create cursors for keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // CONSOLE ARROWS FIX
        this.events.on('toggle-pause', (shouldPause) => {
            if (shouldPause) {
                this.physics.pause();
                this.input.keyboard.enabled = false;
                window.addEventListener('keydown', preventPhaserInput, true);
            } else {
                this.physics.resume();
                this.input.keyboard.enabled = true;
                window.removeEventListener('keydown', preventPhaserInput, true);
            }
        });

        function preventPhaserInput(event) {
            // Allow these keys inside the console
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Enter', ' '].includes(event.key)) {
                event.stopPropagation(); // Stop Phaser from capturing the event
            }
        }

        this.taskMeta.anims.play('taskMeta_move', true);

        // pass on the scene, emit an event that taskInfo has been updated
        EventBus.emit('task-info-updated', taskInfo);
        EventBus.emit('current-scene-ready', this);
        this.ziom.setVisible(true);
        typewriteText(this, "Check Task Info!~", this.narrator, this.ziom);
    }

    update (){
        // if the game is paused dont update anything
        if(this.isPaused) return;

        // Reset velocity before applying movement
        this.player.setVelocity(0);

        if (this.cursors.left.isDown && this.cursors.up.isDown) {
            this.player.setVelocityX(-this.player.speed);
            this.player.setVelocityY(-this.player.speed);
            this.player.anims.play('leftUp', true);
            return;
        }
        else if (this.cursors.right.isDown && this.cursors.up.isDown){
            this.player.setVelocityX(this.player.speed);
            this.player.setVelocityY(-this.player.speed);
            this.player.anims.play('up', true);
            return;
        }
        else if (this.cursors.right.isDown && this.cursors.down.isDown){
            this.player.setVelocityX(this.player.speed);
            this.player.setVelocityY(this.player.speed);
            this.player.anims.play('rightAndDown', true);
            return;
        }
        else if (this.cursors.left.isDown && this.cursors.down.isDown){
            this.player.setVelocityX(-this.player.speed);
            this.player.setVelocityY(this.player.speed);
            this.player.anims.play('left', true);
            return;
        }
        
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-this.player.speed);
            this.player.anims.play('left', true);
        } 
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(this.player.speed);
            this.player.anims.play('rightAndDown', true);
        }
        else if (this.cursors.up.isDown) {
            this.player.setVelocityY(-this.player.speed);
            this.player.anims.play('up', true);
        } 
        else if (this.cursors.down.isDown) {
            this.player.setVelocityY(this.player.speed);
            this.player.anims.play('rightAndDown', true);
        }
    }
}

