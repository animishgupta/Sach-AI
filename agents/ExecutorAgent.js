import { analyzeVideoIntegrity } from "../services/geminiService";
export class ExecutorAgent {
    async execute(task, data) {
        switch (task) {
            case "analyze_media":
                return await analyzeVideoIntegrity(data);
            case "classify_theme":
                return data;
            case "extract_frames":
                return data;
            default:
                return data;
        }
    }
}
