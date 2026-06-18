// ==========================
// FIREBASE
// ==========================


const firebaseConfig={

apiKey:"TU_API_KEY",

authDomain:"TU_PROYECTO.firebaseapp.com",

databaseURL:"TU_DATABASE_URL",

projectId:"TU_ID"

};



firebase.initializeApp(firebaseConfig);

const db=firebase.database();




// VARIABLES


let usuarioActual=

localStorage.getItem("usuarioSubasta");


let subastaActual="";


let datosSubasta={};




// ==========================
// NAVEGACION
// ==========================


function mostrar(id){


document.querySelectorAll(".pantalla")

.forEach(p=>{

p.style.display="none";

});


document.getElementById(id)

.style.display="block";


}






// ==========================
// CREAR USUARIO
// ==========================


function crearUsuario(){



if(!acepta.checked){


alert("Debes aceptar pagar si ganas");

return;

}



let id=

usuario.value.trim();



if(!id){

alert("Ingresa usuario");

return;

}




db.ref("usuarios/"+id)

.once("value",snap=>{



if(snap.exists()){


alert("Usuario ya existe");


}else{



db.ref("usuarios/"+id)

.set({


nombre:nombre.value,

usuario:id,

acepta:true,

fecha:new Date().toLocaleString()


});



localStorage.setItem(

"usuarioSubasta",

id

);


usuarioActual=id;



alert("Usuario creado correctamente");



}


});


}







// ==========================
// ADMIN
// ==========================


function entrarAdmin(){



if(clave.value!="1234"){

alert("Clave incorrecta");

return;

}



mostrar("admin");


cargarAdmin();


}







// ==========================
// CREAR SUBASTA
// ==========================


function crearSubasta(){


let id=Date.now();



db.ref("subastas/"+id)

.set({


titulo:titulo.value,

imagen:imagen.value,

descripcion:descripcion.value,

precioBase:Number(base.value),

precioActual:Number(base.value),

incremento:Number(incremento.value),

fin:fin.value,

estado:"ACTIVA"


});



alert("Subasta creada");


}







// ==========================
// PANEL ADMIN
// ==========================


function cargarAdmin(){



db.ref("usuarios")

.on("value",s=>{


let n=0;


s.forEach(()=>n++);


totalUsuarios.innerHTML=

"Usuarios inscritos: "+n;


});





db.ref("subastas")

.on("value",s=>{


adminSubastas.innerHTML="";



s.forEach(x=>{


let d=x.val();



adminSubastas.innerHTML+=`

<div class="subastaCard">

<b>${d.titulo}</b>

<br>

$${d.precioActual.toLocaleString()}


<button class="eliminar"

onclick="eliminar('${x.key}')">

Eliminar

</button>

</div>

`;



});


});


}







// ==========================
// ELIMINAR
// ==========================


function eliminar(id){



db.ref("subastas/"+id)

.remove();


}







// ==========================
// LISTAR ACTIVAS
// ==========================


function cargarSubastas(){



mostrar("subastas");



db.ref("subastas")

.on("value",s=>{


listaSubastas.innerHTML="";



s.forEach(x=>{



let d=x.val();



if(d.estado=="ACTIVA"){



listaSubastas.innerHTML+=`

<div class="subastaCard">

<img class="foto" src="${d.imagen}">


<h3>${d.titulo}</h3>


<h2>

$${d.precioActual.toLocaleString()}

</h2>


<button onclick="abrir('${x.key}')">

Entrar

</button>


</div>

`;


}


});


});


}








// ==========================
// ABRIR SUBASTA
// ==========================


function abrir(id){



if(!usuarioActual){


alert("Debes crear usuario primero");

return;

}



subastaActual=id;


mostrar("detalle");



db.ref("subastas/"+id)

.on("value",s=>{


datosSubasta=s.val();


foto.src=datosSubasta.imagen;


nombreSubasta.innerHTML=

datosSubasta.titulo;


texto.innerHTML=

datosSubasta.descripcion;



valorActual.innerHTML=

"$"+datosSubasta.precioActual.toLocaleString();


});



botonOferta.onclick=pujar;


rankingLive();


}








// ==========================
// PUJAR
// ==========================


function pujar(){



let valor=

datosSubasta.precioActual+

datosSubasta.incremento;



db.ref(

"subastas/"+subastaActual+"/ofertas"

)

.push({


usuario:usuarioActual,

valor:valor,

fecha:new Date().toLocaleString()


});



db.ref(

"subastas/"+subastaActual+"/precioActual"

)

.set(valor);


}








// ==========================
// TOP 5
// ==========================


function rankingLive(){



db.ref(

"subastas/"+subastaActual+"/ofertas"

)

.on("value",s=>{


let datos=[];



s.forEach(x=>datos.push(x.val()));



datos.sort((a,b)=>b.valor-a.valor);



ranking.innerHTML="";



datos.slice(0,5)

.forEach((x,i)=>{



if(i==0)

lider.innerHTML=x.usuario;



ranking.innerHTML+=`

<li>

🏆 ${x.usuario}

<br>

$${x.valor.toLocaleString()}

</li>

`;


});


});


}
