/**
 * mkraftman-sony-bluray-numpad
 * Custom card for Sony Blu-ray numeric input via rest_command.
 * Shows a dialpad icon that opens a custom numpad overlay.
 */

class MkraftmanSonyBlurayNumpad extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._el = {};
    this._built = false;
    this._active = false;
    this._digits = "";
  }

  static getStubConfig() {
    return {};
  }

  setConfig(config) {
    this._config = config || {};
    if (this._hass) this._build();
  }

  getCardSize() {
    return 2;
  }

  getGridOptions() {
    return { rows: 2, columns: 12, min_rows: 2, min_columns: 6 };
  }

  getLayoutOptions() {
    return { grid_columns: 4, grid_rows: 2 };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    if (!this._built) this._build();
  }

  _build() {
    if (this._built || !this._hass || !this._config) return;

    const shadow = this.shadowRoot;
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100%;
        }
        .card {
          background: transparent;
          border-radius: 12px;
          padding: 12px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .kb-btn {
          width: 55px;
          height: 55px;
          border-radius: 0;
          border: none;
          background: transparent;
          color: #A9A9A9;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: opacity 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .kb-btn:active {
          opacity: 0.6;
        }
        .kb-btn ha-icon {
          --mdc-icon-size: 55px;
        }

        .active-row {
          display: none;
          align-items: center;
          width: 100%;
          height: 56px;
        }
        .active-row.visible {
          display: flex;
        }
        .text-display {
          flex: 1;
          font-size: 24px;
          font-weight: 500;
          color: var(--primary-text-color, #fff);
          white-space: nowrap;
          overflow: visible;
          user-select: none;
          height: 56px;
          line-height: 56px;
          text-align: center;
          letter-spacing: 4px;
        }

        /* Numpad scrim - covers dashboard above numpad */
        .numpad-scrim {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9998;
          background: transparent;
        }
        .numpad-scrim.visible {
          display: block;
        }

        /* Numpad overlay */
        .numpad-overlay {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: #d1d5db;
          padding: 8px 4px;
          padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
          box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
          border-radius: 24px 24px 0 0;
        }
        .numpad-overlay.visible {
          display: block;
        }
        .numpad-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          max-width: 400px;
          margin: 0 auto;
        }
        .numpad-key {
          height: 46px;
          border-radius: 6px;
          border: none;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          -webkit-tap-highlight-color: transparent;
          box-shadow: 0 1px 0 rgba(0,0,0,0.3);
        }
        .numpad-key:active {
          background: #c8c8c8;
        }
        .numpad-key ha-icon {
          --mdc-icon-size: 42px;
          color: #1c1c1e;
        }
        .numpad-key[data-action] ha-icon {
          --mdc-icon-size: 36px;
        }
      </style>

      <div class="card">
        <button class="kb-btn" id="kbBtn">
          <ha-icon icon="mdi:dialpad"></ha-icon>
        </button>
        <div class="active-row" id="activeRow">
          <div class="text-display" id="textDisplay"></div>
        </div>
      </div>

      <div class="numpad-scrim" id="numpadScrim"></div>
      <div class="numpad-overlay" id="numpadOverlay">
        <div class="numpad-grid">
          <button class="numpad-key" data-digit="1"><ha-icon icon="mdi:numeric-1"></ha-icon></button>
          <button class="numpad-key" data-digit="2"><ha-icon icon="mdi:numeric-2"></ha-icon></button>
          <button class="numpad-key" data-digit="3"><ha-icon icon="mdi:numeric-3"></ha-icon></button>
          <button class="numpad-key" data-digit="4"><ha-icon icon="mdi:numeric-4"></ha-icon></button>
          <button class="numpad-key" data-digit="5"><ha-icon icon="mdi:numeric-5"></ha-icon></button>
          <button class="numpad-key" data-digit="6"><ha-icon icon="mdi:numeric-6"></ha-icon></button>
          <button class="numpad-key" data-digit="7"><ha-icon icon="mdi:numeric-7"></ha-icon></button>
          <button class="numpad-key" data-digit="8"><ha-icon icon="mdi:numeric-8"></ha-icon></button>
          <button class="numpad-key" data-digit="9"><ha-icon icon="mdi:numeric-9"></ha-icon></button>
          <button class="numpad-key" data-action="backspace"><ha-icon icon="mdi:backspace-outline"></ha-icon></button>
          <button class="numpad-key" data-digit="0"><ha-icon icon="mdi:numeric-0"></ha-icon></button>
          <button class="numpad-key" data-action="close"><ha-icon icon="mdi:keyboard-close-outline"></ha-icon></button>
        </div>
      </div>
    `;

    this._el.kbBtn = shadow.getElementById("kbBtn");
    this._el.activeRow = shadow.getElementById("activeRow");
    this._el.textDisplay = shadow.getElementById("textDisplay");
    this._el.numpadOverlay = shadow.getElementById("numpadOverlay");
    this._el.numpadScrim = shadow.getElementById("numpadScrim");

    // Tap icon -> activate
    this._el.kbBtn.addEventListener("click", () => this._activate());

    // Tap outside numpad -> close
    this._el.numpadScrim.addEventListener("click", () => this._deactivate());

    // Numpad key events
    this._el.numpadOverlay.addEventListener("click", (e) => {
      const key = e.target.closest(".numpad-key");
      if (!key) return;

      const digit = key.dataset.digit;
      const action = key.dataset.action;

      if (digit) {
        this._digits += digit;
        this._sendDigit(digit);
        this._updateTextDisplay(this._digits);
      } else if (action === "backspace") {
        if (this._digits.length > 0) {
          this._digits = this._digits.slice(0, -1);
          this._sendBackspace();
          this._updateTextDisplay(this._digits);
        }
      } else if (action === "close") {
        this._deactivate();
      }
    });

    this._built = true;
  }

  _activate() {
    this._active = true;
    this._digits = "";
    this._el.kbBtn.style.display = "none";
    this._el.activeRow.classList.add("visible");
    this._el.numpadOverlay.classList.add("visible");
    this._el.numpadScrim.classList.add("visible");
    this._updateTextDisplay("");
    setTimeout(() => {
      this.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  _deactivate() {
    this._active = false;
    this._digits = "";
    this._el.numpadOverlay.classList.remove("visible");
    this._el.numpadScrim.classList.remove("visible");
    this._el.activeRow.classList.remove("visible");
    this._el.kbBtn.style.display = "flex";
    this._updateTextDisplay("");
  }

  _updateTextDisplay(text) {
    this._el.textDisplay.textContent = text;
  }

  _sendDigit(digit) {
    if (!this._hass) return;
    this._hass.callService("rest_command", "sony_bluray_num" + digit, {});
  }

  _sendBackspace() {
    if (!this._hass) return;
    this._hass.callService("rest_command", "sony_bluray_return", {});
  }

  connectedCallback() {
    if (this._hass && this._config && !this._built) {
      this._build();
    }
  }

  disconnectedCallback() {
    this._active = false;
    if (this._el.numpadOverlay) {
      this._el.numpadOverlay.classList.remove("visible");
    }
  }
}

customElements.define("mkraftman-sony-bluray-numpad", MkraftmanSonyBlurayNumpad);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "mkraftman-sony-bluray-numpad",
  name: "Mkraftman Sony Blu-ray Numpad",
  description: "Numeric input for Sony Blu-ray via rest_command.",
});
