const gridSize = 64;

class GameBehavior extends Sup.Behavior {
    stepDuration = 20;
    private currentTickStep = 0;
    private doubleBufferSwitch = false;    
    private nextRandom = false;

    playerPos = new Sup.Math.Vector2(18, 14);

    map: Sup.Actor;
    mapBuffer: Sup.Actor;

    sounds = { impulse1: new Sup.Audio.SoundPlayer("Impulse"),
             impulse2: new Sup.Audio.SoundPlayer("Impulse2"),
             impulse3: new Sup.Audio.SoundPlayer("Impulse3"),
             impulse4: new Sup.Audio.SoundPlayer("Impulse4")};
  
    awake() {
        this.map = Sup.getActor("tileMap");
        this.mapBuffer = Sup.getActor("tileMapBuffer");
        
        for (let lin = 0; lin < gridSize; lin += 1) {
            for (let col = 0; col < gridSize; col += 1) {
                this.mapBuffer.tileMapRenderer.getTileMap().setTileAt(0, col, lin, this.map.tileMapRenderer.getTileMap().getTileAt(0, col, lin));
            }
        }
    }

    update() {
        if (Sup.Input.wasKeyJustPressed("R")) {
            this.nextRandom = true;
        }
        
        if (this.currentTickStep >= this.stepDuration) {
            this.currentTickStep = 0;
            let tileMap: Sup.TileMap;
            let tileMapBuffer: Sup.TileMap;
            
            if (this.doubleBufferSwitch) {
                tileMap = this.mapBuffer.tileMapRenderer.getTileMap();
                tileMapBuffer = this.map.tileMapRenderer.getTileMap();
                this.mapBuffer.setLocalZ(-1);
            }
            else {
                tileMap = this.map.tileMapRenderer.getTileMap();
                tileMapBuffer = this.mapBuffer.tileMapRenderer.getTileMap();
                this.mapBuffer.setLocalZ(1);
            }
            this.doubleBufferSwitch = !this.doubleBufferSwitch;
            
            let moveRight = this.playerPos.x < gridSize - 1 && Sup.Input.isKeyDown("RIGHT");
            let moveLeft = this.playerPos.x > 0 && Sup.Input.isKeyDown("LEFT") && !moveRight;
            let moveUp = this.playerPos.y < gridSize - 1 && Sup.Input.isKeyDown("UP") && !moveLeft && !moveRight;
            let moveDown = this.playerPos.y > 0 && Sup.Input.isKeyDown("DOWN") && !moveUp && !moveLeft && !moveRight;
            
            let bornCount = 0;
            
            for (let lin = 0; lin < gridSize; lin += 1) {
                for (let col = 0; col < gridSize; col += 1) {
                    let currentCellState: number;
                    let neighbourCount = 0;
                    
                    let isPlayer = col == this.playerPos.x && lin == this.playerPos.y;
                    let willMoveRight = col == (this.playerPos.x + (moveRight ? 1 : 0)) && lin == this.playerPos.y;
                    let willMoveLeft = col == (this.playerPos.x + (moveLeft ? -1 : 0)) && lin == this.playerPos.y;
                    let willMoveUp = col == this.playerPos.x && lin == (this.playerPos.y + (moveUp ? 1 : 0));
                    let willMoveDown = col == this.playerPos.x && lin == (this.playerPos.y + (moveDown ? -1 : 0));
                    
                    if (isPlayer) {
                        if (moveRight || moveLeft || moveUp || moveDown) {
                            tileMapBuffer.setTileAt(0, col, lin, 0);
                        }
                        else {
                            tileMapBuffer.setTileAt(0, col, lin, 2);
                        }
                    }
                    else if (willMoveRight|| willMoveLeft || willMoveUp || willMoveDown) {
                        tileMapBuffer.setTileAt(0, col, lin, 2);
                    }
                    else if (this.nextRandom) {
                        tileMapBuffer.setTileAt(0, col, lin, Math.round(Math.random()));
                    }
                    else {
                        for (let linOffset = -1; linOffset <= 1; linOffset += 1) {
                            for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
                                if (col + colOffset >= 0 &&
                                    col + colOffset < gridSize &&
                                    lin + linOffset >= 0 &&
                                    lin + linOffset < gridSize) {

                                    let cellState = tileMap.getTileAt(0, col+colOffset, lin+linOffset);
                                    if (colOffset == 0 && linOffset == 0) {
                                        currentCellState = cellState;
                                    }
                                    else if (cellState != 0) {
                                        neighbourCount += 1;
                                    }
                                }
                            }
                        }
                        
                        if (currentCellState == 0) {
                            if (neighbourCount == 3) {
                                tileMapBuffer.setTileAt(0, col, lin, 1);
                                bornCount += 1;
                            }
                            else {
                                tileMapBuffer.setTileAt(0, col, lin, currentCellState);
                            }
                        }
                        else if (currentCellState == 1) {
                            if (neighbourCount < 2 || neighbourCount > 3) {
                                tileMapBuffer.setTileAt(0, col, lin, 0);
                            }
                            else {
                                tileMapBuffer.setTileAt(0, col, lin, currentCellState);
                            }
                        }
                    }
                }
            }
            if (moveRight) {
                this.playerPos.x += 1;
            }
            else if (moveLeft) {
                this.playerPos.x -= 1;
            }
            else if (moveUp) {
                this.playerPos.y += 1;
            }
            else if (moveDown) {
                this.playerPos.y -= 1;
            }
            
            if (this.nextRandom) {
                this.nextRandom = false;
            }
            
            this.sounds.impulse1.stop();
            this.sounds.impulse1.setPitch(0.5 + Math.random());
            this.sounds.impulse1.setVolume(bornCount/100);
            this.sounds.impulse1.play();
                this.sounds.impulse2.stop();
                this.sounds.impulse2.setPitch(0.5 + Math.random());
                this.sounds.impulse2.setVolume((bornCount/100) - 0.1);
                this.sounds.impulse2.play();
            this.sounds.impulse3.stop();
            this.sounds.impulse3.setPitch(0.5 + Math.random());
            this.sounds.impulse3.setVolume((bornCount/100) - 0.2);
            this.sounds.impulse3.play();
                this.sounds.impulse4.stop();
                this.sounds.impulse4.setPitch(0.5 + Math.random());
                this.sounds.impulse4.setVolume((bornCount/100) - 0.3);
                this.sounds.impulse4.play();
            
        }
        this.currentTickStep += 1;
    }
}
Sup.registerBehavior(GameBehavior);
