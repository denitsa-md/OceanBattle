 
    var WIDTH = 900;
    var HEIGHT = 600;
    var DASHWIDTH = 300;
    var stage, dashInterface;
    var bgBitmap;
    var Submarine;
    var enemies = [], enemiesImg =[], mines = [];
    var speed = 2; speedWeapon = 1.5;
    var level = 1;
    var currTick = 0;
    var torpedos =[];
    var score = 0, lives = 3;
    var keys={
        up:false,
        down:false,
        left:false,
        right:false,
        space:false
    };
    var SingletonSubmarine = (function () {
        var instance;

        function createInstance(img) {
            var submarine = new createjs.Bitmap(img);
            return submarine;
        }

        return {
            getInstance: function (img) {
                if (!instance) {
                    instance = createInstance(img);
                }
                return instance;
            }
        };
    })();
    var start;
    var startScreen;
    var startImage;
    var preloadText;
    
    /*Dashboard vars*/
    var canvasDOM = $('#myGame');


    /*Level*/
    var levelDOM = $('#level');

    /*Score*/
    var scoreField = $('#score');
    var scoreText;


    /*Lives*/
    var livesDash = $("#lives");
    var livesIconSrc;

    /*Torpedoes Loaded*/
    var torpedoesDash = $("#torpedoes");
    var torpedoeIconSrc;
    var torpedoesTextDash = $("#torpedoesText");
    var currentTorpedoesLoaded = 2;

    /*Explosion Sprite*/

    var explosionSprite;

    /*Preloader*/
    var queue, manifest;
  

    /*Sounds*/
    var sonarSound, backgroundMusicSound;

    /***--- Main function---***/

    function init() {

        var canvas = document.getElementById('myGame');
//        var context = canvas.getContext('2d');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvas.setAttribute("tabindex", 0);
        stage = new createjs.Stage(canvas);
        start = new createjs.Bitmap("images/start.png");
        startImage = new createjs.LoadQueue(true);
        startImage.on("complete", loadStartScreen, this);
        startImage.loadFile({id:"startImage", src:"images/start.png"});

        console.log(start);
        stage.addChild(start);

       

        if (getCurrentLevel() === 1) {
//            canvasDom.one("keypress", preload);
            $(window).on("keydown", preload);     
        } else {
            preload();
        }

      }

      function loadStartScreen(event) {
        startScreen = new createjs.Bitmap(startImage.getResult("startImage"));
        stage.addChild(startScreen);  
        stage.update();
      } 
      
      
     /***--- Preloaders ---***/
      function preload() {
          
        $(window).off("keydown", preload);
                
        preloadText = new createjs.Text("Loading...", "30px Verdana", "#000");
        preloadText.textBaseline = "middle";
        preloadText.textAlign = "center";
        preloadText.x = stage.canvas.width/2;
        preloadText.y = stage.canvas.height/2;
        stage.removeChild(start);
        stage.addChild(preloadText);
        
        manifest = [
//Load images
            {id:"background", src:"images/background.jpg"},
            {id:"submarine", src:"images/submarine.png"},
            {id:"enemy1", src:"images/ship1.png"},
            {id:"enemy2", src:"images/ship2.png"},
            {id:"torpedo", src:"images/torpedo.png"},
            {id:"mine", src:"images/mine1.png"},
            {id:"torpedoDashboard", src:"images/torpedoDash.png"},
            {id:"livesDashboard", src:"images/heart.png"},   
            {id:"explosionSprite", src:"images/explosionSprite.png"},
            {id:"enemy3", src:"images/plane.png"},
            {id:"gameOver", src:"images/gameOver.png"},
            {id:"success", src:"images/success.png"},
            {id:"backgroundMusicSound", src:"sounds/backgroundMusic.mp3"},
            {id:"explosionSound", src:"sounds/explosion.mp3"},
            {id:"gameOverSound", src:"sounds/gameOver.mp3"},
            {id:"sonarSound", src:"sounds/sonar.mp3"},
            {id:"torpedoShotSound", src:"sounds/torpedoShot.mp3"},
            {id:"underwaterBomb", src:"sounds/underwaterBomb.mp3"},   
            {id:"torpedoShotSound", src:"sounds/torpedoShot.mp3"},
            {id:"winAlifeSound", src:"sounds/winAlife.mp3"},             
            {id:"winSound", src:"sounds/winSound.mp3"}
        ]
 //Load sounds

          
        queue = new createjs.LoadQueue(true); 
        createjs.Sound.alternateExtensions = ["ogg"];
        queue.installPlugin(createjs.Sound);
        queue.on("fileload", handleFileLoad, this);
        queue.on("progress", progress, this);
        queue.on("complete", gameLoaded, this);
        queue.loadManifest(manifest);

       
       

}

     function handleFileLoad(event) {

         var item = event.item; // A reference to the item that was passed in
         var id = item.id;
         var explosionSpriteData;
         // Add any images to the page body.

       if (id === "background") {
           bgBitmap = new createjs.Bitmap(queue.getResult("background"));
           bgBitmap.name = "imageBackground";
           stage.addChild(bgBitmap);
           stage.update();
        } else if (id.indexOf("enemy") >=0){
            enemiesImg.push(item);  
    //        console.log(
    //                item);
        } else if (id === "explosionSprite") {
            explosionSpriteData = {
                images: [queue.getResult("explosionSprite")],
                frames: {width:80, height:80, regX:40, regY:40},
                animations: {
                    'explode': {
                        frames: [1,2,3,4,5],
                        next: false,
                        speed: 0.5

                    }       
                } 
            };
             console.log("entered");
            explosionSprite = new createjs.SpriteSheet(explosionSpriteData);
        }

     }

    function progress(e) {
    //    canvasDOM.classList.remove('bg');
//        var percent = Math.round(e.progress*100);
//        stage.addChild(preloadText);
//        preloadText.text = "Loading..." + percent + "% \nPlease wait.";
//        setTimeout(stage.update(), 2000);
       // stage.update();
     }

    function gameLoaded() {

    //    bgBitmap = new createjs.Bitmap(queue.getResult("background"));
    //    bgBitmap.name = "imageBackground";
    //    stage.addChild(bgBitmap);
    //    stage.update();
        stage.removeChild(preloadText);
      //  console.log(stage.removeChild(preloadText));
        sonarSound = createjs.Sound.play("sonarSound");
        stage.update();
        
        createjs.Ticker.setFPS(30);
        
        createjs.Ticker.addEventListener('tick', tick);
       
        
        window.onkeyup = keyUp;
        window.onkeydown = keyDown;
        Submarine = submarineClass.create();
        stage.addChild(Submarine);
        Submarine.x = stage.canvas.width/2 - Submarine.width/2;
        Submarine.y = stage.canvas.height - Submarine.height - 20;

        stage.setChildIndex( Submarine, stage.getNumChildren()-1);
        levelDOM.text(getCurrentLevel());
        updateTorpedoesDashboard();
        updateScoreDashboard();
        loadTorpedoes();
        updateLives(lives);


    }


    /* GAME LOGIC*/

var firstShotMade = false;
    /***--- Submarine ---***/
    var submarineClass = {
        
        create: function () {
            var subImage = queue.getResult("submarine");
            var submarine = SingletonSubmarine.getInstance(subImage);
            submarine.width = 100;
            submarine.height = 21;
            return submarine;
        },

        move: function() {
            if (keys.left) {
                Submarine.x-=2;
                if (Submarine.x<0){
                    Submarine.x=0;
                }
            }

            if (keys.right) {
                Submarine.x+=2;
                if (Submarine.x > stage.canvas.width-Submarine.width){
                    Submarine.x = stage.canvas.width-Submarine.width;
                }
            }
        },

        shoot: function (){
            if (firstShotMade === false) {
                sonarSound.stop();
                backgroundMusicSound = createjs.Sound.play("backgroundMusicSound", {loop: -1});
                backgroundMusicSound.volume = 0.05;
                firstShotMade = true;
            }
            if (!stage.contains(Submarine)){
                return;
            }
            var torpedoImg = queue.getResult("torpedo"); 
            var torpedo = new createjs.Bitmap(torpedoImg);
            torpedo.y = Submarine.y;
            torpedo.x = Submarine.x+(Submarine.width/2);
            torpedo.width = 13;
            torpedo.height = 25;
            stage.addChild(torpedo);
            var torpedoShotSound = createjs.Sound.play("torpedoShotSound");       
            torpedos.push(torpedo);      
            currentTorpedoesLoaded--;
            updateTorpedoesDashboard();      
        } 
    };


    /***--- Submarine Torpedos ---***/
    var torpedoClass = {
        moveTorpedos: function() {
            if (torpedos.length > 0) { 
                for (var i = torpedos.length-1; i >= 0; i--) {
                    var torpedo = torpedos[i];
                   // torpedo.y -= speedWeapon;
                    if (torpedo.y < 230) {
                        torpedo.y -= speedWeapon+2.5;
                    } else {
                        torpedo.y -= speedWeapon;
                    }  
                    if(torpedo.y < -20){
                        torpedos.splice(i, 1); 

                    } else if (enemies.length>0){
                        for (var j = enemies.length-1; j >= 0; j--) {
                            var enemy = enemies[j];
                          if (hitTest(torpedo, enemy)) {
                              var explosionSound = createjs.Sound.play("explosionSound");
                              if ((lives < 3) && enemy.givesLife) {
                                  console.log("givesLife"+enemy.givesLife);
                                  addLife();
                                  lives++;
                              } else {
                                score += enemy.points;
                                updateScoreDashboard();   
                              }

                              this.makeExplosion(torpedo, enemy);
                              stage.removeChild(torpedo);                       
                              stage.removeChild(enemy);
                              torpedos.splice(i, 1);
                              enemies.splice(j, 1);
                          }
                        }
                    }
                }
            }        
        },

        makeExplosion: function(torpedo, enemy) {
            var explosion = new createjs.Sprite(explosionSprite, "explode");
            explosion.x = enemy.x+enemy.width/2;
            explosion.y = torpedo.y-5;
            stage.addChild(explosion);        
        }



    };

    /***--- Enemy Ships ---***/
    var enemyClass = {
        checkForNewEnemy: function(){
            var rand = Math.floor(Math.random()*2000);
            var enemy, temp;
            if ((ticking > currTick+250) && (rand < 50)) {

                switch(getCurrentLevel()) {
                    //Level 1 enemies
                    case 1:
                        enemy = enemiesImg[0];  
                        temp = new createjs.Bitmap(enemy.src);
                        if (enemy.id === "enemy1") {
                            temp = this.createEnemy1(temp);
                        }
                        console.log("enemy.id" + enemy.id);
                        stage.addChild(temp);
                        currTick = ticking;
                        enemies.push(temp);
                        break;   
                    //Level 2 enemies    
                    case 2:
                        enemy = enemiesImg[Math.floor(Math.random()*enemiesImg.length-1)];
                        console.log("length" + enemiesImg.length);
                        console.log(enemy);

                        temp = new createjs.Bitmap(enemy.src);
                        if (enemy.id === "enemy1") {
                            temp = this.createEnemy1(temp);
                        } else if (enemy.id === "enemy2") {
                            temp = this.createEnemy2(temp);
                        } 
                        console.log("enemy.id" + enemy.id);
                        stage.addChild(temp);
                        currTick = ticking;
                        enemies.push(temp);
                        break; 
                    //Level 3 enemies
                    case 3:
                        enemy = enemiesImg[Math.floor(Math.random()*enemiesImg.length)];
                        console.log("enemy.id" + enemy.id);
                        temp = new createjs.Bitmap(enemy.src);
                        if (enemy.id === "enemy1") {
                            temp = this.createEnemy1(temp);
                        } else if (enemy.id === "enemy2") {
                            temp = this.createEnemy2(temp);
                        } else if (enemy.id === "enemy3") {
                            temp = this.createEnemy3(temp);
                        }
                        console.log("enemy.id" + enemy.id);
                        stage.addChild(temp);
                        currTick = ticking;
                        enemies.push(temp);
                        break;  
                }
            }        
        },

        createEnemy1: function(enemy){
            enemy.points = 5;
            enemy.width = 90;
            enemy.height = 24;
            enemy.x = -90;
            enemy.y = 218; 
            enemy.speed = 1;
            enemy.canShoot = false;
            enemy.givesLife = false;
            return enemy;
        },

        createEnemy2: function(enemy){
            enemy.points = 10;
            enemy.width = 100;
            enemy.height = 19;
            enemy.x = -100;
            enemy.y = 223; 
            enemy.speed = 1;
            enemy.canShoot = true;
            enemy.givesLife = false;
            return enemy;
        },

        createEnemy3: function(enemy){
            enemy.points = 15;
            enemy.width = 90;
            enemy.height = 33;
            enemy.x = -90;
            enemy.y = 50;
            enemy.speed = 2;
            enemy.canShoot = true;
            enemy.givesLife = true;
            return enemy;
        },

        move: function() {
            if (enemies.length > 0) {
                for (var i=enemies.length-1; i >=0 ; i--) {
                    enemies[i].x += enemies[i].speed;
                    if(enemies[i].x > stage.canvas.width) {
                        stage.removeChild(enemies[i]);
                        enemies.splice(i, 1);
                    }
                }   

                if (getCurrentLevel()>1) {
                    this.shoot();
                }

            }
        },

        shoot: function() {
            var mineImg = queue.getResult("mine");
            var rand = Math.floor(Math.random()*2000);
            var enemyRand = enemies[Math.floor(Math.random()*enemies.length)];

            if (rand <50) {      
                if (enemyRand.canShoot === true) {
                    var mine = new createjs.Bitmap(mineImg);
                    mine.x = enemyRand.x + enemyRand.width/2;
                    mine.y = enemyRand.y + enemyRand.height;
                    mine.width = 20;
                    mine.height = 20;
                    stage.addChild(mine);
                    mines.push(mine);
                    stage.update;   
                }

           }   
        }, 

        moveMines: function() {
            for (var i = mines.length-1; i >= 0; i--){
                var mine = mines[i];    
                mine.y += speedWeapon;
                if(mine.y > stage.canvas.height) {
                    stage.removeChild(mine);
                    mines.splice(i, 1);
                } 
                if (hitTest(Submarine, mine)) {
                    if (stage.contains(Submarine)) {
                        var explosion = new createjs.Sprite(explosionSprite, "explode");
                        explosion.x = Submarine.x+Submarine.width/2;
                        explosion.y = mine.y+5;
                        stage.removeChild(Submarine);
                        stage.addChild(explosion); 
                        var underwaterBomb = createjs.Sound.play("underwaterBomb");    
                        underwaterBomb.volume = 1;
                        lives--;
                        console.log("lives"+lives);
                        updateLives(lives);
                        stage.removeChild(mine);
                       // stage.addChild(Submarine);
                        mines.splice(i, 1);
                        setTimeout(function(){
                            stage.addChild(Submarine);                    
                        }, 3000);
                }
                }

            }
        }
       
    };

    /***--- Enemy Planes ---***/



    /***--- Utilities ---***/

    function hitTest(object1, object2) {
        if (object1.x >= object2.x + object2.width - 10
            || object1.x + object1.width <= object2.x + 10
            || object1.y >= object2.y + object2.height
            || object1.y + object1.height <= object2.y)
        {
            return false;
        }
        return true;        
    } 

    function randomIntFromInterval(min,max)
    {
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    /*Key Events*/
     function keyDown(keyEvent) {
        if (keyEvent.keyCode===37){
            keys.left = true;
        } 

        if (keyEvent.keyCode===39){
            keys.right = true;
        } 

        if (keyEvent.keyCode===38){
            keys.up = true;
        } 

        if (keyEvent.keyCode===40){
            keys.down = true;
        } 
    }

    function keyUp(keyEvent) {
        if (keyEvent.keyCode===32){
            if (currentTorpedoesLoaded!== 0) {
                submarineClass.shoot();
            }
        } 

        if (keyEvent.keyCode===37) {
            keys.left=false;
        }

        if (keyEvent.keyCode===39) {
            keys.right=false;
        }

        if (keyEvent.keyCode===38) {
            keys.up=false;
        }

        if (keyEvent.keyCode===40) {
            keys.down=false;
        }
    } 

    /* Update dashboard */

    function getCurrentLevel() {
        var currentLevel = level;
        return currentLevel;
    }

    function getCurrentSpeed() {
        var currentSpeed = parseInt(sessionStorage.getItem('speed'));
        return currentSpeed;
    }

    function updateScoreDashboard() {
         scoreText = score;
         scoreField.text(scoreText + "/30");
         if (score >= 30) {
            var levelToStore = getCurrentLevel()+1;
            if (levelToStore === 4) {
                var winSound = createjs.Sound.play("winSound"); 
                stopGame();
            }
            console.log("levelToStore" + levelToStore);
            level = levelToStore;
            levelDOM.text(getCurrentLevel());
            score = 0;
            scoreField.text(score +"/30");
        //    window.location.reload(false);
         }
    }

    function updateTorpedoesDashboard() {
        torpedoeIconSrc = (queue.getResult("torpedoDashboard")).src;
        var text;
        switch(currentTorpedoesLoaded) {
            case 0:
                $("#torpedoes img:last-child").remove();
                torpedoesTextDash.empty();
                text = "Reloading";
                torpedoesTextDash.append("<p>" + text + "</p>");
                setTimeout(function(){    
                    currentTorpedoesLoaded = 2;
                    loadTorpedoes();
                }, 5000);
                break;    
            case 1:
                $("#torpedoes img:last-child").remove();
                break;
        }
    }

    function loadTorpedoes() {
        torpedoesDash.append('<img src = ' + torpedoeIconSrc + '>');
        torpedoesDash.append('<img src = ' + torpedoeIconSrc + '>');
        torpedoesTextDash.empty();
        text = "Loaded";
        torpedoesTextDash.append("<p>" + text + "</p>");
    }

    function addLife(){
        livesIconSrc = (queue.getResult("livesDashboard").src);
        livesDash.append('<img src = ' + livesIconSrc + '>');
    }

    function updateLives(lives) {
        livesIconSrc = (queue.getResult("livesDashboard").src);
        switch(lives) {
            case 0:
                $("#lives img:last-child").remove();
                var gameOverSound = createjs.Sound.play("gameOverSound");
                stopGame();               
                break;
            case 1:
            case 2:
                $("#lives img:last-child").remove();
                break;
            case 3:
                for (var i = 0; i<3;i++) {
                    livesDash.append('<img src = ' + livesIconSrc + '>');
                }
                break;
        }
    }

    function stopGame(){
        createjs.Ticker.removeEventListener('tick', tick);
        if (lives<1) {
            var gameOverImg = queue.getResult("gameOver"); 
            var gameOver = new createjs.Bitmap(gameOverImg);
            stage.addChild(gameOver);
            stage.update();
        } else {
            var successImg = queue.getResult("success"); 
            var success = new createjs.Bitmap(successImg);
            stage.addChild(success);
            stage.update();
        }
        
        backgroundMusicSound.stop();
        stage.removeChild(Submarine);
        for (var i = 0; i<enemies.length; i++){
            stage.removeChild(enemies[i]);
            enemies.splice(i, 1);
        }

        resetButton();
        stage.update();  
    }

    function resetButton() {
            addButton = new createjs.Shape();
            var g = addButton.graphics;
            g.f("#39AAC2").drawRoundRect(0,0 ,140,50,5);
            addButton.x = stage.canvas.width/2 - 70;
            addButton.y = 300;
            stage.addChild(addButton);
            resetText = new createjs.Text("Start over.", "12px Verdana", "white");
            resetText.textBaseline = "alphabetic";
            resetText.textAlign = "center";
            resetText.x = addButton.x+70;
            resetText.y = addButton.y+25;
            stage.addChild(resetText);
            stage.update();
            addButton.on("click", reset);
            function reset(e) {
                    console.log("reset");
                    location.reload(true);
                    stage.update();
            }
    }


    var ticking = 0;
    function tick(e){
        ticking++;
        stage.update(e);
        submarineClass.move();
        enemyClass.checkForNewEnemy();
        torpedoClass.moveTorpedos();
        enemyClass.move();
        enemyClass.moveMines();
    }
