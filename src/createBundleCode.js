// 通过 ast 解析完成后的都是 里面的代码
// 我们需要使用 function 来包裹一下
// 然后我们需要构建 require 函数
// 在我们执行这个文件的时候需要直接执行的的入口文件代码
// 所以启动的时候需要调用 require(entryFile), entryFile = 0

import fs from "fs";
import ejs from "ejs";
import path from "path";
import { dirname } from "./utils.js";

export function createBundleCode(data) {
  const bundleTemplate = fs.readFileSync(
    path.join(dirname(), "./bundle.ejs"),
    "utf-8"
  );

  const { modules } = data;

  let code = ejs.render(bundleTemplate, { modules });

  return code;
}
