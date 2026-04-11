import { analyzeVideoIntegrity } from "../services/geminiService";
export class ExecutorAgent {
    async execute(task, data) {
        switch (task) {
            case "analyze_media":
                // data is already VideoFrame[]
                return await analyzeVideoIntegrity(data);
            case "classify_theme":
                // Theme is already decided by forensic verdict
                return data;
            case "extract_frames":
                // Already handled in VideoProcessor
                return data;
            default:
                return data;
        }
    }
}
