import type p5 from "p5";

export class Bird {
    y: number;
    x: number;
    gravity: number;
    lift: number;
    velocity: number;
    disabled: boolean;
    distance: number;
    debugStr: string;

    constructor(protected p: p5) {
        this.y = p.height / 2;
        this.x = 64;
        this.disabled = false;

        this.gravity = 0.7;
        this.lift = -12;
        this.velocity = 0;

        this.distance = 0;
    }

    setDebug(str: string) {
        this.debugStr = str;
    }

    show(color?: p5.Color) {
        const alpha = 255 * .9;
        this.p.noStroke();
        const colorWithAlpha = this.p.color(color)
        colorWithAlpha.setAlpha(alpha);
        this.p.fill(colorWithAlpha);
        
        this.p.ellipse(this.x, this.y, 32);

        this.debugDisplay(colorWithAlpha);
    }

    private debugDisplay(color: p5.Color) {
        // velocity arrow
        this.p.stroke(color);
        this.p.strokeWeight(3);
        this.p.line(this.x, this.y, this.x, this.y + this.velocity * 5);

        // debug string
        if (this.debugStr) {
            this.p.noStroke();
            this.p.text(this.debugStr, this.x + 20, this.y + 15);
        }
    }

    jump() {
        this.velocity = this.lift;
    }

    isEnabled() {
        return !this.disabled;
    }

    disable() {
        this.disabled = true;
    }

    update() {
        this.distance++;
        this.velocity += this.gravity;

        this.y += this.velocity;

        if (this.y > this.p.height) {
            this.y = this.p.height;
            this.velocity = 0;
        }

        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    };
}