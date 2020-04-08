function Stage() {
    const canvas = document.getElementById("stage")
    this.width = canvas.width
    this.height = canvas.height
    this.context = canvas.getContext('2d')
    let d1 = 1
    let d2 = 12
    let d1Input = document.getElementById("d1")
    let d2Input = document.getElementById("d2")
    const stage = this
    d1Input.addEventListener("change", () => {
        stage.d1 = d1Input.value
        d1Input.value = stage.d1
        d2Input.value = stage.d2
    })
    d2Input.addEventListener("change", () => {
        stage.d2 = d2Input.value
        d1Input.value = stage.d1
        d2Input.value = stage.d2
    })

    Object.defineProperties(this, {
        d1: {
            get: () => d1,
            set: (value) => {
                d1 = Math.min(12, Math.max(1, value))
                if (d1 > d2) {
                    d2 = d1
                }
                this.reset()
            }
        },
        d2: {
            get: () => d2,
            set: (value) => {
                d2 = Math.min(12, Math.max(1, value))
                if (d2 < d1) {
                    d1 = d2
                }
                this.reset()
            }
        }
    })

    this.drawBase = () => {
        const centerX = this.width / 2
        const centerY = this.height / 2
        const ctx = this.context
        ctx.lineWidth = 3;
        for (let radius = 1; radius <= d2; ++radius) {
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius * 20, 0, Math.PI * 2)
            if (radius >= d1) {
                ctx.strokeStyle = "#000000"
            } else {
                ctx.strokeStyle = "#aaaaaa"
            }
            ctx.stroke()
        }
    }

    let state = {}

    this.drawAllPoints = () => {
        const centerX = this.width / 2
        const centerY = this.height / 2
        const ctx = this.context
        for (let radius = 1; radius <= d2; ++radius) {
            if (radius >= d1) {
                ctx.fillStyle = "#000000"
            } else {
                ctx.fillStyle = "#aaaaaa"
            }
            for (let i = 0; i < radius; ++i) {
                if (this.excludePoints[radius].has(i)) {
                    continue;
                }
                const theta = (Math.PI * 2 * i) / radius - Math.PI / 2
                const dx = 20 * radius * Math.cos(theta)
                const dy = 20 * radius* Math.sin(theta)
                ctx.beginPath()
                ctx.arc(centerX + dx, centerY + dy, 5, 0, Math.PI * 2)
                if (state.firstAppear[radius].has(i)) {
                    ctx.save()
                    ctx.fillStyle = "#ff0000"
                    ctx.fill()
                    ctx.restore()
                } else {
                    ctx.fill()
                }
            }
        }
    }

    this.reset = () => {
        this.excludePoints = Array.from({ length: this.d2 + 1 }).map(() => new Set())
        this.context.clearRect(0, 0, this.width, this.height)
        this.resetPlay()
        this.drawBase()
        this.drawAllPoints()
    }

    this.resetPlay = () => {
        state = {
            radius: 1,
            multiple: 2,
            pointCount: Array.from({ length: this.d2 + 1 }).map((v, i) => i),
            firstAppear: Array.from({ length: this.d2 + 1 }).map(() => new Set()),
            firstAdded: state.radius >= this.d1,
            firstCount: 0,
        }
        const table = document.getElementById("pointCount")
        table.tHead.deleteRow(0)
        table.tBodies[0].deleteRow(0)
        const head = table.tHead.insertRow()
        const body = table.tBodies[0].insertRow()
        head.insertCell().innerHTML = "추가 점"
        body.insertCell().innerHTML = state.firstCount
        for (let i = 1; i <= d2; ++i) {
            const headCell = head.insertCell()
            headCell.innerHTML = i
            const bodyCell = body.insertCell()
            bodyCell.innerHTML = state.pointCount[i]
        }
    }

    this.drawPointCounts = (marking = new Set()) => {
        const table = document.getElementById("pointCount")
        const body = table.tBodies[0].rows[0]
        body.cells[0].innerHTML = state.firstCount
        for (let i = 1; i <= d2; ++i) {
            const cell = body.cells[i]
            if (marking.has(i)) {
                cell.innerHTML = `<b>${state.pointCount[i]}</b>`
            } else {
                cell.innerHTML = state.pointCount[i]
            }
        }
    }

    this.next = () => {
        console.log(state)
        if (2 * state.radius > d2) {
            this.drawPointCounts(new Set(Array.from({ length: this.d2 - this.d1 + 1 }).map((v, i) => i + this.d1)))
            return
        }
        if (state.radius * state.multiple > d2) {
            state.radius += 1
            state.multiple = 2
            state.firstAdded = state.radius >= this.d1
            this.next()
            return
        }
        if (!state.firstAdded && state.radius * state.multiple >= this.d1) {
            state.firstAdded = true
            for (let point = 0; point < state.radius; ++point) {
                if (!this.excludePoints[state.radius].has(point)) {
                    state.firstAppear[state.radius * state.multiple].add(point * state.multiple)
                    ++state.firstCount
                }
            }
        } else {
            for (let point = 0; point < state.radius; ++point) {
                if (!this.excludePoints[state.radius].has(point)) {
                    this.excludePoints[state.radius * state.multiple].add(point * state.multiple)
                }
            }
        }
        state.pointCount[state.radius * state.multiple] -= state.pointCount[state.radius]
        this.context.clearRect(0, 0, this.width, this.height)
        this.drawBase()
        this.drawAllPoints()
        this.drawPointCounts(new Set([state.radius, state.radius * state.multiple]))
        ++state.multiple
    }
    document.getElementById("next").addEventListener("click", this.next)

    return this
}

const stage = new Stage()
stage.reset()