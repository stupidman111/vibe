import Prism from "prismjs";
import { useEffect } from "react";

import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";

interface Props {
  code: string;
  lang: string;
}

import "./code-theme.css";

export const CodeView = ({ code, lang }: Props) => {
  useEffect(() => {
    Prism.highlightAll(); //自动查找页面中带有 language-xxx 类名的 code 标签，并对其内容进行语法高亮处理。
  }, [code]);

  return (
    <pre className="p-2 bg-transparent border-none rounded-none m-0 text-xs">
      <code className={`language-${lang}`}>{code}</code>
    </pre>
  );
};
