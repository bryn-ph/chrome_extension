const domain = window.location.hostname;

if (domain.includes("facebook.com")) {
  const BlurSection = "filter:blur(8px)!important; pointer-events:none!important; user-select:none!important;";

  const hideFacebookDistractions = () => {
    // Blur distracting elements
    const blurSelectors = [
      '[data-pagelet="FeedUnit"]',
      '[data-pagelet="Stories"]',
      '[data-pagelet="RightRail"]',
      '[data-pagelet="GroupsLeftColumn"]',
      "video[playsinline]",
    ];
    blurSelectors.forEach((selector) => {
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        el.style.cssText = BlurSection;
      });
    });

    // Keep messaging visible - remove blur from messenger
    const messagingSelectors = [
      '[data-pagelet="MercuryFixedBottomContainer"]',
      '[aria-label="Messenger"]',
      ".x9f619",
    ];
    messagingSelectors.forEach((selector) => {
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        el.style.cssText = "";
      });
    });
  };

  hideFacebookDistractions();
  const observer = new MutationObserver(hideFacebookDistractions);
  observer.observe(document.body, { childList: true, subtree: true });
}
