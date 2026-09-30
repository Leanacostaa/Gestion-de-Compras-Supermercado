const formatoPrecio = new Intl.NumberFormat('es-AR');

async function consultarPrecio(productoId) {
  const respuesta = await fetch('precios.json');
  if (!respuesta.ok) throw new Error('No se pudo consultar la lista de precios');

  const productos = await respuesta.json();
  const producto = productos.find((item) => item.productoId === productoId);
  if (!producto || !Number.isFinite(producto.precioActualizado)) {
    throw new Error(`No hay un precio válido para ${productoId}`);
  }

  return producto.precioActualizado;
}

function configurarContador() {
  const inputCantidad = document.querySelector('#input-cantidad');
  const subtotal = document.querySelector('#subtotal-producto');
  const precio = document.querySelector('#precio-unitario');
  const botonAgregar = document.querySelector('[data-add-to-cart]');

  if (!inputCantidad || !subtotal || !precio || !botonAgregar) return;

  let precioUnitario = Number(botonAgregar.dataset.price);

  function actualizarSubtotal() {
    const cantidad = Math.max(1, Number.parseInt(inputCantidad.value, 10) || 1);
    inputCantidad.value = cantidad;
    subtotal.textContent = formatoPrecio.format(cantidad * precioUnitario);
  }

  document.querySelectorAll('[data-qty-step]').forEach((boton) => {
    boton.addEventListener('click', (evento) => {
      evento.stopPropagation();
      const paso = Number.parseInt(boton.dataset.qtyStep, 10);
      const cantidad = Number.parseInt(inputCantidad.value, 10) || 1;
      inputCantidad.value = Math.max(1, cantidad + paso);
      actualizarSubtotal();
    });
  });

  inputCantidad.addEventListener('input', actualizarSubtotal);

  consultarPrecio(botonAgregar.dataset.id)
    .then((nuevoPrecio) => {
      precioUnitario = nuevoPrecio;
      precio.textContent = formatoPrecio.format(precioUnitario);
      botonAgregar.dataset.price = precioUnitario;
      actualizarSubtotal();
    })
    .catch((error) => {
      console.error('Error al cargar el precio actualizado:', error);
      actualizarSubtotal();
    });

  actualizarSubtotal();
}

document.addEventListener('DOMContentLoaded', configurarContador);
