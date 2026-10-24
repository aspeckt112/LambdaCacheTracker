"use strict";

document.getElementById("file-upload").addEventListener("change", function () {
    let submitEvent = new Event("submit", { bubbles: true, cancelable: true });
    document.getElementById("uploadForm").dispatchEvent(submitEvent);
});

document.getElementById("uploadForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const file = this.elements.Upload.files[0];

    if (!file) {
        alert("No file was uploaded");
        return;
    }

    try {
        const gameState = await readGameStateFromFile(file);
        await fetchCaches(gameState);
    } catch (error) {
        if (error instanceof InvalidGameStateError) {
            alert(error.message);
        } else if (error instanceof TypeError) {
            alert("An unexpected error occurred while processing the uploaded file");
        } else {
            console.error("Error during form submission:", error);
            alert("An error occurred while submitting the form.");
        }
    }
});

async function fetchCaches(gameState) {
    let chapters;

    try {
        chapters = buildObtainedCaches(gameState);
    } catch (error) {
        console.error("Error fetching caches:", error);
        alert("Failed to fetch caches");
        return;
    }

    try {
        const container = document.getElementById("caches");
        const summary = summariseCaches(chapters);

        container.replaceChildren(renderChapters(chapters, summary));
        announceSummary(summary);

        requestAnimationFrame(function () {
            const heading = container.querySelector("h2");

            if (!heading) {
                return;
            }

            const reduceMotion = typeof window.matchMedia === "function" &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            heading.scrollIntoView({
                behavior: reduceMotion ? "auto" : "smooth",
                block: "start"
            });
        });
    } catch (error) {
        console.error("Error fetching caches:", error);
        alert("An error occurred while fetching caches.");
    }
}

function summariseCaches(chapters) {
    let total = 0;
    let found = 0;
    let firstIncompleteChapter = null;

    for (const chapter of chapters) {
        const foundInChapter = chapter.caches.filter(function (cache) {
            return cache.obtained;
        }).length;

        total += chapter.caches.length;
        found += foundInChapter;

        if (firstIncompleteChapter === null && foundInChapter < chapter.caches.length) {
            firstIncompleteChapter = chapter;
        }
    }

    return {
        total: total,
        found: found,
        missing: total - found,
        percentage: total === 0 ? 0 : Math.round((found / total) * 100),
        firstIncompleteChapter: firstIncompleteChapter
    };
}

function announceSummary(summary) {
    const status = document.getElementById("cache-status");

    if (!status) {
        return;
    }

    status.textContent = summary.found === summary.total
        ? "Found all " + summary.total + " lambda caches. Lambda Locator complete."
        : "Found " + summary.found + " of " + summary.total + " lambda caches.";
}

function renderChapters(chapters, summary) {
    const wrapper = document.createElement("div");
    wrapper.className = "results";

    const heading = document.createElement("h2");
    heading.textContent = "Your caches";
    wrapper.appendChild(heading);

    wrapper.appendChild(createSummary(summary));

    const list = document.createElement("div");
    list.className = "chapters";

    for (const chapter of chapters) {
        list.appendChild(createChapterCard(chapter));
    }

    wrapper.appendChild(list);

    return wrapper;
}

function createSummary(summary) {
    const card = document.createElement("div");
    card.className = "results-summary";

    const numbers = document.createElement("p");
    numbers.className = "summary-numbers";

    const foundValue = document.createElement("strong");
    foundValue.textContent = summary.found;
    numbers.appendChild(foundValue);
    numbers.appendChild(document.createTextNode(" / " + summary.total + " found"));

    const percentage = document.createElement("span");
    percentage.className = "summary-percent";
    percentage.textContent = summary.percentage + "%";
    numbers.appendChild(percentage);

    card.appendChild(numbers);

    const track = document.createElement("div");
    track.className = "progress-track";
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-label", "Lambda caches found");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", String(summary.total));
    track.setAttribute("aria-valuenow", String(summary.found));
    track.setAttribute(
        "aria-valuetext",
        summary.found + " of " + summary.total + " lambda caches found"
    );

    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = summary.percentage + "%";
    track.appendChild(fill);

    card.appendChild(track);

    const copy = document.createElement("p");
    copy.className = "summary-copy";

    if (summary.found === summary.total) {
        copy.textContent = "That's all of them — Lambda Locator complete.";
    } else if (summary.found === 0) {
        copy.textContent = "No caches found yet.";
    } else {
        copy.textContent = summary.missing +
            (summary.missing === 1 ? " cache still missing." : " caches still missing.");
    }

    card.appendChild(copy);

    if (summary.firstIncompleteChapter) {
        const next = document.createElement("p");
        next.className = "summary-next";

        const link = document.createElement("a");
        link.href = "#" + chapterId(summary.firstIncompleteChapter);
        link.textContent = (summary.found === 0 ? "Start with " : "Next missing chapter: ") +
            summary.firstIncompleteChapter.title;

        next.appendChild(link);
        card.appendChild(next);
    }

    return card;
}

function createChapterCard(chapter) {
    const foundInChapter = chapter.caches.filter(function (cache) {
        return cache.obtained;
    }).length;
    const totalInChapter = chapter.caches.length;
    const complete = foundInChapter === totalInChapter;

    const card = document.createElement("section");
    card.id = chapterId(chapter);
    card.className = "chapter" + (complete ? " is-complete" : "");

    const header = document.createElement("header");
    header.className = "chapter-header";

    const heading = document.createElement("h3");
    heading.textContent = chapter.title;
    header.appendChild(heading);

    const count = document.createElement("span");
    count.className = "chapter-count";
    count.textContent = foundInChapter + " / " + totalInChapter;
    count.setAttribute("aria-label", foundInChapter + " of " + totalInChapter + " caches found");
    header.appendChild(count);

    if (complete) {
        const badge = document.createElement("span");
        badge.className = "chapter-badge";
        badge.textContent = "Complete";
        header.appendChild(badge);
    }

    const guide = document.createElement("a");
    guide.className = "chapter-guide";
    guide.href = chapter.videoLink;
    guide.textContent = "Video guide";
    guide.setAttribute("aria-label", "Watch the " + chapter.title + " video guide");
    header.appendChild(guide);

    card.appendChild(header);

    const cacheList = document.createElement("ul");
    cacheList.className = "cache-grid";

    for (const cache of chapter.caches) {
        cacheList.appendChild(createCacheItem(cache));
    }

    card.appendChild(cacheList);

    return card;
}

function createCacheItem(cache) {
    const item = document.createElement("li");
    item.className = "cache " + (cache.obtained ? "is-found" : "is-missing");
    item.title = "Cache " + cache.number + ": " + (cache.obtained ? "found" : "missing");

    const mark = document.createElement("span");
    mark.className = "cache-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = cache.obtained ? "✓" : "○";
    item.appendChild(mark);

    const number = document.createElement("span");
    number.className = "cache-number";
    number.setAttribute("aria-hidden", "true");
    number.textContent = cache.number;
    item.appendChild(number);

    const hidden = document.createElement("span");
    hidden.className = "visually-hidden";
    hidden.textContent = "Cache " + cache.number + ": " + (cache.obtained ? "found" : "missing");
    item.appendChild(hidden);

    return item;
}

function chapterId(chapter) {
    return "chapter-" + slugify(chapter.title);
}

function slugify(value) {
    return value
        .toLowerCase()
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
