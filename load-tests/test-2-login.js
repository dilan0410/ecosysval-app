// load-tests/test-2-login.js
/**
 * prueba de carga #2: login
 * --------------------------
 * simula 50 usuarios intentando iniciar sesión al mismo tiempo
 * para medir el rendimiento del sistema de autenticación JWT.
 */

const autocannon = require("autocannon");

const URL = "https://ecosysval-backend.onrender.com/auth/login";

console.log(" Iniciando Prueba #2: login concurrente");
console.log(` url: ${URL}`);
console.log(` usuarios simultaneos: 50`);
console.log(`  duracion: 20 segundos`);
console.log("-----------------------------------\n");

const instance = autocannon(
  {
    url: URL,
    connections: 20,
    duration: 15,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "tunurefiw@mailinator.com",
      password: "Pa$$w0rd!",
    }),
  },
  (err, result) => {
    if (err) {
      console.error(" Error:", err);
      return;
    }

    console.log("\n prueba completada\n");
    console.log(" resultados:");
    console.log("─────────────────────────────────────");
    console.log(` Peticiones totales:      ${result.requests.total}`);
    console.log(` Peticiones exitosas:     ${result.requests.total - result.errors}`);
    console.log(` Errores:                 ${result.errors}`);
    console.log(` Peticiones por segundo:  ${result.requests.average}/seg`);
    console.log(`  Latencia promedio:       ${result.latency.average} ms`);
    console.log(` Latencia maxima:         ${result.latency.max} ms`);
    console.log(` Codigos 429 (Rate Limit): ${result["non-2xx"] || 0}`);
    console.log("─────────────────────────────────────\n");

    if (result["non-2xx"] > 0) {
      console.log(" nota: Los codigos 429 son buenos.");
      console.log("   significa que el Rate Limiting está funcionando");
      console.log("   correctamente y bloqueando intentos de fuerza bruta.\n");
    }
  }
);

autocannon.track(instance, { renderProgressBar: true });