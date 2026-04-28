(function () {
  // Show the blocked domain (passed in via the `?d=` query param) inside the chip.
  const params = new URLSearchParams(window.location.search);
  const domain = params.get("d") || "";
  const domainEl = document.getElementById("domain");
  if (domainEl) domainEl.textContent = domain;

  // "Go back": navigate back if we have history, otherwise close the tab.
  // If going back returns the user to a still-blocked URL the background
  // script will re-redirect them here, which is the intended behaviour.
  const backBtn = document.getElementById("back");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      try {
        chrome.tabs.getCurrent((tab) => {
          if (tab && typeof tab.id === "number") {
            chrome.tabs.remove(tab.id);
          } else {
            window.close();
          }
        });
      } catch (e) {
        window.close();
      }
    });
  }
})();
