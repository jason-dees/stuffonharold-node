class HaroldImage extends HTMLDivElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        const mainElement = document.createElement('div');
        mainElement.classList.add('harold-img');

        const image = new Image();
        mainElement.append(image);
        this.mainElement = mainElement;
        this.image = image;
    }

    remove() {
        this.mainElement.parentNode.removeChild(this.mainElement);
    }

    set src(newSrc) {
        this.Image.src = newSrc;
    }
    get src() {
        return this.Image.src;
    }
}
customElements.define('harold-img', HaroldImage, { extends: 'div' });