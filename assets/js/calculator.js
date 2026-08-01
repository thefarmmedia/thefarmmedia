// The Farm Media — Instant Price Calculator (gated unlock demo)
// Mirrors the real two-step "calculate -> unlock with contact info" flow
// used on live client sites. This demo does not submit anywhere —
// on a real build this posts straight into the client's CRM.
(function () {
  "use strict";

  var root = document.querySelector("[data-gated-calc]");
  if (!root) return;

  var projectType = root.querySelector("#projectType");
  var sqftInput = root.querySelector("#sqft");
  var systemSelect = root.querySelector("#system");
  var conditionSelect = root.querySelector("#condition");
  var difficultySelect = root.querySelector("#difficulty");

  var previewRange = root.querySelector("[data-preview-range]");
  var previewOverlay = root.querySelector("[data-preview-overlay]");
  var liveStatus = root.querySelector("[data-live-status]");
  var progressStep2 = root.querySelector("[data-progress-2]");

  var showUnlockBtn = root.querySelector("[data-show-unlock]");
  var unlockCard = root.querySelector("[data-unlock-card]");
  var leadForm = root.querySelector("[data-lead-form]");
  var unlockBtn = root.querySelector("[data-unlock-submit]");

  var resultBox = root.querySelector("[data-result-box]");
  var priceRangeEl = root.querySelector("[data-price-range]");
  var resultText = root.querySelector("[data-result-text]");
  var resetBtn = root.querySelector("[data-reset-calc]");

  // $ per sqft base rates by coating system — illustrative, for demo purposes
  var SYSTEM_RATES = {
    solid: { low: 3.5, high: 5.5, label: "Solid Color Epoxy" },
    flake: { low: 5.5, high: 7.5, label: "Full Broadcast Flake" },
    poly: { low: 6.5, high: 9.5, label: "Polyaspartic / Polyurea" },
    metallic: { low: 8.5, high: 12.5, label: "Metallic Epoxy" }
  };
  var CONDITION_ADD = { good: 0.25, average: 0.5, rough: 0.75 };
  var DIFFICULTY_ADD = { standard: 0, medium: 0, high: 1.0 };

  var pendingEstimate = null;

  function getEstimate() {
    var sqft = parseFloat(sqftInput.value);
    if (!sqft || sqft <= 0) return null;

    var sys = SYSTEM_RATES[systemSelect.value] || SYSTEM_RATES.flake;
    var condAdd = CONDITION_ADD[conditionSelect.value] || 0;
    var diffAdd = DIFFICULTY_ADD[difficultySelect.value] || 0;

    var lowRate = sys.low + condAdd + diffAdd;
    var highRate = sys.high + condAdd + diffAdd;

    var lowTotal = Math.round(sqft * lowRate);
    var highTotal = Math.round(sqft * highRate);

    return { sqft: sqft, systemLabel: sys.label, lowRate: lowRate, highRate: highRate, lowTotal: lowTotal, highTotal: highTotal };
  }

  function currency(n) { return "$" + n.toLocaleString("en-US"); }

  function updateLivePreview() {
    var est = getEstimate();
    if (!est) {
      previewRange.textContent = "$4,850 – $6,200";
      previewOverlay.textContent = "Enter your project details to start calculating…";
      liveStatus.textContent = "Estimated range: calculating…";
      pendingEstimate = null;
      return;
    }
    pendingEstimate = est;
    previewRange.textContent = currency(est.lowTotal) + " – " + currency(est.highTotal);
    previewOverlay.textContent = "Locked until you unlock your quote";
    liveStatus.textContent = "Estimated range: calculating… based on " + est.sqft.toLocaleString("en-US") + " sq ft";
  }

  ["input", "change"].forEach(function (evt) {
    [projectType, sqftInput, systemSelect, conditionSelect, difficultySelect].forEach(function (el) {
      el.addEventListener(evt, updateLivePreview);
    });
  });

  if (showUnlockBtn && unlockCard) {
    showUnlockBtn.addEventListener("click", function () {
      var sqft = parseFloat(sqftInput.value);
      if (!sqft || sqft <= 0) {
        sqftInput.focus();
        sqftInput.style.borderColor = "var(--red-bright)";
        return;
      }
      updateLivePreview();
      unlockCard.classList.remove("hidden");
      if (progressStep2) progressStep2.classList.add("active");
      unlockCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function revealResult() {
    var est = pendingEstimate || getEstimate();
    if (!est) return;

    priceRangeEl.textContent = currency(est.lowTotal) + " – " + currency(est.highTotal);
    resultText.innerHTML = "Based on <strong>" + est.sqft.toLocaleString("en-US") + " sq ft</strong> of " + est.systemLabel.toLowerCase() +
      " and the project details entered above, this project currently falls in the range shown. " +
      "The next step on a real build is a free on-site consultation to confirm measurements and slab condition.";

    resultBox.classList.remove("hidden");
    resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  if (leadForm) {
    leadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!pendingEstimate) {
        updateLivePreview();
        if (!pendingEstimate) return;
      }

      var status = leadForm.querySelector(".form-status");
      unlockBtn.disabled = true;
      unlockBtn.textContent = "Revealing Price…";

      window.setTimeout(function () {
        revealResult();
        unlockBtn.disabled = false;
        unlockBtn.textContent = "Reveal My Exact Ballpark Price";
        if (status) {
          status.textContent = "This is a demo — nothing was sent anywhere. On a live build, this exact submission (contact info + calculated estimate) posts straight into the client's CRM as a booked lead.";
          status.classList.remove("err");
          status.classList.add("show", "ok");
        }
        leadForm.reset();
      }, 500);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      projectType.value = "garage";
      sqftInput.value = "";
      systemSelect.value = "flake";
      conditionSelect.value = "good";
      difficultySelect.value = "standard";
      pendingEstimate = null;
      unlockCard.classList.add("hidden");
      resultBox.classList.add("hidden");
      if (progressStep2) progressStep2.classList.remove("active");
      updateLivePreview();
    });
  }

  updateLivePreview();
})();
