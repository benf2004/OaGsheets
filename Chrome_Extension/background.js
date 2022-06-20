importScripts('ExtPay.js') // or `import` / `require` if using a bundler

chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
        if (changeInfo.url) {
            chrome.tabs.sendMessage( tabId, {
                message: 'url_change',
                url: changeInfo.url
            })
        }
    }
);

function getCookies(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, function (cookie) {
        if (callback) {
            callback(cookie.value);
        }
    });
}

const website = 'http://oa2gsheets.com/'
const filter = {
    url: [
        {
            urlMatches: 'https://oa2gsheets.com/picker',
        },
    ],
};

chrome.webNavigation.onCommitted.addListener(() => {
    console.log("TRIGGERED")
    getCookies(website, "fileID", function (id) {
        console.log(id);
        chrome.storage.sync.set({fileID: id}, function () {
            console.log('Value is set to ' + id);
        });
    });

    getCookies(website,"order", function (id){
        console.log(id);
        chrome.storage.sync.set({order: id}, function(){
            console.log("Success adding order to sync!")
            console.log(id)
        })
    })

    getCookies(website, 'is_dynam', function(id){
        console.log(id)
        chrome.storage.sync.set({is_dynam: id}, function(){
            console.log("Success adding is_dynam to sync!")
        })
    })
}, filter);

function check_trial(user) {
    const now = new Date();
    const days_21 = 1000*60*60*24*21 // in milliseconds
    if (user.trialStartedAt && (now - user.trialStartedAt) < days_21) {
        return true
    }
    else {
        return false
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("RECIEVED MESSAGE:")
        console.log(request)
        return true;
        if (request === "is_paid") {
            chrome.storage.sync.get(['oa_plan'], function(result) {
                let plan = result.oa_plan
                const extpay = ExtPay(plan)
                extpay.getUser().then(user => {
                    console.log("MESSAGE RECIEVED")
                    let send;
                    if (user.paid) {
                        send = "true"
                    }
                    else if (check_trial(user) === true){
                        send = "true"
                    }
                    else {
                        send = "false"
                    }
                    sendResponse(send)
                })
            });
        }
        if (request === "monthly_activated"){
                console.log("received message")
                var extpay = ExtPay('oa2gsheets');
                extpay.startBackground();
                sendResponse("monthly started")

        }
        if (request === "lifetime_activated"){
            console.log("received message")
            chrome.storage.local.remove(['extensionpay_api_key','extensionpay_installed_at', "extensionpay_user", 'oa_plan'])
            chrome.storage.sync.remove(['extensionpay_api_key','extensionpay_installed_at', "extensionpay_user", 'oa_plan'], function() {
                var extpay = ExtPay('oa2gsheets-lifetime')
                extpay.startBackground();
                sendResponse("lifetime activated")
            })
        }
    }
);
