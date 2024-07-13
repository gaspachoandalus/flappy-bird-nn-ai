import type p5 from "p5";
import { BirdWithBrain } from "./birdWithBrain";
import { DNABuilder, GeneticAlgorithm } from "./geneticAlgorithm";
import { Pipe } from "./pipe";

const POPULATION_SIZE = 300;
const TARGET_DISTANCE = 40000;
export const MAX_SPEED = 100;
const UPDATE_INTERVAL = 30;

class BirdWithBrainBuilder implements DNABuilder {
    constructor(private p: p5) {
    }

    getNew(): BirdWithBrain {
        return new BirdWithBrain(this.p);
    }
}

export class Simulation {
    birds: BirdWithBrain[] = [];
    pipes: Pipe[] = [];
    geneticAlgorithm: GeneticAlgorithm;

    private frameCount = 0;
    private distance = 0;
    private lastDistance = 0;
    private lastActiveBirds = 0;
    private bestDistance = 0;
    private _speedMultiplier = 1;
    private updateId: NodeJS.Timeout;
    private ended = false;
    
    constructor(private p: p5) {
    }

    get speedMultiplier() {
        return this._speedMultiplier;
    }

    set speedMultiplier(speedMultiplier: number) {
        this._speedMultiplier = speedMultiplier;
        this.restartLoop();
    }

    nextFrame() {
        clearTimeout(this.updateId);
        this.updateId = setTimeout(() => this.update(1), 0);
    }

    private restartLoop() {
        clearTimeout(this.updateId);
        this.updateId = setInterval(() => this.update(), this._speedMultiplier == MAX_SPEED ? 0 : UPDATE_INTERVAL);
    }

    init() {
        this.geneticAlgorithm = new GeneticAlgorithm(this.p, new BirdWithBrainBuilder(this.p));
        this.pipes.push(new Pipe(this.p));

        this.geneticAlgorithm.initPopulation(POPULATION_SIZE);
        this.birds = [...this.geneticAlgorithm.population as BirdWithBrain[]];

        this.updateId = setInterval(() => this.update(), UPDATE_INTERVAL);
    }

    end() {
        this.ended = true;
    }

    show() {
        this.p.background(0);

        // first birds are drawn in front
        // there's a gradient hue: from red (first), then green, then blue
        for (let i = this.birds.length - 1; i >= 0; i--) {
            this.p.colorMode(this.p.HSB);
            const color = this.p.color(this.p.map(i, 0, this.birds.length, 0, 360), 100, 100);
            this.birds[i].show(color);
        }

        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.show();
        }

        this.showDebug();
    }

    update(frames?: number) {
        const start = performance.now();
        for (let updateIterationsLeft = frames ?? this.speedMultiplier;
            updateIterationsLeft > 0 && performance.now() - start < 30;
            updateIterationsLeft--) {
            this.internalUpdate();
            this.handleGenerationEnd();
            this.injectPipe();
        }
    }

    private internalUpdate() {
        this.frameCount++;
        this.distance++;
        this.updateBirds();
        this.updatePipes();
    }

    private updateBirds() {

        // update and move birds
        for (let i = 0; i < this.birds.length; i++) {
            const bird = this.birds[i];
            bird.update();

            const shouldJump = bird.shouldJump(i, this.pipes[0].x, this.pipes[0].top);
            if (shouldJump) {
                bird.jump();
            }
        }
    }

    private updatePipes() {
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.update();

            for (let j = this.birds.length - 1; j >= 0; j--) {
                const hitResult = pipe.hits(this.birds[j]);
                if (hitResult.hit) {
                    const bird = this.birds.splice(j, 1)[0];
                    bird.distance -= hitResult.distanceToCenter;
                }
            }

            if (pipe.x + pipe.w < 0) {
                this.pipes.splice(i, 1);
            }
        }
    }

    injectPipe() {
        if (this.frameCount % 75 == 0) {
            this.pipes.push(new Pipe(this.p));
        }
    }

    showDebug() {
        const fps = this.p.frameRate();

        const text = [
            `fps ${fps.toFixed(1)}`,
            `speed ${this.speedMultiplier === MAX_SPEED ? "max" : ("x" + this.speedMultiplier)}`,
            `gen ${this.geneticAlgorithm.generation}`,
            `total birds ${this.geneticAlgorithm.population.length}`,
            `active birds ${this.birds.length}`,
            `distance ${this.distance}`,
            `last distance ${this.lastDistance} (${this.lastActiveBirds})`,
            `best distance ${this.bestDistance}`
        ];
        
        // transparent background
        this.p.noStroke();
        this.p.colorMode(this.p.RGB);
        this.p.fill(0, 0, 0, 255 * .5);
        this.p.rect(0, 0, 200, 15 + text.length * 15);

        // text
        this.p.fill(0, 255, 0);
        this.p.noStroke();
        text.forEach((str, i) => {
            this.p.text(str, 10, 15 + 15 * i);
        });
    }

    handleGenerationEnd() {
        if (this.birds.length === 0 || this.distance >= TARGET_DISTANCE) {
            this.buildNewGeneration();
        }
    }

    private buildNewGeneration() {
        this.pipes.splice(0, 1);

        this.lastDistance = this.distance;
        this.lastActiveBirds = this.birds.length;
        this.bestDistance = Math.max(this.bestDistance, this.distance);
        this.distance = 0;

        this.geneticAlgorithm.calcFitness(TARGET_DISTANCE);
        this.geneticAlgorithm.evaluate();
        this.geneticAlgorithm.naturalSelection();

        this.birds = [...this.geneticAlgorithm.population as BirdWithBrain[]];
    }
}