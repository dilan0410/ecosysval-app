// load-tests/test-3-empresas.js
/**
 * prueba de carga #3: listar empresas
 * ------------------------------------
 * simula 100 usuarios consultando el directorio de empresas
 * para medir el rendimiento del backend + PostgreSQL bajo carga.
 */

const autocannon = require("autocannon");

const URL = "https://ecosysval-backend.onrender.com/empresas";

console.log(" Iniciando Prueba #3: listar empresas");
console.log(` url: ${URL}`);
console.log(` usuarios simultaneos: 100`);
console.log(`  duracion: 30 segundos`);
console.log("-----------------------------------\n");

const instance = autocannon(
  {
    url: URL,
    connections: 30,
    duration: 20,
    headers: {
      "Content-Type": "application/json",
    },
  },
  (err, result) => {
    if (err) {
      console.error(" Error:", err);
      return;
    }

    console.log("\n prueba completada\n");
    console.log(" resultados de bases de datos:");
    console.log("─────────────────────────────────────");
    console.log(` Peticiones totales:      ${result.requests.total}`);
    console.log(` Peticiones exitosas:     ${result.requests.total - result.errors}`);
    console.log(` Throughput promedio:     ${result.requests.average} req/seg`);
    console.log(`  Latencia promedio:       ${result.latency.average} ms`);
    console.log(` Latencia p99 (peor 1%):   ${result.latency.p99} ms`);
    console.log(` Datos transferidos:       ${(result.throughput.total / 1024 / 1024).toFixed(2)} MB`);
    console.log("─────────────────────────────────────\n");
  }
);

autocannon.track(instance, { renderProgressBar: true });