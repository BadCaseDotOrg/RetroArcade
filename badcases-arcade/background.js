chrome.action.onClicked.addListener(() => {
  console.log("[background] Extension icon clicked, opening arcadeTab.html");
  chrome.tabs.create({ url: chrome.runtime.getURL("arcadeTab.html") });
});