// Datos de muestra para la aplicación

// Cursos de muestra
const SAMPLE_COURSES = [
    {
        id: 1,
        title: "Álgebra Básica",
        description: "Fundamentos de álgebra para estudiantes principiantes",
        color: "#4CAF50",
        icon: "fas fa-square-root-alt"
    },
    {
        id: 2,
        title: "Geometría",
        description: "Estudio de figuras, formas y propiedades espaciales",
        color: "#2196F3",
        icon: "fas fa-shapes"
    },
    {
        id: 3,
        title: "Cálculo Diferencial",
        description: "Introducción al cálculo y análisis matemático",
        color: "#9C27B0",
        icon: "fas fa-chart-line"
    }
];

// Temas de muestra
const SAMPLE_TOPICS = [
    {
        id: 101,
        courseId: 1,
        title: "Ecuaciones Lineales",
        description: "Aprende a resolver ecuaciones de primer grado",
        icon: "fas fa-equals",
        sections: [
            {
                id: 1001,
                title: "Introducción a las Ecuaciones",
                type: "text",
                content: "<h3>¿Qué es una ecuación?</h3><p>Una ecuación es una igualdad matemática entre dos expresiones algebraicas, denominadas miembros, en las que aparecen valores conocidos o datos, y desconocidos o incógnitas, relacionados mediante operaciones matemáticas.</p><p>La solución de la ecuación son los valores que pueden tomar las incógnitas para que la igualdad sea cierta.</p>"
            },
            {
                id: 1002,
                title: "Video Explicativo",
                type: "youtube",
                content: "dQw4w9WgXcQ" // ID del video de YouTube
            }
        ]
    },
    {
        id: 102,
        courseId: 1,
        title: "Polinomios",
        description: "Operaciones con polinomios y factorización",
        icon: "fas fa-superscript",
        sections: [
            {
                id: 1003,
                title: "Definición de Polinomios",
                type: "text",
                content: "<h3>Polinomios</h3><p>Un polinomio es una expresión matemática que consiste en variables y coeficientes, que implica solo las operaciones de adición, sustracción, multiplicación y exponentes enteros no negativos de variables.</p>"
            }
        ]
    },
    {
        id: 201,
        courseId: 2,
        title: "Figuras Planas",
        description: "Estudio de triángulos, cuadriláteros y círculos",
        icon: "fas fa-shapes",
        sections: [
            {
                id: 2001,
                title: "Triángulos",
                type: "text",
                content: "<h3>Triángulos</h3><p>Un triángulo es un polígono de tres lados. La suma de los ángulos internos de un triángulo es siempre 180 grados.</p>"
            },
            {
                id: 2002,
                title: "Applet Interactivo",
                type: "geogebra",
                content: "abcdef123456" // ID del applet de GeoGebra
            }
        ]
    },
    {
        id: 301,
        courseId: 3,
        title: "Límites y Continuidad",
        description: "Conceptos fundamentales del cálculo diferencial",
        icon: "fas fa-chart-line",
        sections: []
    }
];
