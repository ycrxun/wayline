(() => {
    const root = document.documentElement;
    const themeButton = document.querySelector(".theme-toggle");
    const giscusPanel = document.querySelector("[data-giscus]");

    const preferredTheme = () =>
        window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    const themeModes = {
        dark: { color: "#0c1117", label: "切换到护眼模式" },
        eye: { color: "#e9e4d8", label: "切换到浅色模式" },
        light: { color: "#f5f7fb", label: "切换到深色模式" },
    };
    const nextTheme = { dark: "eye", eye: "light", light: "dark" };

    const applyTheme = (theme, persist = true) => {
        const mode = themeModes[theme] ? theme : "dark";
        const modeConfig = themeModes[mode];
        root.dataset.theme = mode;
        document.querySelector('meta[name="theme-color"]')?.setAttribute(
            "content",
            modeConfig.color,
        );
        themeButton?.setAttribute("aria-label", modeConfig.label);
        themeButton?.setAttribute("title", modeConfig.label);
        if (persist) {
            localStorage.setItem("wayline-theme", mode);
            localStorage.removeItem("ronggle-theme");
        }
        updateGiscusTheme();
    };

    applyTheme(root.dataset.theme || preferredTheme(), false);

    themeButton?.addEventListener("click", () => {
        applyTheme(nextTheme[root.dataset.theme] || "eye");
    });

    const navButton = document.querySelector(".nav-toggle");
    const navigation = document.querySelector(".site-nav");
    const navBackdrop = document.querySelector(".nav-backdrop");
    const closeNavigation = () => {
        navButton?.setAttribute("aria-expanded", "false");
        navigation?.classList.remove("is-open");
        navBackdrop?.classList.remove("is-open");
        document.body.classList.remove("nav-open");
    };

    navButton?.addEventListener("click", () => {
        const open = navButton.getAttribute("aria-expanded") === "true";
        navButton.setAttribute("aria-expanded", String(!open));
        navigation?.classList.toggle("is-open", !open);
        navBackdrop?.classList.toggle("is-open", !open);
        document.body.classList.toggle("nav-open", !open);
    });

    navBackdrop?.addEventListener("click", closeNavigation);

    navigation?.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeNavigation);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeNavigation();
    });

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                });
            },
            { rootMargin: "0px 0px -8%", threshold: 0.06 },
        );
        document.querySelectorAll("[data-reveal]").forEach((element) => {
            revealObserver.observe(element);
        });
    } else {
        document.querySelectorAll("[data-reveal]").forEach((element) => {
            element.classList.add("is-visible");
        });
    }

    const progressBar = document.querySelector(".reading-progress span");
    if (progressBar) {
        const updateProgress = () => {
            const article = document.querySelector("[data-article-content]");
            if (!article) return;
            const start = article.offsetTop;
            const length = Math.max(article.offsetHeight - window.innerHeight * 0.55, 1);
            const value = Math.min(Math.max((window.scrollY - start) / length, 0), 1);
            progressBar.style.width = `${value * 100}%`;
        };
        updateProgress();
        window.addEventListener("scroll", updateProgress, { passive: true });
        window.addEventListener("resize", updateProgress);
    }

    const codeBlocks = document.querySelectorAll(".prose .highlight, .prose pre:not(.chroma)");
    codeBlocks.forEach((block) => {
        const code = block.querySelector("code");
        if (!code) return;
        const codeSurface = block.matches("pre") ? block : block.querySelector("pre");
        let language = null;
        if (block.classList.contains("highlight") && !block.querySelector(".code-language")) {
            language = document.createElement("span");
            language.className = "code-language";
            language.textContent = (code.dataset.lang || "CODE").toUpperCase();
            block.append(language);
        }
        if (language && codeSurface) {
            const updateOverflowLabel = () => {
                const baseLabel = (code.dataset.lang || "CODE").toUpperCase();
                language.textContent =
                    codeSurface.scrollWidth > codeSurface.clientWidth + 1
                        ? `${baseLabel} · SWIPE →`
                        : baseLabel;
            };
            updateOverflowLabel();
            document.fonts?.ready.then(updateOverflowLabel);
            window.addEventListener("resize", updateOverflowLabel);
        }
        const button = document.createElement("button");
        button.type = "button";
        button.className = "copy-code";
        button.textContent = "COPY";
        block.append(button);
        button.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(code.innerText);
                button.textContent = "COPIED";
            } catch {
                button.textContent = "FAILED";
            }
            window.setTimeout(() => {
                button.textContent = "COPY";
            }, 1600);
        });
    });

    document.querySelector("[data-print-resume]")?.addEventListener("click", () => {
        window.print();
    });

    const revealContact = (button) => {
        try {
            const value = atob(button.dataset.contact || "").trim();
            const link = document.createElement("a");
            link.href =
                button.dataset.contactType === "email"
                    ? `mailto:${value}`
                    : `tel:${value.replace(/\s+/g, "")}`;
            link.textContent = value;
            button.replaceWith(link);
        } catch {
            button.textContent = "请更新联系方式";
        }
    };

    document.querySelectorAll(".contact-reveal").forEach((button) => {
        button.addEventListener("click", () => revealContact(button));
    });

    window.addEventListener("beforeprint", () => {
        document.querySelectorAll(".contact-reveal").forEach(revealContact);
    });

    const tocLinks = [...document.querySelectorAll("[data-toc] a")];
    const tocHeadings = tocLinks
        .map((link) => {
            const id = decodeURIComponent(link.hash.slice(1));
            return { link, heading: document.getElementById(id) };
        })
        .filter((item) => item.heading);

    if (tocHeadings.length && "IntersectionObserver" in window) {
        const tocObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    tocLinks.forEach((link) => link.classList.remove("is-active"));
                    tocHeadings
                        .find((item) => item.heading === entry.target)
                        ?.link.classList.add("is-active");
                });
            },
            { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
        );
        tocHeadings.forEach((item) => tocObserver.observe(item.heading));
    }

    function updateGiscusTheme() {
        if (!giscusPanel) return;
        const frame = document.querySelector("iframe.giscus-frame");
        if (!frame) return;
        const theme =
            root.dataset.theme === "dark"
                ? giscusPanel.dataset.giscusDark || "dark_dimmed"
                : giscusPanel.dataset.giscusLight || "light";
        frame.contentWindow?.postMessage(
            { giscus: { setConfig: { theme } } },
            "https://giscus.app",
        );
    }

    if (giscusPanel) {
        window.addEventListener("message", (event) => {
            if (event.origin === "https://giscus.app") updateGiscusTheme();
        });
    }

    const photoItems = [...document.querySelectorAll("[data-photo-item]")];
    const photoLightbox = document.querySelector("#photo-lightbox");
    if (photoItems.length && photoLightbox) {
        let activePhoto = 0;
        const image = photoLightbox.querySelector("[data-lightbox-image]");
        const title = photoLightbox.querySelector("[data-lightbox-title]");
        const meta = photoLightbox.querySelector("[data-lightbox-meta]");
        const description = photoLightbox.querySelector("[data-lightbox-description]");
        const credit = photoLightbox.querySelector("[data-lightbox-credit]");
        const license = photoLightbox.querySelector("[data-lightbox-license]");
        const link = photoLightbox.querySelector("[data-lightbox-link]");
        const counter = photoLightbox.querySelector("[data-lightbox-counter]");
        const previous = photoLightbox.querySelector("[data-lightbox-prev]");
        const next = photoLightbox.querySelector("[data-lightbox-next]");

        const updatePhoto = (index) => {
            activePhoto = (index + photoItems.length) % photoItems.length;
            const item = photoItems[activePhoto];
            image.src = item.dataset.photoSrc;
            image.alt = item.dataset.photoTitle || "";
            title.textContent = item.dataset.photoTitle || "";
            meta.textContent = item.dataset.photoMeta || "";
            description.textContent = item.dataset.photoDescription || "";
            description.hidden = !item.dataset.photoDescription;
            credit.textContent = item.dataset.photoCredit
                ? `PHOTO · ${item.dataset.photoCredit}`
                : "";
            credit.hidden = !item.dataset.photoCredit;
            license.textContent = item.dataset.photoLicense || "";
            license.href = item.dataset.photoLicenseUrl || "#";
            license.hidden = !(item.dataset.photoLicense && item.dataset.photoLicenseUrl);
            link.href = item.dataset.photoLink || "#";
            link.hidden = !item.dataset.photoLink;
            link.target = /^https?:\/\//.test(item.dataset.photoLink || "") ? "_blank" : "";
            link.rel = link.target ? "noopener noreferrer" : "";
            link.textContent = item.dataset.photoLinkLabel || "查看相关页面 ↗";
            counter.textContent = `${String(activePhoto + 1).padStart(2, "0")} / ${String(photoItems.length).padStart(2, "0")}`;
        };

        const openPhoto = (index) => {
            updatePhoto(index);
            photoLightbox.showModal();
            document.body.classList.add("photo-open");
            photoLightbox.querySelector("[data-lightbox-close]").focus();
        };

        const closePhoto = () => {
            if (photoLightbox.open) photoLightbox.close();
        };

        photoItems.forEach((item, index) => {
            item.addEventListener("click", () => openPhoto(index));
        });

        photoLightbox.querySelector("[data-lightbox-close]")?.addEventListener("click", closePhoto);
        previous?.addEventListener("click", () => updatePhoto(activePhoto - 1));
        next?.addEventListener("click", () => updatePhoto(activePhoto + 1));
        photoLightbox.addEventListener("click", (event) => {
            if (event.target === photoLightbox) closePhoto();
        });
        photoLightbox.addEventListener("close", () => {
            document.body.classList.remove("photo-open");
        });

        document.addEventListener("keydown", (event) => {
            if (!photoLightbox.open) return;
            if (event.key === "Escape") {
                event.preventDefault();
                closePhoto();
            } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                updatePhoto(activePhoto - 1);
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                updatePhoto(activePhoto + 1);
            }
        });

        if (photoItems.length === 1) {
            previous?.setAttribute("hidden", "");
            next?.setAttribute("hidden", "");
        }
    }

    const escapeHTML = (value = "") =>
        String(value).replace(
            /[&<>"']/g,
            (character) =>
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;",
                })[character],
        );

    const createSearchController = ({
        form,
        input,
        results,
        status,
        endpoint,
        limit = 30,
        idleText = "",
        syncUrl = false,
    }) => {
        let documents = [];
        let indexState = "idle";
        let timer;

        const render = (query) => {
            const normalized = query.trim().toLocaleLowerCase();
            results.replaceChildren();

            if (!normalized) {
                status.textContent =
                    idleText || `INDEX READY / ${documents.length} ENTRIES`;
                return;
            }

            const matches = documents
                .filter((entry) => {
                    const haystack = [
                        entry.title,
                        entry.summary,
                        ...(entry.categories || []),
                        ...(entry.tags || []),
                    ]
                        .join(" ")
                        .toLocaleLowerCase();
                    return haystack.includes(normalized);
                })
                .slice(0, limit);

            status.textContent = `${matches.length} RESULT${matches.length === 1 ? "" : "S"} / “${query.trim()}”`;

            if (!matches.length) {
                const empty = document.createElement("p");
                empty.className = "search-empty";
                empty.textContent = "没有匹配内容。换一个关键词试试。";
                results.append(empty);
                return;
            }

            matches.forEach((entry) => {
                const link = document.createElement("a");
                link.className = "search-result";
                link.href = entry.permalink;
                link.innerHTML = `
                    <time>${escapeHTML(entry.date)}</time>
                    <div>
                        <h2>${escapeHTML(entry.title)}</h2>
                        <p>${escapeHTML(entry.summary)}</p>
                    </div>
                    <span class="search-result__arrow">↗</span>
                `;
                results.append(link);
            });
        };

        const loadIndex = async () => {
            if (indexState === "loaded" || indexState === "loading" || !endpoint) return;
            indexState = "loading";
            status.textContent = "LOADING INDEX / 正在读取文章索引";

            try {
                const response = await fetch(endpoint, { cache: "force-cache" });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                documents = await response.json();
                indexState = "loaded";
                render(input.value);
            } catch {
                indexState = "error";
                status.textContent = "INDEX UNAVAILABLE / 搜索索引暂时无法加载";
            }
        };

        input.addEventListener("input", () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                render(input.value);
                if (syncUrl) {
                    const url = new URL(window.location.href);
                    input.value.trim()
                        ? url.searchParams.set("q", input.value.trim())
                        : url.searchParams.delete("q");
                    history.replaceState({}, "", url);
                }
            }, 100);
        });

        form?.addEventListener("submit", (event) => {
            event.preventDefault();
            loadIndex();
            render(input.value);
        });

        return { loadIndex, focus: () => input.focus() };
    };

    const searchPage = document.querySelector("[data-search-page]");
    let pageSearch = null;
    if (searchPage) {
        const input = searchPage.querySelector("#search-input");
        input.value = new URL(window.location.href).searchParams.get("q") || "";
        pageSearch = createSearchController({
            form: searchPage.querySelector(".js-search-form"),
            input,
            results: searchPage.querySelector(".search-results"),
            status: searchPage.querySelector(".search-status"),
            endpoint: searchPage.dataset.searchJson,
            syncUrl: true,
        });
        pageSearch.loadIndex();
    }

    const searchDialog = document.querySelector("#site-search-dialog");
    const searchOpenButton = document.querySelector("[data-search-open]");
    if (searchDialog && searchOpenButton) {
        const input = searchDialog.querySelector("[data-search-dialog-input]");
        const indexUrl = searchDialog.querySelector("[data-search-index-url]")?.dataset.searchIndexUrl;
        const dialogSearch = createSearchController({
            form: searchDialog.querySelector(".site-search__form"),
            input,
            results: searchDialog.querySelector("[data-search-dialog-results]"),
            status: searchDialog.querySelector("[data-search-dialog-status]"),
            endpoint: indexUrl,
            limit: 8,
            idleText: "输入关键词开始搜索",
        });

        const openSearch = () => {
            if (searchDialog.open) return;
            searchDialog.showModal();
            document.body.classList.add("search-open");
            searchOpenButton.setAttribute("aria-expanded", "true");
            dialogSearch.loadIndex();
            requestAnimationFrame(() => input.focus());
        };

        const closeSearch = () => {
            if (searchDialog.open) searchDialog.close();
        };

        searchOpenButton.setAttribute("aria-expanded", "false");
        searchOpenButton.addEventListener("click", (event) => {
            event.preventDefault();
            openSearch();
        });
        searchDialog.querySelector("[data-search-close]")?.addEventListener("click", closeSearch);
        searchDialog.addEventListener("click", (event) => {
            if (event.target === searchDialog) closeSearch();
        });
        searchDialog.addEventListener("close", () => {
            document.body.classList.remove("search-open");
            searchOpenButton.setAttribute("aria-expanded", "false");
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && searchDialog.open) {
                event.preventDefault();
                closeSearch();
                return;
            }
            const target = event.target;
            const isEditing =
                target instanceof HTMLElement &&
                (target.matches("input, textarea, select") || target.isContentEditable);
            const shortcut = event.key === "/" || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k");
            if (!shortcut || isEditing) return;
            event.preventDefault();
            openSearch();
        });

    }
})();
