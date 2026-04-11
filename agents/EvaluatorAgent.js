export class EvaluatorAgent {
    evaluate(output) {
        return {
            safe: true,
            confidence: "medium",
            result: output
        };
    }
}
