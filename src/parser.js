import { parse as parseBabel } from "@babel/parser";
import rawTraverse from "@babel/traverse";
import { transformFromAst } from "@babel/core";
const traverse = rawTraverse.default;

export function parse(source) {
  const dependencies = [];
  const ast = parseBabel(source, {
    sourceType: "module",
  });

  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      // 基于import来获取当前文件需要的依赖
      dependencies.push(node.source.value);
    },
  });

  // 把里面的import替换成require
  const { code } = transformFromAst(ast, null, {
    // 需要使用babel-preset-env
    presets: ["env"],
  });

  return {
    code,
    dependencies,
  };
}
