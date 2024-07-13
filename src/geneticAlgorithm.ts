import type p5 from "p5";
import { sumOfNSquares } from "./utils";

const MUTATION_RATE = 0.01;
const SURVIVAL_RATE = 0.05;
const RENEWAL_RATE = 0.05;

export interface DNA {
    fitness: number;
    calcFitness(target: number): void;
    crossover(partner: DNA): DNA;
    mutate(mutationRate: number): void;
    getPhenotype(): string;
    reset();
}

export interface DNABuilder {
    getNew(): DNA;
}

export class GeneticAlgorithm {
    population: DNA[];
    generations: number;
    mutationRate: number;
    best: string;

    constructor(private p: p5, private dnaBuilder: DNABuilder) {
        this.population = [];
        this.generations = 0;
        this.mutationRate = MUTATION_RATE;
    }

    get generation(): number {
        return this.generations;
    }

    initPopulation(size: number) {
        for (let i = 0; i < size; i++) {
            this.population.push(this.dnaBuilder.getNew());
        }
    }

    calcFitness(target: number) {
        this.population.forEach((dna) => {
            dna.calcFitness(target);
        });
    }

    /**
     * each rank has a probability of i^2 (1, 4, 9, 16, 25, ...)
     */
    private pickRandomByRank() {

        // Calculate selection probabilities (linear ranking)
        // const rankSum = sumOfNIntegers(this.population.length);
        const rankSum = sumOfNSquares(this.population.length);

        const rankProbabilities = Array.from({ length: this.population.length }, (_, index) => {
            // return (index + 1) / rankSum;
            return Math.pow((this.population.length - index), 2) / rankSum;
        });

        let index = 0;
        let r = this.p.random(1);
        while (r > 0) {
            r = r - rankProbabilities[index];
            index++;
        }
        index--;

        return this.population[index];
    }

    private pickRandom() {
        const totalFitness = this.population.reduce((acc, dna) => acc + dna.fitness, 0);

        let index = 0;
        let r = this.p.random(1);
        while (r > 0) {
            r = r - (this.population[index].fitness / totalFitness);
            index++;
        }
        index--;

        return this.population[index];
    }

    /**
     * replace current population with children from parents of the mating pool
     */
    naturalSelection() {

        // sort population by fitness (descending)
        this.population.sort((a, b) => b.fitness - a.fitness);

        // keep a portion of the population
        const keepCount = Math.floor(this.population.length * SURVIVAL_RATE);
        const newCount = Math.floor(this.population.length * RENEWAL_RATE);
        const crossCount = this.population.length - keepCount - newCount;

        const newPopulation = this.population.slice(0, keepCount);
        for (let i = 0; i < keepCount; i++) {
            newPopulation[i].reset();
        }

        // create rest of the population by crossover and mutation
        for (let i = 0; i < crossCount; i++) {
            const partnerA = this.pickRandomByRank();
            const partnerB = this.pickRandomByRank();
            const child = partnerA.crossover(partnerB);
            child.mutate(this.mutationRate);
            newPopulation.push(child);
        }
        
        this.population = newPopulation;

        // add new specimens
        this.addNewSpecimens(newCount);

        this.generations++;
    }

    private addNewSpecimens(count: number) {
        // replace last 5% of the population with new random specimens
        for (let i = 0; i < count; i++) {
            this.population.push(this.dnaBuilder.getNew());
        }
    }

    evaluate() {
        const { index } = this.population.reduce((acc, dna, i) => {
            if (dna.fitness > acc.worldrecord) {
                return { index: i, worldrecord: dna.fitness };
            }
            return acc;
        }, { index: 0, worldrecord: 0.0 });

        this.best = this.population[index].getPhenotype();
    }

    getBest() {
        return this.best
    }
}