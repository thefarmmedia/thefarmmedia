// The Farm Media — Instant Price Range Calculator (demo widget)
// This mirrors the exact kind of tool we build directly into client sites.
(function () {
  "use strict";

  var root = document.querySelector("[data-calculator]");
  if (!root) return;

  var sqftInput = root.querySelector("[data-sqft]");
  var sqftValue = root.querySelector("[data-sqft-value]");
  var coatingChips = root.querySelectorAll("[data-coating]");
  var conditionChips = root.querySelectorAll("[data-condition]");
  var sizeChips = root.querySelectorAll("[data-size-preset]");

  var lowOut = root.querySelector("[data-low]");
  var highOut = root.querySelector("[data-high]");
  var sqftOut = root.querySelector("[data-out-sqft]");
  var rateOut = root.querySelector("[data-out-rate]");
  var conditionOut = root.querySelector("[data-out-condition]");
  var progressBar = root.querySelector("[data-progress]");

  // $ per sqft ranges — illustrative industry ballpark figures for demo purposes only
  var COATING_RATES = {
    solid: { low: 3, high: 5, label: "Solid Color Epoxy" },
    flake: { low: 4, high: 7, label: "Flake / Chip Epoxy" },
    poly: { low: 5, high: 9, label: "Polyaspartic / Polyurea" },
    metallic: { low: 8, high: 12, label: "Metallic Epoxy" }
  };

  var CONDITION_MULT = {
    good: { mult: 1, label: "Good — ready to coat" },
    minor: { mult: 1.12, label: "Minor cracks / pitting" },
    major: { mult: 1.3, label: "Major repair needed" }
  };

  var state = {
    sqft: parseInt(sqftInput ? sqftInput.value : 450, 10),
    coating: "flake",
    condition: "good"
  };

  function setActive(list, matchAttr, value) {
    list.forEach(function (el) {
      el.classList.toggle("active", el.getAttribute(matchAttr) === value);
    });
  }

  function roundTo(n, step) {
    return Math.round(n / step) * step;
  }

  function currency(n) {
    return "$" + n.toLocaleString("en-US");
  }

  function calculate() {
    var rate = COATING_RATES[state.coating];
    var cond = CONDITION_MULT[state.condition];
    var low = roundTo(state.sqft * rate.low * cond.mult, 25);
    var high = roundTo(state.sqft * rate.high * cond.mult, 25);

    if (lowOut) lowOut.textContent = currency(low);
    if (highOut) highOut.textContent = currency(high);
    if (sqftOut) sqftOut.textContent = state.sqft.toLocaleString("en-US") + " sq ft";
    if (rateOut) rateOut.textContent = "$" + rate.low + " – $" + rate.high + " / sq ft (" + rate.label + ")";
    if (conditionOut) conditionOut.textContent = cond.label;

    if (progressBar) {
      var pct = Math.min(100, Math.round((state.sqft / 1200) * 100));
      progressBar.style.width = pct + "%";
    }
  }

  if (sqftInput) {
    sqftInput.addEventListener("input", function () {
      state.sqft = parseInt(sqftInput.value, 10);
      if (sqftValue) sqftValue.textContent = state.sqft.toLocaleString("en-US");
      setActive(sizeChips, "data-size-preset", "");
      calculate();
    });
  }

  coatingChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      state.coating = chip.getAttribute("data-coating");
      setActive(coatingChips, "data-coating", state.coating);
      calculate();
    });
  });

  conditionChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      state.condition = chip.getAttribute("data-condition");
      setActive(conditionChips, "data-condition", state.condition);
      calculate();
    });
  });

  sizeChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var val = parseInt(chip.getAttribute("data-size-preset"), 10);
      state.sqft = val;
      if (sqftInput) sqftInput.value = val;
      if (sqftValue) sqftValue.textContent = val.toLocaleString("en-US");
      setActive(sizeChips, "data-size-preset", chip.getAttribute("data-size-preset"));
      calculate();
    });
  });

  // init defaults
  setActive(coatingChips, "data-coating", state.coating);
  setActive(conditionChips, "data-condition", state.condition);
  if (sqftValue) sqftValue.textContent = state.sqft.toLocaleString("en-US");
  calculate();

  // lead capture form on calculator page (demo only)
  var leadForm = document.querySelector("[data-calc-lead-form]");
  if (leadForm) {
    leadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = leadForm.querySelector(".form-status");
      var resultSummary = leadForm.querySelector("[data-lead-summary]");
      if (resultSummary && lowOut && highOut) {
        resultSummary.value =
          "Estimate: " + lowOut.textContent + " - " + highOut.textContent +
          " | " + state.sqft + " sq ft | " + COATING_RATES[state.coating].label +
          " | " + CONDITION_MULT[state.condition].label;
      }
      if (status) {
        status.textContent = "This is a demo capture — in a live build, this lead (with the price range attached) lands straight in your CRM.";
        status.classList.remove("err");
        status.classList.add("show", "ok");
      }
      leadForm.reset();
    });
  }
})();
