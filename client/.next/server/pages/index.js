"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/index";
exports.ids = ["pages/index"];
exports.modules = {

/***/ "./src/pages/index.tsx":
/*!*****************************!*\
  !*** ./src/pages/index.tsx ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/react */ \"next-auth/react\");\n/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth_react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst Home = ()=>{\n    const { data  } = (0,next_auth_react__WEBPACK_IMPORTED_MODULE_1__.useSession)();\n    console.log(\"HERE IS DATA\", data);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        children: [\n            data?.user ? /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                onClick: ()=>(0,next_auth_react__WEBPACK_IMPORTED_MODULE_1__.signOut)(),\n                children: \"Sign Out\"\n            }, void 0, false, {\n                fileName: \"/Users/brickly/Desktop/Youtube/Shadee Merhi/Imessage/client/src/pages/index.tsx\",\n                lineNumber: 12,\n                columnNumber: 9\n            }, undefined) : /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                onClick: ()=>(0,next_auth_react__WEBPACK_IMPORTED_MODULE_1__.signIn)(\"google\"),\n                children: \"Sign In\"\n            }, void 0, false, {\n                fileName: \"/Users/brickly/Desktop/Youtube/Shadee Merhi/Imessage/client/src/pages/index.tsx\",\n                lineNumber: 14,\n                columnNumber: 9\n            }, undefined),\n            data?.user?.name\n        ]\n    }, void 0, true, {\n        fileName: \"/Users/brickly/Desktop/Youtube/Shadee Merhi/Imessage/client/src/pages/index.tsx\",\n        lineNumber: 10,\n        columnNumber: 5\n    }, undefined);\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Home);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvaW5kZXgudHN4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7QUFDOEQ7QUFFOUQsTUFBTUcsSUFBSSxHQUFhLElBQU07SUFDM0IsTUFBTSxFQUFFQyxJQUFJLEdBQUUsR0FBR0YsMkRBQVUsRUFBRTtJQUU3QkcsT0FBTyxDQUFDQyxHQUFHLENBQUMsY0FBYyxFQUFFRixJQUFJLENBQUMsQ0FBQztJQUVsQyxxQkFDRSw4REFBQ0csS0FBRzs7WUFDREgsSUFBSSxFQUFFSSxJQUFJLGlCQUNULDhEQUFDQyxRQUFNO2dCQUFDQyxPQUFPLEVBQUUsSUFBTVQsd0RBQU8sRUFBRTswQkFBRSxVQUFROzs7Ozt5QkFBUyxpQkFFbkQsOERBQUNRLFFBQU07Z0JBQUNDLE9BQU8sRUFBRSxJQUFNVix1REFBTSxDQUFDLFFBQVEsQ0FBQzswQkFBRSxTQUFPOzs7Ozt5QkFBUztZQUUxREksSUFBSSxFQUFFSSxJQUFJLEVBQUVHLElBQUk7Ozs7OztpQkFDYixDQUNOO0NBQ0g7QUFFRCxpRUFBZVIsSUFBSSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaW1lc3NhZ2UtZ3JhcGhxbC8uL3NyYy9wYWdlcy9pbmRleC50c3g/MTlhMCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE5leHRQYWdlIH0gZnJvbSBcIm5leHRcIjtcbmltcG9ydCB7IHNpZ25Jbiwgc2lnbk91dCwgdXNlU2Vzc2lvbiB9IGZyb20gXCJuZXh0LWF1dGgvcmVhY3RcIjtcblxuY29uc3QgSG9tZTogTmV4dFBhZ2UgPSAoKSA9PiB7XG4gIGNvbnN0IHsgZGF0YSB9ID0gdXNlU2Vzc2lvbigpO1xuXG4gIGNvbnNvbGUubG9nKFwiSEVSRSBJUyBEQVRBXCIsIGRhdGEpO1xuXG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIHtkYXRhPy51c2VyID8gKFxuICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNpZ25PdXQoKX0+U2lnbiBPdXQ8L2J1dHRvbj5cbiAgICAgICkgOiAoXG4gICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2lnbkluKFwiZ29vZ2xlXCIpfT5TaWduIEluPC9idXR0b24+XG4gICAgICApfVxuICAgICAge2RhdGE/LnVzZXI/Lm5hbWV9XG4gICAgPC9kaXY+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBIb21lO1xuIl0sIm5hbWVzIjpbInNpZ25JbiIsInNpZ25PdXQiLCJ1c2VTZXNzaW9uIiwiSG9tZSIsImRhdGEiLCJjb25zb2xlIiwibG9nIiwiZGl2IiwidXNlciIsImJ1dHRvbiIsIm9uQ2xpY2siLCJuYW1lIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/pages/index.tsx\n");

/***/ }),

/***/ "next-auth/react":
/*!**********************************!*\
  !*** external "next-auth/react" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("next-auth/react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./src/pages/index.tsx"));
module.exports = __webpack_exports__;

})();