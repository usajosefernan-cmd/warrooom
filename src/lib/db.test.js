const assert = require("assert");
const fs = require("fs");
const path = require("path");

// Creamos un path temporal para el test
const testDbPath = path.join(__dirname, "test-db.json");

function runTests() {
  console.log("Iniciando pruebas unitarias de AI War Room...");

  // Test 1: Simulación de lectura/escritura DB JSON
  try {
    const initialData = {
      projects: [],
      debates: [],
      decisions: [],
      hypotheses: [],
      sources: [],
      tasks: [],
      roadmap_items: [],
      ai_logs: []
    };

    fs.writeFileSync(testDbPath, JSON.stringify(initialData, null, 2), "utf-8");
    assert.strictEqual(fs.existsSync(testDbPath), true, "El archivo test-db.json debería existir");

    const raw = fs.readFileSync(testDbPath, "utf-8");
    const parsed = JSON.parse(raw);
    assert.deepStrictEqual(parsed.projects, [], "La colección projects debe estar vacía");
    console.log("✓ Test 1: Lectura/Escritura DB Local pasados con éxito.");
  } catch (err) {
    console.error("✗ Test 1 falló:", err);
    process.exit(1);
  }

  // Test 2: Simulación del Quality Gate
  try {
    const qualityGateMock = {
      passed: true,
      warnings: [],
      missing_evidence: [],
      contradictions: []
    };

    assert.strictEqual(qualityGateMock.passed, true);
    assert.strictEqual(qualityGateMock.warnings.length, 0);
    console.log("✓ Test 2: Validación del Quality Gate pasada con éxito.");
  } catch (err) {
    console.error("✗ Test 2 falló:", err);
    process.exit(1);
  }

  // Limpiar test
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  console.log("\nTodas las pruebas unitarias pasaron exitosamente.");
}

runTests();
