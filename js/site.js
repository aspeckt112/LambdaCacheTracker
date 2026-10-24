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

        container.replaceChildren(renderChapters(chapters));

        requestAnimationFrame(() => {
            const firstCacheContainer = document.querySelector(".cache-container");
            if (firstCacheContainer) {
                firstCacheContainer.scrollIntoView({ behavior: "smooth" });
            }
        });
    } catch (error) {
        console.error("Error fetching caches:", error);
        alert("An error occurred while fetching caches.");
    }
}

function renderChapters(chapters) {
    const wrapper = document.createElement("div");
    const total = chapters.reduce(function (sum, chapter) {
        return sum + chapter.caches.length;
    }, 0);
    const found = chapters.reduce(function (sum, chapter) {
        return sum + chapter.caches.filter(function (cache) {
            return cache.obtained;
        }).length;
    }, 0);

    const heading = document.createElement("h2");
    heading.textContent = "Your caches";
    wrapper.appendChild(heading);

    const summary = document.createElement("p");
    summary.className = "cache-summary";
    summary.textContent = "Found " + found + " of " + total + " lambda caches. " +
        (found === total
            ? "That's all of them — Lambda Locator complete."
            : "Missing caches are the ones left unchecked.");
    wrapper.appendChild(summary);

    for (const chapter of chapters) {
        const section = document.createElement("section");
        section.className = "chapter";

        const h3 = document.createElement("h3");
        h3.textContent = chapter.title;
        section.appendChild(h3);

        const guide = document.createElement("p");
        guide.className = "chapter-guide";
        const link = document.createElement("a");
        link.href = chapter.videoLink;
        link.textContent = "Watch the chapter guide";
        guide.appendChild(link);
        section.appendChild(guide);

        const list = document.createElement("ul");
        list.className = "cache-list";

        for (const cache of chapter.caches) {
            const item = document.createElement("li");
            item.className = "cache-container";

            const label = document.createElement("label");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.disabled = true;
            checkbox.checked = cache.obtained;

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" Cache #" + cache.number));
            item.appendChild(label);
            list.appendChild(item);
        }

        section.appendChild(list);
        wrapper.appendChild(section);
    }

    return wrapper;
}
