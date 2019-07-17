# AnoteJS

This library aim to aid people to annotate plain text sentences.

I found it useful to some compnanies and projects. So talking with my colleague we decided to implement it.

It is a short term side project.

```sh
npm install anotejs
```

```html
<h1>Anote</h1>
<div id="text">
  O Projeto Atlas Linguístico do Brasil (Projeto ALiB) == empreendimento de
  grande amplitude, de caráter nacional, em desenvolvimento == tem por meta a
  realização de um atlas geral do Brasil no que diz respeito à língua
  portuguesa. Desejo que permeia a atividade dialetal no Brasil, durante todo o
  desenvolvimento dos estudos linguísticos e filológicos, ganha corpo nesse
  final/começo de milênio, a partir de iniciativa de um grupo de pesquisadores
  do Instituto de Letras. Mais uma vez a UFBA assume atitude pioneira ao
  empreender a concretização dessa proposta que se realiza como projeto conjunto
  que envolve hoje doze Universidades.
</div>
<script type="module">
  import { Annotator, WORD_TOKENIZER } from "../dist/anote.js";
  Annotator.install({
    tokenizer: WORD_TOKENIZER,
    elem: document.getElementById("text"),
    onUpdate(annotations) {
      console.log(annotations);
    },
    onSelected(label, selectionDone) {
      if (label) {
        label = prompt("Label", label);
      } else {
        label = prompt("Label");
      }
      selectionDone(label.trim());
    }
  });
</script>

<style>
  #text span {
    margin: 0.2em;
  }
  [data-label] {
    background-color: khaki;
  }
</style>
```
