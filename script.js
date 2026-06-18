let subasta = {};



// =================
// CREAR SUBASTA
// =================

function crearSubasta(){


if(clave.value !== "1234"){

alert("Clave incorrecta");
return;

}


db.ref("subasta").set({

producto:producto.value,

imagen:imagen.value,

base:Number(valorBase.value),

precio:Number(valorBase.value),

incremento:Number(incremento.value),

fin:fechaFin.value,

estado:"ACTIVA"

});


db.ref("ofertas").remove();


alert("Subasta creada");


}





// =================
// OFERTAR
// =================


function hacerOferta(){


if(!nombre.value){

alert("Debes registrarte");

return;

}


if(subasta.estado !== "ACTIVA"){

alert("Subasta cerrada");

return;

}


if(new Date() > new Date(subasta.fin)){

db.ref("subasta/estado").set("FINALIZADA");

alert("Tiempo terminado");

return;

}



let nuevo =

subasta.precio + subasta.incremento;



let oferta={

nombre:nombre.value,

celular:celular.value,

correo:correo.value,

valor:nuevo,

fecha:new Date().toLocaleString()

};



db.ref("ofertas").push(oferta);


db.ref("subasta/precio").set(nuevo);


}





// =================
// ACTUALIZAR SUBASTA
// =================


db.ref("subasta").on("value", dato=>{


if(!dato.exists()) return;


subasta=dato.val();


nombreProducto.innerHTML=subasta.producto;


fotoProducto.src=subasta.imagen;


precioBase.innerHTML=

"$"+subasta.base.toLocaleString();


ofertaActual.innerHTML=

"$"+subasta.precio.toLocaleString();


});






// =================
// TOP 5 EN VIVO
// =================


db.ref("ofertas").on("value", dato=>{


let lista=[];


dato.forEach(x=>{

lista.push(x.val());

});



lista.sort((a,b)=>b.valor-a.valor);



top.innerHTML="";



lista.slice(0,5).forEach((x,i)=>{


if(i===0){

ganadorActual.innerHTML=x.nombre;

}


top.innerHTML +=

`

<li>

<strong>${x.nombre}</strong>

<br>

$${x.valor.toLocaleString()}

</li>

`;



});


});
