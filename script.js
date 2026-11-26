document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    root.dataset.jsReady = "1";

    document.querySelectorAll("[data-year]").forEach((element) => {
        element.textContent = new Date().getFullYear();
    });

    /* ---------- Theme ---------- */
    const toggle = document.querySelector(".themebtn");
    const themeColor = document.querySelector('meta[name="theme-color"]');

    const applyTheme = (theme) => {
        const isDark = theme === "dark";
        root.dataset.theme = theme;

        if (toggle) {
            toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
            toggle.setAttribute("aria-pressed", String(isDark));
        }

        if (themeColor) {
            themeColor.setAttribute("content", isDark ? "#0e0e0d" : "#ffffff");
        }
    };

    // The head script may already have applied dark before paint; sync controls.
    applyTheme(root.dataset.theme === "dark" ? "dark" : "light");

    if (toggle) {
        toggle.addEventListener("click", () => {
            const next = root.dataset.theme === "dark" ? "light" : "dark";
            applyTheme(next);

            try {
                localStorage.setItem("theme", next);
            } catch (e) {
                /* Theme still applies for this visit if storage is blocked. */
            }
        });
    }

    /* ---------- Copy email ---------- */
    document.querySelectorAll("[data-copy-email]").forEach((button) => {
        const email = button.dataset.copyEmail;
        const label = button.querySelector(".copy-label");
        const status = button.parentElement.querySelector("[data-copy-status]");
        let resetTimer;

        const showResult = (copied) => {
            if (status) {
                status.textContent = copied
                    ? "Email address copied to clipboard."
                    : "Could not copy the email address. Select it and copy manually.";
            }
            if (label) label.textContent = copied ? "Copied" : "Copy";
            button.setAttribute(
                "aria-label",
                copied ? "Email address copied to clipboard" : "Copy email address to clipboard"
            );

            window.clearTimeout(resetTimer);
            resetTimer = window.setTimeout(() => {
                if (status) status.textContent = "";
                if (label) label.textContent = "Copy";
                button.setAttribute("aria-label", "Copy email address to clipboard");
            }, 2400);
        };

        const fallbackCopy = () => {
            const input = document.createElement("textarea");
            input.value = email;
            input.setAttribute("readonly", "");
            input.style.position = "fixed";
            input.style.top = "-9999px";
            document.body.appendChild(input);
            input.select();

            let copied = false;
            try {
                copied = document.execCommand("copy");
            } catch (e) {
                copied = false;
            }

            input.remove();
            showResult(copied);
        };

        button.addEventListener("click", async () => {
            if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
                fallbackCopy();
                return;
            }

            try {
                await navigator.clipboard.writeText(email);
                showResult(true);
            } catch (e) {
                fallbackCopy();
            }
        });
    });

    /* ---------- Mobile menu ---------- */
    const menuButton = document.querySelector(".menubtn");
    const menu = document.getElementById("mobile-menu");

    const setMenu = (open) => {
        if (!menu || !menuButton) return;
        menu.hidden = !open;
        menuButton.setAttribute("aria-expanded", String(open));
        menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    if (menuButton && menu) {
        menuButton.addEventListener("click", () => setMenu(menu.hidden));
        menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") setMenu(false);
        });
        window.addEventListener("resize", () => {
            if (window.innerWidth > 720) setMenu(false);
        });
    }

    /* ---------- Header on scroll ---------- */
    const header = document.getElementById("site-header");
    let scrollQueued = false;

    const updateScroll = () => {
        if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
        scrollQueued = false;
    };

    window.addEventListener(
        "scroll",
        () => {
            if (scrollQueued) return;
            scrollQueued = true;
            requestAnimationFrame(updateScroll);
        },
        { passive: true }
    );
    window.addEventListener("resize", updateScroll);
    updateScroll();

    /* ---------- Reveal on scroll ---------- */
    const reveals = Array.from(document.querySelectorAll(".reveal"));

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                });
            },
            { threshold: 0.05, rootMargin: "0px 0px -24px 0px" }
        );
        reveals.forEach((element) => revealObserver.observe(element));
    } else {
        reveals.forEach((element) => element.classList.add("is-visible"));
    }

    /* ---------- In-view accents ---------- */
    document.querySelectorAll(".tool-ribbon, .affiliations").forEach((region) => {
        if (!("IntersectionObserver" in window)) {
            region.classList.add("is-in-view");
            region.classList.remove("is-paused");
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                region.classList.toggle("is-in-view", entry.isIntersecting);
                if (region.classList.contains("tool-ribbon")) {
                    region.classList.toggle("is-paused", !entry.isIntersecting);
                }
            },
            { threshold: 0.2 }
        );
        observer.observe(region);
    });

    /* ---------- Current section in nav ---------- */
    const navLinks = Array.from(document.querySelectorAll('.desknav a[href^="#"]'));

    if ("IntersectionObserver" in window && navLinks.length) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    navLinks.forEach((link) => {
                        if (link.getAttribute("href") === `#${entry.target.id}`) {
                            link.setAttribute("aria-current", "true");
                        } else {
                            link.removeAttribute("aria-current");
                        }
                    });
                });
            },
            { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
        );

        navLinks.forEach((link) => {
            const section = document.querySelector(link.getAttribute("href"));
            if (section) sectionObserver.observe(section);
        });
    }

    /* ---------- Scratch-off reveals ---------- */
    document.querySelectorAll(".specialty--scratch").forEach((scratch) => {
        const canvas = scratch.querySelector(".specialty-cover");
        const status = scratch.parentElement.querySelector("[data-scratch-status]");
        const revealLabel = scratch.dataset.revealLabel;
        const revealStatus = scratch.dataset.revealStatus;
        const revealTarget = scratch.dataset.revealTarget
            ? document.querySelector(scratch.dataset.revealTarget)
            : null;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let scratching = false;
        let revealed = false;
        let lastPoint = null;

        const themeColors = () => {
            const styles = getComputedStyle(document.documentElement);
            const value = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
            return {
                tile: value("--tile", "#f6f5f2"),
                rule: value("--rule", "#e8e6e1"),
                accent: value("--accent", "#b84a10")
            };
        };

        const paintCover = () => {
            const rect = scratch.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const width = rect.width;
            const height = rect.height;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const colors = themeColors();
            ctx.globalCompositeOperation = "source-over";
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = colors.tile;
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = colors.rule;
            ctx.lineWidth = 1;
            for (let x = -height; x < width + height; x += 10) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x + height, height);
                ctx.stroke();
            }

            ctx.globalAlpha = 0.22;
            ctx.fillStyle = colors.accent;
            ctx.font = '600 13px "IBM Plex Mono", monospace';
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("\u2726", width / 2, height / 2);
            ctx.globalAlpha = 1;
        };

        const clearCover = () => {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        };

        const scratchedFraction = () => {
            const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            let clear = 0;
            let total = 0;
            for (let i = 3; i < pixels.length; i += 32) {
                total += 1;
                if (pixels[i] < 40) clear += 1;
            }
            return total ? clear / total : 0;
        };

        const reveal = () => {
            if (revealed) return;
            revealed = true;
            scratching = false;
            lastPoint = null;
            scratch.classList.add("is-revealed");
            scratch.classList.remove("is-scratching");
            scratch.setAttribute("aria-pressed", "true");
            if (revealLabel) scratch.setAttribute("aria-label", revealLabel);
            if (status) status.textContent = revealStatus || "Hidden content revealed.";
            if (revealTarget) revealTarget.hidden = false;
            window.setTimeout(clearCover, reducedMotion.matches ? 0 : 420);
        };

        const eraseTo = (x, y) => {
            ctx.save();
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = 26;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            if (lastPoint) {
                ctx.moveTo(lastPoint.x, lastPoint.y);
            } else {
                ctx.moveTo(x, y);
            }
            ctx.lineTo(x + 0.01, y + 0.01);
            ctx.stroke();
            ctx.restore();
            lastPoint = { x, y };
        };

        const pointerPosition = (event) => {
            const rect = scratch.getBoundingClientRect();
            return { x: event.clientX - rect.left, y: event.clientY - rect.top };
        };

        scratch.addEventListener("pointerdown", (event) => {
            if (revealed) return;
            scratching = true;
            lastPoint = null;
            scratch.classList.add("is-scratching");
            if (scratch.setPointerCapture) {
                try {
                    scratch.setPointerCapture(event.pointerId);
                } catch (e) {
                    /* Synthetic or already-released pointers are safe to ignore. */
                }
            }
            const point = pointerPosition(event);
            eraseTo(point.x, point.y);
        });

        scratch.addEventListener("pointermove", (event) => {
            if (!scratching || revealed) return;
            event.preventDefault();
            const point = pointerPosition(event);
            eraseTo(point.x, point.y);
            if (scratchedFraction() > 0.42) reveal();
        });

        const endScratch = () => {
            scratching = false;
            lastPoint = null;
            scratch.classList.remove("is-scratching");
        };

        scratch.addEventListener("pointerup", endScratch);
        scratch.addEventListener("pointercancel", endScratch);
        scratch.addEventListener("lostpointercapture", endScratch);

        scratch.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
                event.preventDefault();
                reveal();
            }
        });

        // Keyboard-generated clicks have no pointerdown, so reveal explicitly.
        scratch.addEventListener("click", (event) => {
            if (event.detail === 0) reveal();
        });

        paintCover();

        let resizeTimer;
        window.addEventListener("resize", () => {
            if (revealed) return;
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(paintCover, 150);
        });

        if ("MutationObserver" in window) {
            const themeObserver = new MutationObserver(() => {
                if (!revealed) paintCover();
            });
            themeObserver.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ["data-theme"]
            });
        }
    });

    /* ---------- Portrait lightbox ---------- */
    const avatarButton = document.querySelector(".avatar-frame");
    const lightbox = document.getElementById("photo-lightbox");

    if (avatarButton && lightbox) {
        const closeButton = lightbox.querySelector(".lightbox-close");
        const backdrop = lightbox.querySelector(".lightbox-backdrop");
        let opener = null;

        const openLightbox = () => {
            opener = document.activeElement;
            const scrollbar = window.innerWidth - document.documentElement.clientWidth;
            if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
            lightbox.hidden = false;
            document.body.classList.add("lightbox-open");
            if (closeButton) closeButton.focus();
        };

        const closeLightbox = () => {
            if (lightbox.hidden) return;
            lightbox.hidden = true;
            document.body.classList.remove("lightbox-open");
            document.body.style.paddingRight = "";
            if (opener && typeof opener.focus === "function") opener.focus();
            opener = null;
        };

        avatarButton.addEventListener("click", openLightbox);
        if (closeButton) closeButton.addEventListener("click", closeLightbox);
        if (backdrop) backdrop.addEventListener("click", closeLightbox);

        document.addEventListener("keydown", (event) => {
            if (lightbox.hidden) return;
            if (event.key === "Escape") {
                event.preventDefault();
                closeLightbox();
            } else if (event.key === "Tab") {
                // The close button is the only focusable item in the dialog.
                event.preventDefault();
                if (closeButton) closeButton.focus();
            }
        });
    }

    /* ---------- Status line easter egg ---------- */
    const statusToggle = document.querySelector(".status-toggle");
    const statusText = document.getElementById("status-text");

    if (statusToggle && statusText) {
        const messages = [
            statusText.textContent.trim(),
            "Nairobi, Kenya \u00b7 Currently shipping",
            "Nairobi, Kenya \u00b7 Between meetings, probably",
            "Nairobi, Kenya \u00b7 Debugging someone else's code",
            null
        ];
        let statusIndex = 0;

        const nairobiTime = () => {
            try {
                return new Intl.DateTimeFormat("en-GB", {
                    timeZone: "Africa/Nairobi",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                }).format(new Date());
            } catch (e) {
                return "the usual hour";
            }
        };

        statusToggle.addEventListener("click", () => {
            statusIndex = (statusIndex + 1) % messages.length;
            const message = messages[statusIndex];
            statusText.textContent = message === null
                ? `Nairobi, Kenya \u00b7 ${nairobiTime()} EAT`
                : message;
        });
    }

    /* ---------- Konami code: creative chaos ---------- */
    const konami = [
        "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
        "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"
    ];
    let konamiProgress = 0;
    let chaosTimer;
    let chaosToastTimer;

    const triggerChaos = () => {
        root.classList.add("chaos");
        window.clearTimeout(chaosTimer);
        chaosTimer = window.setTimeout(() => root.classList.remove("chaos"), 10000);

        let toast = document.querySelector(".chaos-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.className = "chaos-toast";
            toast.setAttribute("role", "status");
            document.body.appendChild(toast);
        }
        toast.textContent = "creative chaos: on \u2726";
        toast.classList.add("is-shown");
        window.clearTimeout(chaosToastTimer);
        chaosToastTimer = window.setTimeout(() => toast.classList.remove("is-shown"), 2600);
    };

    document.addEventListener("keydown", (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
        if (key === konami[konamiProgress]) {
            konamiProgress += 1;
            if (konamiProgress === konami.length) {
                konamiProgress = 0;
                triggerChaos();
            }
        } else {
            konamiProgress = key === konami[0] ? 1 : 0;
        }
    });

    /* ---------- Brand mark typewriter ---------- */
    const brand = document.querySelector(".brand");
    const brandNote = document.querySelector(".brand-note");

    if (brand && brandNote) {
        const path = window.location.pathname.replace(/\\/g, "/");
        const isHome = /(^|\/)index\.html$/.test(path) || path.endsWith("/");

        if (isHome) {
            const originalNote = brandNote.textContent;
            const message = "still building\u2026";
            let typeTimer;
            let restoreTimer;

            brand.addEventListener("click", (event) => {
                event.preventDefault();
                window.clearInterval(typeTimer);
                window.clearTimeout(restoreTimer);
                root.classList.add("brand-typing");
                brandNote.classList.add("is-typing");
                brandNote.textContent = "";
                let index = 0;

                typeTimer = window.setInterval(() => {
                    index += 1;
                    brandNote.textContent = message.slice(0, index);
                    if (index >= message.length) {
                        window.clearInterval(typeTimer);
                        restoreTimer = window.setTimeout(() => {
                            brandNote.classList.remove("is-typing");
                            root.classList.remove("brand-typing");
                            brandNote.textContent = originalNote;
                        }, 1800);
                    }
                }, 55);
            });
        }
    }

    /* ---------- Console note ---------- */
    console.log(
        "%cJibran Sheikh %c available for good problems ",
        "background:#b84a10; color:#fff; font-weight:600; padding:2px 6px;",
        "background:#141413; color:#fff; padding:2px 6px;"
    );
    console.log(
        "%cjibran@binboi.biz",
        "color:#6e6b65; font-family:monospace; font-size:12px;"
    );
});
