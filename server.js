require("dotenv").config();
const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const db = new Database("data.sqlite");
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS cars (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL, category TEXT DEFAULT 'Économique',
 price REAL NOT NULL, image TEXT DEFAULT '', description TEXT DEFAULT '',
 available INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS bookings (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 customer TEXT NOT NULL, phone TEXT NOT NULL, city TEXT NOT NULL,
 car TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL,
 message TEXT DEFAULT '', status TEXT DEFAULT 'Nouvelle',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);`);
if (db.prepare("SELECT COUNT(*) n FROM cars").get().n === 0) {
 const add=db.prepare("INSERT INTO cars(name,category,price,image,description) VALUES(?,?,?,?,?)");
 [
 ["Dacia Sandero - Manuelle","Citadine",250,"https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=900","Boîte manuelle • Tarif par jour"],
 ["Opel Corsa - Manuelle","Citadine",250,"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900","Boîte manuelle • Tarif par jour"],
 ["Renault Clio 5 - Automatique","Citadine",300,"https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=900","Boîte automatique • Tarif par jour"],
 ["Renault Clio 5 - Manuelle","Citadine",250,"https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=900","Boîte manuelle • Tarif par jour"],
 ["Peugeot 208 - Manuelle","Citadine",300,"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900","Boîte manuelle • Tarif par jour"],
 ["Dacia Logan - Manuelle","Berline",250,"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900","Boîte manuelle • Tarif par jour"],
 ["Dacia Logan - Automatique","Berline",300,"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900","Boîte automatique • Tarif par jour"]
 ].forEach(x=>add.run(...x));
}
app.use(helmet({contentSecurityPolicy:false}));
app.use(express.json({limit:"100kb"}));
app.use(express.urlencoded({extended:false}));
app.use(session({
 secret:process.env.SESSION_SECRET || "replace-this-secret-before-deployment",
 resave:false,saveUninitialized:false,
 cookie:{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:8*60*60*1000}
}));
app.use(express.static(path.join(__dirname,"public")));
const admin=(req,res,next)=>{
 if(req.session && req.session.admin) return next();
 return res.status(401).json({error:"Connexion administrateur requise"});
};
app.get("/api/config",(req,res)=>res.json({whatsapp:(process.env.WHATSAPP_NUMBER||"212661630867").replace(/\D/g,"")}));
app.get("/api/cars",(req,res)=>res.json(db.prepare("SELECT * FROM cars WHERE available=1 ORDER BY id DESC").all()));
app.post("/api/bookings",(req,res)=>{
 const {customer,phone,city,car,start_date,end_date,message=""}=req.body;
 if(!customer||!phone||!city||!car||!start_date||!end_date) return res.status(400).json({error:"Veuillez remplir tous les champs obligatoires."});
 if(end_date<start_date) return res.status(400).json({error:"La date de retour doit suivre la date de départ."});
 const info=db.prepare(`INSERT INTO bookings(customer,phone,city,car,start_date,end_date,message)
 VALUES(?,?,?,?,?,?,?)`).run(customer.trim(),phone.trim(),city.trim(),car,start_date,end_date,String(message).slice(0,1000));
 res.status(201).json({id:info.lastInsertRowid});
});
app.post("/api/admin/login",(req,res)=>{
 const {username,password}=req.body;
 if(username=== (process.env.ADMIN_USER||"admin") && password===process.env.ADMIN_PASSWORD){
   req.session.admin=true; return res.json({ok:true});
 }
 res.status(401).json({error:"Identifiants incorrects."});
});
app.post("/api/admin/logout",admin,(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get("/api/admin/bookings",admin,(req,res)=>res.json(db.prepare("SELECT * FROM bookings ORDER BY id DESC").all()));
app.patch("/api/admin/bookings/:id",admin,(req,res)=>{
 const allowed=["Nouvelle","Confirmée","Terminée","Annulée"];
 if(!allowed.includes(req.body.status)) return res.status(400).json({error:"Statut invalide"});
 db.prepare("UPDATE bookings SET status=? WHERE id=?").run(req.body.status,req.params.id);
 res.json({ok:true});
});
app.get("/api/admin/cars",admin,(req,res)=>res.json(db.prepare("SELECT * FROM cars ORDER BY id DESC").all()));
app.post("/api/admin/cars",admin,(req,res)=>{
 const {name,category,price,image,description}=req.body;
 if(!name||!Number.isFinite(Number(price))||Number(price)<=0) return res.status(400).json({error:"Nom et prix valide obligatoires."});
 const info=db.prepare("INSERT INTO cars(name,category,price,image,description) VALUES(?,?,?,?,?)")
 .run(name,category||"Économique",Number(price),image||"",description||"");
 res.status(201).json({id:info.lastInsertRowid});
});
app.delete("/api/admin/cars/:id",admin,(req,res)=>{
 db.prepare("UPDATE cars SET available=0 WHERE id=?").run(req.params.id);res.json({ok:true});
});
const port=process.env.PORT||3000;
app.listen(port,()=>console.log(`CHAKROUN BENZCAR : http://localhost:${port}`));