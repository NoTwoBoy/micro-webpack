import { parse } from "./parser.js";
import path from "path";
import fs from "fs";

let ID = 0;
export default class Compilation {
  constructor({ loaders, entry }) {
    this._loaders = loaders || [];
    this._entry = entry;
    this.graph = [];
  }

  make() {
    const self = this;
    function _buildModule(filename) {
      // 构建模块
      // 1.获取模块的编码
      let sourceCode = fs.readFileSync(filename, { encoding: "utf-8" });
      // 在这里调用 loader
      // 把 sourdeCode 给到 loader做处理
      self._loaders.forEach(({ loader, test: rule }) => {
        if (rule.test(filename)) {
          // 现在 loader 是 string ，需要使用 require 加载过来
          // 暂时只支持一个loader
          // TODO options
          sourceCode = loader(sourceCode);
        }
      });

      // 2.获取模块的依赖关系和把 import 替换成 require
      const { code, dependencies } = parse(sourceCode);

      return {
        code,
        dependencies,
        filename,
        mapping: {},
        id: ID++,
      };
    }

    // 通过队列的方式来把所有的文件都处理掉
    const moduleQueue = [];
    const entryModule = _buildModule(this._entry);
    moduleQueue.push(entryModule);
    this.graph.push(entryModule);

    while (moduleQueue.length > 0) {
      const currentModule = moduleQueue.shift();
      currentModule.dependencies.forEach((dependence) => {
        // 提前处理下 dependence 的路径
        // 需要完整的文件路径
        const childPath = path.resolve(
          path.dirname(currentModule.filename),
          dependence
        );
        const childModule = _buildModule(childPath);
        // mapping 的 key 需要的是相对路径
        currentModule.mapping[dependence] = childModule.id;
        moduleQueue.push(childModule);
        this.graph.push(childModule);
      });
    }
  }
}
