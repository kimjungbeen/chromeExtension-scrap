chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "xOqk2KFT",
        title: "Scrap subtitle of this video",
        contexts: ["selection"]
    })
})

// content script -> background
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    /*
     scrap
     */
    if (request.key == "LGjhVJ9y") {
        console.log("scrap")
        var [tab] = await chrome.tabs.query({active: true, currentWindow: true})
        var [response] = await chrome.scripting.executeScript({target: {tabId: tab.id}, func: scrap})
        
        console.log(response)
        
        var textOrURLs = response.result.textOrURLs
        var authorship = response.result.authorship
        var sourceURL = response.result.sourceURL
        
        if (textOrURLs.length == 0 && authorship == "" && sourceURL == "") {
            return true
        }
        
        if (authorship == "" && sourceURL != "") {
            var object = await scrapByURL(sourceURL)
            authorship = object.authorship
        }
        
        console.log("authorship: " + authorship)
        console.log("sourceURL: " + sourceURL)
        
        var text = ""
        for (const key in textOrURLs) {
            let textOrURL = textOrURLs[key]
            
            if (textOrURL.substring(0, 1) == "/" && textOrURL.match("fn")) {
                var object = await scrapByURL("https://wol.jw.org" + textOrURL)
                text = text + "[" + clean(object.text) + "]"
            } else if (textOrURL.substring(0, 1) != "/") {
                text = text + textOrURL
            }
        }
        
        await sleep(500)
        
        /*
         clipboard
         */
        await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: function (obj) {
                const html = obj.text + " (<a href='" + obj.sourceURL + "'>" + obj.authorship + "</a>)"
                const plain = obj.text + " ([" + obj.authorship + "](" + obj.sourceURL + "))"
                const item = new window.ClipboardItem({
                    'text/html': new Blob([html], {type: 'text/html'}),
                    'text/plain': new Blob([plain], {type: 'text/plain'})
                });
                navigator.clipboard.write([item]);
            },
            args: [{text: clean(text), authorship: clean(authorship), sourceURL: sourceURL}]
        })
    }
    
    /*
     scrap from link
     */
    else if (request.key == "oKl1WFqN") {
        console.log("scrap from link")
        var [tab] = await chrome.tabs.query({active: true, currentWindow: true})
        var [response] = await chrome.scripting.executeScript({target: {tabId: tab.id}, func: async function () {
            var tous = [];
            var s = window.getSelection();
            var r = s.getRangeAt(0);
            var cac = r.commonAncestorContainer;
            var sc = r.startContainer;
            var ec = r.endContainer;
            var c = ec;
            
            console.log('selection');
            console.log('range');
            
            while (cac.contains(c)) {
                if (c.nodeName == 'A') { ec = c; break; }
                else { c = c.parentElement; };
            };
            var so = r.startOffset;
            var eo = r.endOffset; c = sc;
            
            console.log(sc);
            console.log(ec);
            console.log(cac);
            
            do {
                if (c.nodeName == '#text') { tous.push(c.textContent); }
                else if (c.nodeName == 'A') {
                    var u = c.getAttribute('href');
                    if (u != '' && u != null) { tous.push(u); };
                    if (c.textContent != '' && c.textContent.match(/[0-9]/g)) { tous.push(c.textContent); };  };
                if (!cac.contains(c) || ec.contains(c)) { break; };
                
                while (c.nextSibling == undefined) {
                    c = c.parentNode;
                    if (c != undefined && window.getComputedStyle(c, null).getPropertyValue('display').match('block')) { tous.push(' '); };
                }; 
                
                c = c.nextSibling;
                
                while (c.firstChild != undefined && c.nodeName != 'A') { c = c.firstChild };
            } while (true);
            
            if (tous.length == 1) {
                tous[0] = tous[0].substr(0, eo);
                tous[0] = tous[0].substr(so);
            } else if (tous.length > 1) {
                tous[0] = tous[0].substr(so);
                tous[tous.length-1] = tous[tous.length-1].substr(0, eo);
            }
            
            return new Promise(function (resolve) {
                return resolve({textOrURLs: tous})
            })
        }})
        
        var textOrURLs = response.result.textOrURLs
        
        console.log(textOrURLs)
        
        var html = ""
        var plain = ""
        for (const key in textOrURLs) {
            let textOrURL = textOrURLs[key]
            
            if (textOrURL.substring(0, 1) == "/" && !textOrURL.match("fn")) {
                var obj = await scrapByURL("https://wol.jw.org" + textOrURL)
                html = html + clean(obj.text) + " (<a href='" + obj.sourceURL + "'>" + obj.authorship + "</a>)\n\n"
                plain = plain + clean(obj.text) + " ([" + obj.authorship + "](" + obj.sourceURL + "))\n\n"
            }
        }
        
        await sleep(500)

        console.log(html)
        console.log(plain)
        
        /*
         clipboard
         */
        await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: function (obj) {
                const item = new window.ClipboardItem({
                    'text/html': new Blob([obj.text.html], {type: 'text/html'}),
                    'text/plain': new Blob([obj.text.plain], {type: 'text/plain'})
                });
                navigator.clipboard.write([item]);
            },
            args: [{text: {html: html, plain: plain}}]
        })
    }
    
    /*
     get authorship
     */
    else if (request.key == "A9VF1nd5") {
        console.log("get authorship")
        var [tab] = await chrome.tabs.query({active: true, currentWindow: true})
        var [response] = await chrome.scripting.executeScript({target: {tabId: tab.id}, func: scrap})
        
        console.log(response)
        
        var textOrURLs = response.result.textOrURLs
        var authorship = response.result.authorship
        var sourceURL = response.result.sourceURL
        
        if (authorship == "" && sourceURL != "") {
            var object = await scrapByURL(sourceURL)
            authorship = object.authorship
        }
        
        console.log("authorship: " + authorship)
        console.log("sourceURL: " + sourceURL)
        
        await sleep(500)
        
        await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: function (obj) {
                const html = "(<a href='" + obj.sourceURL + "'>" + obj.authorship + "</a>)"
                const plain = "([" + obj.authorship + "](" + obj.sourceURL + "))"
                const item = new window.ClipboardItem({
                    'text/html': new Blob([html], {type: 'text/html'}),
                    'text/plain': new Blob([plain], {type: 'text/plain'})
                });
                navigator.clipboard.write([item]);
            },
            args: [{authorship: clean(authorship), sourceURL: sourceURL}]
        })
    }
    
    /*
     hwis content script -> background
     */
    else if (request.key == "kbg4pqlu") {
        console.log("hwis content script -> background")
        var [tab] = await chrome.tabs.query({active: true, currentWindow: true})
        var response;
        
        do {
            response = (await chrome.scripting.executeScript({target: {tabId: tab.id}, func: scrap}))[0]
            console.log("loop")
        } while (!response.result)
        
        var text = request.text
        var authorship = response.result.authorship
        var sourceURL = response.result.sourceURL

        console.log(text)
        
        var timestamps = text.match(/((\d{2}:)?\d{2}:\d{2}\.\d{3}) --> ((\d{2}:)?\d{2}:\d{2}\.\d{3})/g)
        text = text.replace(/((\d{2}:)?\d{2}:\d{2}\.\d{3}) --> ((\d{2}:)?\d{2}:\d{2}\.\d{3})/g, '')
        text = text.replace(/\S*:\S*/g, ' ')
        if (timestamps) {
            var fts = timestamps[0].replace(/(\.\d{3}) --> ((\d{2}:)?\d{2}:\d{2}\.\d{3})/g, '')
            var lts = timestamps[timestamps.length-1].replace(/((\d{2}:)?\d{2}:\d{2}\.\d{3}) --> /g, '').replace(/(.\d{3})/g, '')
            authorship = authorship + " " + fts + (fts == lts ? '' : "-" + lts)
        }

        console.log(timestamps)
        console.log(authorship)
        
        chrome.tabs.remove(tab.id)
        
        await sleep(500)
        
        /*
         clipboard
         */
        var [tab] = await chrome.tabs.query({active: true, currentWindow: true})
        await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: function (obj) {
                const html = obj.text + " (<a href='" + obj.sourceURL + "'>" + obj.authorship + "</a>)"
                const plain = obj.text + " ([" + obj.authorship + "](" + obj.sourceURL + "))"
                const item = new window.ClipboardItem({
                    'text/html': new Blob([html], {type: 'text/html'}),
                    'text/plain': new Blob([plain], {type: 'text/plain'})
                });
                navigator.clipboard.write([item]);
            },
            args: [{text: clean(text), authorship: authorship, sourceURL: sourceURL}]
        })
    }
})

async function scrapByURL(url) {
    const window = await chrome.windows.create({url: url})
    await chrome.tabs.query({active: true})
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true})
    
    var response = null
    var cnt = 0
    do {
        await sleep(500)
        cnt += 1
        response = (await chrome.scripting.executeScript({target: {tabId: tab.id}, func: scrap}))[0]
        console.log(response)
    } while (!response.result && cnt < 10) 
    
    var textOrURLs = response.result.textOrURLs
    var authorship = response.result.authorship
    var sourceURL = response.result.sourceURL
    
    console.log(textOrURLs)
    console.log(authorship)
    console.log(sourceURL)
    
    if (authorship == "" && sourceURL != "") {
        var object = await scrapByURL(sourceURL)
        authorship = object.authorship
    }
    
    var text = ""
    for (const key in textOrURLs) {
        let textOrURL = textOrURLs[key]
        
        if (textOrURL.substring(0, 1) == "/" && textOrURL.match("fn")) {
            const object = await scrapByURL("https://wol.jw.org" + textOrURL)
            text = text + "[" + clean(object.text) + "]"
        } else if (textOrURL.substring(0, 1) != "/") {
            text = text + textOrURL
        }
    }
    
    chrome.tabs.remove(tab.id)
    
    return new Promise(function (resolve) {
        return resolve({text: text, authorship: authorship, sourceURL: sourceURL})
    })
}

async function scrap() {
    console.log("scrap")
    const url = window.location.href
    console.log(url)
    
    if (url.match("jw.org")) {
        console.log("jw.org")
        if (url.match("fn")) {
            console.log("footnote")
            return new Promise(function (resolve) {
                return resolve({
                textOrURLs: [document.querySelector('.footnoteResult').textContent],
                authorship: "",
                sourceURL: ""
                })
            })
        } else if (document.querySelector("video")) {
            console.log("video")
            if (!(window.getSelection() && window.getSelection().type === "Range")) {
                console.log("create selection")
                var h = document.querySelector('#content h1');

                var s = window.getSelection();
                var r = document.createRange();
                s.removeAllRanges();
                r.setStart(h, 0);
                r.setEnd(h, h.length);
                s.addRange(r);
            }

            const address = await getAddress()
            return new Promise(function (resolve) {
                return resolve({
                    textOrURLs: [window.getSelection().toString()],
                    authorship: address.authorship,
                    sourceURL: address.sourceURL
                })
            })
        } else if (!(window.getSelection() && window.getSelection().type === "Range")) {
            console.log('no range')
            var rs = document.querySelector('.results')
            if (rs && rs.querySelector('.linkCard')) {
                console.log("link card")
                
                var target = rs.querySelector('.result');
                var fc = target;
                while (fc.firstChild != undefined) { fc = fc.firstChild };
                var lc = target;
                while (lc.lastChild != undefined) { lc = lc.lastChild };
                console.log('firstChild');
                console.log(fc);
                console.log('lastChild');
                console.log(lc);
                var s = window.getSelection();
                var r = document.createRange();
                s.removeAllRanges();
                r.setStart(fc, 0);
                r.setEnd(lc, lc.length);
                s.addRange(r);
    
                const address = await getAddress()
                return new Promise(function (resolve) {
                    return resolve({
                        textOrURLs: [window.getSelection().toString()],
                        authorship: address.authorship,
                        sourceURL: address.sourceURL
                    })
                })
            } else {
                console.log('not link card')
                var s = window.getSelection();
                var r = document.createRange();
                var hls = document.querySelectorAll('.jwac-textHighlight');
                if (hls) {
                    var fc = hls[0];
                    console.log("hls")
                    console.log(hls)
                    while (fc.firstChild != undefined) { fc = fc.firstChild };
                    var lc = hls[hls.length-1];
                    while (lc.lastChild != undefined) { lc = lc.lastChild };
                    console.log('firstChild');
                    console.log(fc);
                    console.log('lastChild');
                    console.log(lc);
                    s.removeAllRanges();
                    r.setStart(fc, 0);
                    r.setEnd(lc, lc.length);
                    s.addRange(r);
                }
            }
        }
        
        const address = await getAddress()
        return new Promise(function (resolve) {
            return resolve({
                textOrURLs: getTextOrURLs(),
                authorship: address.authorship,
                sourceURL: address.sourceURL
            })
        })
    } else {
        console.log("not jw.org")
        if (url.match("hwis")) {
            console.log("hwis")
            
            var event = document.createEvent("HTMLEvents")
            event.initEvent("click", true, true)
            event.eventName = "click"
            document.querySelector("#btn_view").dispatchEvent(event)

            const response = await chrome.runtime.sendMessage({
                key: "kbg4pqlu",
                text: window.getSelection().toString()
            })
            
            return new Promise(function (resolve) {
                return resolve({
                    textOrURLs: [],
                    authorship: "",
                    sourceURL: ""
                })
            })
        } else if (url.match("stdict")) {
            return new Promise(function (resolve) {
                return resolve({
                    textOrURLs: [window.getSelection().toString()],
                    authorship: "국립국어원 표준국어대사전 '" + document.querySelector(".t_blue2").textContent.trim() + "'",
                    sourceURL: url
                })
            })
        } else if (url.match("wikipedia")) {
            return new Promise(function (resolve) {
                return resolve({
                    textOrURLs: [window.getSelection().toString()],
                    authorship: "WIKIPEDIA '" + document.querySelector(".mw-page-title-main").textContent.trim() + "'",
                    sourceURL: url
                })
            })
        } else {
            console.log(document.title)
            return new Promise(function (resolve) {
                return resolve({
                    textOrURLs: [window.getSelection().toString()],
                    authorship: document.title,
                    sourceURL: url
                })
            })
        }
    }
    
    function getTextOrURLs() {
        console.log("get text or urls")
        
        var tous = [];
        var s = window.getSelection();
        var r = s.getRangeAt(0);
        var cac = r.commonAncestorContainer;
        var sc = r.startContainer;
        var ec = r.endContainer;
        var c = ec;
        
        console.log('selection');
        console.log('range');
        
        while (cac.contains(c)) {
            if (c.nodeName == 'A') { ec = c; break; }
            else { c = c.parentElement; };
        };
        var so = r.startOffset;
        var eo = r.endOffset; c = sc; 
        
        console.log(sc);
        console.log(ec);
        console.log(cac);
        
        do {
            if (c.nodeName == '#text') { tous.push(c.textContent); }
            else if (c.nodeName == 'A') {
                var u = c.getAttribute('href');
                if (u != '' && u != null) { tous.push(u); };
                if (c.textContent != '' && c.textContent.match(/[0-9]/g)) { tous.push(c.textContent); };  };
            if (!cac.contains(c) || ec.contains(c)) { break; };
            
            while (c.nextSibling == undefined) {
                c = c.parentNode;
                if (c != undefined && window.getComputedStyle(c, null).getPropertyValue('display').match('block')) { tous.push(' '); };
            }; c = c.nextSibling;
            
            while (c.firstChild != undefined && c.nodeName != 'A') { c = c.firstChild };
        } while (true);
        
        if (tous.length == 1) {
            tous[0] = tous[0].substr(0, eo);
            tous[0] = tous[0].substr(so);
        } else if (tous.length > 1) {
            tous[0] = tous[0].substr(so);
            tous[tous.length-1] = tous[tous.length-1].substr(0, eo);
        }
        
        console.log(tous)
        
        return tous;
    }
    
    /*
     authorship
     sourceURL

     called only at *.jw.org
     */
    async function getAddress() {
        console.log("get address")
        switch (getType()) {
            case "VERSE": return getAddressOfBible()
            case "PARAGRAPH": return await getAddressOfPublication()
            case "STUDYNOTE": return getAddressOfStudyNote()
            case "ARTICLE": return getAddressOfJWArticle()
            case "GALLERY": return getAddressOfGallery()
            case "VIDEO": return await getAddressOfJWVideo()
            case 'LINKCARD': return getAddressOfLinkcard()
            case "DAILYTEXT": return {authorship: document.querySelector('.bodyTxt').nextElementSibling.textContent + " " + document.querySelector(".tabContent.active").querySelector("header").textContent, sourceURL: "https://wol.jw.org" + document.querySelector('.bodyTxt').nextElementSibling.getAttribute('href')}
            case "TOOLTIP": return getAddressOfTooltip()
            case "FOOTNOTE": return {authorship: "", sourceURL: window.location.href}
            default: return {authorship: window.location.href.split('/')[2], sourceURL: url}
        }
    }
    
    function getType() {
        const url = window.location.href
        var cursor = window.getSelection().anchorNode.parentElement;
        var result = 'UNIDENTIFIED';
        
        if (url.match("wol.jw.org")) {
            while (cursor.nodeName != 'BODY') {
                if (cursor.classList.contains('v')) {result = 'VERSE'; break};
                if (cursor.classList.contains('s5')) {result = 'STUDYNOTE'; break};
                if (cursor.querySelector('.spriteLink') != undefined) {result = 'PARAGRAPH'; break};
                if (cursor.classList.contains('gallery')) {result = 'GALLERY'; break;};
                if (cursor.querySelector('#dailyText') != undefined) {result = 'DAILYTEXT'; break;};
                if (cursor.querySelector('.tooltip') != undefined) {result = 'TOOLTIP'; break;};
                if (cursor.querySelector('.results > .linkCard') != undefined) {result = 'LINKCARD'; break;};
                cursor = cursor.parentElement;
            };
        }

        else if (url.match("jw.org")) {
            while (cursor.nodeName != 'BODY') {
                if (cursor.querySelector("video") != undefined) {result = 'VIDEO'; break;};
                if (cursor.querySelector('.articleCitation') != undefined) {result = 'ARTICLE'; break;};
                cursor = cursor.parentElement;
            };
        }
        
        console.log("type: " + result)
        
        return result
    }

    function getAddressOfBible() {
        var url = window.location.href.replace(/(\?[^#]*)/g, '')
        
        var s = window.getSelection();
        var r = s.getRangeAt(0);
        var sc = r.startContainer;
        var ec = r.endContainer;
        var c = sc;
        c = c.nodeName == '#text' ? c.parentElement : c;
        while(!c.classList.contains('v')) { c = c.parentElement};
        
        var bookNumber = Number(c.id.split('-')[0].split('v')[1]);
        var chapterStart = Number(c.id.split('-')[1]);
        var verseStart = Number(c.id.split('-')[2]);
        
        console.log("content script: c.id = " + c.id)
        
        c = ec;
        while (c.firstChild != undefined && c.nodeName != '#text') { c = c.firstChild; };
        c = c.parentElement;
        while(!c.classList.contains('v')) { c = c.parentElement; };
        var v = c.id.split('-')[2];
        var chapterEnd = Number(c.id.split('-')[1])
        var verseEnd = Number(ec.nodeName == '#text' || ec.nodeName == 'SPAN' ? v : v-1);
        
        var authorship = ""
        if (url.match("en") && url.match("lp-e")) {
            var bookName = getShortenBookNameByNumber(bookNumber, "en")
            
            if (chapterStart == chapterEnd && verseStart == verseEnd) {
                url = "https://wol.jw.org/en/wol/b/r1/lp-e/nwtsty/" + bookNumber + "/" + chapterStart + "#study=dicover&v=" + bookNumber + ":" + chapterStart + ":" + verseStart
                authorship = bookName + " " + chapterStart + ":" + verseStart
            } else {
                url = "https://wol.jw.org/en/wol/b/r1/lp-e/nwtsty/" + bookNumber + "/" + chapterStart + "#study=dicover&v=" + bookNumber + ":" + chapterStart + ":" + verseStart + "-" + bookNumber + ":" + chapterEnd + ":" + verseEnd
                
                if (chapterStart == chapterEnd) {
                    authorship = bookName + " " + chapterStart + ":" + verseStart + (verseStart == verseEnd-1 ? ", " : "-") + verseEnd
                } else {
                    authorship = bookName + " " + chapterStart + ":" + verseStart + "-" + chapterEnd + ":" + verseEnd
                }
            }
        } else if (url.match("ko") && url.match("lp-ko")) {
            var bookName = getShortenBookNameByNumber(bookNumber, "ko")
            
            if (chapterStart == chapterEnd && verseStart == verseEnd) {
                url = "https://wol.jw.org/ko/wol/b/r8/lp-ko/nwtsty/" + bookNumber + "/" + chapterStart + "#study=dicover&v=" + bookNumber + ":" + chapterStart + ":" + verseStart
                authorship = bookName + " " + chapterStart + ":" + verseStart
            } else {
                url = "https://wol.jw.org/ko/wol/b/r8/lp-ko/nwtsty/" + bookNumber + "/" + chapterStart + "#study=dicover&v=" + bookNumber + ":" + chapterStart + ":" + verseStart + "-" + bookNumber + ":" + chapterEnd + ":" + verseEnd
                
                if (chapterStart == chapterEnd) {
                    authorship = bookName + " " + chapterStart + ":" + verseStart + (verseStart == verseEnd-1 ? ", " : "-") + verseEnd
                } else {
                    authorship = bookName + " " + chapterStart + ":" + verseStart + "-" + chapterEnd + ":" + verseEnd
                }
            }
        }
        
        return {authorship: authorship, sourceURL: url}
    }
    
    function getAddressOfStudyNote() {
        var url = window.location.href.replace(/(\?[^#]*)/g, '')
        
        var s = window.getSelection();
        var r = s.getRangeAt(0);
        var sc = r.startContainer;
        var ec = r.endContainer;
        var c = sc;
        c = c.nodeName == '#text' ? c.parentElement : c;
        while(!c.classList.contains('section')) { c = c.parentElement };
        
        var bookNumber = Number(c.dataset.key.split('-')[0])
        var chapterStart = Number(c.dataset.key.split('-')[1])
        var verseStart = Number(c.dataset.key.split('-')[2])
        
        console.log("content script: c.id = " + c.id)
        
        c = ec;
        while (c.firstChild != undefined && c.nodeName != '#text') { c = c.firstChild; };
        c = c.parentElement;
        while(!c.classList.contains('section')) { c = c.parentElement; };
        var v = c.dataset.key.split('-')[2];
        var chapterEnd = Number(c.dataset.key.split('-')[1])
        var verseEnd = Number(ec.nodeName == '#text' || ec.nodeName == 'SPAN' ? v : v-1);
        
        var authorship = ""
        if (url.match("en") && url.match("lp-e")) {
            var bookName = getShortenBookNameByNumber(bookNumber, "en")
            
            if (chapterStart == chapterEnd && verseStart == verseEnd) {
                url = "https://wol.jw.org/en/wol/b/r1/lp-e/nwtsty/" + bookNumber + "/" + chapterStart + "#study=dicover&v=" + bookNumber + ":" + chapterStart + ":" + verseStart
                authorship = bookName + " " + chapterStart + ":" + verseStart + " Study Note"
            } else {
                url = "https://wol.jw.org/en/wol/b/r1/lp-e/nwtsty/" + bookNumber + "/" + chapterStart + "#study=dicover&v=" + bookNumber + ":" + chapterStart + ":" + verseStart + "-" + bookNumber + ":" + chapterEnd + ":" + verseEnd
                
                if (chapterStart == chapterEnd) {
                    authorship = bookName + " " + chapterStart + ":" + verseStart + (verseStart == verseEnd-1 ? ", " : "-") + verseEnd + " Study Note"
                } else {
                    authorship = bookName + " " + chapterStart + ":" + verseStart + "-" + chapterEnd + ":" + verseEnd + " Study Note"
                }
            }
        } else if (url.match("ko") && url.match("lp-ko")) {
            var bookName = getShortenBookNameByNumber(bookNumber, "ko")
            
            if (chapterStart == chapterEnd && verseStart == verseEnd) {
                url = "https://wol.jw.org/ko/wol/b/r8/lp-ko/nwtsty/" + bookNumber + "/" + chapterStart + "#study=dicover&v=" + bookNumber + ":" + chapterStart + ":" + verseStart
                authorship = bookName + " " + chapterStart + ":" + verseStart + " 연구노트"
            } else {
                url = "https://wol.jw.org/ko/wol/b/r8/lp-ko/nwtsty/" + bookNumber + "/" + chapterStart + "#study=dicover&v=" + bookNumber + ":" + chapterStart + ":" + verseStart + "-" + bookNumber + ":" + chapterEnd + ":" + verseEnd
                
                if (chapterStart == chapterEnd) {
                    authorship = bookName + " " + chapterStart + ":" + verseStart + (verseStart == verseEnd-1 ? ", " : "-") + verseEnd + " 연구노트"
                } else {
                    authorship = bookName + " " + chapterStart + ":" + verseStart + "-" + chapterEnd + ":" + verseEnd + " 연구노트"
                }
            }
        }
        
        return {authorship: authorship, sourceURL: url}
    }
    
    function getAddressOfGallery() {
        const url = window.location.href
        const title = document.querySelector(".mediaTitle").textContent.trim(" ")
        
        var authorship = ""
        if (url.match("en") && url.match("lp-e")) {
            authorship = "Media:" + title
        } else if (url.match("ko") && url.match("lp-ko")) {
            authorship = "미디어:" + title
        }
        
        return {authorship: authorship, sourceURL: url}
    }
    
    async function getAddressOfPublication() {
        console.log("get address of publication")
        var url = window.location.href.replace(/(\?[^#]*)/g, '')
        
        var sl = document.querySelector(".spriteLink.ellipsized")
        var spd = document.querySelector(".scrollPositionDisplay")
        var slText = (sl ? sl.textContent : "")
        var spdText = (spd ? spd.textContent : "")
        var cnt = 0
        while ((slText == "" || spdText == "") && cnt < 10) {
            await sleep(500)
            cnt += 1
            slText = (sl ? sl.textContent : "")
            spdText = (spd ? spd.textContent : "")
            console.log("loop")
        }
            
        var s = window.getSelection();
        var r = s.getRangeAt(0);
        var sc = r.startContainer;
        var c = sc.nodeName == '#text' ? sc.parentElement : sc;
        var p = c.querySelector('p');
        c = (p == undefined ? c : p);
        while (c.dataset.pid == undefined) { c = c.parentElement };
        const hStart = c.dataset.pid;
        
        var ec = r.endContainer;
        c = ec.nodeName == '#text' ? ec.parentElement : ec;
        p = c.querySelector('p'); c = p == undefined ? c : p;
        while (c.dataset.pid == undefined) { c = c.parentElement };
        const hEnd = ec.nodeName == '#text' ? c.dataset.pid : c.dataset.pid - 1;
        
        console.log("get paragraph number")
        
        /*
         paragraph
         */
        var paragraph = ""
        try {
            var s = window.getSelection();
            var r = s.getRangeAt(0);
            var sc = r.startContainer;
            var c = sc.nodeName == '#text' ? sc.parentElement : sc;
            var p = c.querySelector('p'); c = p == undefined ? c : p;
            while (c.querySelector('sup') == undefined) {
                if (c.nodeName == 'P') { break; };
                c = c.parentElement
            };
            var sup = c.querySelector('sup');
            const pStart = sup.textContent
            
            var ec = r.endContainer;
            c = ec.nodeName == '#text' ? ec.parentElement : ec;
            p = c.querySelector('p'); c = p == undefined ? c : p;
            while (c.querySelector('sup') == undefined) {
                if (c.nodeName == 'P') { break; };
                c = c.parentElement
            };
            sup = c.querySelector('sup');
            const pEnd = ec.nodeName == '#text' ? sup.innerText : sup.innerText - 1;
            
            paragraph = "¶" + (pStart == pEnd ? pStart : pStart + (pStart == pEnd-1 ? ", " : "-") + pEnd)
        } catch {
            paragraph = "h=" + (hStart == hEnd ? hStart : hStart + (hStart == hEnd-1 ? ", " : "-") + hEnd)
        }
        
        console.log("get authorship and source url")
        
        // var hd = document.querySelectorAll("header")
        // hd = (hd.length == 1 ? hd[0] : null)
        // var strs = (hd ? hd.querySelectorAll("strong") : null)
        var strs = document.querySelectorAll("#content strong")
        var title;
        console.log(slText)
        for (const key in strs) {
            const str = strs[key].textContent.trim()
            console.log(str)
            if (slText.match(str)) {
                continue
            } else {
                title = str
                break
            }
        }
        
        /*
         authorship and source url
         */
        var authorship = ""
        const lang = document.querySelector("#contentLibLang").getAttribute("value")
        // Check if the URL contains "en" or "ko"
        if (lang.match("English")) {
            // If the spriteLink is not empty and the scrollPositionDisplay is empty,
            // set theResult to the spriteLink and theParagraph
            if (slText != "" && spdText == "") {
                authorship = slText + " " + title;
            } else {
                var sls = slText.split('pp. ')
                sls = sls.length == 1 ? slText.split('p. ') : sls
                
                console.log(sls)
                
                var spds = spdText.split('pp. ')
                spds = spds.length == 1 ? spdText.split('p. ') : spds
                
                console.log(spds)
                
                authorship = sls[0] + " " + title + " p. " + spds[spds.length-1]
            }
        } else if (lang.match("한국어")) {
            if (slText != "" && spdText == "") {
                authorship = slText + " " + title
            } else {
                var frags = slText.split(" ")
                for (const key in frags) {
                    const frag = frags[key]
                    
                    if (!frag.includes('면')) {
                        authorship = authorship + " " + frag
                    }
                }
                
                authorship = authorship + " " + title
                
                frags = spdText.split(" ")
                for (const key in frags) {
                    const frag = frags[key]
                    if (frag.includes('면')) {
                        authorship = authorship + " " + frag
                    }
                }
            }
        }
        
        authorship = authorship.trim()
        authorship = authorship + " " + paragraph
        
        url = (url.indexOf("?") != -1 ? url : url.split("?")[0])
        url = (url.indexOf("#") == -1 ? url : url.split("#")[0])

        url = url + "#h=" + (hStart == hEnd ? hStart : hStart + "-" + hEnd)
        
        return new Promise(function (resolve) {
            return resolve({authorship: authorship, sourceURL: url})
        })
    }
    
    function getAddressOfJWArticle() {
        const url = window.location.href
        var bcs = document.querySelectorAll("#content .breadcrumbItem")
        bcs = (bcs.length == 0 ? document.querySelectorAll(".breadcrumbItem") : bcs)
        const title = document.querySelector("h1").textContent
        var authorship;

        console.log(bcs)

        for (const key in bcs) {
            const bc = bcs[key].textContent
            if (!bc) { continue }
            console.log(bc)
            authorship = (authorship ? authorship + " > " : "") + bc.trim()
        }

        console.log(authorship)
        console.log(url)

        authorship = authorship + " > " + title
        return {authorship: authorship, sourceURL: url}
    }

    async function getAddressOfJWVideo() {
        var cnt = 0
        while (!document.querySelector("video") && cnt < 10) {
            await sleep(500)
            cnt += 1
            console.log("loop")
        }

        const url = window.location.href
        var bcs = document.querySelectorAll("#content .breadcrumbItem")
        bcs = (bcs.length == 0 ? document.querySelectorAll(".breadcrumbItem") : bcs)
        const title = document.querySelector("#content h1").textContent
        var authorship;

        console.log(bcs)

        for (const key in bcs) {
            const bc = bcs[key].textContent
            if (!bc) { continue }
            console.log(bc)
            authorship = (authorship ? authorship + " > " : "") + bc.trim()
        }

        console.log(authorship)
        console.log(url)

        authorship = authorship + " > " + title
        return {authorship: authorship, sourceURL: url}
    }

    function getAddressOfLinkcard() {
        console.log("get address of link card")

        var s = window.getSelection();
        var r = s.getRangeAt(0);
        var cac = r.commonAncestorContainer;
        var c = (cac.nodeName == '#text' ? cac.parentElement : cac)
        
        while (!c.querySelector('.linkCard') && c.nodeName != 'BODY') {c = c.parentElement}
        var linkURL = c.querySelector('.linkCard').querySelector('a[href]').getAttribute('href');

        console.log(linkURL)

        return {authorship: "", sourceURL: "https://wol.jw.org" + linkURL}
    }

    function getAddressOfTooltip() {
        console.log("get address of link card")

        var s = window.getSelection();
        var r = s.getRangeAt(0);
        var cac = r.commonAncestorContainer;
        var c = (cac.nodeName == '#text' ? cac.parentElement : cac)

        console.log(c)

        while (!c.querySelector('.linkCard') && c.nodeName != 'BODY') {c = c.parentElement; console.log(c)}
        var linkURL = c.querySelector('a[href]').getAttribute('href')

        console.log(linkURL)

        return {authorship: "", sourceURL: "https://wol.jw.org" + linkURL}
    }
    
    function getShortenBookNameByNumber(bookNumber, language) {
        switch (language) {
            case "ko":
                switch (bookNumber) {
                    case 1: return "창"
                    case 2: return "출"
                    case 3: return "레"
                    case 4: return "민"
                    case 5: return "신"
                    case 6: return "수"
                    case 7: return "삿"
                    case 8: return "룻"
                    case 9: return "삼상"
                    case 10: return "삼하"
                    case 11: return "왕상"
                    case 12: return "왕하"
                    case 13: return "대상"
                    case 14: return "대하"
                    case 15: return "라"
                    case 16: return "느"
                    case 17: return "더"
                    case 18: return "욥"
                    case 19: return "시"
                    case 20: return "잠"
                    case 21: return "전"
                    case 22: return "아"
                    case 23: return "사"
                    case 24: return "렘"
                    case 25: return "애"
                    case 26: return "겔"
                    case 27: return "단"
                    case 28: return "호"
                    case 29: return "욜"
                    case 30: return "암"
                    case 31: return "옵"
                    case 32: return "욘"
                    case 33: return "미"
                    case 34: return "나"
                    case 35: return "합"
                    case 36: return "습"
                    case 37: return "학"
                    case 38: return "슥"
                    case 39: return "말"
                    case 40: return "마"
                    case 41: return "막"
                    case 42: return "눅"
                    case 43: return "요"
                    case 44: return "행"
                    case 45: return "롬"
                    case 46: return "고전"
                    case 47: return "고후"
                    case 48: return "갈"
                    case 49: return "엡"
                    case 50: return "빌"
                    case 51: return "골"
                    case 52: return "살전"
                    case 53: return "살후"
                    case 54: return "딤전"
                    case 55: return "딤후"
                    case 56: return "디"
                    case 57: return "몬"
                    case 58: return "히"
                    case 59: return "약"
                    case 60: return "벧전"
                    case 61: return "벧후"
                    case 62: return "요1"
                    case 63: return "요2"
                    case 64: return "요3"
                    case 65: return "유"
                    case 66: return "계"
                }
            break
            case "en":
                switch (bookNumber) {
                    case 1: return "Ge"
                    case 2: return "Ex"
                    case 3: return "Le"
                    case 4: return "Nu"
                    case 5: return "De"
                    case 6: return "Jos"
                    case 7: return "Jg"
                    case 8: return "Ru"
                    case 9: return "1Sa"
                    case 10: return "2Sa"
                    case 11: return "1Ki"
                    case 12: return "2Ki"
                    case 13: return "1Ch"
                    case 14: return "2Ch"
                    case 15: return "Ezr"
                    case 16: return "Ne"
                    case 17: return "Es"
                    case 18: return "Job"
                    case 19: return "Ps"
                    case 20: return "Pr"
                    case 21: return "Ec"
                    case 22: return "Ca"
                    case 23: return "Isa"
                    case 24: return "Jer"
                    case 25: return "La"
                    case 26: return "Eze"
                    case 27: return "Da"
                    case 28: return "Ho"
                    case 29: return "Joe"
                    case 30: return "Am"
                    case 31: return "Ob"
                    case 32: return "Jon"
                    case 33: return "Mic"
                    case 34: return "Na"
                    case 35: return "Hab"
                    case 36: return "Zep"
                    case 37: return "Hag"
                    case 38: return "Zec"
                    case 39: return "Mal"
                    case 40: return "Mt"
                    case 41: return "Mr"
                    case 42: return "Lu"
                    case 43: return "Joh"
                    case 44: return "Ac"
                    case 45: return "Ro"
                    case 46: return "1Co"
                    case 47: return "2Co"
                    case 48: return "Ga"
                    case 49: return "Eph"
                    case 50: return "Php"
                    case 51: return "Col"
                    case 52: return "1Th"
                    case 53: return "2Th"
                    case 54: return "1Ti"
                    case 55: return "2Ti"
                    case 56: return "Tit"
                    case 57: return "Ph..."
                    case 58: return "Heb"
                    case 59: return "Jas"
                    case 60: return "1Pe"
                    case 61: return "2Pe"
                    case 62: return "1Jo"
                    case 63: return "2Jo"
                    case 64: return "3Jo"
                    case 65: return "Ju..."
                    case 66: return "Re"
                }
            break
        }
    }
}

/*
 tools
 */

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function createWindow(url) {
    return new Promise(resolve => {
        chrome.windows.create({url}, async tab => {
            chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
                if (info.status === 'complete' && tabId === tab.id) {
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve(tab);
                }
            });
        });
    });
}

function createTab(url) {
    return new Promise(resolve => {
        chrome.tabs.create({url}, async tab => {
            chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
                if (info.status === 'complete' && tabId === tab.id) {
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve(tab);
                }
            });
        });
    });
}

const trigger = (el, etype, custom) => {
  const evt = custom ?? new Event( etype, { bubbles: true } );
  el.dispatchEvent( evt );
};

function clean(text) {
    return text.replace(/(\r\n|\n|\r|\t)/gm, ' ').replace(/\s+/g, ' ').replace(/(\[[A-Za-z]\s)/g, '[').trim()
}

function isTextSelected() {
    var selection = window.getSelection();
    return selection && selection.type === 'Range';
}

function removeSelection() {
    var selection = window.getSelection ? window.getSelection() : document.selection ? document.selection : null;
    if(!!selection) selection.empty ? selection.empty() : selection.removeAllRanges();
}
