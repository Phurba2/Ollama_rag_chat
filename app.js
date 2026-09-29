const form = document.querySelector("#chat-form");
const questionInput = document.querySelector("#question");
const chat = document.querySelector("#chat");
const sendButton = document.querySelector("#send-button");
const welcome = document.querySelector("#welcome");

function addMessage(type, content, isHtml = false) {
  const message = document.createElement("div");
  message.className = `message ${type}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  if (isHtml) {
    bubble.innerHTML = content;
  } else {
    bubble.textContent = content;
  }

  message.appendChild(bubble);
  chat.appendChild(message);

  chat.scrollTop = chat.scrollHeight;

  return message;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderMarkdown(markdown) {
  let html = escapeHtml(markdown.trim());

  html = html.replace(
    /^### (.+)$/gm,
    "<h3>$1</h3>"
  );

  html = html.replace(
    /^## (.+)$/gm,
    "<h2>$1</h2>"
  );

  html = html.replace(
    /^# (.+)$/gm,
    "<h2>$1</h2>"
  );

  html = html.replace(
    /^\- (.+)$/gm,
    "<li>$1</li>"
  );

  html = html.replace(
    /((?:<li>.*<\/li>\n?)+)/g,
    "<ul>$1</ul>"
  );

  html = html.replace(
    /\*\*(.+?)\*\*/g,
    "<strong>$1</strong>"
  );

  html = html.replace(
    /\n\n+/g,
    "</p><p>"
  );

  html = html.replace(
    /\n/g,
    "<br>"
  );

  return `<p>${html}</p>`;
}

function addTypingMessage() {
  return addMessage(
    "assistant",
    `
      <div
        class="typing"
        aria-label="Generating answer"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    `,
    true
  );
}

async function askQuestion(question) {
  const response = await fetch("/api/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "The request failed."
    );
  }

  return data.answer;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = questionInput.value.trim();

  if (!question || sendButton.disabled) {
    return;
  }

  if (welcome) {
    welcome.remove();
  }

  addMessage("user", question);

  questionInput.value = "";
  questionInput.style.height = "auto";

  sendButton.disabled = true;

  const typingMessage = addTypingMessage();

  try {
    const answer = await askQuestion(question);

    typingMessage.remove();

    addMessage(
      "assistant",
      renderMarkdown(answer),
      true
    );
  } catch (error) {
    typingMessage.remove();

    addMessage(
      "assistant",
      `<span class="error">${escapeHtml(error.message)}</span>`,
      true
    );
  } finally {
    sendButton.disabled = false;
    questionInput.focus();
  }
});

questionInput.addEventListener("input", () => {
  questionInput.style.height = "auto";
  questionInput.style.height =
    `${questionInput.scrollHeight}px`;
});

questionInput.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" &&
    !event.shiftKey
  ) {
    event.preventDefault();
    form.requestSubmit();
  }
});
