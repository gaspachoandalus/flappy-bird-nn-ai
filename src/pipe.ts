import type p5 from 'p5';
import { Bird } from './bird';

const PIPE_SPACING = 130;

export class Pipe {
    spacing: number;
    top: number;
    bottom: number;
    x: number;
    w: number;
    speed: number;

    highlight = false;

    constructor(private p: p5) {
        this.spacing = PIPE_SPACING;
        this.top = p.random(p.height / 6, (3 / 4) * p.height);
        this.bottom = p.height - (this.top + this.spacing);
        this.x = p.width;
        this.w = 80;
        this.speed = 6;
    }

    hits(bird: Bird): { hit: boolean, distanceToCenter: number } {
        if (bird.y < this.top || bird.y > this.p.height - this.bottom) {
            if (bird.x > this.x && bird.x < this.x + this.w) {
                this.highlight = true;
                return {
                    hit: true,
                    distanceToCenter: Math.abs(bird.x - this.x - this.w / 2)
                };
            }
        }
        this.highlight = false;
        return {
            hit: false,
            distanceToCenter: 0
        }
    }

    show() {
        this.p.fill(255);
        this.p.stroke(255);
        if (this.highlight) {
            this.p.fill(255, 0, 0);
        }
        this.p.rect(this.x, 0, this.w, this.top);
        this.p.rect(this.x, this.p.height - this.bottom, this.w, this.bottom);
    };

    update() {
        this.x -= this.speed;
    };

    offscreen() {
        if (this.x < -this.w) {
            return true;
        } else {
            return false;
        }
    };
}