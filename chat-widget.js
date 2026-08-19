(() => {
  const API_URL = "https://royal-light-chat.theroyallight9090.workers.dev/chat";
  const TURNSTILE_SITE_KEY = "0x4AAAAAAEVRBGuNy_j-8G94";
  const LOGO_URL = "image/logo/trl.png";

  // ---------- Bilingual UI strings ----------
  // Only the widget's own chrome (labels, placeholder, greeting) is
  // translated here. The assistant's actual replies already come back in
  // whichever language the visitor typed in, straight from the model.
  const STRINGS = {
    en: {
      dir: "ltr",
      title: "Royal Light Assistant",
      subtitle: "Lighting help",
      placeholder: "Ask about lighting products…",
      send: "Send",
      imageLabel: "Upload product image",
      close: "Close chat",
      open: "Open AI chat",
      greeting: "Hello! I'm the Royal Light assistant. How can I help with your lighting project?",
      removeImage: "Remove image",
      viewProduct: "View product",
      catalogueProduct: "Catalogue product",
      langToggle: "العربية",
    },
    ar: {
      dir: "rtl",
      title: "مساعد رويال لايت",
      subtitle: "مساعدة في الإضاءة",
      placeholder: "اسأل عن منتجات الإضاءة…",
      send: "إرسال",
      imageLabel: "رفع صورة المنتج",
      close: "إغلاق المحادثة",
      open: "افتح المحادثة",
      greeting: "مرحباً! أنا مساعد رويال لايت. كيف يمكنني مساعدتك في مشروع الإضاءة؟",
      removeImage: "إزالة الصورة",
      viewProduct: "عرض المنتج",
      catalogueProduct: "منتج من الكتالوج",
      langToggle: "English",
    },
  };

  let lang = (navigator.language || "en").toLowerCase().startsWith("ar") ? "ar" : "en";
  const t = () => STRINGS[lang];

  const style = document.createElement("style");
  style.textContent = `
    #trl-chat-launcher {
      position: fixed; right: 20px; bottom: 86px; z-index: 10001;
      width: 56px; height: 56px; border: 0; border-radius: 50%;
      background: #c9a24d; color: #111; font-size: 25px; cursor: pointer;
      box-shadow: 0 8px 24px rgba(0,0,0,.28);
    }
    #trl-chat-panel {
      position: fixed; right: 20px; bottom: 152px; z-index: 10001;
      width: min(370px, calc(100vw - 24px)); height: min(570px, calc(100vh - 180px));
      display: none; grid-template-rows: auto 1fr auto auto auto;
      overflow: hidden; border: 1px solid #d8d8d8; border-radius: 18px;
      background: #fff; color: #1a1a1a; font-family: "Segoe UI", Arial, sans-serif;
      box-shadow: 0 18px 55px rgba(0,0,0,.28);
    }
    #trl-chat-panel.trl-open { display: grid; }
    #trl-chat-panel[dir="rtl"] .trl-user { margin-left: 0; margin-right: auto; border-bottom-right-radius: 14px; border-bottom-left-radius: 4px; }
    .trl-chat-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; background: #111; color: #fff; gap: 10px;
    }
    .trl-chat-header-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .trl-chat-header-avatar {
      width: 34px; height: 34px; border-radius: 50%; flex: 0 0 34px;
      background: #c9a24d; display: grid; place-items: center; overflow: hidden;
    }
    .trl-chat-header-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .trl-chat-header strong { display: block; font-size: 15px; }
    .trl-chat-header small { color: #d7bd84; }
    .trl-chat-header-actions { display: flex; align-items: center; gap: 4px; flex: 0 0 auto; }
    #trl-lang-toggle {
      border: 1px solid rgba(255,255,255,.35); background: transparent; color: #fff;
      font-size: 11px; font-weight: 600; border-radius: 12px; padding: 4px 9px; cursor: pointer;
    }
    #trl-chat-close { border: 0; background: transparent; color: #fff; font-size: 25px; cursor: pointer; line-height: 1; }
    #trl-chat-messages { overflow-y: auto; padding: 14px; background: #f7f7f7; }
    .trl-row { display: flex; align-items: flex-end; gap: 8px; margin: 0 0 10px; }
    .trl-row.trl-row-user { justify-content: flex-end; }
    #trl-chat-panel[dir="rtl"] .trl-row.trl-row-user { justify-content: flex-start; }
    .trl-avatar {
      width: 26px; height: 26px; border-radius: 50%; flex: 0 0 26px;
      background: #111; display: grid; place-items: center; overflow: hidden;
    }
    .trl-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .trl-message {
      max-width: 78%; padding: 10px 12px;
      border-radius: 14px; line-height: 1.45; font-size: 14px; white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .trl-bot { background: #fff; border: 1px solid #e2e2e2; border-bottom-left-radius: 4px; }
    .trl-user { margin-left: auto; background: #c9a24d; color: #111; border-bottom-right-radius: 4px; }
    .trl-user-image { display: block; width: 180px; max-width: 100%; margin-bottom: 7px; border-radius: 9px; }
    .trl-typing { display: inline-flex; align-items: center; gap: 4px; padding: 4px 2px; }
    .trl-typing span {
      width: 6px; height: 6px; border-radius: 50%; background: #b7ab94;
      animation: trl-bounce 1.2s infinite ease-in-out;
    }
    .trl-typing span:nth-child(2) { animation-delay: .15s; }
    .trl-typing span:nth-child(3) { animation-delay: .3s; }
    @keyframes trl-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: .5; }
      30% { transform: translateY(-4px); opacity: 1; }
    }
    #trl-image-preview {
      display: none; align-items: center; gap: 9px; padding: 8px 12px;
      border-top: 1px solid #eee; background: #fff; font-size: 12px;
    }
    #trl-image-preview.trl-visible { display: flex; }
    #trl-image-preview img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; }
    #trl-image-preview span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #trl-image-remove { border: 0; background: transparent; font-size: 20px; cursor: pointer; }
    #trl-turnstile-wrap { padding: 6px 12px 2px; background: #fff; }
    #trl-chat-form { display: flex; gap: 8px; padding: 10px 12px 12px; background: #fff; }
    #trl-chat-input {
      flex: 1; min-width: 0; border: 1px solid #ccc; border-radius: 22px;
      padding: 10px 13px; font-size: 14px; outline: none;
    }
    #trl-chat-input:focus { border-color: #c9a24d; box-shadow: 0 0 0 2px rgba(201,162,77,.18); }
    #trl-chat-send {
      border: 0; border-radius: 22px; padding: 0 15px; background: #111;
      color: #fff; font-weight: 700; cursor: pointer;
    }
    #trl-chat-send:disabled { opacity: .45; cursor: not-allowed; }
    #trl-image-button {
      display: grid; place-items: center; width: 40px; height: 40px; flex: 0 0 40px;
      border: 1px solid #ccc; border-radius: 50%; background: #fff; cursor: pointer;
      font-size: 18px;
    }
    .trl-product-list { display: grid; gap: 9px; margin: 4px 0 12px 34px; }
    #trl-chat-panel[dir="rtl"] .trl-product-list { margin: 4px 34px 12px 0; }
    .trl-product-card {
      display: grid; grid-template-columns: 72px 1fr; gap: 10px; padding: 9px;
      border: 1px solid #ddd; border-radius: 12px; background: #fff;
    }
    .trl-product-card img { width: 72px; height: 72px; object-fit: contain; border-radius: 8px; background: #f5f5f5; }
    .trl-product-card strong { display: block; font-size: 13px; margin-bottom: 3px; }
    .trl-product-card small { display: block; color: #666; margin-bottom: 7px; }
    .trl-product-card a {
      display: inline-block; padding: 6px 9px; border-radius: 15px; background: #111;
      color: #fff; text-decoration: none; font-size: 12px; font-weight: 700;
    }
    @media (max-width: 600px) {
      #trl-chat-launcher { right: 15px; bottom: 76px; }
      #trl-chat-panel { right: 12px; bottom: 142px; height: min(530px, calc(100vh - 160px)); }
    }
  `;
  document.head.appendChild(style);

  const panel = document.createElement("section");
  panel.id = "trl-chat-panel";
  panel.setAttribute("aria-label", "Royal Light AI assistant");
  panel.dir = t().dir;
  panel.innerHTML = `
    <header class="trl-chat-header">
      <div class="trl-chat-header-info">
        <div class="trl-chat-header-avatar"><img src="${LOGO_URL}" alt=""></div>
        <div><strong id="trl-title"></strong><small id="trl-subtitle"></small></div>
      </div>
      <div class="trl-chat-header-actions">
        <button id="trl-lang-toggle" type="button"></button>
        <button id="trl-chat-close" type="button">×</button>
      </div>
    </header>
    <div id="trl-chat-messages" aria-live="polite"></div>
    <div id="trl-image-preview">
      <img alt="Selected product">
      <span></span>
      <button id="trl-image-remove" type="button">×</button>
    </div>
    <div id="trl-turnstile-wrap"><div id="trl-turnstile"></div></div>
    <form id="trl-chat-form">
      <label id="trl-image-button" for="trl-chat-image" title="Upload product image">📷</label>
      <input id="trl-chat-image" type="file" accept="image/jpeg,image/png,image/webp" hidden>
      <input id="trl-chat-input" maxlength="800" autocomplete="off">
      <button id="trl-chat-send" type="submit" disabled></button>
    </form>
  `;

  const launcher = document.createElement("button");
  launcher.id = "trl-chat-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-expanded", "false");
  launcher.textContent = "✦";

  document.body.append(panel, launcher);

  const messages = panel.querySelector("#trl-chat-messages");
  const form = panel.querySelector("#trl-chat-form");
  const input = panel.querySelector("#trl-chat-input");
  const send = panel.querySelector("#trl-chat-send");
  const close = panel.querySelector("#trl-chat-close");
  const imageInput = panel.querySelector("#trl-chat-image");
  const imagePreview = panel.querySelector("#trl-image-preview");
  const imagePreviewPhoto = imagePreview.querySelector("img");
  const imagePreviewName = imagePreview.querySelector("span");
  const imageRemove = panel.querySelector("#trl-image-remove");
  const langToggle = panel.querySelector("#trl-lang-toggle");
  const imageButton = panel.querySelector("#trl-image-button");

  let history = [];
  let turnstileToken = "";
  let turnstileWidgetId = null;
  let busy = false;
  let selectedImage = null;

  function applyStrings() {
    const s = t();
    panel.dir = s.dir;
    panel.setAttribute("aria-label", s.title);
    panel.querySelector("#trl-title").textContent = s.title;
    panel.querySelector("#trl-subtitle").textContent = `${s.subtitle} • English / العربية`;
    langToggle.textContent = s.langToggle;
    close.setAttribute("aria-label", s.close);
    launcher.setAttribute("aria-label", s.open);
    input.placeholder = s.placeholder;
    input.setAttribute("aria-label", s.title);
    send.textContent = s.send;
    imageButton.setAttribute("aria-label", s.imageLabel);
    imageButton.title = s.imageLabel;
    imageRemove.setAttribute("aria-label", s.removeImage);
  }
  applyStrings();

  function avatar(role) {
    const el = document.createElement("div");
    el.className = "trl-avatar";
    if (role === "assistant") {
      el.innerHTML = `<img src="${LOGO_URL}" alt="">`;
    } else {
      el.style.visibility = "hidden"; // keeps user bubbles aligned without a visible avatar
    }
    return el;
  }

  function addMessage(role, text) {
    const row = document.createElement("div");
    row.className = `trl-row ${role === "user" ? "trl-row-user" : ""}`;

    const bubble = document.createElement("div");
    bubble.className = `trl-message ${role === "user" ? "trl-user" : "trl-bot"}`;
    bubble.dir = "auto";
    bubble.textContent = text;

    if (role === "user") {
      row.appendChild(bubble);
    } else {
      row.appendChild(avatar("assistant"));
      row.appendChild(bubble);
    }

    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  function addTypingIndicator() {
    const row = document.createElement("div");
    row.className = "trl-row";
    row.appendChild(avatar("assistant"));

    const bubble = document.createElement("div");
    bubble.className = "trl-message trl-bot";
    bubble.innerHTML = `<span class="trl-typing"><span></span><span></span><span></span></span>`;

    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  function addImageMessage(text, previewUrl) {
    const row = document.createElement("div");
    row.className = "trl-row trl-row-user";

    const bubble = document.createElement("div");
    bubble.className = "trl-message trl-user";
    bubble.dir = "auto";

    const image = document.createElement("img");
    image.className = "trl-user-image";
    image.src = previewUrl;
    image.alt = "Uploaded product";
    bubble.appendChild(image);

    if (text) bubble.appendChild(document.createTextNode(text));
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function renderProductCards(products) {
    if (!Array.isArray(products) || !products.length) return;
    const list = document.createElement("div");
    list.className = "trl-product-list";

    products.forEach((product) => {
      const card = document.createElement("article");
      card.className = "trl-product-card";

      const image = document.createElement("img");
      image.src = product.image;
      image.alt = product.name;

      const details = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = product.name;
      const code = document.createElement("small");
      code.textContent = product.code || product.category || t().catalogueProduct;
      const link = document.createElement("a");
      link.href = product.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = t().viewProduct;

      details.append(name, code, link);
      card.append(image, details);
      list.appendChild(card);
    });

    messages.appendChild(list);
    messages.scrollTop = messages.scrollHeight;
  }

  function prepareImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        reject(new Error("Please choose a JPG, PNG or WebP image"));
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        reject(new Error("Please choose an image smaller than 8 MB"));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Unable to read this image"));
      reader.onload = () => {
        const source = String(reader.result);
        const image = new Image();
        image.onerror = () => reject(new Error("Unable to open this image"));
        image.onload = () => {
          const maximum = 1100;
          const scale = Math.min(1, maximum / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const previewUrl = canvas.toDataURL("image/jpeg", 0.78);
          resolve({
            data: previewUrl.split(",")[1],
            mimeType: "image/jpeg",
            previewUrl,
            fileName: file.name,
          });
        };
        image.src = source;
      };
      reader.readAsDataURL(file);
    });
  }

  function clearSelectedImage() {
    selectedImage = null;
    imageInput.value = "";
    imagePreview.classList.remove("trl-visible");
    imagePreviewPhoto.removeAttribute("src");
    imagePreviewName.textContent = "";
    updateSendButton();
  }

  function updateSendButton() {
    send.disabled = busy || !turnstileToken || (!input.value.trim() && !selectedImage);
  }

  function resetTurnstile() {
    turnstileToken = "";
    if (window.turnstile && turnstileWidgetId !== null) {
      window.turnstile.reset(turnstileWidgetId);
    }
    updateSendButton();
  }

  function renderTurnstile() {
    if (!window.turnstile || turnstileWidgetId !== null) return;
    turnstileWidgetId = window.turnstile.render("#trl-turnstile", {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "light",
      size: "flexible",
      callback(token) {
        turnstileToken = token;
        updateSendButton();
      },
      "expired-callback": resetTurnstile,
      "error-callback": resetTurnstile,
    });
  }

  function loadTurnstile() {
    if (window.turnstile) return renderTurnstile();
    if (document.querySelector('script[data-trl-turnstile="true"]')) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.trlTurnstile = "true";
    script.addEventListener("load", renderTurnstile);
    document.head.appendChild(script);
  }

  function setOpen(open) {
    panel.classList.toggle("trl-open", open);
    launcher.setAttribute("aria-expanded", String(open));
    if (open) {
      loadTurnstile();
      setTimeout(() => input.focus(), 50);
    }
  }

  addMessage("assistant", t().greeting);

  launcher.addEventListener("click", () => setOpen(!panel.classList.contains("trl-open")));
  close.addEventListener("click", () => setOpen(false));
  langToggle.addEventListener("click", () => {
    lang = lang === "en" ? "ar" : "en";
    applyStrings();
  });
  input.addEventListener("input", updateSendButton);
  imageRemove.addEventListener("click", clearSelectedImage);
  imageInput.addEventListener("change", async () => {
    const file = imageInput.files?.[0];
    if (!file) return;
    try {
      selectedImage = await prepareImage(file);
      imagePreviewPhoto.src = selectedImage.previewUrl;
      imagePreviewName.textContent = selectedImage.fileName;
      imagePreview.classList.add("trl-visible");
      updateSendButton();
    } catch (error) {
      clearSelectedImage();
      addMessage("assistant", error.message);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if ((!message && !selectedImage) || !turnstileToken || busy) return;

    const previousHistory = history.slice(-6);
    const token = turnstileToken;
    const imageForRequest = selectedImage;
    const historyMessage = message || "Customer uploaded a product photo.";
    history.push({ role: "user", content: historyMessage });
    if (imageForRequest) {
      addImageMessage(message || "Please find this product.", imageForRequest.previewUrl);
    } else {
      addMessage("user", message);
    }
    input.value = "";
    clearSelectedImage();
    busy = true;
    updateSendButton();
    const waiting = addTypingIndicator();

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: previousHistory,
          turnstileToken: token,
          image: imageForRequest
            ? { data: imageForRequest.data, mimeType: imageForRequest.mimeType }
            : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chat request failed");

      waiting.dir = "auto";
      waiting.textContent = data.reply;
      history.push({ role: "assistant", content: data.reply });
      renderProductCards(data.products);
    } catch (error) {
      waiting.dir = "auto";
      waiting.textContent = `${error.message}. You can WhatsApp us on +974 5557 7303.`;
    } finally {
      busy = false;
      resetTurnstile();
      input.focus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
})();
