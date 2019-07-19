class MutableAnnotation {
    constructor(label, elem, value) {
        this.label = label;
        this.elem = elem;
        this.value = value;
    }
}
export class Annotation extends MutableAnnotation {
}
export class Annotator /* MyFunkyClass */ {
    constructor(props) {
        this.annotations = {};
        this.props = props;
    }
    static install(props) {
        const annotator = new Annotator(props);
        annotator.main();
    }
    main() {
        // Tokeniza elemento em palavras, parágrafos...
        const root = this.props.elem;
        this.props.tokenizer.tokenize(root);
        // Considera somente seleções no elemento gerenciado
        this.selecting = false;
        document.onselectionchange = () => {
            const sel = document.getSelection();
            if (!root.contains(sel.anchorNode) || sel.isCollapsed) {
                this.selecting = false;
            }
            else {
                this.selecting = true;
            }
        };
        // Expande a seleção para conter o token por completo
        let sel;
        let rng;
        document.onmouseup = () => {
            sel = document.getSelection();
            if (this.selecting) {
                this.selecting = false;
                rng = this.props.tokenizer.expand(sel);
                // Está atualizando uma anotação?
                let prevLabel = null;
                let prevParent = null;
                if (rng.startContainer.parentElement === rng.endContainer.parentElement &&
                    rng.startContainer.parentElement.hasAttribute("data-label")) {
                    prevParent = rng.startContainer.parentElement;
                    prevLabel = prevParent.getAttribute("data-label");
                }
                const elems = [];
                if (!prevLabel) {
                    // Obtém lista de elementos na seleção
                    for (let elem = rng.startContainer; elem != rng.endContainer.nextElementSibling; elem = elem.nextElementSibling) {
                        if (elem.hasAttribute("data-label") ||
                            elem.parentElement.hasAttribute("data-label")) {
                            sel.empty();
                            return;
                        }
                        elems.push(elem);
                    }
                }
                // Expande a range para encobrir toda a anotação prévia
                if (prevLabel) {
                    rng.setStartBefore(prevParent);
                    rng.setEndAfter(prevParent);
                }
                // Dá controle ao seletor de label
                this.props.onSelected(prevLabel, (label) => {
                    sel.empty();
                    if (!prevLabel && !label) {
                        return;
                    }
                    // Nova anotação
                    else if (!prevLabel && label) {
                        // Envolve tokens num elemento grupo
                        const group = document.createElement("span");
                        group.setAttribute("data-label", label);
                        const first = elems[0];
                        first.parentElement.replaceChild(group, first);
                        group.appendChild(first);
                        for (const elem of elems.slice(1)) {
                            elem.parentElement.removeChild(elem);
                            group.appendChild(elem);
                        }
                        // Instancia anotação
                        const value = elems.map(e => e.innerText).join(" ");
                        const annotation = new MutableAnnotation(label, group, value);
                        const id = objectId(group);
                        this.annotations[id] = annotation;
                    }
                    // Atualiza anotação
                    else if (prevLabel && label) {
                        const group = prevParent;
                        group.setAttribute("data-label", label);
                        const id = objectId(group);
                        this.annotations[id].label = label;
                    }
                    // Remove anotação
                    else if (prevLabel && !label) {
                        const group = prevParent;
                        group.replaceWith(...group.childNodes);
                        const id = objectId(group);
                        delete this.annotations[id];
                    }
                    // Notifica mudança de anotações
                    this.props.onUpdate(Object.values(this.annotations));
                });
            }
        };
    }
}
class WordTokenizer {
    expand(sel) {
        const rng = sel.getRangeAt(0);
        rng.setStartBefore(rng.startContainer);
        rng.setEndAfter(rng.endContainer);
        return rng;
    }
    tokenize(elem) {
        if (elem.childElementCount > 0) {
            throw new Error("Cannot tokenize compound elements");
        }
        const tokens = elem.innerHTML.trim().split(/\s+/);
        elem.innerHTML = "";
        for (const token of tokens) {
            const el = document.createElement("span");
            el.innerText = token;
            elem.appendChild(el);
        }
        return elem;
    }
}
export const WORD_TOKENIZER = new WordTokenizer();
var __next_objid = 1;
function objectId(obj) {
    //https://stackoverflow.com/a/9957347
    if (obj == null)
        return null;
    if (obj.__obj_id == null)
        obj.__obj_id = __next_objid++;
    return obj.__obj_id;
}
//# sourceMappingURL=anote.js.map