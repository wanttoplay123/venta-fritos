const productos = [
    { nombre: "Buñuelos", precio: 2500, vendidos: 0 },
    { nombre: "Deditos", precio: 2500, vendidos: 0 },
    { nombre: "Empanadas de maíz con carne", precio: 2500, vendidos: 0 },
    { nombre: "Empanadas con pollo", precio: 3000, vendidos: 0 },
    { nombre: "Empanadas Hawaiana", precio: 3000, vendidos: 0 },
    { nombre: "Empanadas trifásica", precio: 3500, vendidos: 0 },
    { nombre: "Arepa huevo", precio: 3500, vendidos: 0 },
    { nombre: "Quibes", precio: 3500, vendidos: 0 },
    { nombre: "Jugo", precio: 1000, vendidos: 0 },
    { nombre: "Cafe", precio: 500, vendidos: 0 }        
];


const tablaBody = document.querySelector("#tablaProductos tbody");
const totalGeneralDiv = document.getElementById("totalVenta");
const reiniciarBTN = document.getElementById("reiniciar");

function guardarVentas(){
    const datos = productos.map(p => p.vendidos);
    localStorage.setItem("ventasFritos", JSON.stringify(datos));
}

function cargarVentas(){
    const datos = JSON.parse(localStorage.getItem("ventasFritos"));
    if(datos){
        datos.forEach((vendidos, index) =>{
            productos[index].vendidos = vendidos
        
        });
    }
}

function cargarProductos(){
    tablaBody.innerHTML = "";
    productos.forEach((producto, index)=>{
        const fila = document.createElement("tr");
        fila.innerHTML = `
        <td>${producto.nombre}</td>
        <td>$${producto.precio}</td>
        <td id="vendidos-${index}">${producto.vendidos}</td>
        <td id="subtotal-${index}">$${producto.vendidos * producto.precio}</td>
        <td><button onclick="venderProducto(${index})">+</button></td>`;
        tablaBody.appendChild(fila);
    });
    actualizarTotalGeneral();
}


function venderProducto(index){
    productos[index].vendidos++;
    document.getElementById(`vendidos-${index}`).innerText = productos[index].vendidos;
    document.getElementById(`subtotal-${index}`).innerText = `$${productos[index].vendidos * productos[index].precio}`;
    guardarVentas();
    actualizarTotalGeneral();
  
}

function actualizarTotalGeneral() {
    let total = 0;
    productos.forEach(producto => {
      total += producto.vendidos * producto.precio;
    });
    totalGeneralDiv.innerText = `Total: $${total}`;
}

// Reiniciar ventas
reiniciarBTN.addEventListener("click", () => {
    if (confirm("¿Seguro que quieres reiniciar las ventas?")) {
      productos.forEach(producto => producto.vendidos = 0);
      localStorage.removeItem("ventasFritos");
      cargarProductos();
    }
  });
  
cargarVentas();
cargarProductos();