const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// menu movil
const toggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');
const cerrarMenu = () => {
    menu.classList.remove('abierto');
    toggle.setAttribute('aria-expanded', false);
    toggle.setAttribute('aria-label', 'Abrir menú');
};
toggle.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    toggle.setAttribute('aria-expanded', abierto);
    toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', cerrarMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarMenu(); });

// formulario: arma un correo con los datos y confirma en el boton
const form = document.getElementById('form-contacto');
const textoBoton = form.querySelector('.texto-boton');
// fundido corto al cambiar el texto del boton
const cambiarTexto = texto => {
    textoBoton.classList.add('cambiando');
    setTimeout(() => {
        textoBoton.textContent = texto;
        textoBoton.classList.remove('cambiando');
    }, 150);
};
form.addEventListener('submit', e => {
    e.preventDefault();
    const cuerpo = `${form.mensaje.value}\n\n${form.nombre.value}\n${form.correo.value}`;
    window.location.href = 'mailto:gerlynfp@gmail.com?subject=' + encodeURIComponent(form.asunto.value) +
        '&body=' + encodeURIComponent(cuerpo);
    const boton = form.querySelector('.boton-enviar');
    boton.classList.add('enviado');
    cambiarTexto('Abriendo tu correo');
    clearTimeout(boton.temporizador);
    boton.temporizador = setTimeout(() => {
        boton.classList.remove('enviado');
        cambiarTexto('Enviar mensaje');
    }, 3000);
});

// copiar email
document.querySelectorAll('.copiar').forEach(boton => {
    boton.addEventListener('click', async () => {
        const aviso = boton.querySelector('.aviso');
        try {
            await navigator.clipboard.writeText(boton.dataset.copiar);
            aviso.textContent = 'Copiado';
        } catch {
            aviso.textContent = 'No se pudo copiar';
        }
        boton.classList.add('copiado');
        clearTimeout(boton.temporizador);
        boton.temporizador = setTimeout(() => boton.classList.remove('copiado'), 1800);
    });
});

document.getElementById('anio').textContent = new Date().getFullYear();

// titulo del hero: cada palabra sube desde una mascara
const titulo = document.querySelector('.titulo-animado');
titulo.setAttribute('aria-label', titulo.textContent);
titulo.innerHTML = titulo.textContent.trim().split(/\s+/)
    .map((p, i) => `<span class="palabra" aria-hidden="true"><span style="--i:${i}">${p}</span></span>`)
    .join(' ');
requestAnimationFrame(() => document.body.classList.add('cargado'));

// nav: sombra al bajar y enlace activo segun la seccion visible
const navbar = document.querySelector('.navbar');
const enlaces = [...menu.querySelectorAll('a')];
const secciones = enlaces.map(a => document.querySelector(a.getAttribute('href')));
const fondo = document.querySelector('.banner-fondo');
const lineas = [...document.querySelectorAll('.linea-tiempo')].map(linea => ({
    linea,
    progreso: linea.querySelector('.linea-progreso'),
    tarjetas: [...linea.querySelectorAll('.tarjeta')],
}));

let pendiente = false;
const actualizar = () => {
    pendiente = false;
    const y = scrollY;
    navbar.classList.toggle('con-sombra', y > 20);

    const marca = y + innerHeight * 0.35;
    let activa = -1;
    secciones.forEach((s, i) => { if (s.offsetTop <= marca) activa = i; });
    enlaces.forEach((a, i) => {
        a.classList.toggle('activo', i === activa);
        if (i === activa) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });

    if (!reducirMovimiento) {
        // parallax suave de las hojas del hero
        if (y < innerHeight) fondo.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;

        // la linea de tiempo se dibuja al pasar por ella
        lineas.forEach(({ linea, progreso, tarjetas }) => {
            const r = linea.getBoundingClientRect();
            const avance = Math.min(Math.max((innerHeight * 0.6 - r.top) / r.height, 0), 1);
            // transform directo sobre la linea, sin variables CSS en el padre
            progreso.style.transform = `scaleY(${avance})`;
            tarjetas.forEach(t => {
                t.classList.toggle('alcanzada', t.getBoundingClientRect().top < innerHeight * 0.6);
            });
        });
    }
};
addEventListener('scroll', () => {
    if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); }
}, { passive: true });
addEventListener('resize', actualizar);
actualizar();
