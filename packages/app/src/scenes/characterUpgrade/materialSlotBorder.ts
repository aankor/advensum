import { Actor, Color, ImageSource, Rectangle, Sprite, vec } from 'excalibur';

export default class MaterialSlotBorder extends Actor {
  constructor() {
    super({
      pos: vec(18, 348),
      width: 260,
      height: 260,
      anchor: vec(0, 0),
    });
  }

  onInitialize() {
    this.graphics.add(new Rectangle({
      width: 260,
      height: 260,
      color: Color.Transparent,
      lineWidth: 3,
      strokeColor: Color.Gray,
    }));
  }
}