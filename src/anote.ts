class MutableAnnotation
{
  constructor(public label: string, public elem: HTMLElement, public value: string) {}
}

export class Annotation extends MutableAnnotation
{
  readonly label: string;
  readonly elem: HTMLElement;
  readonly value: string;
}

interface IProps {
  tokenizer: ITokenizer;
  elem: HTMLElement;
  onUpdate(annotations: Annotation[]): void;
  onSelected(label: string|null, selectionDone: (label: string|null) => void);
  onSelectionVanished();
}

export class Annotator /* MyFunkyClass */
{
  static install(props: IProps)
  {
    const annotator = new Annotator(props);
    annotator.main();
  }

  private props: IProps;

  private constructor(props: IProps) { this.props = props; }

  private selecting: boolean;
  private annotations: { [i: number]: MutableAnnotation } = {};

  private main()
  {
    // Tokeniza elemento em palavras, parágrafos...
    const root = this.props.elem;
    this.props.tokenizer.tokenize(root);

    this.selecting = false;
    document.onselectionchange = () => {
      const sel = document.getSelection();

      // Considera somente seleções no elemento gerenciado
      if (!root.contains(sel.anchorNode)) {
        this.selecting = false;
      }
      // Seleção removida
      else if (sel.isCollapsed && this.selecting) {
        sel.empty();
        this.props.onSelectionVanished();
        this.selecting = false;
      }
      // Realmente uma seleção está ocorrendo
      else {
        this.selecting = true;
      }
    };

    // Expande a seleção para conter o token por completo
    let sel: Selection;
    let rng: Range;
    document.onmouseup = () => {
      sel = document.getSelection();
      if (this.selecting) {
        this.selecting = false;
        rng = this.props.tokenizer.expand(sel);

        // Está atualizando uma anotação?
        let prevLabel: string|null = null;
        let prevParent: HTMLElement|null = null;
        if (rng.startContainer.parentElement === rng.endContainer.parentElement &&
            rng.startContainer.parentElement.hasAttribute("data-label")) {
          prevParent = rng.startContainer.parentElement;
          prevLabel = prevParent.getAttribute("data-label");
        }

        const elems = [] as HTMLElement[];
        if (!prevLabel) {
          // Obtém lista de elementos na seleção
          for (let elem = rng.startContainer as Element;
               elem != (rng.endContainer as Element).nextElementSibling;
               elem = elem.nextElementSibling) {
            if (elem.hasAttribute("data-label") ||
                elem.parentElement.hasAttribute("data-label")) {
              sel.empty();
              return;
            }
            elems.push(elem as HTMLElement);
          }
        }

        // Expande a range para encobrir toda a anotação prévia
        if (prevLabel) {
          rng.setStartBefore(prevParent);
          rng.setEndAfter(prevParent);
        }

        // Dá controle ao seletor de label
        this.props.onSelected(prevLabel, (label: string|null) => {
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

export interface ITokenizer {
  expand(sel: Selection): Range;
  tokenize(elem: HTMLElement);
}

class WordTokenizer implements ITokenizer
{
  expand(sel: Selection): Range
  {
    const rng = sel.getRangeAt(0);
    rng.setStartBefore(rng.startContainer);
    rng.setEndAfter(rng.endContainer);
    return rng;
  }

  tokenize(elem: HTMLElement)
  {
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
function objectId(obj)
{
  // https://stackoverflow.com/a/9957347
  if (obj == null)
    return null;
  if (obj.__obj_id == null)
    obj.__obj_id = __next_objid++;
  return obj.__obj_id;
}
