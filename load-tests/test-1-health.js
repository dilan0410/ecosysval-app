// load-tests/test-1-health.js
/**
 * prueba de carga #1: HEALTH CHECK
 * ---------------------------------
 * simula 100 usuarios haciendo peticiones get al backend
 * durante 30 segundos para medir estabilidad general.
 */

const autocannon = require("autocannon");

const URL = "https://ecosysval-backend.onrender.com";

console.log(" Iniciando Prueba #1: HEALTH CHECK");
console.log(` url: ${URL}`);
console.log(`  Duración: 30 segundos`);
console.log(` Usuarios concurrentes: 100`);
console.log("-----------------------------------\n");

const instance = autocannon(
  {
    url: URL,
    connections: 100,       // 100 usuarios simultáneos
    duration: 30,           // durante 30 segundos
    pipelining: 1,          // 1 petición a la vez por usuario
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
    console.log(" resultados:");
    console.log("─────────────────────────────────────");
    console.log(` peticiones totales:      ${result.requests.total}`);
    console.log(` peticiones exitosas:     ${result.requests.total - result.errors}`);
    console.log(` errores:                 ${result.errors}`);
    console.log(` peticiones por segundo:  ${result.requests.average}/seg`);
    console.log(`  latencia promedio:       ${result.latency.average} ms`);
    console.log(` latencia máxima:         ${result.latency.max} ms`);
    console.log(` bytes transferidos:      ${(result.throughput.total / 1024 / 1024).toFixed(2)} MB`);
    console.log("─────────────────────────────────────\n");
  }
);

// mostrar progreso en tiempo real
autocannon.track(instance, { renderProgressBar: true });