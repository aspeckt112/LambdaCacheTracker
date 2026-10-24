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
        document.getElementById("caches").outerHTML = renderChapters(chapters);

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

    for (const chapter of chapters) {
        const heading = document.createElement("div");

        const h3 = document.createElement("h3");
        h3.textContent = chapter.title;

        const h4 = document.createElement("h4");
        const link = document.createElement("a");
        link.href = chapter.videoLink;
        link.textContent = chapter.videoLink;
        h4.appendChild(link);

        heading.appendChild(h3);
        heading.appendChild(h4);
        wrapper.appendChild(heading);

        for (const cache of chapter.caches) {
            const cacheContainer = document.createElement("div");
            cacheContainer.className = "cache-container";

            const h5 = document.createElement("h5");
            h5.textContent = "Cache # " + cache.number;

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.disabled = true;
            checkbox.defaultChecked = cache.obtained;

            cacheContainer.appendChild(h5);
            cacheContainer.appendChild(checkbox);
            wrapper.appendChild(cacheContainer);
        }
    }

    return wrapper.innerHTML;
}
