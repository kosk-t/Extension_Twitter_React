let namelist : any= {};
let listmode : String= "";
let tabid: number | undefined = 0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(process.env.DEBUG){
      console.log("addListner")
    }
    tabid = sender.tab?.id;

    if (request.name === 'start') {
        // listmode = request.text;
        setObservation();
    }else if (request.name === 'stop') {
        executeStopProcess("download");
    }else if (request.name === 'view') {
        executeStopProcess("view");
    }


    // console.log("Recv. Send response = " + document.title);
    sendResponse({ title: document.title });

    return true;
});

// MutationObserverを使って、子要素の変化を監視する
const observer = new MutationObserver(mutations => {
    // mutationsをループし、新しく追加された子要素を取得する

    // const childs = parentElement.childNodes
    // console.log("childs")
    // console.log(childs)

    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(item => {
        if (item.nodeType === Node.ELEMENT_NODE) { //&& item.classList.contains('child')
            addNamesList(item)
        }
      });
    });
  });

function addNamesList(item : Node){
    if(item.nodeType != Node.ELEMENT_NODE){
      return;
    }
    if(listmode === "like"){
        addLikeList(item);
    }else{
        addTweetList(item);
    }
}

function addLikeList(item : any){
    // 新しく追加された子要素を処理する
    // console.log('新しい子要素が追加されました:', item);
    const element = item.querySelector('[class="css-175oi2r r-1iusvr4 r-16y2uox"]')
    // console.log('element')
    // console.log(element)
    if(element == null){
        return;
    }
    const innerNameElement = element.querySelector("[class='css-175oi2r r-1awozwy r-18u37iz r-1wbh5a2']").childNodes[0];

    //内部名取得
    // console.log("innerNameElement")
    // console.log(innerNameElement)
    let innerName : any = innerNameElement.textContent
    // console.log("innerName")
    // console.log(innerName)

    if(namelist[innerName]){
        // console.log("skip : " + innerName)
        return;
    }

    //img
    //非同期で取って来るっぽくて、当初このタグが存在しないのでナシ
    // const imgDivElement = item.querySelector("[class='css-1dbjc4n r-1niwhzg r-vvn4in r-u6sd8q r-4gszlv r-1p0dtai r-1pi2tsx r-1d2f490 r-u8s1d r-zchlnj r-ipm5af r-13qz1uu r-1wyyakw']")
    // let imgtag = "";
    // if(imgDivElement){
    //     imgtag = imgDivElement.outerHTML;
    // }

    //フォローされていればtrue
    const isFollowed = !(element.querySelector('[data-testid="userFollowIndicator"]') === null)
    // console.log("isFollowed")
    // console.log(isFollowed)

    //表示名取得
    const displayNameParent = element.querySelector('[class="css-175oi2r r-1wbh5a2 r-dnmrzs"]')

    // console.log('displayNameParent')
    // console.log(displayNameParent)
    let nameResult = displayNameParent.innerText;
    // displayNameParent.childNodes.forEach((nameItem: Element, nameIndex: any) =>{
    //     if(nameItem.tagName == "SPAN"){
    //     nameResult += nameItem.textContent
    //     }else if(nameItem.tagName == "IMG"){
    //     nameResult += nameItem.getAttribute('alt')
    //     }
    // })


    // console.log("nameResult")
    // console.log(nameResult)

    //bio取得
    
    const bioParent = element.querySelector("[class='css-146c3p1 r-bcqeeo r-1ttztb7 r-qvutc0 r-37j5jr r-a023e6 r-rjixqe r-16dba41 r-1h8ys4a r-1jeg54m']")
    // console.log('bioParent')
    // console.log(bioParent)
    let bioResult = ""
    if(bioParent){
        bioParent.childNodes.forEach((bioItem : Element, nameIndex: any) =>{
            if(bioItem.tagName == "SPAN" || bioItem.tagName == "DIV"){
                bioResult += bioItem.textContent;//.innerHTML
            }else if(bioItem.tagName == "IMG"){
                bioResult += bioItem.getAttribute('alt')
            }else if(bioItem.tagName == "A"){
                bioResult += bioItem.textContent;//.innerHTML
            }
        })
    }
    // console.log("bioResult")
    // console.log(bioResult)

    let itemvalues = {displayName: nameResult, isFollowed: isFollowed, bio:bioResult};
    namelist[innerName] = itemvalues;
    // chrome.storage.sync.set({'namelist': namelist}, function () {
    // });

    //backgroundにメッセージ送信
    chrome.runtime.sendMessage({
        type: "twitterlikecount",
        text: String(Object.keys(namelist).length)
    },
    function (response) {
    if (response) {
        // console.log(response)
    }
    });
}

function addTweetList(item : any){
    // 新しく追加された子要素を処理する
    // console.log('新しい子要素が追加されました:', item);
    const article = item.querySelector('article');
    if (article == null){
      return;
    }
    const userElement = article.querySelector("div[data-testid='User-Name']")
    // console.log('element')
    // console.log(element)
    if(userElement == null){
        return;
    }

    const userDisplayElement = userElement.childNodes[0];
    const userNameElement = userElement.childNodes[1];

    const displayNameElement = userDisplayElement.querySelector("div > a > div > div");
    let nameResult = ""
    displayNameElement.childNodes.forEach((nameItem: Element, nameIndex: any) =>{
        if(nameItem.tagName == "SPAN"){
        nameResult += nameItem.textContent
        }else if(nameItem.tagName == "IMG"){
        nameResult += nameItem.getAttribute('alt')
        }
    })
    const innerNameElement = userNameElement.querySelectorAll("div > div > a > div > span")
    const innerName = innerNameElement[0].innerText;

    const articleContent = article.querySelector("div[data-testid='tweetText']").innerText;
    

    const itemvalues = {innerName:innerName, displayName:nameResult, article:articleContent};
    namelist[innerName] = itemvalues;
    // chrome.storage.sync.set({'namelist': namelist}, function () {
    // });

    //backgroundにメッセージ送信
    //アイコンの数字を変える目的
    chrome.runtime.sendMessage({
        type: "twitterlikecount",
        text: String(Object.keys(namelist).length)
    },
    function (response) {
    if (response) {
        // console.log(response)
    }
    });
}

function executeStopProcess(mode: string){
    if(listmode === "like"){
        executeDownloadLike(mode);
    }else{
        executeDownloadTweet(mode);
    }
}

function executeDownloadLike(mode: string){
  chrome.runtime.sendMessage({ type: 'createTab', url: 'likedata.html', data:namelist}, () =>{
    observer.disconnect();
    namelist = {};
  });
}

function executeDownloadTweet(mode : string){
  chrome.runtime.sendMessage({ type: 'createTab', url: 'quotedata.html', data:namelist}, () =>{
    observer.disconnect();
    namelist = {};
  });
}

function escapeHtml(unsafe: any) {
    return unsafe.replace(/[&<"']/g, function(match: string) {
      switch (match) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case "\"":
          return "&quot;";
        case "'":
          return "&#039;";
      }
    });
  }

// The body of this function will be executed as a content script inside the
// current page
function setObservation() {

  let categories = document.querySelectorAll('div[data-testid="ScrollSnap-List"] > div');
  if(categories.length == 0){
    listmode = "reply"
  }else{
    let isQuoteResult = categories[0].querySelector("a")?.getAttribute("aria-selected")
    let isRepostResult = categories[1].querySelector("a")?.getAttribute("aria-selected")
    let isLikeResult = categories[2].querySelector("a")?.getAttribute("aria-selected")
    if(isQuoteResult == "true"){
      listmode = "reply"
    }else{
      listmode = "like"
    }
  }


    // console.log("hello 1");
    namelist = {};
    
    // const testbigelement = document.evaluate('//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div[1]/div/section', document, null, XPathResult.ANY_TYPE, null)
    const bigelement: any | null = document.querySelector('div[data-testid="primaryColumn"] > div > section > div > div');
    
    // console.log(bigelement)
    // const ariaelement = bigelement.querySelector('[aria-labelledby="accessible-list-0"]')
    // console.log(ariaelement)
    // const list = ariaelement.childNodes[1]
    // console.log(list)
    // const listchild = list.firstChild
    // console.log(listchild)
    
    // const parentElement = bigelement.querySelector('div > div')
    observer.observe(bigelement, { childList: true });

    for (let key in bigelement.childNodes) {
        addNamesList(bigelement.childNodes[key])
    }
}
 




// // 監視を開始する
// observer.observe(parent, { childList: true });