// CampusLink front end.
// The help board is shared: requests, AI answers and replies are saved on the server.

const helpForm = document.querySelector("#helpForm");
const requestList = document.querySelector("#requestList");
const formMessage = document.querySelector("#formMessage");
const API = "/api/requests";


// ----- Small helpers -----

// Make an HTML element with optional class and text (text is always shown as plain text, which is safe).
function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
}

function ago(ts) {
    const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
    if (s < 60) return "just now";
    const m = Math.round(s / 60);
    if (m < 60) return m + " min ago";
    const h = Math.round(m / 60);
    if (h < 24) return h + " h ago";
    return Math.round(h / 24) + " days ago";
}

function savedName() {
    try { return localStorage.getItem("campuslink_name") || ""; } catch (e) { return ""; }
}

function saveName(name) {
    try { localStorage.setItem("campuslink_name", name); } catch (e) { /* ignore */ }
}

async function api(path, options) {
    const response = await fetch(path, options);
    let data = {};
    try { data = await response.json(); } catch (e) { /* no JSON */ }
    if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
    return data;
}

function postJSON(path, body) {
    return api(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
}


// ----- Drawing the cards -----

function aiBox(req) {
    const box = el("div", "ai-box");
    box.append(el("strong", "ai-label", "AI study helper"));

    if (req.ai_answer) {
        box.append(el("p", "ai-text", req.ai_answer));
        box.append(el("small", "ai-note", "The AI can make mistakes. Check important answers with your teacher or another student."));
        return box;
    }

    box.append(el("p", "ai-text", "The AI answer isn’t ready right now."));
    const button = el("button", "small-button", "Ask AI again");
    button.type = "button";
    button.addEventListener("click", async function () {
        button.disabled = true;
        button.textContent = "Thinking…";
        try { await api(API + "/" + req.id + "/ai", { method: "POST" }); } catch (e) { /* shown again on reload */ }
        loadRequests();
    });
    box.append(button);
    return box;
}

function replySection(req) {
    const section = el("div", "replies");
    section.append(el("h4", "", "Answers and notes from students (" + req.replies.length + ")"));

    req.replies.forEach(function (r) {
        const item = el("div", "reply");
        const head = el("div", "reply-head");
        head.append(el("strong", "", r.name), el("span", "badge", r.kind === "notes" ? "Notes" : "Answer"), document.createTextNode(ago(r.created_at)));
        item.append(head, el("p", "", r.text));
        if (r.link) {
            const a = el("a", "", "Open the notes link");
            a.href = r.link;
            a.target = "_blank";
            a.rel = "noopener noreferrer nofollow";
            item.append(a);
        }
        section.append(item);
    });

    section.append(replyForm(req));
    return section;
}

function replyForm(req) {
    const form = el("form", "reply-form");

    const name = el("input");
    name.placeholder = "Your name";
    name.maxLength = 40;
    name.value = savedName();
    name.setAttribute("aria-label", "Your name");

    const kind = el("select");
    kind.setAttribute("aria-label", "Type of reply");
    kind.append(new Option("I’m sharing an answer or tip", "tip"), new Option("I’m sharing notes", "notes"));

    const text = el("textarea");
    text.rows = 3;
    text.maxLength = 600;
    text.placeholder = "Write your answer, tip, or a short note about your notes";
    text.setAttribute("aria-label", "Your reply");

    const link = el("input");
    link.type = "url";
    link.maxLength = 300;
    link.placeholder = "Link to notes (optional): Google Drive, PDF, video…";
    link.setAttribute("aria-label", "Link to notes");

    const button = el("button", "small-button", "Add reply");
    button.type = "submit";
    const msg = el("p", "reply-msg");

    form.append(name, kind, text, link, button, msg);

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        msg.textContent = "";
        if (!name.value.trim() || !text.value.trim()) {
            msg.textContent = "Please add your name and a reply.";
            return;
        }
        button.disabled = true;
        try {
            await postJSON(API + "/" + req.id + "/replies", {
                name: name.value, kind: kind.value, text: text.value, link: link.value
            });
            saveName(name.value.trim());
            loadRequests();
        } catch (e) {
            msg.textContent = e.message;
            button.disabled = false;
        }
    });
    return form;
}

function renderCard(req) {
    const card = el("article", "request-card");
    card.append(
        el("h3", "", req.subject + " - Help Needed"),
        el("p", "meta", "Posted by " + req.name + " · " + ago(req.created_at)),
        el("p", "question", req.question),
        aiBox(req),
        replySection(req)
    );
    return card;
}

async function loadRequests() {
    try {
        const data = await api(API);
        requestList.replaceChildren();
        if (data.requests.length === 0) {
            requestList.append(el("p", "meta", "No requests yet. Be the first to ask!"));
        }
        data.requests.forEach(function (req) { requestList.append(renderCard(req)); });
    } catch (e) {
        requestList.replaceChildren(el("p", "meta", "Couldn’t load the requests. Please refresh in a moment."));
    }
}


// ----- Posting a new help request -----

helpForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const studentName = document.querySelector("#studentName").value.trim();
    const subject = document.querySelector("#subject").value;
    const helpDetails = document.querySelector("#helpDetails").value.trim();
    const button = helpForm.querySelector("button[type=submit]");

    if (studentName === "" || subject === "" || helpDetails === "") {
        formMessage.textContent = "Please complete all fields.";
        return;
    }

    button.disabled = true;
    formMessage.textContent = "Posting… the AI is writing an answer, this can take a few seconds.";

    try {
        await postJSON(API, { name: studentName, subject: subject, question: helpDetails });
        saveName(studentName);
        formMessage.textContent = "Your request is posted! The AI answer is below.";
        helpForm.reset();
        loadRequests();
    } catch (e) {
        formMessage.textContent = e.message;
    }
    button.disabled = false;
});

document.querySelector("#refreshBtn").addEventListener("click", loadRequests);

document.querySelector("#studentName").value = savedName();
loadRequests();
