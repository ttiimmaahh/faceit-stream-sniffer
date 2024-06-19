var msg = {}
msg.m3u8list = []
var urlPatternLive = /http[s]?[://]{1}[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%=~_|]*index.m3u8$/
var urlPatternDemand = /http[s]?[://]{1}[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%?=~_|]*index.m3u8[-A-Za-z0-9+&@#/%?=~_|!:,.;]*$/
var url = ""
//Monitor page network requests
chrome.webRequest.onHeadersReceived.addListener(details => {
    var xToken = '';
    chrome.tabs.query({ active: true }, tabs => {
        if (url != tabs[0].url) {
            msg.m3u8list = []
        }
        url = tabs[0].url
        var tmp
        if (/\?/.test(details.url)) {
            tmp = details.url.slice(0, details.url.indexOf("?"))
        } else {
            tmp = details.url.trim()
        }
        // console.log(tmp);

        if (urlPatternLive.test(tmp)) {
            console.log("Live: " + details.url);

            // console.log(details.responseHeaders);
            for (i in details.responseHeaders) {
                if (details.responseHeaders[i].name == 'x-token') {
                    // console.log(details.responseHeaders[i].value);
                    xToken = details.responseHeaders[i].value;
                }
            }

            let trimmedUrl = details.url;
            if (details.url.includes("&start")) {
                trimmedUrl = details.url.substring(0, details.url.indexOf("&start"));
                console.log("Trimmed URL: " + trimmedUrl);
            }

            let urlObj = {
                "url": trimmedUrl,
                "token": xToken
            }

            msg.m3u8list = [];
            if (msg.m3u8list.indexOf(urlObj)==-1) {
                msg.m3u8list.push(urlObj)
            }
        }
    });
}, { urls: ["<all_urls>"] }, ["responseHeaders"]);

chrome.runtime.onConnect.addListener(function (port) {//Add listener
    port.onMessage.addListener(function (receivedMsg) {//Listen for messages from popups
        if (receivedMsg.action == 'getList') {
            //console.log("bg send:" + msg.toString())
            port.postMessage({action:'m3u8List','data':msg.m3u8list})
        }
    })
});