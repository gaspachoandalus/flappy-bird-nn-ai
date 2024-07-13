import type p5 from "p5";
import { Bird } from "./bird";
import { DNA } from "./geneticAlgorithm";
import { NeuralNetwork } from "./neuralnetwork";

export class BirdWithBrain extends Bird implements DNA {
    fitness: number;
    private brain: NeuralNetwork;

    constructor(protected p: p5) {
        super(p);
        this.brain = new NeuralNetwork(4, 5, 1);
    }

    shouldJump(index: number, pipeX: number, pipeTop: number): boolean {
        const inputs = [
            this.p.map(pipeTop - this.y, 0, this.p.height / 2, 0, 1),
            this.p.map(pipeX - this.x, 0, this.p.width / 2, 0, 1),
            this.p.map(this.velocity, -10, 10, 0, 1),
            1
        ];

        const output = this.brain.feedforward(inputs);

        this.setDebug(`${index} ${output[0].toFixed(5)}`);
        return output[0] > 0.5;

    }

    calcFitness() {
        this.fitness = this.distance;
        this.distance = 0;
    }

    reset() {
        // this.distance = 0;
        // this.fitness = 0;
    }

    crossover(partner: BirdWithBrain): BirdWithBrain {
        const child = new BirdWithBrain(this.p);

        child.brain.weights_ih.set(0);
        child.brain.weights_ih.add(this.brain.weights_ih);
        child.brain.weights_ih.add(partner.brain.weights_ih);
        child.brain.weights_ih.multiply(0.5);

        child.brain.weights_ho.set(0);
        child.brain.weights_ho.add(this.brain.weights_ho);
        child.brain.weights_ho.add(partner.brain.weights_ho);
        child.brain.weights_ho.multiply(0.5);

        child.brain.bias_h.set(0);
        child.brain.bias_h.add(this.brain.bias_h);
        child.brain.bias_h.add(partner.brain.bias_h);
        child.brain.bias_h.multiply(0.5);

        child.brain.bias_o.set(0);
        child.brain.bias_o.add(this.brain.bias_o);
        child.brain.bias_o.add(partner.brain.bias_o);
        child.brain.bias_o.multiply(0.5);

        return child;
    }

    mutate(mutationRate: number): BirdWithBrain {

        const mutate = (value: number) => {
            if (this.p.random(1) < mutationRate) {
                return this.p.constrain(value + this.p.randomGaussian(0, .2), -1, 1);
            }
            return value;
        };

        this.brain.weights_ih.map(mutate);
        this.brain.weights_ho.map(mutate);
        this.brain.bias_h.map(mutate);
        this.brain.bias_o.map(mutate);
        return this;
    }

    getPhenotype(): string {
        return this.brain.saveModel();
    }

    setPhenotype(phenotype: string) {
        this.brain.loadModel(phenotype);
    }
}