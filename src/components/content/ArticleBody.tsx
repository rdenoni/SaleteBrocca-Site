import type { ArticleBlock } from "@/types/content";
import styles from "./ArticleBody.module.css";

interface ArticleBodyProps {
  blocks: readonly ArticleBlock[];
}

function renderBlock(block: ArticleBlock, index: number) {
  switch (block.type) {
    case "heading":
      return <h2 key={index}>{block.text}</h2>;
    case "quote":
      return <blockquote key={index}>{block.text}</blockquote>;
    case "list":
      return (
        <ul key={index}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{item}</li>
          ))}
        </ul>
      );
    default:
      return <p key={index}>{block.text}</p>;
  }
}

/* Corpo em Martel 18/32 numa coluna de leitura de ~72 caracteres; títulos em Noto Sans. */
export function ArticleBody({ blocks }: ArticleBodyProps) {
  return <div className={styles.body}>{blocks.map(renderBlock)}</div>;
}
