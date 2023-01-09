/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/worker.js":
/*!***********************!*\
  !*** ./src/worker.js ***!
  \***********************/
/***/ (() => {

eval("const even = (x) => 2 * Math.round(x / 2);\n\nfunction createTransformer(x, y, width, height) {\n  x = even(x);\n  y = even(y);\n  width = even(width);\n  height = even(height);\n  return (frame, controller) => {\n    const newFrame = new VideoFrame(frame, {\n      visibleRect: { x, y, width, height },\n    });\n    \n    controller.enqueue(newFrame);\n    frame.close();\n  };\n}\n\nonmessage = async (event) => {\n  const { readable, writable, x, y, width, height } = event.data;\n  readable\n    .pipeThrough(\n      new TransformStream({\n        transform: createTransformer(x, y, width, height),\n      })\n    )\n    .pipeTo(writable);\n};\n\n\n//# sourceURL=webpack://duckyc.github.io/./src/worker.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/worker.js"]();
/******/ 	
/******/ })()
;