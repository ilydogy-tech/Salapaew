const products = [
 {id:"demo-1",name:"Pastel game pack",desc:"แพ็กไอเทมเกมโทนพาสเทล • ตัวอย่าง",price:59,category:"game",emoji:"🎀"},
 {id:"demo-2",name:"Cute coin service",desc:"บริการเติมเหรียญ • ตัวอย่างสินค้า",price:89,category:"game",emoji:"🪙"},
 {id:"demo-3",name:"Digital gift card",desc:"ของขวัญดิจิทัล • ตัวอย่าง",price:129,category:"digital",emoji:"💌"},
 {id:"demo-4",name:"Profile decoration",desc:"ตกแต่งโปรไฟล์ • ตัวอย่าง",price:39,category:"digital",emoji:"🧸"},
 {id:"demo-5",name:"Lovely starter set",desc:"เซตเริ่มต้นสำหรับคนพิเศษ • ตัวอย่าง",price:79,category:"game",emoji:"🌷"},
 {id:"demo-6",name:"Custom mini service",desc:"บริการดิจิทัลตามตกลง • ตัวอย่าง",price:99,category:"digital",emoji:"🫧"}
];
let cart = [];
const $ = s => document.querySelector(s);
const money = n => "฿"+Number(n).toLocaleString("th-TH");
function renderProducts(filter="all"){
 $("#product-grid").innerHTML=products.filter(p=>filter==="all"||p.category===filter).map(p=>`<article class="product-card"><div class="product-art">${p.emoji}</div><h3>${p.name}</h3><p>${p.desc}</p><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-button" data-add="${p.id}" aria-label="เพิ่ม ${p.name}">＋</button></div></article>`).join("");
}
function renderCart(){
 $("#cart-count").textContent=cart.reduce((n,i)=>n+i.qty,0);
 $("#cart-items").innerHTML=cart.length?cart.map(i=>`<div class="cart-row"><span>${i.name} × ${i.qty}</span><span>${money(i.price*i.qty)} <button data-remove="${i.id}">ลบ</button></span></div>`).join(""):'<p class="form-hint">ถุงช้อปปิ้งยังว่างอยู่เลย ♡</p>';
 $("#cart-total").textContent=money(cart.reduce((n,i)=>n+i.price*i.qty,0));
}
function openModal(id){$(id).classList.add("open");$(id).setAttribute("aria-hidden","false")}
function closeModal(id){$(id).classList.remove("open");$(id).setAttribute("aria-hidden","true")}
document.addEventListener("click",e=>{
 const add=e.target.closest("[data-add]");if(add){const p=products.find(p=>p.id===add.dataset.add);const existing=cart.find(i=>i.id===p.id);existing?existing.qty++:cart.push({...p,qty:1});renderCart();return}
 const rem=e.target.closest("[data-remove]");if(rem){cart=cart.filter(i=>i.id!==rem.dataset.remove);renderCart();return}
 const filter=e.target.closest("[data-filter]");if(filter){document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b===filter));renderProducts(filter.dataset.filter)}
});
$("#cart-open").onclick=()=>{renderCart();openModal("#cart-modal")};
$("#cart-close").onclick=()=>closeModal("#cart-modal");
$("#success-close").onclick=()=>closeModal("#success-modal");
document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModal("#"+m.id)}));
$("#checkout-form").addEventListener("submit",e=>{
 e.preventDefault();
 if(!cart.length){alert("กรุณาเลือกสินค้าก่อนนะคะ ♡");return}
 // Front-end preview only. A real order number must be allocated atomically by the database.
 const demoNum=String(Number(sessionStorage.getItem("salapaew-demo-order")||0)+1).padStart(4,"0");
 sessionStorage.setItem("salapaew-demo-order",Number(demoNum));
 $("#success-order").textContent="SLP"+demoNum;
 closeModal("#cart-modal");openModal("#success-modal");cart=[];renderCart();e.target.reset();
});
renderProducts();renderCart();