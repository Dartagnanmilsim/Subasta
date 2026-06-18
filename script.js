let subasta = {};


// ===========================
// CREAR SUBASTA ADMIN
// ===========================

function crearSubasta(){


if(clave.value !== "1234"){

alert("Clave administrador incorrecta");

return;

}


db.ref("subasta").set({

producto: producto.value,

imagen: imagen.value,

precio: Number(base.value),

incremento: Number(incremento.value),

fin: fin.value,

estado: "ACTIVA",

creada: new Date().toLocaleString()

});


db.ref("ofertas").remove();


alert("Subasta creada correctamente");


}



// ===========================
// HACER OFERTA
// ===========================

function ofertar(){


if(!subasta.estado){

alert("No hay subasta activa");

return;

}


if(subasta.estado !== "ACTIVA"){

alert("Subasta cerrada");

return;

}



if(new Date() > new Date(subasta.fin)){


cerrarSubasta();

alert("Tiempo terminado");

return;

}



// incremento automático

let nuevoValor =

subasta.precio + subasta.incremento;



let oferta = {

nombre: nombre.value,

celular: celular.value,

correo: correo.value,

ciudad: ciudad.value,

valor: nuevoValor,

fecha: new Date().toLocaleString()

};



// guardar oferta

db.ref("ofertas").push(oferta);



// actualizar precio actual

db.ref("subasta/precio").set(nuevoValor);



}



// ===========================
// ESCUCHAR SUBASTA EN VIVO
// ===========================


db.ref("subasta").on("value", snapshot => {


if(!snapshot.exists()) return;


subasta = snapshot.val();


titulo.innerHTML = subasta.producto;


precio.innerHTML =

"$" + subasta.precio.toLocaleString();


termina.innerHTML = subasta.fin;


foto.src = subasta.imagen;


});



// ===========================
// RANKING EN VIVO
// ===========================


db.ref("ofertas").on("value", snapshot => {


ranking.innerHTML = "";


let datos = [];


snapshot.forEach(item => {


datos.push(item.val());


});



datos.sort((a,b)=>{

return b.valor - a.valor;

});



datos.forEach((o,index)=>{


let medalla="";


if(index===0){

medalla="🥇 ";

}else if(index===1){

medalla="🥈 ";

}else if(index===2){

medalla="🥉 ";

}



ranking.innerHTML += `

<li>

${medalla}

${o.nombre}

<br>

$${o.valor.toLocaleString()}

<br>

${o.fecha}

</li>

`;



});


});




// ===========================
// CIERRE DE SUBASTA
// ===========================


function cerrarSubasta(){


db.ref("subasta/estado").set("FINALIZADA");


db.ref("ofertas")

.orderByChild("valor")

.limitToLast(1)

.once("value", snap=>{


snap.forEach(x=>{


let ganador = x.val();


db.ref("ganador").set(ganador);


});


});


}
