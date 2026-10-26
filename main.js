const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// menu movil
const toggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');
toggle.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    toggle.setAttribute('aria-expanded', abierto);
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('abierto');
    toggle.setAttribute('aria-expanded', false);
}));

// formulario: arma un correo con los datos
document.getElementById('form-contacto').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const cuerpo = `${f.mensaje.value}\n\n${f.nombre.value}\n${f.correo.value}`;
    window.location.href = 'mailto:gerlynfp@gmail.com?subject=' + encodeURIComponent(f.asunto.value) +
        '&body=' + encodeURIComponent(cuerpo);
});

document.getElementById('anio').textContent = new Date().getFullYear();

// cinta: se duplica el contenido para que el bucle no tenga cortes
const pista = document.querySelector('.cinta-pista');
pista.innerHTML += pista.innerHTML;

// titulo: aparece palabra por palabra
const titulo = document.querySelector('.titulo-animado');
titulo.setAttribute('aria-label', titulo.textContent);
titulo.innerHTML = titulo.textContent.trim().split(/\s+/)
    .map((p, i) => `<span class="palabra" aria-hidden="true"><span style="--i:${i}">${p}</span></span>`)
    .join(' ');

// retraso escalonado para los hijos de [data-escalonar]
document.querySelectorAll('[data-escalonar]').forEach(grupo => {
    [...grupo.children].forEach((hijo, i) => hijo.style.setProperty('--retraso', `${i * 0.08}s`));
});

// aparicion al hacer scroll
const revelables = document.querySelectorAll('.revelar');
if (reducirMovimiento || !('IntersectionObserver' in window)) {
    revelables.forEach(el => el.classList.add('visible'));
} else {
    const observador = new IntersectionObserver(entradas => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('visible');
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revelables.forEach(el => observador.observe(el));
}
document.body.classList.add('cargado');

// barra de progreso y nav compacta
const barra = document.querySelector('.progreso-scroll');
const navbar = document.querySelector('.navbar');
const alHacerScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    barra.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    navbar.classList.toggle('compacta', scrollY > 40);
};
addEventListener('scroll', alHacerScroll, { passive: true });
alHacerScroll();

// luz que sigue al cursor (solo con raton)
const luz = document.querySelector('.cursor-luz');
if (!reducirMovimiento && matchMedia('(pointer: fine)').matches) {
    let x = innerWidth / 2, y = innerHeight / 2, lx = x, ly = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; luz.classList.add('activa'); });
    document.addEventListener('pointerleave', () => luz.classList.remove('activa'));
    const seguir = () => {
        lx += (x - lx) * 0.12;
        ly += (y - ly) * 0.12;
        luz.style.transform = `translate(${lx}px, ${ly}px)`;
        requestAnimationFrame(seguir);
    };
    seguir();
}

// constelacion de triangulos en el hero
const canvas = document.getElementById('constelacion');
const ctx = canvas.getContext('2d');
const colores = ['#8052ff', '#ffb829', '#15846e', '#b18cff', '#ff5fa2', '#4d8dff'];
let particulas = [];
let ancho, alto, dpr;
let raton = { x: -9999, y: -9999 };

const crearParticulas = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    ancho = canvas.clientWidth;
    alto = canvas.clientHeight;
    canvas.width = ancho * dpr;
    canvas.height = alto * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // la nube se concentra a la derecha en escritorio y arriba en movil
    const movil = ancho < 820;
    const cx = movil ? ancho * 0.5 : ancho * 0.72;
    const cy = movil ? alto * 0.28 : alto * 0.5;
    const rx = movil ? ancho * 0.45 : ancho * 0.22;
    const ry = movil ? alto * 0.2 : alto * 0.32;
    const total = movil ? 260 : 650;

    particulas = Array.from({ length: total }, (_, i) => {
        const ambiente = i % 5 === 0;
        // distribucion gaussiana dentro de la elipse
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(-2 * Math.log(Math.random() || 0.01)) * 0.45;
        const bx = ambiente ? Math.random() * ancho : cx + Math.cos(a) * r * rx;
        const by = ambiente ? Math.random() * alto : cy + Math.sin(a) * r * ry;
        return {
            bx, by, x: bx, y: by,
            tam: ambiente ? 2 + Math.random() * 2 : 2 + Math.random() * 3.5,
            rot: Math.random() * Math.PI * 2,
            vrot: (Math.random() - 0.5) * 0.01,
            fase: Math.random() * Math.PI * 2,
            color: colores[Math.floor(Math.random() * colores.length)],
            alfa: ambiente ? 0.25 + Math.random() * 0.25 : 0.55 + Math.random() * 0.45,
        };
    });
};

const dibujarTriangulo = (p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.beginPath();
    ctx.moveTo(0, -p.tam);
    ctx.lineTo(p.tam * 0.87, p.tam * 0.5);
    ctx.lineTo(-p.tam * 0.87, p.tam * 0.5);
    ctx.closePath();
    ctx.globalAlpha = p.alfa;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
};

const animar = (t) => {
    ctx.clearRect(0, 0, ancho, alto);
    for (const p of particulas) {
        // deriva suave
        let tx = p.bx + Math.sin(t * 0.0004 + p.fase) * 6;
        let ty = p.by + Math.cos(t * 0.0005 + p.fase) * 6;
        // el raton aparta las particulas cercanas
        const dx = tx - raton.x, dy = ty - raton.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14400) {
            const f = (1 - Math.sqrt(d2) / 120) * 28;
            const d = Math.sqrt(d2) || 1;
            tx += (dx / d) * f;
            ty += (dy / d) * f;
        }
        p.x += (tx - p.x) * 0.08;
        p.y += (ty - p.y) * 0.08;
        p.rot += p.vrot;
        dibujarTriangulo(p);
    }
    if (!reducirMovimiento) requestAnimationFrame(animar);
};

crearParticulas();
if (reducirMovimiento) {
    animar(0);
} else {
    requestAnimationFrame(animar);
    canvas.parentElement.addEventListener('pointermove', e => {
        const r = canvas.getBoundingClientRect();
        raton = { x: e.clientX - r.left, y: e.clientY - r.top };
    });
    canvas.parentElement.addEventListener('pointerleave', () => { raton = { x: -9999, y: -9999 }; });
}
let redimension;
addEventListener('resize', () => {
    // en movil la barra del navegador cambia el alto al hacer scroll; solo se rehace si cambia el ancho
    if (canvas.clientWidth === ancho) return;
    clearTimeout(redimension);
    redimension = setTimeout(() => { crearParticulas(); if (reducirMovimiento) animar(0); }, 150);
});
