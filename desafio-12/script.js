const botonTipoGrafico = document.querySelectorAll('[data-chart-type]');
const contextoGrafico = document.getElementById('grafico-lecturas');

const graficoLecturas = new Chart(contextoGrafico, {
    type: 'bar',
    data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
        datasets: [{
            label: 'Libros leídos',
            data: [3, 5, 4, 7, 6, 9],
            backgroundColor: 'rgba(79, 70, 229, 0.75)',
            borderColor: '#4f46e5',
            borderWidth: 2,
            borderRadius: 8,
            tension: 0.35,
            fill: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (contexto) => ` ${contexto.parsed.y} libros`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                },
                title: {
                    display: true,
                    text: 'Cantidad de libros'
                }
            }
        }
    }
});

botonTipoGrafico.forEach((boton) => {
    boton.addEventListener('click', () => {
        graficoLecturas.config.type = boton.dataset.chartType;
        graficoLecturas.update();

        botonTipoGrafico.forEach((otroBoton) => {
            otroBoton.setAttribute('aria-pressed', String(otroBoton === boton));
        });
    });
});
