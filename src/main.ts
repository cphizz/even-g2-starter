import {
  waitForEvenAppBridge,
  CreateStartUpPageContainer,
  RebuildPageContainer,
  TextContainerProperty,
  StartUpPageCreateResult,
  OsEventTypeList,
} from '@evenrealities/even_hub_sdk'

const W = 576, H = 288
let startupDone = false
let tapCount = 0
let tapTimer = null
let currentScreen = 'home'

function log(msg) {
  const el = document.getElementById('log')
  if (!el) return
  const div = document.createElement('div')
  div.className = 'entry'
  div.textContent = new Date().toTimeString().slice(0,8) + '  ' + msg
  el.insertBefore(div, el.firstChild)
}
function setStatus(msg) {
  const el = document.getElementById('status')
  if (el) el.textContent = msg
  log(msg)
}
function makeContainers(content) {
  return [
    new TextContainerProperty({ xPosition:8, yPosition:4, width:560, height:272, containerID:1, containerName:'content', isEventCapture:0, content:content.slice(0,1000) }),
    new TextContainerProperty({ xPosition:0, yPosition:0, width:W, height:H, containerID:2, containerName:'events', isEventCapture:1, content:' ' }),
  ]
}
async function showScreen(bridge, content) {
  const config = { containerTotalNum:2, textObject:makeContainers(content) }
  if (!startupDone) {
    const r = await bridge.createStartUpPageContainer(new CreateStartUpPageContainer(config))
    if (r !== StartUpPageCreateResult.success) throw new Error('Startup failed: ' + r)
    startupDone = true; return
  }
  await bridge.rebuildPageContainer(new RebuildPageContainer(config))
}
const screens = {
  home: () => ['', '        Even G2 Starter App', '', '  Tap        - say hello', '  Double tap - show info', '  Scroll up  - screen A', '  Scroll down- screen B'].join('\n'),
  hello: () => ['', '        Hello from G2!', '', '        Tap to go back'].join('\n'),
  info: () => ['  Even Realities G2', '  Display: 576x288px', '  Green micro-LED', '', '  SDK: even_hub_sdk 0.0.7', '', '  Double tap to go back'].join('\n'),
  scrollA: () => ['', '        Screen A', '', '  Scroll down for Screen B', '  Tap to go home'].join('\n'),
  scrollB: () => ['', '        Screen B', '', '  Scroll up for Screen A', '  Tap to go home'].join('\n'),
}
async function boot() {
  setStatus('Waiting for Even bridge...')
  const bridge = await Promise.race([
    waitForEvenAppBridge(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Bridge timeout')), 15000)),
  ])
  setStatus('Connected!')
  await showScreen(bridge, screens.home())
  let lastScroll = 0
  bridge.onEvenHubEvent((event) => {
    const t = event.listEvent?.eventType ?? event.textEvent?.eventType ?? event.sysEvent?.eventType
    if (t === OsEventTypeList.SCROLL_TOP_EVENT || t === OsEventTypeList.SCROLL_BOTTOM_EVENT) {
      const now = Date.now(); if (now - lastScroll < 300) return; lastScroll = now
      if (t === OsEventTypeList.SCROLL_TOP_EVENT) { log('SCROLL UP'); currentScreen='scrollA'; void showScreen(bridge, screens.scrollA()) }
      else { log('SCROLL DOWN'); currentScreen='scrollB'; void showScreen(bridge, screens.scrollB()) }
      return
    }
    if (t === OsEventTypeList.DOUBLE_CLICK_EVENT) { tapCount += 2 }
    else if (t === OsEventTypeList.CLICK_EVENT || t === undefined) { tapCount += 1 }
    else { return }
    if (tapTimer) clearTimeout(tapTimer)
    if (tapCount >= 3) { tapCount=0; log('TRIPLE TAP'); currentScreen='home'; void showScreen(bridge, screens.home()); return }
    tapTimer = setTimeout(() => {
      const n = tapCount; tapCount=0; tapTimer=null
      if (n===1) { log('TAP'); const next = currentScreen==='home' ? 'hello' : 'home'; currentScreen=next; void showScreen(bridge, screens[next]()) }
      else if (n>=2) { log('DOUBLE TAP'); currentScreen='info'; void showScreen(bridge, screens.info()) }
    }, 600)
  })
}
void boot().catch(err => setStatus('Error: ' + err))
