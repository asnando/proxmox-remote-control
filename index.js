const BASE_URL = "http://192.168.15.3:8080/api2/json"
const USERNAME = "root@pam"
const REALM = "<realm>"
const TOKEN = "<token>"

function buildAuthHeader() {
    return `PVEAPIToken=${USERNAME}!${REALM}=${TOKEN}`
}

async function get(url) {
    return fetch(BASE_URL+url, {
        method: "GET",
        mode: "cors",
        headers: {
            "Authorization": buildAuthHeader(),
            "Content-Type": "application/json;charset=UTF-8",
        }
    })
    .then((res) => res.json())
}

async function post(url, body) {
    return fetch(BASE_URL+url, {
        method: "POST", 
        body,
        mode: "cors",
        headers: { "Authorization": buildAuthHeader() }
    })
    .then(async (res) => res.json())
    .catch(console.error)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function refresh(ms = 1000) {
    await sleep(ms)
    location.reload()
}

async function shutdown() {
    await post(`/nodes/pve/status/shutdown`)
}

async function listVMs() {
    return get("/nodes/pve/qemu")
}

async function startVm(vmid) {
    await post(`/nodes/pve/qemu/${vmid}/status/start`)
    refresh()
}

async function shutdownVm(vmid) {
    await post(`/nodes/pve/qemu/${vmid}/status/shutdown`)
    refresh()
}

async function stopVm(vmid) {
    await post(`/nodes/pve/qemu/${vmid}/status/stop`)
    refresh()
}

function createButton(text, onclick) {
    button = document.createElement("button")
    button.classList.add("pushable")
    shadow = document.createElement("span")
    shadow.classList.add("shadow")
    edge = document.createElement("span")
    edge.classList.add("edge")
    front = document.createElement("span")
    front.classList.add("front")
    button.onclick = onclick
    button.appendChild(shadow)
    button.appendChild(edge)
    button.appendChild(front)
    front.textContent = text

    return button
}

function renderVMs(vms) {
    vms.sort((a, b) => a.name.localeCompare(b.name))
    vms
    .forEach((vm) => {
        console.log(vm)
        var container = document.createElement("div")
        var title = document.createElement("h2")
        title.textContent = `vmid: ${vm.vmid}, name: ${vm.name}`

        var status = document.createElement("p")
        status.textContent = `Status: ${vm.status}`

        container.appendChild(title)
        container.appendChild(status)
        container.classList.add("vm-container")

        var buttonsContainer = document.createElement("div")

        if (vm.status == "running") {
            stopButton = createButton("🔌 shutdown", shutdownVm.bind(null, vm.vmid))
            stopButton.classList.add("stop")
            forceStopButton = createButton("☠️ force stop", stopVm.bind(null, vm.vmid))
            forceStopButton.classList.add("force-stop")
            buttonsContainer.appendChild(stopButton)
            buttonsContainer.appendChild(forceStopButton)
        } else {
            startButton = createButton("⚡ start", startVm.bind(null, vm.vmid))
            startButton.classList.add("start")
            buttonsContainer.appendChild(startButton)
        }
        container.appendChild(buttonsContainer)
        document.body.appendChild(container)
    })
}

function renderRefreshButton() {
    var button = createButton("🔄 refresh", refresh.bind(null, 0))
    button.classList.add("refresh")
    document.body.appendChild(button)
}

function renderShutdownButton() {
    var button = createButton("🔋 Shutdown Proxmox", shutdown)
    button.classList.add("shutdown-node")
    document.body.appendChild(button)
}

async function main() {
    vms = await listVMs()
    renderShutdownButton()
    renderRefreshButton()
    renderVMs(vms.data)
}

window.onload = main