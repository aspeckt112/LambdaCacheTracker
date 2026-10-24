"use strict";

class InvalidGameStateError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidGameStateError";
    }
}

const GAME_STATE_DATA_PATTERN = /"data"\s*"([^"]+)"/;

const CHAPTERS = [
    {
        title: "A Red Letter Day",
        videoLink: "https://www.youtube.com/watch?v=8be_82sx5_w&t=0s",
        cacheCount: 1
    },
    {
        title: "Route Kanal",
        videoLink: "https://youtu.be/8be_82sx5_w?t=5",
        cacheCount: 7
    },
    {
        title: "Water Hazard",
        videoLink: "https://www.youtube.com/watch?v=8be_82sx5_w&t=76s",
        cacheCount: 10
    },
    {
        title: "Black Mesa East",
        videoLink: "https://www.youtube.com/watch?v=8be_82sx5_w&t=251s",
        cacheCount: 1
    },
    {
        title: "We Don't Go To Ravenholm",
        videoLink: "https://www.youtube.com/watch?v=8be_82sx5_w&t=260s",
        cacheCount: 4
    },
    {
        title: "Highway 17",
        videoLink: "https://www.youtube.com/watch?v=8be_82sx5_w&t=322s",
        cacheCount: 5
    },
    {
        title: "Sandtraps",
        videoLink: "https://www.youtube.com/watch?v=8be_82sx5_w&t=424s",
        cacheCount: 2
    },
    {
        title: "Nova Prospekt",
        videoLink: "https://www.youtube.com/watch?v=8be_82sx5_w&t=465s",
        cacheCount: 3
    },
    {
        title: "Entanglement",
        videoLink: "https://www.youtube.com/watch?v=8be_82sx5_w&t=496s",
        cacheCount: 1
    },
    {
        title: "Anticitizen One",
        videoLink: "https://www.youtube.com/watch?v=8be_82sx5_w&t=505s",
        cacheCount: 10
    },
    {
        title: "Follow Freeman",
        videoLink: "https://www.youtube.com/watch?v=8be_82sx5_w&t=636s",
        cacheCount: 1
    }
];

function readGameStateFromText(fileContent) {
    if (typeof fileContent !== "string") {
        throw new TypeError("File content must be a string");
    }

    if (fileContent.trim() === "") {
        throw new InvalidGameStateError("Game state file is empty");
    }

    const match = fileContent.match(GAME_STATE_DATA_PATTERN);

    if (match === null) {
        throw new InvalidGameStateError("Game state data not found in file");
    }

    return match[1];
}

async function readGameStateFromFile(file) {
    if (file === null || file === undefined) {
        throw new TypeError("File is required");
    }

    const fileContent = await file.text();

    return readGameStateFromText(fileContent);
}

function parseGameStateHex(gameState) {
    const value = gameState.trim();

    // Hex is zero padded 16 character hexadecimal, optionally prefixed with 0x.
    if (!/^(?:0[xX])?[0-9a-fA-F]{1,16}$/.test(value)) {
        throw new InvalidGameStateError("Uploaded game state is not a valid hexadecimal value");
    }

    return BigInt("0x" + value.replace(/^0[xX]/, ""));
}

function buildObtainedCaches(gameState) {
    if (gameState === null || gameState === undefined) {
        throw new TypeError("Game state is required");
    }

    if (typeof gameState !== "string" || gameState.trim() === "") {
        throw new TypeError("Game state must be a non-empty string");
    }

    const gameStateHex = parseGameStateHex(gameState);
    let cacheNumber = 0;

    return CHAPTERS.map(function (chapter) {
        const caches = [];

        for (let i = 0; i < chapter.cacheCount; i++) {
            cacheNumber++;

            const obtained = ((gameStateHex >> BigInt(cacheNumber - 1)) & 1n) === 1n;

            caches.push({ number: cacheNumber, obtained: obtained });
        }

        return {
            title: chapter.title,
            videoLink: chapter.videoLink,
            caches: caches
        };
    });
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        InvalidGameStateError: InvalidGameStateError,
        readGameStateFromText: readGameStateFromText,
        readGameStateFromFile: readGameStateFromFile,
        buildObtainedCaches: buildObtainedCaches
    };
}
