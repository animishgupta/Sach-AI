export const analyzeVideoIntegrity = async (frames) => {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ frames })
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
    catch (err) {
        console.error("Forensic analysis failed:", err);
        throw new Error(`FORENSIC_FAILURE: ${err.message || "Unknown error"}`);
    }
};
