let data = {};

// タブが切り替わった時のイベント
chrome.tabs.onActivated.addListener(function (tabId) {
  // chrome.tabs.query({"active": true}, function (tab) {
  //     console.log(tab[0].url); // 切り替わったタブのURL
  //     chrome.tabs.remove(tab[0].id); //切り替わったタブを削除
  // });
  chrome.action.setBadgeText({ text: "" });
});

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    switch (request.type) {
    case "twitterlikecount":
      //アイコンの文字を変更する
      chrome.action.setBadgeText({ text: request.text });
      break;
    case "createTab":
      if(process.env.DEBUG){
        console.log("createTab");
      }
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        data = request.data;
        const tab = tabs[0];
        if (tab.id) {
          chrome.tabs.create({ url: request.url, index:tab.index+1, selected:true }, function(newTab: chrome.tabs.Tab){
            // if(newTab.id){
            //   chrome.tabs.sendMessage(
            //   newTab.id,
            //   {
            //     type: 'createTab',
            //     data: request.data
            //   });
            // }
          });
        }
      });
    case "getdata":
      sendResponse({data: data});
      return;
    default:
      console.log("Error: Unkown request.")
      console.log(request);
    }
    sendResponse({response: "listener is successful"});
  }
);