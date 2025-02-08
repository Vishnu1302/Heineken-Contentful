import { exec } from "child_process";
import path from "path";
import fs from "fs";

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { cmaToken, spaceId, targetEnv } = req.body;
    const mergeDir = path.resolve("./merge_data");
    const mergeFile = path.join(mergeDir, "merge-output.json");

    if (!spaceId || !targetEnv) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (!fs.existsSync(mergeFile)) {
        return res.status(404).json({ error: "Merge file not found. Run merge first." });
    }

    const command = `contentful-merge apply \
        --cma-token "${cmaToken}" \
        --space "${spaceId}" \
        --environment "${targetEnv}" \
        --file "${mergeFile}" \
        --yes`;

    console.log("Applying merge:", command);

    // ✅ Use exec with a timeout
    const process = exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
        if (error) {
            console.error("❌ Command execution error:", error.message);
            return res.status(500).json({ error: error.message });
        }
        if (stderr) {
            console.warn("⚠️ Command stderr:", stderr);
        }

        console.log("✅ Merge applied successfully");
        
        try {
            // ✅ Cleanup log files
            const logDir = path.resolve("./");
            const logFiles = fs.readdirSync(logDir);

            logFiles.forEach((file) => {
                if (file.startsWith("log-create-changeset") || file.startsWith("log-apply-changeset")) {
                    fs.unlinkSync(path.join(logDir, file));
                    console.log(`🗑️ Deleted ${file}`);
                }
            });

            // ✅ Cleanup merge_data folder
            if (fs.existsSync(mergeDir)) {
                fs.rmSync(mergeDir, { recursive: true, force: true });
                console.log("🗑️ Cleared merge_data folder");
            }
        } catch (cleanupError) {
            console.error("⚠️ Cleanup error:", cleanupError);
        }

        // ✅ Ensure response is sent
        res.status(200).json({
            message: "Merge applied successfully ✅",
            logs: stdout.split("\n").filter((line) => line.trim() !== ""),
        });
    });

    // ✅ Handle process timeout
    process.on("exit", (code) => {
        console.log(`⚡ Process exited with code: ${code}`);
    });

    process.on("error", (err) => {
        console.error("❌ Process error:", err);
        res.status(500).json({ error: "Process failed to execute" });
    });

    process.on("close", (code) => {
        console.log(`🔄 Process closed with code: ${code}`);
    });
}
