// Defense-in-depth content script that runs at document_start. The main
// enforcement is the background script redirecting blocklisted tabs to the
// extension's blocked.html, but service workers can be slow to wake up after
// a Chrome restart, so this script does a synchronous best-effort check
// against cached blocklist/focusSessionState and stops the page early.

type FocusSessionState = {
  started?: boolean;
  onBreak?: boolean;
};

function isInActiveFocusSession(state: FocusSessionState | undefined): boolean {
  if (!state) return false;
  return state.started === true && state.onBreak !== true;
}

function redirectToBlockedPage(host: string) {
  const blockedUrl = chrome.runtime.getURL("blocked.html") + "?d=" + encodeURIComponent(host);
  // Stop any ongoing parsing/loading first.
  try {
    window.stop();
  } catch {
    /* ignore */
  }
  window.location.replace(blockedUrl);
}

function maybeBlockNow() {
  // Skip the extension's own blocked page.
  const blockedPrefix = chrome.runtime.getURL("blocked.html");
  if (window.location.href.startsWith(blockedPrefix)) return;

  chrome.storage.local.get(["blocklist", "focusSessionState"], (data) => {
    const blocklist: string[] = data.blocklist || [];
    const focusSessionState: FocusSessionState | undefined = data.focusSessionState;

    if (!isInActiveFocusSession(focusSessionState)) return;
    if (!blocklist.length) return;

    const host = window.location.hostname;
    const blocked = blocklist.some((site) => site && host.includes(site));
    if (blocked) {
      redirectToBlockedPage(host);
    }
  });
}

maybeBlockNow();

// React to mid-session blocklist edits or focus state changes.
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (changes.focusSessionState || changes.blocklist) {
    maybeBlockNow();
  }
});
