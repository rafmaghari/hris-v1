import{j as e}from"./app-3Ds5Ugas.js";import{c as a,B as r}from"./createLucideIcon-D09f9KDG.js";import{S as h}from"./square-pen-DdqE-SlW.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=[["circle",{cx:"9",cy:"12",r:"1",key:"1vctgf"}],["circle",{cx:"9",cy:"5",r:"1",key:"hp0tcf"}],["circle",{cx:"9",cy:"19",r:"1",key:"fkjjf6"}],["circle",{cx:"15",cy:"12",r:"1",key:"1tmaij"}],["circle",{cx:"15",cy:"5",r:"1",key:"19l28e"}],["circle",{cx:"15",cy:"19",r:"1",key:"f4zoj3"}]],m=a("GripVertical",y);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],p=a("Plus",j);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}]],f=a("Trash",u);function g({menus:t,onAddSubMenu:l,onEditMenu:n,onDeleteMenu:d,isSubmitting:o}){const i=(x,s=0,v=null)=>x.map(c=>e.jsxs("div",{children:[e.jsxs("div",{className:`mb-2 flex items-center rounded-md border p-2 ${s===0?"bg-gray-50":s===1?"ml-8 bg-gray-100":"ml-16 bg-gray-200"}`,children:[e.jsx("div",{className:"mr-2",children:e.jsx(m,{className:"h-5 w-5 text-gray-400"})}),e.jsxs("div",{className:"flex flex-1 items-center",children:[e.jsx("span",{className:c.is_active?"":"text-gray-400 line-through",children:c.name}),c.url&&e.jsx("span",{className:"ml-2 text-xs text-gray-500",children:c.url})]}),e.jsxs("div",{className:"flex gap-1",children:[e.jsx(r,{variant:"outline",size:"icon",onClick:()=>l(c),title:"Add Sub Menu",children:e.jsx(p,{className:"h-4 w-4"})}),e.jsx(r,{variant:"outline",size:"icon",onClick:()=>n(c),children:e.jsx(h,{className:"h-4 w-4"})}),e.jsx(r,{variant:"destructive",size:"icon",onClick:()=>d(c.id),disabled:o,children:e.jsx(f,{className:"h-4 w-4"})})]})]}),c.children&&c.children.length>0&&e.jsx("div",{className:"ml-4",children:i(c.children,s+1,c.id)})]},c.id));return e.jsx("div",{className:"menu-tree space-y-2",children:t.length===0?e.jsx("div",{className:"p-8 text-center text-gray-500",children:"No menus found. Create your first menu item."}):i(t)})}const _=Object.freeze(Object.defineProperty({__proto__:null,default:g},Symbol.toStringTag,{value:"Module"}));export{g as M,p as P,_ as a};
