import { Matrix } from './matrix';

export function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

export function dsigmoid(y) {
    // return sigmoid(x) * (1 - sigmoid(x));
    return y * (1 - y);
}

export class NeuralNetwork {
    input_nodes: number;
    hidden_nodes: number;
    output_nodes: number;
    weights_ih: Matrix;
    weights_ho: Matrix;
    bias_h: Matrix;
    bias_o: Matrix;
    learning_rate: number;

    constructor(input_nodes: number, hidden_nodes: number, output_nodes: number) {
        this.input_nodes = input_nodes;
        this.hidden_nodes = hidden_nodes;
        this.output_nodes = output_nodes;

        this.weights_ih = new Matrix(this.hidden_nodes, this.input_nodes);
        this.weights_ho = new Matrix(this.output_nodes, this.hidden_nodes);
        this.weights_ih.randomize();
        this.weights_ho.randomize();

        this.bias_h = new Matrix(this.hidden_nodes, 1);
        this.bias_o = new Matrix(this.output_nodes, 1);
        this.bias_h.randomize();
        this.bias_o.randomize();
        this.learning_rate = 0.1;
    }

    feedforward(input_array: number[]): number[] {

        // Generating the Hidden Outputs
        const inputs = Matrix.fromArray(input_array);
        const hidden = Matrix.multiply(this.weights_ih, inputs);
        hidden.add(this.bias_h);
        // activation function!
        hidden.map(sigmoid);

        // Generating the output's output!
        const output = Matrix.multiply(this.weights_ho, hidden);
        output.add(this.bias_o);
        output.map(sigmoid);

        // Sending back to the caller!
        return output.toArray();
    }

    saveModel() {
        const model = {
            weights_ih: this.weights_ih.data,
            weights_ho: this.weights_ho.data,
            bias_h: this.bias_h.data,
            bias_o: this.bias_o.data
        };
        return JSON.stringify(model, undefined, 2);
    }

    loadModel(model: string) {
        const obj = JSON.parse(model);
        this.weights_ih.data = obj.weights_ih;
        this.weights_ho.data = obj.weights_ho;
        this.bias_h.data = obj.bias_h;
        this.bias_o.data = obj.bias_o;
    }
    
    train(input_array: number[], target_array: number[]) {
        // Generating the Hidden Outputs
        const inputs = Matrix.fromArray(input_array);
        const hidden = Matrix.multiply(this.weights_ih, inputs);
        hidden.add(this.bias_h);
        // activation function!
        hidden.map(sigmoid);

        // Generating the output's output!
        const outputs = Matrix.multiply(this.weights_ho, hidden);
        outputs.add(this.bias_o);
        outputs.map(sigmoid);

        // Convert array to matrix object
        const targets = Matrix.fromArray(target_array);

        // Calculate the error
        // ERROR = TARGETS - OUTPUTS
        const output_errors = Matrix.subtract(targets, outputs);

        // let gradient = outputs * (1 - outputs);
        // Calculate gradient
        const gradients = Matrix.map(outputs, dsigmoid);
        gradients.multiply(output_errors);
        gradients.multiply(this.learning_rate);


        // Calculate deltas
        const hidden_T = Matrix.transpose(hidden);
        const weight_ho_deltas = Matrix.multiply(gradients, hidden_T);

        // Adjust the weights by deltas
        this.weights_ho.add(weight_ho_deltas);
        // Adjust the bias by its deltas (which is just the gradients)
        this.bias_o.add(gradients);

        // Calculate the hidden layer errors
        const who_t = Matrix.transpose(this.weights_ho);
        const hidden_errors = Matrix.multiply(who_t, output_errors);

        // Calculate hidden gradient
        const hidden_gradient = Matrix.map(hidden, dsigmoid);
        hidden_gradient.multiply(hidden_errors);
        hidden_gradient.multiply(this.learning_rate);

        // Calcuate input->hidden deltas
        const inputs_T = Matrix.transpose(inputs);
        const weight_ih_deltas = Matrix.multiply(hidden_gradient, inputs_T);

        this.weights_ih.add(weight_ih_deltas);
        // Adjust the bias by its deltas (which is just the gradients)
        this.bias_h.add(hidden_gradient);

        // outputs.print();
        // targets.print();
        // error.print();
    }

}