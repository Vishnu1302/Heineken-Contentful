// import { exec } from "child_process";
// import path from "path";
// import fs from "fs";
// import process from "process";  

// export default function handler(req, res) {
//     if (req.method !== "POST") {
//         return res.status(405).json({ error: "Method not allowed" });
//     }

//     const { spaceId, sourceEnv, targetEnv, cdaToken } = req.body;

//     if (!spaceId || !sourceEnv || !targetEnv || !cdaToken) {
//         return res.status(400).json({ error: "Missing required fields" });
//     }

//     const outputDir = path.join(process.cwd(), "merge_data");
//     if (!fs.existsSync(outputDir)) {
//         fs.mkdirSync(outputDir);
//     }

//     const outputFilePath = path.join(outputDir, "merge-output.json");
//     const logFilePath = path.join(outputDir, "merge.log");

//     const command = `contentful-merge create \
//         --space "${spaceId}" \
//         --source "${sourceEnv}" \
//         --target "${targetEnv}" \
//         --cda-token "${cdaToken}" \
//         --output-file "${outputFilePath}" \
//         --request-batch-size=10 > ${logFilePath} 2>&1` ;

//     console.log("Running command:", command);

//     exec(command, (error, stdout, stderr) => {
//         if (error) {
//             return res.status(500).json({ error: error.message });
//         }

//         res.status(200).json({
//             logs: fs.readFileSync(logFilePath, "utf8").split("\n").filter((line) => line.trim() !== ""),
//             mergeFile: outputFilePath,
//         });
//     });
// }

import { exec } from "child_process";
import path from "path";
import fs from "fs";

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { spaceId, sourceEnv, targetEnv, cdaToken } = req.body;

    if (!spaceId || !sourceEnv || !targetEnv || !cdaToken) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const outputDir = "/tmp"; // ✅ Use /tmp instead of process.cwd()
    const outputFilePath = path.join(outputDir, "merge-output.json");
    const logFilePath = path.join(outputDir, "merge.log");

    const command = `contentful-merge create \
        --space "${spaceId}" \
        --source "${sourceEnv}" \
        --target "${targetEnv}" \
        --cda-token "${cdaToken}" \
        --output-file "${outputFilePath}" \
        --request-batch-size=10 > ${logFilePath} 2>&1`;

    console.log("Running command:", command);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({
            logs: fs.readFileSync(logFilePath, "utf8").split("\n").filter((line) => line.trim() !== ""),
            mergeFile: outputFilePath,
        });
    });
}
