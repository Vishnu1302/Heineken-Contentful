import { useState } from "react";
import { TextInput, Button, Spinner, Note, Card, Modal } from "@contentful/f36-components";

export default function Home() {
    const [cdaToken, setCdaToken] = useState("");
    const [cmaToken, setCmaToken] = useState(""); 
    const [spaceId, setSpaceId] = useState("");
    const [sourceEnv, setSourceEnv] = useState("");
    const [targetEnv, setTargetEnv] = useState("");
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showRetryModal, setShowRetryModal] = useState(false); 

    const handleMerge = async () => {
        setLogs([]);
        setLoading(true);
    
        try {
            const response = await fetch("/api/merge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ spaceId, sourceEnv, targetEnv, cdaToken }),
            });
    
            const data = await response.json();
    
            if (response.ok && data.logs && data.logs.length > 0) {
                setLogs(data.logs);
            } else {
                setLogs(["Merge failed: " + (data.error || "Unknown error.")]);
                setShowRetryModal(true);
            }
        } catch (error) {
            setLogs(["Error: Unable to execute merge"]);
            setShowRetryModal(true);
        } finally {
            setLoading(false);
        }
    };
    
    const handleApplyMerge = async () => {
        setLogs([]);
        setLoading(true);

        try {
            const response = await fetch("/api/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ spaceId, targetEnv, cmaToken }),
            });

            const data = await response.json();

            if (response.ok && data.logs && data.logs.length > 0) {
                setLogs(data.logs);
                alert("Merge applied successfully!");
            } else {
                setLogs(["Apply Merge failed. Check logs."]);
            }
        } catch (error) {
            setLogs(["Error: Unable to apply merge"]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "800px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Merge Section */}
            <div>
                <h2>Run Merge</h2>
                <TextInput placeholder="CDA Token" value={cdaToken} onChange={(e) => setCdaToken(e.target.value)} />
                <TextInput placeholder="Space ID" value={spaceId} onChange={(e) => setSpaceId(e.target.value)} />
                <TextInput placeholder="Source Environment" value={sourceEnv} onChange={(e) => setSourceEnv(e.target.value)} />
                <TextInput placeholder="Target Environment" value={targetEnv} onChange={(e) => setTargetEnv(e.target.value)} />
                <Button onClick={handleMerge} isDisabled={loading} style={{ marginTop: "10px" }}>
                    {loading ? <Spinner size="small" /> : "Run Merge"}
                </Button>
            </div>

            {/* Apply Merge Section */}
            <div>
                <h2>Apply Merge</h2>
                <TextInput placeholder="CMA Token" value={cmaToken} onChange={(e) => setCmaToken(e.target.value)} />
                <Button onClick={handleApplyMerge} isDisabled={loading || !cmaToken} style={{ marginTop: "10px" }}>
                    {loading ? <Spinner size="small" /> : "Apply Merge"}
                </Button>
            </div>

            {/* Logs Section */}
            <Card style={{ gridColumn: "span 2", marginTop: "20px", padding: "10px" }}>
                <h3>Logs</h3>
                <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                    {logs.length > 0 ? logs.join("\n") : "No logs yet."}
                </pre>
            </Card>

            {showRetryModal && (
                <Modal onClose={() => setShowRetryModal(false)} isShown={true} title="Merge Failed">
                    <p>Do you want to retry running the merge?</p>
                    <Button onClick={() => { setShowRetryModal(false); handleMerge(); }}>Retry</Button>
                </Modal>
            )}
        </div>
    );
}
