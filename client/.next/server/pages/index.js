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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   \"getServerSideProps\": () => (/* binding */ getServerSideProps)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/react */ \"next-auth/react\");\n/* harmony import */ var next_auth_react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth_react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst Home = ()=>{\n    const { data  } = (0,next_auth_react__WEBPACK_IMPORTED_MODULE_1__.useSession)();\n    console.log(\"HERE IS DATA\", data);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        children: [\n            data?.user ? /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                onClick: ()=>(0,next_auth_react__WEBPACK_IMPORTED_MODULE_1__.signOut)(),\n                children: \"Sign Out\"\n            }, void 0, false, {\n                fileName: \"/Users/brickly/Desktop/Youtube/Shadee Merhi/Imessage/client/src/pages/index.tsx\",\n                lineNumber: 12,\n                columnNumber: 9\n            }, undefined) : /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                onClick: ()=>(0,next_auth_react__WEBPACK_IMPORTED_MODULE_1__.signIn)(\"google\"),\n                children: \"Sign In\"\n            }, void 0, false, {\n                fileName: \"/Users/brickly/Desktop/Youtube/Shadee Merhi/Imessage/client/src/pages/index.tsx\",\n                lineNumber: 14,\n                columnNumber: 9\n            }, undefined),\n            data?.user?.name\n        ]\n    }, void 0, true, {\n        fileName: \"/Users/brickly/Desktop/Youtube/Shadee Merhi/Imessage/client/src/pages/index.tsx\",\n        lineNumber: 10,\n        columnNumber: 5\n    }, undefined);\n};\nasync function getServerSideProps(context) {\n    const session = await (0,next_auth_react__WEBPACK_IMPORTED_MODULE_1__.getSession)(context);\n    return {\n        props: {\n            session\n        }\n    };\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Home);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvaW5kZXgudHN4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBO0FBQzBFO0FBRTFFLE1BQU1JLElBQUksR0FBYSxJQUFNO0lBQzNCLE1BQU0sRUFBRUMsSUFBSSxHQUFFLEdBQUdGLDJEQUFVLEVBQUU7SUFFN0JHLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDLGNBQWMsRUFBRUYsSUFBSSxDQUFDLENBQUM7SUFFbEMscUJBQ0UsOERBQUNHLEtBQUc7O1lBQ0RILElBQUksRUFBRUksSUFBSSxpQkFDVCw4REFBQ0MsUUFBTTtnQkFBQ0MsT0FBTyxFQUFFLElBQU1ULHdEQUFPLEVBQUU7MEJBQUUsVUFBUTs7Ozs7eUJBQVMsaUJBRW5ELDhEQUFDUSxRQUFNO2dCQUFDQyxPQUFPLEVBQUUsSUFBTVYsdURBQU0sQ0FBQyxRQUFRLENBQUM7MEJBQUUsU0FBTzs7Ozs7eUJBQVM7WUFFMURJLElBQUksRUFBRUksSUFBSSxFQUFFRyxJQUFJOzs7Ozs7aUJBQ2IsQ0FDTjtDQUNIO0FBRU0sZUFBZUMsa0JBQWtCLENBQUNDLE9BQXdCLEVBQUU7SUFDakUsTUFBTUMsT0FBTyxHQUFHLE1BQU1mLDJEQUFVLENBQUNjLE9BQU8sQ0FBQztJQUV6QyxPQUFPO1FBQ0xFLEtBQUssRUFBRTtZQUNMRCxPQUFPO1NBQ1I7S0FDRixDQUFDO0NBQ0g7QUFFRCxpRUFBZVgsSUFBSSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaW1lc3NhZ2UtZ3JhcGhxbC8uL3NyYy9wYWdlcy9pbmRleC50c3g/MTlhMCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE5leHRQYWdlLCBOZXh0UGFnZUNvbnRleHQgfSBmcm9tIFwibmV4dFwiO1xuaW1wb3J0IHsgZ2V0U2Vzc2lvbiwgc2lnbkluLCBzaWduT3V0LCB1c2VTZXNzaW9uIH0gZnJvbSBcIm5leHQtYXV0aC9yZWFjdFwiO1xuXG5jb25zdCBIb21lOiBOZXh0UGFnZSA9ICgpID0+IHtcbiAgY29uc3QgeyBkYXRhIH0gPSB1c2VTZXNzaW9uKCk7XG5cbiAgY29uc29sZS5sb2coXCJIRVJFIElTIERBVEFcIiwgZGF0YSk7XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAge2RhdGE/LnVzZXIgPyAoXG4gICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2lnbk91dCgpfT5TaWduIE91dDwvYnV0dG9uPlxuICAgICAgKSA6IChcbiAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzaWduSW4oXCJnb29nbGVcIil9PlNpZ24gSW48L2J1dHRvbj5cbiAgICAgICl9XG4gICAgICB7ZGF0YT8udXNlcj8ubmFtZX1cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTZXJ2ZXJTaWRlUHJvcHMoY29udGV4dDogTmV4dFBhZ2VDb250ZXh0KSB7XG4gIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBnZXRTZXNzaW9uKGNvbnRleHQpO1xuXG4gIHJldHVybiB7XG4gICAgcHJvcHM6IHtcbiAgICAgIHNlc3Npb24sXG4gICAgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgSG9tZTtcbiJdLCJuYW1lcyI6WyJnZXRTZXNzaW9uIiwic2lnbkluIiwic2lnbk91dCIsInVzZVNlc3Npb24iLCJIb21lIiwiZGF0YSIsImNvbnNvbGUiLCJsb2ciLCJkaXYiLCJ1c2VyIiwiYnV0dG9uIiwib25DbGljayIsIm5hbWUiLCJnZXRTZXJ2ZXJTaWRlUHJvcHMiLCJjb250ZXh0Iiwic2Vzc2lvbiIsInByb3BzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/pages/index.tsx\n");

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