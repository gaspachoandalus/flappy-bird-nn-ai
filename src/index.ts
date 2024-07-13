import type P5 from "p5"
import { MAX_SPEED, Simulation } from "./simulation";

let simulation: Simulation;

export const sketch = (p: P5) => {
  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    simulation = new Simulation(p);
    simulation.init();
  }

  p.keyPressed = () => {
    if (p.key == " ") {
      simulation.speedMultiplier = simulation.speedMultiplier == 0 ? 1 : 0;
    }
    else if (p.keyCode == p.LEFT_ARROW) {
      if (simulation.speedMultiplier > 0) {
        simulation.speedMultiplier--;
      }
    }
    else if (p.keyCode == p.RIGHT_ARROW) {
      if (simulation.speedMultiplier == 0) {
        simulation.nextFrame();
      }
      else if (simulation.speedMultiplier < MAX_SPEED) {
        simulation.speedMultiplier++;
      }
    }
    else if (p.key == "f") {
      simulation.speedMultiplier = simulation.speedMultiplier == 1 ? MAX_SPEED : 1;
    }
    else if (p.key == "s") {
      console.log("Saving model");
      localStorage.setItem("best", simulation.geneticAlgorithm.getBest());
    }
    else if (p.key == "l") {
      console.log("Loading model");
      simulation.birds[0].setPhenotype(localStorage.getItem("best"));
    }
    else if (p.key == "q") {
      simulation.end();
      console.log("simulation ended");
      p.noLoop();
    }
  }

  p.draw = () => {
    if (simulation.speedMultiplier >= MAX_SPEED) {
      p.background(0);
      simulation.showDebug();
    }
    else {
      simulation.show();
    }
  }

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };
};

declare function p5(sketch: (p: P5) => void, node: HTMLElement): void;

export const myp5 = new p5(sketch, document.body);
