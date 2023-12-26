var scrapText = "scrap"
var scrapFromLinkText = " | from link"
var authorshipText = " | authorship"
var copyText = " | copy"

const padding = 7
const imgSize = 23

window.addEventListener('mouseup', async function (e) {
    const url = window.location.href
    await sleep(100)

    if (url.match("workflowy.com")) { return }
    
    if (isTextSelected() && !document.querySelector("#R8dHdZPZ")) {
        var options = document.createElement("div")
        document.body.appendChild(options)
        options.id = "R8dHdZPZ"
        options.style.position = "fixed"
        options.style.backgroundColor = "white"
        options.style.border = "1px solid #d8d8d8"
        options.style.display = "block"
        options.style.borderRadius = padding + "px"
        options.style.boxShadow = "0px 0px 5px #d8d8d8"
        options.style.color = "black"
        options.style.fontWeight = "normal"
        options.style.zIndex = 10000 // https://developer.chrome.com/blog/what-is-the-top-layer/
        options.style.textOverflow = "ellipsis"
        options.style.whiteSpace = "nowrap"
        options.style.transitionDuration = "0s"
        options.style.width = padding * 5 + imgSize * 4 + "px"
        options.style.height = padding * 2 + imgSize + "px"
        
        var scrap = document.createElement("img")
        options.appendChild(scrap)
        scrap.style.position = "absolute"
        scrap.style.left = padding + "px"
        scrap.style.top = padding + "px"
        scrap.style.display = "inline"
        scrap.setAttribute("src", "https://img.icons8.com/ios-glyphs/30/mining-gems.png")
        scrap.style.width = imgSize + "px"
        scrap.style.height = imgSize + "px"
        scrap.style.opacity = "0.5"
        scrap.style.borderRadius = padding + "px"
        
        var authorship = document.createElement("img")
        options.appendChild(authorship)
        authorship.style.position = "absolute"
        authorship.style.left = padding * 2 + imgSize + "px"
        authorship.style.top = padding + "px"
        authorship.style.display = "inline"
        authorship.setAttribute("src", "https://img.icons8.com/fluency-systems-filled/48/link.png")
        authorship.style.width = imgSize + "px"
        authorship.style.height = imgSize + "px"
        authorship.style.opacity = "0.5"
        authorship.style.borderRadius = padding + "px"
        
        var copy = document.createElement("img")
        options.appendChild(copy)
        copy.style.position = "absolute"
        copy.style.left = padding * 3 + imgSize * 2 + "px"
        copy.style.top = padding + "px"
        copy.style.display = "inline"
        copy.setAttribute("src", "https://img.icons8.com/fluency-systems-filled/48/copy.png")
        copy.style.width = imgSize + "px"
        copy.style.height = imgSize + "px"
        copy.style.opacity = "0.5"
        copy.style.borderRadius = padding + "px"

        var scrapFromLink = document.createElement("img")
        options.appendChild(scrapFromLink)
        scrapFromLink.style.position = "absolute"
        scrapFromLink.style.left = padding * 4 + imgSize * 3 + "px"
        scrapFromLink.style.top = padding + "px"
        scrapFromLink.style.display = "inline"
        scrapFromLink.setAttribute("src", "https://img.icons8.com/fluency-systems-filled/48/copy-link.png")
        scrapFromLink.style.width = imgSize + "px"
        scrapFromLink.style.height = imgSize + "px"
        scrapFromLink.style.opacity = "0.5"
        scrapFromLink.style.borderRadius = padding + "px"
        
        if (!url.match("jw.org")) {
            scrapFromLink.style.display = "none"
            options.style.width = padding * 4 + imgSize * 3 + "px"
        }

        var width = options.getBoundingClientRect().width
        var height = options.getBoundingClientRect().height
        
        options.style.left = e.clientX - (width / 2) + "px"
        options.style.top = e.clientY - height - padding + "px"
        options.style.opacity = 1
        
        scrap.addEventListener('mouseover', async function (e) {
            scrap.style.backgroundColor = "#d8d8d8"
        })
        scrap.addEventListener('mouseout', async function (e) {
            scrap.style.backgroundColor = null
        })
        scrap.addEventListener('mouseover', async function (e) {
            const response = await chrome.runtime.sendMessage({key: "LGjhVJ9y"})
            
            scrap.setAttribute("src", "https://img.icons8.com/fluency-systems-filled/48/easy.png")
            scrap.style.left = padding + "px"
            options.style.width = padding * 2 + imgSize + "px"
            
            scrapFromLink.remove()
            authorship.remove()
            copy.remove()
            
            await sleep(1000)
            
            options.remove()
            removeSelection()
        })
        
        authorship.addEventListener('mouseover', async function (e) {
            authorship.style.backgroundColor = "#d8d8d8"
        })
        authorship.addEventListener('mouseout', async function (e) {
            authorship.style.backgroundColor = null
        })
        authorship.addEventListener('click', async function (e) {
            const response = await chrome.runtime.sendMessage({key: "A9VF1nd5"})
            
            authorship.setAttribute("src", "https://img.icons8.com/fluency-systems-filled/48/easy.png")
            authorship.style.left = padding + "px"
            options.style.left = e.clientX - (padding * 2 + imgSize) / 2 + "px"
            options.style.width = padding * 2 + imgSize + "px"
            
            scrap.remove()
            scrapFromLink.remove()
            copy.remove()
            
            await sleep(1000)
            
            options.remove()
            removeSelection()
        })
        
        copy.addEventListener('mouseover', async function (e) {
            copy.style.backgroundColor = "#d8d8d8"
        })
        copy.addEventListener('mouseout', async function (e) {
            copy.style.backgroundColor = null
        })
        copy.addEventListener('click', async function (e) {
            const text = clean(window.getSelection().toString())
            const item = new window.ClipboardItem({
                'text/plain': new Blob([text], {type: 'text/plain'})
            });
            navigator.clipboard.write([item]);
            
            copy.setAttribute("src", "https://img.icons8.com/fluency-systems-filled/48/easy.png")
            copy.style.left = padding + "px"
            options.style.left = e.clientX - (padding * 2 + imgSize) / 2 + "px"
            options.style.width = padding * 2 + imgSize + "px"
            
            scrap.remove()
            scrapFromLink.remove()
            authorship.remove()
            
            await sleep(1000)
            
            options.remove()
            removeSelection()
        })

        scrapFromLink.addEventListener('mouseover', async function (e) {
            scrapFromLink.style.backgroundColor = "#d8d8d8"
        })
        scrapFromLink.addEventListener('mouseout', async function (e) {
            scrapFromLink.style.backgroundColor = null
        })
        scrapFromLink.addEventListener('mouseover', async function (e) {
            const response = await chrome.runtime.sendMessage({key: "oKl1WFqN"})
            
            scrapFromLink.setAttribute("src", "https://img.icons8.com/fluency-systems-filled/48/easy.png")
            scrapFromLink.style.left = padding + "px"
            options.style.left = e.clientX - (padding * 2 + imgSize) / 2 + "px"
            options.style.width = padding * 2 + imgSize + "px"
            
            scrap.remove()
            authorship.remove()
            copy.remove()
            
            await sleep(1000)
            
            options.remove()
            removeSelection()
        })
    }
})

window.addEventListener("click", async function (e) {
    const element = document.elementFromPoint(e.clientX, e.clientY)
    if (element.id != "R8dHdZPZ" && element.parentElement.id != "R8dHdZPZ") {    
        const options = document.querySelector("#R8dHdZPZ")
        if (options) { options.remove() }
    }
    return true
})

window.addEventListener("keydown", async function (e) {
    const options = document.querySelector("#R8dHdZPZ")
    if (options) { options.remove() }
    return true
})

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
    return text.replace(/(\r\n|\n|\r|\t)/gm, ' ').replace(/\s+/g, ' ').trim()
}

function isTextSelected() {
    var selection = window.getSelection();
    return selection && selection.type === 'Range';
}

function removeSelection() {
    var selection = window.getSelection ? window.getSelection() : document.selection ? document.selection : null;
    if(!!selection) selection.empty ? selection.empty() : selection.removeAllRanges();
}