"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
    InvalidGameStateError,
    readGameStateFromText,
    buildObtainedCaches
} = require("../js/game-state.js");

function flattenCaches(chapters) {
    return chapters.flatMap((chapter) => chapter.caches);
}

function obtainedCacheNumbers(chapters) {
    return flattenCaches(chapters)
        .filter((cache) => cache.obtained)
        .map((cache) => cache.number);
}

test("readGameStateFromText throws when the file is empty", () => {
    assert.throws(() => readGameStateFromText(""), /Game state file is empty/);
    assert.throws(() => readGameStateFromText("   \n\t "), /Game state file is empty/);
});

test("readGameStateFromText throws when the data is not found", () => {
    assert.throws(
        () => readGameStateFromText('"GameState" { "1" { "id" "45" } }'),
        /Game state data not found in file/
    );
});

test("readGameStateFromText returns the game state", () => {
    const fileContent = [
        '"GameState"',
        "{",
        '\t"28"',
        "\t{",
        '\t\t"id"\t\t"86"',
        '\t\t"value"\t\t"0"',
        '\t\t"data"\t\t"0x00000008C2C5D3C1"',
        '\t\t"hud"\t\t"0"',
        '\t\t"msg"\t\t"0"',
        "\t}",
        "}"
    ].join("\n");

    assert.equal(readGameStateFromText(fileContent), "0x00000008C2C5D3C1");
});

test("buildObtainedCaches rejects a null game state", () => {
    assert.throws(() => buildObtainedCaches(null), TypeError);
});

test("buildObtainedCaches rejects an empty game state", () => {
    assert.throws(() => buildObtainedCaches(""), TypeError);
});

test("buildObtainedCaches rejects an invalid game state", () => {
    assert.throws(() => buildObtainedCaches("invalid"), InvalidGameStateError);
});

test("buildObtainedCaches returns eleven chapters", () => {
    assert.equal(buildObtainedCaches("0x0000000000000000").length, 11);
});

test("buildObtainedCaches numbers every cache from 1 to 45", () => {
    const chapters = buildObtainedCaches("0x0000000000000000");
    const numbers = flattenCaches(chapters).map((cache) => cache.number);

    assert.deepEqual(numbers, Array.from({ length: 45 }, (_, index) => index + 1));
});

test("buildObtainedCaches returns no obtained caches for zero", () => {
    const chapters = buildObtainedCaches("0x0000000000000000");

    assert.ok(flattenCaches(chapters).every((cache) => cache.obtained === false));
});

test("buildObtainedCaches returns every cache as obtained", () => {
    const chapters = buildObtainedCaches("0x00001FFFFFFFFFFF");

    assert.ok(flattenCaches(chapters).every((cache) => cache.obtained === true));
});

test("buildObtainedCaches returns only the first cache", () => {
    const caches = flattenCaches(buildObtainedCaches("0x0000000000000001"));

    assert.equal(caches[0].obtained, true);
    assert.ok(caches.slice(1).every((cache) => cache.obtained === false));
});

test("buildObtainedCaches returns only the second cache", () => {
    const caches = flattenCaches(buildObtainedCaches("0x0000000000000002"));

    assert.equal(caches[0].obtained, false);
    assert.equal(caches[1].obtained, true);
    assert.ok(caches.slice(2).every((cache) => cache.obtained === false));
});

test("buildObtainedCaches returns caches 6 to 10", () => {
    const caches = flattenCaches(buildObtainedCaches("0x00000000000003E0"));

    assert.ok(caches.slice(0, 5).every((cache) => cache.obtained === false));
    assert.ok(caches.slice(5, 10).every((cache) => cache.obtained === true));
    assert.ok(caches.slice(10).every((cache) => cache.obtained === false));
});

test("buildObtainedCaches returns caches 21 to 30", () => {
    const caches = flattenCaches(buildObtainedCaches("0x000000003FF00000"));

    assert.ok(caches.slice(0, 20).every((cache) => cache.obtained === false));
    assert.ok(caches.slice(20, 30).every((cache) => cache.obtained === true));
    assert.ok(caches.slice(30).every((cache) => cache.obtained === false));
});

test("buildObtainedCaches returns the caches in the sample file", () => {
    const obtained = obtainedCacheNumbers(buildObtainedCaches("0x00000008C2C5D3C1"));

    assert.deepEqual(obtained, [1, 7, 8, 9, 10, 13, 15, 16, 17, 19, 23, 24, 26, 31, 32, 36]);
});

test("buildObtainedCaches maps caches to the correct chapters", () => {
    const chapters = buildObtainedCaches("0x00001FFFFFFFFFFF");

    assert.deepEqual(
        chapters.map((chapter) => [chapter.title, chapter.caches.length]),
        [
            ["A Red Letter Day", 1],
            ["Route Kanal", 7],
            ["Water Hazard", 10],
            ["Black Mesa East", 1],
            ["We Don't Go To Ravenholm", 4],
            ["Highway 17", 5],
            ["Sandtraps", 2],
            ["Nova Prospekt", 3],
            ["Entanglement", 1],
            ["Anticitizen One", 10],
            ["Follow Freeman", 1]
        ]
    );
});
