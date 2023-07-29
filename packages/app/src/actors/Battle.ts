import * as ex from 'excalibur';
import { ExcaliburGraphicsContext } from 'excalibur';

export class Battle extends ex.Actor {
    constructor(x: number, y: number, public pubkey: string) {
        super({
            name: 'Battle',
            anchor: ex.Vector.Zero,
            pos: new ex.Vector(x, y),
            scale: new ex.Vector(1, 1),
            width: 100,
            height: 40,
            //collider: ex.Shape.Box(20 * cols, 15 * rows, ex.Vector.Zero),
            //collisionType: ex.CollisionType.Fixed,
            //collisionGroup: ex.CollisionGroupManager.groupByName("floor"),
        });
        this.graphics.add(
            new ex.Rectangle({
                lineWidth: 2,
                width: 70,
                height: 24,
                color: ex.Color.Green
            })
        );
        this.graphics.anchor = new ex.Vector(0.5,1);
        this.graphics.add(
            new ex.Text({
                text: pubkey.slice(0, 4) + ".." + pubkey.slice(pubkey.length - 4)
            })
        );
    }
}
