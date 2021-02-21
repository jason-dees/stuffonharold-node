function generateBadIdeaUrl() {
    var badIdea = new Date();
    return '/api/image?width=' + window.innerWidth +
        '&height=' + window.innerHeight + '&noo' + badIdea.getMilliseconds()
}

class HaroldImage extends HTMLElement {
    constructor(count) {
        super();
        this.attachShadow({ mode: 'open' });
        const self = this;
        self.classList.add("harold-img");
        this.setAttribute('data-count', count);
    }
    connectedCallback() {
        const { shadowRoot } = this;
        const self = this;
        const template = document.getElementById('harold-img');
        const node = document.importNode(template.content, true);
        shadowRoot.appendChild(node);
        shadowRoot.innerHTML += `
        <style>
            img {
                box-shadow: 0 0 20px 5px #444;
                background-color: white;
                padding: 20px;
                padding-bottom: 40px;
                max-width: 90%;
            }
        </style>`;
        fetch(generateBadIdeaUrl())
            .then(response => response.blob())
            .then((b) => self.blob = b);
    }

    set blob(blob) {
        this.src = URL.createObjectURL(blob);
    }
    set src(newSrc) {
        const { shadowRoot } = this;
        shadowRoot.querySelector('img').src = newSrc;
    }
    get src() {
        const { shadowRoot } = this;
        return shadowRoot.querySelector('img').image.src;
    }
}
customElements.define('harold-img', HaroldImage);

class HaroldQueue extends HTMLElement {
    constructor() {
        super();
        const self = this;
        self.attachShadow({ mode: 'open' });
        self.length = 3;
        self.total = 0;
    }

    connectedCallback() {
        const { shadowRoot } = this;
        const self = this;
        const template = document.getElementById('harold-queue');
        const node = document.importNode(template.content, true);
        shadowRoot.appendChild(node);
        shadowRoot.innerHTML += `
        <style>
            .harold-img {
                position: absolute;
                width: 100%;
                top: 0;
                left: 0;
                overflow: hidden; 
            }
            .harold-img:nth-child(3) {
                z-index: -1; 
            }
            .harold-img:nth-child(4){
                z-index: -2; 
            }
            .harold-img:nth-child(n+4){
                z-index: -3; 
            }
        </style>`;
        (function addHarold(haroldsLeft) {
            if (haroldsLeft == 0) { return; }
            self.addNewHarold.bind(self)();
            addHarold(--haroldsLeft);
        })(this.length);
    }

    shift() {
        const { shadowRoot } = this;
        const element = this.firstChild;
        element.remove();
        this.addNewHarold.bind(this)();
    }

    addNewHarold() {
        const { shadowRoot } = this;
        const self = this;
        self.total++;
        shadowRoot.appendChild(new HaroldImage(this.total))
    }

    get firstChild() {
        const { shadowRoot } = this;
        return shadowRoot.children[1];
    } 
}

customElements.define('harold-queue', HaroldQueue);

var nextAreaPercent = .20;
function start() {
    var harolds = document.querySelector('#harolds');
    var nextHarold = harolds.shift.bind(harolds);

    addSwipeListener(harolds, nextHarold);
}
function addSwipeListener(harolds, nextEvent) {
    console.log(harolds)
    let haroldImage = () => harolds.firstChild;
    console.log(haroldImage()); 
    let start = { x: 0, y: 0 };
    let previous = { x: 0, y: 0 };
    let isDown = false;
    let velocity = { x: 0, y: 0 };
    let nextArea;
    let nextAreaCalculation = function () {
        let nextAreaPadding = window.innerWidth * nextAreaPercent;
        nextArea = {
            left: nextAreaPadding,
            right: window.innerWidth - nextAreaPadding
        };
    };
    addEventListener(window, 'resize', function () { nextAreaCalculation(); console.log("resize"); });
    nextAreaCalculation();
    let isInNextPadding = function (point) {
        return point.x > nextArea.right || point.x < nextArea.left;
    };
    var activateDropAreas = function () {
        let dropAreas = document.getElementsByClassName('drop-area');
        for (var i = 0; i < dropAreas.length; i++) {
            dropAreas[i].classList.add('active');
        }
    };
    var deactivateDropAreas = function () {
        let dropAreas = document.getElementsByClassName('drop-area');
        for (var i = 0; i < dropAreas.length; i++) {
            dropAreas[i].classList.remove('active');
        }
    };
    var startMovementFn = function (e) {
        if (isInNextPadding(getPoint(e))) {
            return;
        }
        e.preventDefault();
        haroldImage().classList.add('drag');
        start = getPoint(e);
        console.log(start);
        previous = start;
        isDown = true;
        activateDropAreas();
    }

    var preventDefault = function (e) { e.preventDefault(); }
    addEventListener(harolds, ['mousedown', 'touchstart'], startMovementFn);

    harolds.addEventListener("dragstart", preventDefault);
    harolds.addEventListener("drag", preventDefault);
    var downFn = function (e) {
        if (isDown) {
            var current = getPoint(e);
            if (isInNextPadding(current)) {
                nextEvent();
                dragDone();
                return;
            }
            var offset = calculateOffset(previous, current);
            setOffsetPosition(haroldImage(), offset);
            previous = current;
        }
    };
    addEventListener(harolds, ['mousemove', 'touchmove'], downFn);

    addEventListener(harolds, ['mouseup', 'touchend'], dragDone);
    addEventListener(harolds, 'click', function (e) {
        console.log("Click")
        if (isInNextPadding(getPoint(e))) {
            dragDone();
            nextEvent();
        }
    });

    function calculateOffset(start, end) {
        return { x: start.x - end.x, y: start.y - end.y };
    }
    function getPoint(e) {
        switch (e.type) {
            case "mousedown":
            case "mousemove":
            case "click":
                return { x: e.pageX, y: e.pageY };
            case "touchstart":
            case "touchmove":
                return { x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY };
        }
        console.warn("Unrecognized event", e);
        return {};
    }

    function dragDone() {
        isDown = false;
        deactivateDropAreas();
        haroldImage().style.position = "relative";
        haroldImage().style.left = "auto";
        haroldImage().style.top = "auto";
        haroldImage().classList.remove('drag');
    }

    function setOffsetPosition(element, offset) {
        var position = getPosition(element);
        element.style.position = "relative";
        var left = (offset.x * -1 + position.x);
        var top = (offset.y * -1 + position.y + window.scrollY);
        element.style.left = left + "px";
        element.style.top = top + "px";
    }

    function getPosition(element) {
        var rect = element.getBoundingClientRect();
        return { x: rect.left, y: rect.top };
    }

    function addEventListener(element, eventType, fn) {
        if (typeof (eventType) == "object") {
            eventType.forEach(e => {
                addEventListener(element, e, fn);
            });
            return;
        }
        console.log(arguments)
        element.addEventListener(eventType, function (e) {
            fn(e);
        });
    }

}

start();